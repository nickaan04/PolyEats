import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Cards from "../Cards";
import "../../Styles/App.scss";
import Reviews from "../Reviews";
import "../../Styles/Reviews.scss";

function RestaurantReviews({ API_PREFIX, addAuthHeader }) {
  const { id } = useParams(); // Get restaurant ID from URL
  const [restaurant, setRestaurant] = useState([]); // Restaurant object
  const [reviews, setReviews] = useState([]); // Reviews array
  const [showOverlay, setShowOverlay] = useState(false); // State to toggle overlay visibility
  const [overlayContent, setOverlayContent] = useState(null); // State to hold dynamic content for overlay


  useEffect(() => {
    fetch(`http://localhost:8000/restaurant/${id}`, {
      headers: addAuthHeader()
    })
      .then((res) => res.json())
      .then((json) => {
        setRestaurant(json.restaurant.restaurant);
        setReviews(json.restaurant.reviews);
      })
      .catch((error) => console.error("Error fetching restaurant:", error));
  }, [API_PREFIX, addAuthHeader, id]);

  if (!restaurant) {
    return <p>Loading restaurant details...</p>;
  }

  const handleOverlayToggle = (content) => {
    setOverlayContent(content); // Set content dynamically
    setShowOverlay(!showOverlay); // Toggle overlay visibility
  };

  return (
    <div>
      <div className="restaurant-top-banner">
      <img src={restaurant.image} alt={restaurant.name} className="restaurant-image" />
      <div className="restaurant-overlay">
        <h1 className="restaurant-name">{restaurant.name}</h1>
          <Link to={`/restaurant/${id}/images`} className="btn btn-primary see-images-button">
            See Photos
          </Link>
        </div>
      </div>
    <div>
      <h2 className="details">{restaurant.price} {restaurant.cuisine} </h2>
      <div className="stars">
              {"★".repeat(restaurant.avg_rating)}
              {"☆".repeat(5 - (Math.floor(restaurant.avg_rating)))}
      </div>
    </div>
      <div className="image-container">        
        {/* Overlay that appears when button is clicked */}
        {showOverlay && (
          <div className="overlay-frame">
            <div className="overlay-content">
            <p>{restaurant.description}</p>
            <p>
              Accepted Payments:{" "}
              {Object.keys(restaurant.accepted_payments).join(", ")}
            </p>
            <p>
              Nutrition Types: {Object.keys(restaurant.nutrition_types).join(", ")}
            </p>
            <p>Delivery: {restaurant.delivery ? "Yes" : "No"}</p>
            <div className="hours">
              <h2>Hours</h2>
              <ul>
                {Object.entries(restaurant.hours).map(([day, hours], index) => (
                  <li key={index}>
                    {day}: {hours}
                  </li>
                ))}
              </ul>
            </div>

              <button onClick={() => setShowOverlay(false)} className="close-overlay-button">
                Close
              </button>
            </div>
          </div>
        )}
      </div>
      

      <button onClick={() => handleOverlayToggle(<div><h3>{restaurant.name}</h3><p>{restaurant.description}</p></div>)} className="toggle-overlay-button">
        See Details
      </button>

      <Reviews
        reviews={reviews}
        setReviews={setReviews}
        API_PREFIX={API_PREFIX}
        editable={true} // Allow adding reviews here
        restaurantId={id} // Pass the restaurant ID
        addAuthHeader={addAuthHeader}
        setRestaurant={setRestaurant} // Pass down to update the rating
      />
    </div>
  );
}

export default RestaurantReviews;