import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Cards from "../Cards";
import RestaurantFilter from "./RestaurantFilter";
import "../../Styles/App.scss";
import campusMarketImage from "../../Assets/campus_market.jpg";
import logo from "../../Assets/logo.png";

const RestaurantList = ({ API_PREFIX, addAuthHeader }) => {
  const { complexId } = useParams();
  const [restaurants, setRestaurants] = useState([]);
  const [filters, setFilters] = useState({});

  // Fetch restaurants based on filters
  const fetchRestaurants = () => {
    const queryParameters = new URLSearchParams();

    // Build query parameters based on active filters
    if (filters.name) queryParameters.append("name", filters.name);
    if (filters.minRating)
      queryParameters.append("avg_rating", filters.minRating);
    if (filters.price) queryParameters.append("price", filters.price);
    if (filters.cuisine) queryParameters.append("cuisine", filters.cuisine);
    if (filters.delivery) queryParameters.append("delivery", filters.delivery);

    if (
      filters.accepted_payments &&
      Object.keys(filters.accepted_payments).length > 0
    ) {
      queryParameters.append(
        "accepted_payments",
        JSON.stringify(filters.accepted_payments)
      );
    }
    if (
      filters.nutrition_types &&
      Object.keys(filters.nutrition_types).length > 0
    ) {
      queryParameters.append(
        "nutrition_types",
        JSON.stringify(filters.nutrition_types)
      );
    }
    if (filters.hours && Object.keys(filters.hours).length > 0) {
      queryParameters.append("hours", JSON.stringify(filters.hours));
    }

    // Fetch restaurants with new query parameters
    fetch(
      `${API_PREFIX}/complexes/${complexId}/restaurants?${queryParameters.toString()}`,
      {
        headers: addAuthHeader()
      }
    )
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Failed to fetch restaurants");
      })
      .then((data) => setRestaurants(data.restaurants_list))
      .catch((error) => console.error(error));
  };

  useEffect(() => {
    fetchRestaurants();
  }, [filters, complexId, API_PREFIX, addAuthHeader]); // Re-fetch when filters change

  return (
    <div>
      <div className="top-image">
        <img src={logo} alt="Top Banner" />
      </div>
      <h2>Restaurants</h2>
      <RestaurantFilter setFilters={setFilters} />
      <div className="card-container">
        {restaurants.map((restaurant, index) => (
          <Cards
            key={index}
            image={restaurant.image || campusMarketImage} // Fallback to campusMarketImage
            title={restaurant.name}
            link={`/restaurant/${restaurant._id}`} // Link to each item’s unique page
          />
        ))}
      </div>
    </div>
  );
};

export default RestaurantList;
