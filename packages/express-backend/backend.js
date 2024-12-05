import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import multer from "multer";
import complexService from "./services/complex-service.js";
import restaurantService from "./services/restaurant-service.js";
import { authenticateUser, registerUser, loginUser } from "./auth.js";
import authRoutes from "./auth.js";
import accountService from "./services/account-service.js";
import reviewService from "./services/review-service.js";
import { BlobServiceClient } from "@azure/storage-blob";

const {
  MONGO_CONNECTION_STRING,
  AZURE_STORAGE_CONNECTION_STRING, // Full connection string from the .env file
  AZURE_CONTAINER_NAME // Container name from the .env file
} = process.env;

// Connect to MongoDB
mongoose.set("debug", true);
mongoose.connect(MONGO_CONNECTION_STRING).catch((error) => console.log(error));

// Initialize Express
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

// Multer configuration for in-memory file storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Azure Blob Storage setup
const blobServiceClient = BlobServiceClient.fromConnectionString(
  AZURE_STORAGE_CONNECTION_STRING
);
const containerClient =
  blobServiceClient.getContainerClient(AZURE_CONTAINER_NAME);

// Helper function to upload a file to Azure Blob Storage
async function uploadFileToAzure(file) {
  const blobName = `${Date.now()}-${file.originalname}`;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  await blockBlobClient.uploadData(file.buffer, {
    blobHTTPHeaders: { blobContentType: file.mimetype }
  });
  return blockBlobClient.url; // Return the URL of the uploaded blob
}

// Helper function to delete a file from Azure Blob Storage
async function deleteFileFromAzure(blobName) {
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  const response = await blockBlobClient.deleteIfExists();
  return response.succeeded;
}

// Start Express server
app.listen(process.env.PORT, () => {
  console.log("REST API is listening.");
});

// Routes
// Welcome route
app.get("/", (req, res) => {
  res.status(200).send({ message: "Welcome to PolyEats!" });
});

// Authentication routes
app.use("/auth", authRoutes);
app.post("/signup", registerUser);
app.post("/login", loginUser);

// Upload a file to Azure Blob Storage
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send({ error: "No file uploaded" });
    }

    const fileUrl = await uploadFileToAzure(req.file);
    res
      .status(201)
      .send({ message: "File uploaded successfully", url: fileUrl });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).send({ error: "Error uploading file" });
  }
});

// Download a file from Azure Blob Storage
app.get("/download/:blobName", async (req, res) => {
  try {
    const { blobName } = req.params;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    const exists = await blockBlobClient.exists();
    if (!exists) {
      return res.status(404).send({ error: "File not found" });
    }

    const downloadBlockBlobResponse = await blockBlobClient.download(0);
    const stream = downloadBlockBlobResponse.readableStreamBody;

    res.setHeader("Content-Disposition", `attachment; filename="${blobName}"`);
    res.setHeader("Content-Type", downloadBlockBlobResponse.contentType);

    stream.pipe(res);
  } catch (error) {
    console.error("Error downloading file:", error);
    res.status(500).send({ error: "Error downloading file" });
  }
});

// Delete a file from Azure Blob Storage
app.delete("/delete/:blobName", async (req, res) => {
  try {
    const { blobName } = req.params;

    const deleted = await deleteFileFromAzure(blobName);
    if (deleted) {
      res.status(200).send({ message: "File deleted successfully" });
    } else {
      res.status(404).send({ error: "File not found" });
    }
  } catch (error) {
    console.error("Error deleting file:", error);
    res.status(500).send({ error: "Error deleting file" });
  }
});

// Post a review for a specific restaurant
app.post(
  "/review",
  authenticateUser,
  upload.array("pictures", 10),
  async (req, res) => {
    try {
      const { item, review, rating, restaurant } = req.body;
      const userId = req.user._id;

      // Upload files to Azure Blob Storage
      const uploadedFiles = await Promise.all(
        req.files.map(async (file) => await uploadFileToAzure(file))
      );

      // Use helper function to handle review creation
      const newReview = await reviewService.postReview({
        item,
        review,
        rating,
        restaurant,
        author: userId,
        pictures: uploadedFiles
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
      const profilePicUrl = await uploadFileToAzure(req.file);

      const updatedAccount = await accountService.updateProfilePicture(
        userId,
        profilePicUrl
      );

      res.status(200).send({
        message: "Profile picture updated successfully",
        profile_pic: updatedAccount.profile_pic
      });
    } catch (error) {
      console.error("Error updating profile picture:", error);
      res.status(500).send({ error: "Error updating profile picture" });
    }
  }
);

// Delete profile picture
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
