import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Cards from "../Cards";
import "../../Styles/App.scss";
import campusMarketImage from "../../assets/campus_market.jpg";
import logo from "../../Assets/logo.png";

const colors = ["#2b46b7", "#86d561", "#47bff9", "#ffe05d", "#fe933b", "#f74943", "#ee75de", "#7356d3", "#1a602a"];

const RestaurantList = ({ API_PREFIX, addAuthHeader }) => {
  const { complexId } = useParams();
  const [restaurants, setRestaurants] = useState([]);

  useEffect(() => {
    fetch(`${API_PREFIX}/complexes/${complexId}/restaurants`, {
      headers: addAuthHeader()
    })
      .then((res) => (res.status === 200 ? res.json() : undefined))
      .then((json) => setRestaurants(json ? json.restaurants_list : []))
      .catch((error) => console.log(error));
  }, [complexId, API_PREFIX, addAuthHeader]);

  return (
    <div>
      <div className="top-image">
        <img src={logo} alt="Top Banner" />
      </div>
      <h2>Restaurants</h2>
      <div className="card-container">
      {restaurants.map((restaurant, index) => (
        <Cards
          key={index} 
          color={colors[index % colors.length] || campusMarketImage}  // Fallback to campusMarketImage
          title={restaurant.name}
          link={`/restaurant/${restaurant._id}`}          // Link to each item’s unique page
        />
      ))}
    </div>
    </div>
  );
};

export default RestaurantList;
