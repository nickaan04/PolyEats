import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import multer from "multer";
import { Storage } from "@google-cloud/storage"; // Import Google Cloud Storage
import complexService from "./services/complex-service.js";
import restaurantService from "./services/restaurant-service.js";
import { authenticateUser, registerUser, loginUser } from "./auth.js";
import authRoutes from "./auth.js";
import accountService from "./services/account-service.js";
import reviewService from "./services/review-service.js";

const { MONGO_CONNECTION_STRING } = process.env;

// Initialize Google Cloud Storage
const storage = new Storage();
const bucketName = "polyeats"; // Replace with your bucket name
const bucket = storage.bucket(bucketName);

// Connect to MongoDB
mongoose.set("debug", true);
mongoose
  .connect(MONGO_CONNECTION_STRING)
  .catch((error) => console.error("MongoDB connection error:", error));

// Initialize Express app
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

app.use(express.json());

// Set up multer for file uploads
const upload = multer({ storage: multer.memoryStorage() }); // Store files in memory

// Start the server
app.listen(process.env.PORT, () => {
  console.log("REST API is listening on port:", process.env.PORT);
});

// Register routes
app.use("/auth", authRoutes);
app.get("/", (req, res) =>
  res.status(200).send({ message: "Welcome to PolyEats!" })
);

// Signup and login routes
app.post("/signup", registerUser);
app.post("/login", loginUser);

// Post a review
app.post(
  "/review",
  authenticateUser,
  upload.array("pictures", 10),
  async (req, res) => {
    try {
      const { item, review, rating, restaurant } = req.body;
      const userId = req.user._id;

      const newReview = await reviewService.postReview({
        item,
        review,
        rating,
        restaurant,
        author: userId,
        pictures: req.files // Files are passed directly to the review service
      });

      res.status(201).send(newReview);
    } catch (error) {
      console.error("Error posting review:", error);
      res.status(500).send({ error: "Error posting review" });
    }
  }
);

// Upload or update profile picture
app.post(
  "/account/profile-pic",
  authenticateUser,
  upload.single("profile_pic"),
  async (req, res) => {
    const userId = req.user._id;

    if (!req.file) {
      return res.status(400).send({ error: "No file uploaded" });
    }

    try {
      console.log("Uploading file:", req.file.originalname);

      // Upload file to Google Cloud Storage
      const blob = bucket.file(
        `profile-pictures/${userId}-${req.file.originalname}`
      );
      const stream = blob.createWriteStream();

      stream.on("error", (err) => {
        console.error("Error uploading to Google Cloud Storage:", err);
        throw err;
      });

      stream.on("finish", async () => {
        const profilePicUrl = `https://storage.googleapis.com/${bucketName}/${blob.name}`;
        console.log("File uploaded successfully to:", profilePicUrl);

        // Save the URL to the database
        const updatedAccount = await accountService.updateProfilePicture(
          userId,
          profilePicUrl
        );

        res.status(200).send({
          message: "Profile picture updated successfully",
          profile_pic: profilePicUrl
        });
      });

      stream.end(req.file.buffer);
    } catch (error) {
      console.error("Error updating profile picture:", error);
      res.status(500).send({ error: "Error updating profile picture" });
    }
  }
);

// Remove profile picture
app.post("/account/profile-pic/remove", authenticateUser, async (req, res) => {
  const userId = req.user._id;

  try {
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

// Other account routes
app.get("/account/details", authenticateUser, async (req, res) => {
  try {
    const account = await accountService.getAccountDetails(req.user._id);
    res.status(200).send({ account });
  } catch (error) {
    console.error("Error fetching account details:", error);
    res.status(500).send({ error: "Error fetching account details" });
  }
});

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
    //e.g. ?name=Hearth or ?name=hearth (not case sensitive)
    filters.name = name;
  }
  if (minRating) {
    //e.g. ?minRating=4
    filters.avg_rating = parseFloat(minRating);
  }
  if (cuisine) {
    //e.g. ?cuisine=Mexican or ?name=mexican (not case sensitive)
    filters.cuisine = cuisine;
  }
  if (delivery) {
    //e.g. ?delivery=true
    filters.delivery = delivery === "true";
  }
  if (price) {
    //e.g. ?price=$
    filters.price = price;
  }
  if (accepted_payments) {
    //JSON object, e.g., ?accepted_payments={"PolyCard": true, "CreditDebit": true}
    try {
      filters.accepted_payments = JSON.parse(accepted_payments);
    } catch (error) {
      return res
        .status(400)
        .send({ error: "Invalid format for accepted_payments" });
    }
  }
  if (nutrition_types) {
    //JSON object, e.g., ?nutrition_types={"Vegan": true, "GlutenFree": true}
    try {
      filters.nutrition_types = JSON.parse(nutrition_types);
    } catch (error) {
      return res
        .status(400)
        .send({ error: "Invalid format for nutrition_types" });
    }
  }
  if (hours) {
    //JSON object, e.g., ?hours={"M": true}
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
