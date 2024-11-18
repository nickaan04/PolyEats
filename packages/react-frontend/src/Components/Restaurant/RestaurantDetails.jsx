import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../../Styles/RestaurantDetails.scss";

const RestaurantDetails = ({ API_PREFIX, addAuthHeader }) => {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    //fetch restaurant details
    fetch(`${API_PREFIX}/restaurant/${id}`, {
      headers: addAuthHeader()
    })
      .then((res) => res.json())
      .then((data) => {
        setRestaurant(data.restaurant.restaurant);
        setReviews(data.restaurant.reviews);
      })
      .catch((error) =>
        console.error("Error fetching restaurant details:", error)
      );

    //check if restaurant is in favorites
    fetch(`${API_PREFIX}/account/favorites`, {
      headers: addAuthHeader()
    })
      .then((res) => res.json())
      .then((data) => {
        const favorites = data.favorites || [];
        setIsFavorite(favorites.some((fav) => fav._id === id));
      })
      .catch((error) =>
        console.error("Error fetching favorite restaurants:", error)
      );
  }, [API_PREFIX, addAuthHeader, id]);

  //add or remove restaurant from favorites
  const toggleFavorite = async () => {
    const url = `${API_PREFIX}/account/favorites/${id}`;
    const method = isFavorite ? "DELETE" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: addAuthHeader()
      });

      if (response.ok) {
        setIsFavorite(!isFavorite);
        alert(
          isFavorite
            ? "Restaurant removed from favorites."
            : "Restaurant added to favorites."
        );
      } else {
        alert("Error updating favorites.");
      }
    } catch (error) {
      console.error("Error updating favorites:", error);
    }
  };

  if (!restaurant) {
    return <p>Loading restaurant details...</p>;
  }

  return (
    <div className="restaurant-details">
      <div className="header">
        <h1>{restaurant.name}</h1>
        <button
          className={`bookmark ${isFavorite ? "favorited" : ""}`}
          onClick={toggleFavorite}>
          {isFavorite ? "★" : "☆"}
        </button>
      </div>
      <p>{restaurant.cuisine}</p>
      <p>Average Rating: {restaurant.avg_rating}</p>
      <p>{restaurant.description}</p>
      <p>
        Accepted Payments:{" "}
        {Object.keys(restaurant.accepted_payments).join(", ")}
      </p>
      <p>
        Nutrition Types: {Object.keys(restaurant.nutrition_types).join(", ")}
      </p>

      {/* Reviews Section */}
      <div className="reviews-section">
        <h2>Reviews</h2>
        {reviews.length > 0 ? (
          reviews.map((review, index) => (
            <div key={index} className="review-card">
              <h3>{review.item}</h3>
              <p>
                By: {review.author.firstname} {review.author.lastname}
              </p>
              <div className="stars">
                {"★".repeat(review.rating)}
                {"☆".repeat(5 - review.rating)}
              </div>
              <p>{review.review}</p>
            </div>
          ))
        ) : (
          <p>No reviews yet</p>
        )}
      </div>
    </div>
  );
};

export default RestaurantDetails;
