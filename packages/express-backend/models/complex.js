import mongoose from "mongoose";

const ComplexSchema = new mongoose.Schema(
  {
    //complex name
    name: {
      type: String,
      required: true,
      trim: true
    },
    //URL to the complex image
    image: {
      type: String,
      trim: true
    }
  },
  { collection: "complexes" } //MongoDB collection
);

export default mongoose.model("Complex", ComplexSchema);
