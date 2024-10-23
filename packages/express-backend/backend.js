import express from "express;
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

const { MONGO_CONNECTION_STRING } = process.env;

mongoose.set("debug", true);
mongoose
  .connect(MONGO_CONNECTION_STRING)
  .catch((error) => console.log(error));

app.use(cors());
app.use(express.json());

const app = express();
const port = 8000;
