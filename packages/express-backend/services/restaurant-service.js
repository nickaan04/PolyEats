import restaurantModel from "../models/restaurant.js";

//get a single restaurant by ID
function getRestaurantById(id) {
  return restaurantModel.findById(id); //populate reviews?
}

//filter and/or sort restaurants in complex based on given criteria
function getRestaurants(filters, sortField, sortOrder = "asc", complexId) {
  const query = complexId ? { complex_id: complexId } : {};
  const sortOptions = { [sortField]: sortOrder === "asc" ? 1 : -1 };

  if (filters.name) {
    //case-insensitive name search
    query.name = { $regex: filters.name, $options: "i" };
  }
  if (filters.avg_rating) {
    //searches for restaurant with average rating greater than or equal to specified minRating
    query.avg_rating = { $gte: filters.avg_rating };
  }
  if (filters.cuisine) {
    //case-insensitive cuisine search
    query.cuisine = { $regex: filters.cuisine, $options: "i" };
  }
  if (filters.delivery) {
    //searches for restaurants that offer delivery
    query.delivery = filters.delivery;
  }
  if (filters.price) {
    //searches for restaurants that meet the desired price
    query.price = filters.price;
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
  if (filters.hours) {
    //returns restaurants based on the desired hours
    Object.keys(filters.hours).forEach((day) => {
      query[`hours.${day}`] = { $regex: filters.hours[day], $options: "i" };
    });
  }

  return restaurantModel.find(query).sort(sortOptions);
}

export default {
  getRestaurantById,
  getRestaurants
};
