import mongoose from "mongoose";

const RestaurantSchema = new mongoose.Schema(
  {
    // name: {
    //   type: String,
    //   required: true,
    //   trim: true
    // },
    // job: {
    //   type: String,
    //   required: true,
    //   trim: true,
    //   validate(value) {
    //     if (value.length < 2)
    //       throw new Error("Invalid job, must be at least 2 characters.");
    //   }
    // }
  },
  { collection: "restaurants" }
);

const Restaurant = mongoose.model("Restaurant", RestaurantSchema);

export default Restaurant;
