import restaurantModel from "../models/restaurant.js";

//get restaurants within a specific complex
function getRestaurantsByComplex(complexId) {
  return restaurantModel.find({ complex_id: complexId }); //populate reviews?
}

//get a single restaurant by ID
function getRestaurantById(id) {
  return restaurantModel.findById(id); //populate reviews?
}

//filter restaurants that match given criteria
function filterRestaurants(filters) {
  const query = {};

  if (filters.avg_rating) {
    query.avg_rating = { $gte: filters.avg_rating }; //returns restaurants greater than or equal to specified rating
  }
  if (filters.cuisine) {
    query.cuisine = filters.cuisine; //returns restaurants with specific cuisine
  }
  if (filters.delivery) {
    query.delivery = filters.delivery; //returns restaurants based on if they offer delivery
  }
  if (filters.accepted_payments) {
    //returns restaurants based on the desired accepted payments
    Object.keys(filters.accepted_payments).forEach((paymentMethod) => {
      query[`accepted_payments.${paymentMethod}`] =
        filters.accepted_payments[paymentMethod];
    });
  }
  if (filters.nutrition_types) {
    //returns restaurants based on the desired nutrition types
    Object.keys(filters.nutrition_types).forEach((nutritionType) => {
      query[`nutrition_types.${nutritionType}`] =
        filters.nutrition_types[nutritionType];
    });
  }

  return restaurantModel.find(query);
}

//sort restaurants based on the field (ascending or descending)
function getSortedRestaurants(sortField, sortOrder = "asc") {
  const sortOptions = {};
  sortOptions[sortField] = sortOrder === "asc" ? 1 : -1;
  return restaurantModel.find().sort(sortOptions);
}

export default {
  getRestaurantById,
  getRestaurantsByComplex,
  getSortedRestaurants,
  filterRestaurants
};
