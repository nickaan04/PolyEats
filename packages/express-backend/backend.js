import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import multer from "multer";
import { Storage } from "@google-cloud/storage";
import complexService from "./services/complex-service.js";
import restaurantService from "./services/restaurant-service.js";
import { authenticateUser, registerUser, loginUser } from "./auth.js";
import authRoutes from "./auth.js";
import accountService from "./services/account-service.js";
import reviewService from "./services/review-service.js";

const {
  MONGO_CONNECTION_STRING,
  GOOGLE_APPLICATION_CREDENTIALS,
  GCS_BUCKET_NAME,
  PORT
} = process.env;

mongoose.set("debug", true);
mongoose.connect(MONGO_CONNECTION_STRING).catch((error) => console.error("MongoDB Connection Error:", error));

const app = express();

// Set up CORS
app.use(
  cors({
    origin: "https://ashy-beach-00ce8fa1e.4.azurestaticapps.net",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept", "X-Requested-With"],
  })
);

app.use(express.json());

// Configure Google Cloud Storage
const storage = new Storage();
const bucket = storage.bucket(GCS_BUCKET_NAME);

// Configure multer to store files in memory
const multerStorage = multer.memoryStorage();
const upload = multer({ storage: multerStorage });

// Start the server
app.listen(PORT, () => {
  console.log(`REST API is listening on port ${PORT}`);
});

// Serve static files if necessary
// (Commented out since images are uploaded to GCS)
// app.use("/uploads", express.static("../uploads"));

// Register auth routes
app.use("/auth", authRoutes);

app.get("/", (req, res) => {
  res.status(200).send({ message: "Welcome to PolyEats!" });
});

app.post("/signup", registerUser);
app.post("/login", loginUser);

// Upload file to Google Cloud Storage
const uploadFileToGCS = async (file) => {
  const blob = bucket.file(file.originalname);
  const blobStream = blob.createWriteStream({
    resumable: false,
    metadata: {
      contentType: file.mimetype,
    },
  });

  return new Promise((resolve, reject) => {
    blobStream.on("error", reject);
    blobStream.on("finish", () => {
      resolve(`https://storage.googleapis.com/${GCS_BUCKET_NAME}/${blob.name}`);
    });
    blobStream.end(file.buffer);
  });
};

// Post a review with image uploads
app.post(
  "/review",
  authenticateUser,
  upload.array("pictures", 10),
  async (req, res) => {
    try {
      const { item, review, rating, restaurant } = req.body;
      const userId = req.user._id;

      // Upload pictures to GCS
      const pictureUrls = await Promise.all(
        req.files.map((file) => uploadFileToGCS(file))
      );

      // Save the review in MongoDB
      const newReview = await reviewService.postReview({
        item,
        review,
        rating,
        restaurant,
        author: userId,
        pictures: pictureUrls,
      });

      res.status(201).send(newReview);
    } catch (error) {
      console.error("Error posting review:", error);
      res.status(500).send({ error: error.message || "Error posting review" });
    }
  }
);

// Delete a review
app.delete("/review/:reviewId", authenticateUser, async (req, res) => {
  const { reviewId } = req.params;
  const userId = req.user._id;

  try {
    await reviewService.deleteReview(reviewId, userId);
    res.status(200).send({ message: "Review and associated pictures deleted successfully" });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).send({ error: "Error deleting review" });
  }
});

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
      const profilePicUrl = await uploadFileToGCS(req.file);
      const updatedAccount = await accountService.updateProfilePicture(userId, profilePicUrl);
      res.status(200).send({
        message: "Profile picture updated successfully",
        profile_pic: updatedAccount.profile_pic,
      });
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
      profile_pic: updatedAccount.profile_pic,
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
