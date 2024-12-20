import reviewModel from "../models/review.js";
import restaurantModel from "../models/restaurant.js";
import { uploadFileToAzure, deleteFileFromAzure } from "../azureBlobStorage.js";

//post a new review
async function postReview(reviewData) {
  const { pictures, ...reviewDetails } = reviewData;
  const pictureUrls = [];

  //upload pictures is Azure if included
  if (pictures && pictures.length > 0) {
    for (const file of pictures) {
      const publicUrl = await uploadFileToAzure(
        "images",
        file,
        "review-pictures"
      );
      pictureUrls.push(publicUrl);
    }
  }

  const review = new reviewModel({ ...reviewDetails, pictures: pictureUrls });
  const savedReview = await review.save();

  //dynamically update restaurant rating based on review rating
  await updateRestaurantRating(review.restaurant);

  return savedReview;
}

//delete a review by its ID (only if the review is authored by the requesting user)
async function deleteReview(reviewId, accountId) {
  const review = await reviewModel.findOne({
    _id: reviewId,
    author: accountId
  });

  if (!review) {
    throw new Error("Review not found or you are not authorized to delete it.");
  }

  //delete associated pictures from Azure
  if (review.pictures && review.pictures.length > 0) {
    const deletePromises = review.pictures.map((url) => {
      const blobName = url.split("/").pop(); //extract blob name from URL
      return deleteFileFromAzure("images", blobName, "review-pictures");
    });

    await Promise.all(deletePromises);
  }

  await reviewModel.findByIdAndDelete(reviewId);
  //dynamically update rating
  await updateRestaurantRating(review.restaurant);
}

//get all reviews for a specific restaurant
async function getReviewsByRestaurant(restaurantId) {
  return reviewModel
    .find({ restaurant: restaurantId })
    .populate("author", "firstname lastname profile_pic")
    .exec();
}

//helper to calculate and update restaurant's average rating
async function updateRestaurantRating(restaurantId) {
  const reviews = await reviewModel.find({ restaurant: restaurantId });
  if (reviews.length === 0) {
    //reset to default rating if no reviews exist
    await restaurantModel.findByIdAndUpdate(restaurantId, { avg_rating: 3 });
  } else {
    const avgRating =
      reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
    await restaurantModel.findByIdAndUpdate(restaurantId, {
      avg_rating: avgRating.toFixed(1) //rounded to 1 decimal place
    });
  }
}

export default {
  postReview,
  deleteReview,
  getReviewsByRestaurant
};
