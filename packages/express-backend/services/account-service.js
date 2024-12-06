import accountModel from "../models/account.js";
import reviewModel from "../models/review.js";
import restaurantModel from "../models/restaurant.js";
import { uploadFileToAzure, deleteFileFromAzure } from "../azureBlobStorage.js";

//fetch account details by ID (excluding password)
async function getAccountDetails(accountId) {
  return accountModel
    .findById(accountId, "-password")
    .populate("favorites")
    .exec();
}

//update profile picture path for an account
async function updateProfilePicture(accountId, file) {
  const account = await accountModel.findById(accountId);
  if (!account) {
    throw new Error("Account not found");
  }

  const DEFAULT_PROFILE_PIC =
    "https://polyeats1901.blob.core.windows.net/images/profile-pictures/defaultprofilepic.jpeg";

  // Delete old profile picture if it exists and is not the default
  if (account.profile_pic !== DEFAULT_PROFILE_PIC) {
    const oldBlobName = account.profile_pic.split("/").pop(); // Extract blob name from URL
    await deleteFileFromAzure("images", oldBlobName, "profile-pictures");
  }

  // Upload the new profile picture to Azure
  const publicUrl = await uploadFileToAzure("images", file, "profile-pictures");

  account.profile_pic = publicUrl;
  await account.save();
  return account;
}

//remove profile pic
async function removeProfilePicture(accountId) {
  const account = await accountModel.findById(accountId);
  if (!account) {
    throw new Error("Account not found");
  }

  const DEFAULT_PROFILE_PIC =
    "https://polyeats1901.blob.core.windows.net/images/profile-pictures/defaultprofilepic.jpeg";

  // Delete the custom profile picture if it exists
  if (account.profile_pic !== DEFAULT_PROFILE_PIC) {
    const blobName = account.profile_pic.split("/").pop(); // Extract blob name from URL
    await deleteFileFromAzure("images", blobName, "profile-pictures");
  }

  // Set the profile picture back to the default
  account.profile_pic = DEFAULT_PROFILE_PIC;
  await account.save();
  return account;
}

//fetch reviews given by the account
async function getAccountReviews(accountId) {
  return reviewModel
    .find({ author: accountId })
    .populate("author", "firstname lastname profile_pic") // Ensure profile_pic is included
    .exec();
}

//fetch favorite restaurants saved by the account
async function getFavoriteRestaurants(accountId) {
  return restaurantModel
    .find({
      _id: { $in: (await accountModel.findById(accountId)).favorites }
    })
    .exec();
}

//add a restaurant to favorites
async function addFavoriteRestaurant(accountId, restaurantId) {
  const account = await accountModel.findById(accountId);
  if (!account.favorites.includes(restaurantId)) {
    account.favorites.push(restaurantId);
    await account.save();
  }
  return account;
}

//remove a restaurant from favorites
async function removeFavoriteRestaurant(accountId, restaurantId) {
  const account = await accountModel.findById(accountId);
  account.favorites = account.favorites.filter(
    (fav) => fav.toString() !== restaurantId
  );
  await account.save();
  return account;
}

async function deleteAccount(accountId) {
  // Find the account to get the profile picture
  const account = await accountModel.findById(accountId);
  if (!account) {
    throw new Error("Account not found");
  }

  const DEFAULT_PROFILE_PIC =
    "https://polyeats1901.blob.core.windows.net/images/profile-pictures/defaultprofilepic.jpeg";

  // Delete the profile picture if it is not the default one
  if (account.profile_pic !== DEFAULT_PROFILE_PIC) {
    const blobName = account.profile_pic.split("/").pop(); // Extract blob name
    await deleteFileFromAzure("images", blobName, "profile-pictures");
  }

  // Fetch all reviews by the account
  const reviews = await reviewModel.find({ author: accountId });

  // Delete review images from Azure Storage
  for (const review of reviews) {
    if (review.pictures && review.pictures.length > 0) {
      for (const pictureUrl of review.pictures) {
        const blobName = pictureUrl.split("/").pop(); // Extract blob name
        await deleteFileFromAzure("images", blobName, "review-pictures");
      }
    }
  }

  // Delete the account from the database
  await accountModel.findByIdAndDelete(accountId);

  // Delete all reviews by the account
  await reviewModel.deleteMany({ author: accountId });

  return { message: "Account and associated data successfully deleted" };
}

export default {
  getAccountDetails,
  updateProfilePicture,
  removeProfilePicture,
  getAccountReviews,
  getFavoriteRestaurants,
  addFavoriteRestaurant,
  removeFavoriteRestaurant,
  deleteAccount
};
