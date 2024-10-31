import mongoose from "mongoose";

const ComplexSchema = new mongoose.Schema(
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
  { collection: "complexes" }
);

const Complex = mongoose.model("Complex", ComplexSchema);

export default Complex;