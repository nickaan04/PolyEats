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
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [priceFilter, setPriceFilter] = useState("all");

  useEffect(() => {
    fetch(`${API_PREFIX}/complexes/${complexId}/restaurants`, {
      headers: addAuthHeader()
    })
      .then((res) => (res.status === 200 ? res.json() : undefined))
      .then((json) => {
        const restaurantList = json ? json.restaurants_list : [];
        setRestaurants(restaurantList);
        setFilteredRestaurants(restaurantList);
      })
      .catch((error) => console.log(error));
  }, [complexId, API_PREFIX, addAuthHeader]);

  useEffect(() => {
    filterRestaurants();
  }, [priceFilter, restaurants]);

  const filterRestaurants = () => {
    if (priceFilter === "all") {
      setFilteredRestaurants(restaurants);
    } else {
      const filtered = restaurants.filter(
        (restaurant) => restaurant.price === priceFilter
      );
      setFilteredRestaurants(filtered);
    }
  };

  return (
    <div>
      <div className="top-image">
        <img src={logo} alt="Top Banner" />
      </div>
      <h2>Restaurants</h2>
      <RestaurantFilter onFilterChange={setPriceFilter} />
      <div className="card-container">
        {filteredRestaurants.map((restaurant, index) => (
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
