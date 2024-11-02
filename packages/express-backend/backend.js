import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import userService from "../express-backend/services/user-service.js";
// import accountService from "../express-backend/services/account-service.js";
import complexService from "../express-backend/services/complex-service.js";
import restaurantService from "../express-backend/services/restaurant-service.js";
// import reviewService from "../express-backend/services/review-service.js";

dotenv.config();

const { MONGO_CONNECTION_STRING } = process.env;

mongoose.set("debug", true);
mongoose.connect(MONGO_CONNECTION_STRING).catch((error) => console.log(error));

const app = express();
const port = 8000;

app.use(cors());
app.use(express.json());

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

//get list of complexes
app.get("/complexes", (req, res) => {
  const name = req.query.name;

  complexService
    .getComplexes(name)
    .then((complexes) => {
      res.status(200).send({ complexes_list: complexes });
    })
    .catch((error) => {
      res.status(500).send({ error: "Error fetching complexes" });
    });
});

//get all restaurants within a specific complex
app.get("/complexes/:complexId/restaurants", (req, res) => {
  const complexId = req.params.complexId;

  restaurantService
    .getRestaurantsByComplex(complexId)
    .then((restaurants) => {
      res.status(200).send({ restaurants_list: restaurants });
    })
    .catch((error) => {
      res.status(500).send({ error: "Error fetching restaurants in complex" });
    });
});

//get specific restaurant by id
app.get("/restaurant/:id", (req, res) => {
  const restaurantId = req.params.id;

  restaurantService
    .getRestaurantById(restaurantId)
    .then((restaurant) => {
      if (restaurant) {
        res.status(200).send({ restaurant: restaurant });
      } else {
        res.status(404).send("Restaurant not found");
      }
    })
    .catch((error) => {
      res.status(500).send({ error: "Error fetching restaurant" });
    });
});

//get restaurants that satisfy specific filters
app.get("/restaurants/filter", (req, res) => {
  const { minRating, cuisine, delivery, accepted_payments, nutrition_types } =
    req.query;

  const filters = {};
  if (minRating) {
    filters.avg_rating = parseFloat(minRating);
  }
  if (cuisine) {
    filters.cuisine = cuisine;
  }
  if (delivery) {
    filters.delivery = delivery === "true";
  }
  if (accepted_payments) {
    try {
      //parse accepted_payments from query string to an object
      filters.accepted_payments = JSON.parse(accepted_payments);
    } catch (error) {
      return res
        .status(400)
        .send({ error: "Invalid format for accepted_payments" });
    }
  }
  if (nutrition_types) {
    try {
      //parse nutrition_types from query string to an object
      filters.nutrition_types = JSON.parse(nutrition_types);
    } catch (error) {
      return res
        .status(400)
        .send({ error: "Invalid format for nutrition_types" });
    }
  }

  restaurantService
    .filterRestaurants(filters)
    .then((restaurants) => {
      res.status(200).send({ restaurants_list: restaurants });
    })
    .catch((error) => {
      res
        .status(500)
        .send({ error: "Error fetching restaurants with specified filters" });
    });
});

//get restaurants sorted by a specific parameter
app.get("/restaurants/sort", (req, res) => {
  const { sortField, sortOrder } = req.query;

  restaurantService
    .getSortedRestaurants(sortField, sortOrder || "asc")
    .then((restaurants) => {
      res.status(200).send({ restaurants_list: restaurants });
    })
    .catch((error) => {
      res.status(500).send({ error: "Error sorting restaurants" });
    });
});
