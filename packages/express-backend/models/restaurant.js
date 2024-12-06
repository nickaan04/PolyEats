import mongoose from "mongoose";

const RestaurantSchema = new mongoose.Schema(
  {
    //restaurant name
    name: {
      type: String,
      required: true,
      trim: true
    },
    //reference to complex that restaurant is in
    complex_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Complex"
    },
    //hours the restaurant is open
    hours: {
      M: { type: String, default: "CLOSED" },
      T: { type: String, default: "CLOSED" },
      W: { type: String, default: "CLOSED" },
      TH: { type: String, default: "CLOSED" },
      F: { type: String, default: "CLOSED" },
      SAT: { type: String, default: "CLOSED" },
      SUN: { type: String, default: "CLOSED" }
    },
    //restaurant's average rating
    avg_rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 3
    },
    //indicates whether a restaurant offers delivery
    delivery: {
      type: Boolean,
      default: false
    },
    //types of payment the restaurant accepts
    accepted_payments: {
      PolyCard: { type: Boolean, default: false },
      CreditDebit: { type: Boolean, default: false },
      Cash: { type: Boolean, default: false }
    },
    //type of cuisine offered at restaurant
    cuisine: {
      type: String,
      trim: true
    },
    //nutrition types offered at restaurant
    nutrition_types: {
      Vegan: { type: Boolean, default: false },
      Vegetarian: { type: Boolean, default: false },
      GlutenFree: { type: Boolean, default: false }
    },
    //restaurant price range
    price: {
      type: String,
      enum: ["$", "$$", "$$$"],
      default: "$$"
    },
    //URL to restaurant image
    image: {
      type: String,
      trim: true
    }
  },
  { collection: "restaurants" } //MongoDB collection
);

const Restaurant = mongoose.model("Restaurant", RestaurantSchema);

export default Restaurant;
