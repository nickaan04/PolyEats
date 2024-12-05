import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import multer from "multer";
import { Storage } from "@google-cloud/storage"; // Google Cloud Storage
import dotenv from "dotenv"; // To load environment variables
import complexService from "./services/complex-service.js";
import restaurantService from "./services/restaurant-service.js";
import { authenticateUser, registerUser, loginUser } from "./auth.js";
import authRoutes from "./auth.js";
import accountService from "./services/account-service.js";
import reviewService from "./services/review-service.js";

dotenv.config(); // Load environment variables from .env

const { MONGO_CONNECTION_STRING, GOOGLE_CLOUD_KEY } = process.env;

mongoose.set("debug", true);
mongoose.connect(MONGO_CONNECTION_STRING).catch((error) => console.log(error));

const app = express();
app.use(
  cors({
    origin: "https://black-meadow-0048ebf1e.4.azurestaticapps.net",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Accept",
      "X-Requested-With"
    ]
  })
);

app.options("*", cors());
app.use(express.json());

app.listen(process.env.PORT, () => {
  console.log("REST API is listening.");
});

app.use("/uploads", express.static("../uploads"));

// Configure multer storage
const storageMulter = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage: storageMulter });

// Initialize Google Cloud Storage
if (!GOOGLE_CLOUD_KEY) {
  console.error("GOOGLE_CLOUD_KEY is not set in environment variables!");
  process.exit(1);
}
const googleCloudKey = JSON.parse(
  Buffer.from(GOOGLE_CLOUD_KEY, "base64").toString("utf-8")
);
const storage = new Storage({ credentials: googleCloudKey });
const bucketName = "polyeats"; // Replace with your bucket name
const bucket = storage.bucket(bucketName);

//register auth routes
app.use("/auth", authRoutes);

app.get("/", (req, res) => {
  res.status(200).send({ message: "Welcome to PolyEats!" });
});

app.post("/signup", registerUser);
app.post("/login", loginUser);

//post a review for a specific restaurant
app.post(
  "/review",
  authenticateUser,
  upload.array("pictures", 10), // Accept up to 10 images
  async (req, res) => {
    try {
      const { item, review, rating, restaurant } = req.body;
      const userId = req.user._id;

      // Use helper function to handle review creation and picture uploads
      const newReview = await reviewService.postReview({
        item,
        review,
        rating,
        restaurant,
        author: userId,
        pictures: req.files // Pass the files directly to the helper
      });

      res.status(201).send(newReview);
    } catch (error) {
      console.error("Error posting review:", error);
      res.status(500).send({ error: "Error posting review" });
    }
  }
);

//upload or update profile picture
app.post(
  "/account/profile-pic",
  authenticateUser,
  upload.single("profile_pic"),
  async (req, res) => {
    const userId = req.user._id;

    if (!req.file) {
      console.error("No file uploaded");
      return res.status(400).send({ error: "No file uploaded" });
    }

    try {
      console.log("Uploading file:", req.file.originalname);

      // Upload file to Google Cloud Storage
      const blob = bucket.file(`profile-pictures/${userId}-${req.file.originalname}`);
      const stream = blob.createWriteStream();

      stream.on("error", (err) => {
        console.error("Error uploading to GCS:", err.message);
        res.status(500).json({ error: "Error uploading file to storage" });
      });

      stream.on("finish", async () => {
        const profilePicUrl = `https://storage.googleapis.com/${bucketName}/${blob.name}`;
        console.log("File uploaded successfully to:", profilePicUrl);

        // Save the profile picture URL in the database
        const updatedAccount = await accountService.updateProfilePicture(userId, profilePicUrl);

        res.status(200).json({
          message: "Profile picture updated successfully",
          profile_pic: profilePicUrl,
        });
      });

      stream.end(req.file.buffer);
    } catch (error) {
      console.error("Error updating profile picture:", error.stack || error.message);
      res.status(500).json({ error: "Error updating profile picture" });
    }
  }
);


//delete profile picture
app.post("/account/profile-pic/remove", authenticateUser, async (req, res) => {
  const userId = req.user._id;

  try {
    // Use the helper function to handle profile picture removal
    const updatedAccount = await accountService.removeProfilePicture(userId);

    res.status(200).send({
      message: "Profile picture removed successfully",
      profile_pic: updatedAccount.profile_pic
    });
  } catch (error) {
    console.error("Error removing profile picture:", error);
    res.status(500).send({ error: "Error removing profile picture" });
  }
});

//get account details
app.get("/account/details", authenticateUser, (req, res) => {
  accountService
    .getAccountDetails(req.user._id)
    .then((account) => res.status(200).send({ account }))
    .catch((error) =>
      res.status(500).send({ error: "Error fetching account details" })
    );
});

// All other routes remain unchanged below this line
//get reviews given by the account
app.get("/account/reviews", authenticateUser, (req, res) => {
  accountService
    .getAccountReviews(req.user._id)
    .then((reviews) => res.status(200).send({ reviews }))
    .catch((error) =>
      res.status(500).send({ error: "Error fetching reviews" })
    );
});

//get favorite restaurants for the account
app.get("/account/favorites", authenticateUser, (req, res) => {
  accountService
    .getFavoriteRestaurants(req.user._id)
    .then((favorites) => res.status(200).send({ favorites }))
    .catch((error) =>
      res.status(500).send({ error: "Error fetching favorite restaurants" })
    );
});

//add a restaurant to favorites
app.post("/account/favorites/:restaurantId", authenticateUser, (req, res) => {
  accountService
    .addFavoriteRestaurant(req.user._id, req.params.restaurantId)
    .then((account) =>
      res
        .status(201)
        .send({ message: "Restaurant added to favorites", account })
    )
    .catch((error) =>
      res.status(500).send({ error: "Error adding restaurant to favorites" })
    );
});

//remove a restaurant from favorites
app.delete("/account/favorites/:restaurantId", authenticateUser, (req, res) => {
  accountService
    .removeFavoriteRestaurant(req.user._id, req.params.restaurantId)
    .then((account) =>
      res
        .status(204)
        .send({ message: "Restaurant removed from favorites", account })
    )
    .catch((error) =>
      res
        .status(500)
        .send({ error: "Error removing restaurant from favorites" })
    );
});

//delete account route
app.delete("/account/delete", authenticateUser, (req, res) => {
  accountService
    .deleteAccount(req.user._id)
    .then((response) => res.status(204).send(response))
    .catch((error) =>
      res.status(500).send({ error: "Error deleting account" })
    );
});

//get list of complexes
app.get("/complexes", authenticateUser, (req, res) => {
  const name = req.query.name;

  complexService
    .getComplexes(name)
    .then((complexes) => {
      res.status(200).send({ complexes_list: complexes });
    })
    .catch((error) => {
      res.status(500).send({ error: "Error fetching complexes" });
    });
});

//get all restaurants within a specific complex (with filters/sorting if desired)
app.get("/complexes/:complexId/restaurants", authenticateUser, (req, res) => {
  const complexId = req.params.complexId;
  const {
    name,
    minRating,
    cuisine,
    delivery,
    price,
    accepted_payments,
    nutrition_types,
    hours,
    sortField,
    sortOrder
  } = req.query;

  const filters = {};
  if (name) {
    filters.name = name;
  }
  if (minRating) {
    filters.avg_rating = parseFloat(minRating);
  }
  if (cuisine) {
    filters.cuisine = cuisine;
  }
  if (delivery) {
    filters.delivery = delivery === "true";
  }
  if (price) {
    filters.price = price;
  }
  if (accepted_payments) {
    try {
      filters.accepted_payments = JSON.parse(accepted_payments);
    } catch (error) {
      return res
        .status(400)
        .send({ error: "Invalid format for accepted_payments" });
    }
  }
  if (nutrition_types) {
    try {
      filters.nutrition_types = JSON.parse(nutrition_types);
    } catch (error) {
      return res
        .status(400)
        .send({ error: "Invalid format for nutrition_types" });
    }
  }
  if (hours) {
    try {
      filters.hours = JSON.parse(hours);
    } catch (error) {
      return res.status(400).send({ error: "Invalid format for hours" });
    }
  }

  restaurantService
    .getRestaurants(filters, sortField, sortOrder || "asc", complexId)
    .then((restaurants) => {
      res.status(200).send({ restaurants_list: restaurants });
    })
    .catch((error) => {
      res.status(500).send({
        error: "Error fetching/filtering/sorting restaurants in complex"
      });
    });
});

/* For sorting:
  ?sortField=name&sortOrder=asc --> Name A-Z
  ?sortField=name&sortOrder=desc --> Name Z-A
  ?sortField=avg_rating&sortOrder=desc --> Average Rating high to low
  ?sortField=avg_rating&sortOrder=asc --> Average Rating low to high
  ?sortField=price&sortOrder=asc --> price low to high
  ?sortField=price&sortOrder=desc --> price high to low
  */

//get specific restaurant information by id (with reviews)
app.get("/restaurant/:id", authenticateUser, (req, res) => {
  const restaurantId = req.params.id;

  restaurantService
    .getRestaurantWithReviews(restaurantId)
    .then(({ restaurant, reviews }) => {
      if (restaurant) {
        res.status(200).send({ restaurant: { restaurant, reviews } });
      } else {
        res.status(404).send("Restaurant not found");
      }
    })
    .catch((error) => {
      res.status(500).send({ error: "Error fetching restaurant" });
    });
});
