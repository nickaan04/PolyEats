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

const { MONGO_CONNECTION_STRING } = process.env;

mongoose.set("debug", true);
mongoose.connect(MONGO_CONNECTION_STRING).catch((error) => console.log(error));

const app = express();
app.use(
  cors({
    origin: "https://ashy-beach-00ce8fa1e.4.azurestaticapps.net",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept", "X-Requested-With"],
  })
);

app.use("*", cors());
app.use(express.json());

app.listen(process.env.PORT, () => {
  console.log("REST API is listening.");
});

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Register auth routes
app.use("/auth", authRoutes);

app.get("/", (req, res) => {
  res.status(200).send({ message: "Welcome to PolyEats!" });
});

app.post("/signup", registerUser);
app.post("/login", loginUser);

// Review Routes
app.post("/review", authenticateUser, upload.array("pictures", 10), async (req, res) => {
  try {
    const { item, review, rating, restaurant } = req.body;
    const userId = req.user._id;

    const newReview = await reviewService.postReview({
      item,
      review,
      rating,
      restaurant,
      author: userId,
      pictures: req.files,
    });

    res.status(201).send(newReview);
  } catch (error) {
    console.error("Error posting review:", error);
    res.status(500).send({ error: "Error posting review" });
  }
});

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

// Profile Picture Routes
app.post("/account/profile-pic", authenticateUser, upload.single("profile_pic"), async (req, res) => {
  const userId = req.user._id;

  if (!req.file) {
    return res.status(400).send({ error: "No file uploaded" });
  }

  try {
    const updatedAccount = await accountService.updateProfilePicture(userId, req.file);
    res.status(200).send({
      message: "Profile picture updated successfully",
      profile_pic: updatedAccount.profile_pic,
    });
  } catch (error) {
    console.error("Error updating profile picture:", error);
    res.status(500).send({ error: "Error updating profile picture" });
  }
});

// Delete Profile Picture
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

// Delete Account
app.delete("/account/delete", authenticateUser, async (req, res) => {
  try {
    await accountService.deleteAccount(req.user._id);
    res.status(204).send({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Error deleting account:", error);
    res.status(500).send({ error: "Error deleting account" });
  }
});
