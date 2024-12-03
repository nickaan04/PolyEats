import reviewModel from "../models/review.js";
import restaurantModel from "../models/restaurant.js";
import { uploadFileToGCS, deleteFileFromGCS } from "../googleCloudStorage.js";

async function postReview(reviewData) {
  const { pictures, ...reviewDetails } = reviewData;

  const pictureUrls = [];
  if (pictures && pictures.length > 0) {
    for (const file of pictures) {
      const publicUrl = await uploadFileToGCS(file, "review-pictures");
      pictureUrls.push(publicUrl);
    }
  }

  const review = new reviewModel({ ...reviewDetails, pictures: pictureUrls });
  const savedReview = await review.save();
  await updateRestaurantRating(review.restaurant);
  return savedReview;
}

async function deleteReview(reviewId, accountId) {
  const review = await reviewModel.findOne({ _id: reviewId, author: accountId });

  if (!review) {
    throw new Error("Review not found or unauthorized.");
  }

  if (review.pictures && review.pictures.length > 0) {
    const deletePromises = review.pictures.map((picture) => {
      const filePath = picture.split(`${bucketName}/`)[1];
      return deleteFileFromGCS(filePath);
    });

    await Promise.all(deletePromises);
  }

  await reviewModel.findByIdAndDelete(reviewId);
  await updateRestaurantRating(review.restaurant);
}

async function updateRestaurantRating(restaurantId) {
  const reviews = await reviewModel.find({ restaurant: restaurantId });
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 3;
  await restaurantModel.findByIdAndUpdate(restaurantId, { avg_rating: avgRating.toFixed(1) });
}

export default {
  postReview,
  deleteReview,
};
