import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema(
  {
    //item being reviewed
    item: {
      type: String,
      required: true,
      trim: true
    },
    //body of the review
    review: {
      type: String,
      required: true,
      trim: true
    },
    //rating of the review
    rating: {
      type: Number,
      required: true
    },
    //list of URLs to pictures uploaded with the review
    pictures: [
      {
        type: String,
        trim: true
      }
    ],
    //date the review was created
    date: {
      type: Date,
      default: Date.now
    },
    //reference to author of review
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true
    },
    //refernece to restaurant to review is about
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true
    }
  },
  { collection: "reviews" } //MongoDB collection
);

const Review = mongoose.model("Review", ReviewSchema);

export default Review;
