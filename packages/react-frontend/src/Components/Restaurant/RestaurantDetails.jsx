import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Card from "react-bootstrap/Card";

const RestaurantDetails = ({ API_PREFIX, addAuthHeader }) => {
  const { restaurantId } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    fetch(`${API_PREFIX}/restaurant/${restaurantId}`, {
      headers: addAuthHeader()
    })
      .then((res) => (res.status === 200 ? res.json() : undefined))
      .then((json) => {
        if (json) {
          setRestaurant(json.restaurant.restaurant);
          setReviews(json.restaurant.reviews);
        }
      })
      .catch((error) => console.log(error));
  }, [restaurantId, API_PREFIX, addAuthHeader]);

  if (!restaurant) {
    return <p>Loading...</p>;
  }

  const formatAcceptedPayments = (payments) => {
    return Object.entries(payments)
      .filter(([key, value]) => value)
      .map(([key]) => key)
      .join(", ");
  };

  const formatNutritionTypes = (nutrition) => {
    return Object.entries(nutrition)
      .filter(([key, value]) => value)
      .map(([key]) => key)
      .join(", ");
  };

  return (
    <div>
      <h2>{restaurant.name}</h2>
      <p>
        <strong>Cuisine:</strong> {restaurant.cuisine}
      </p>
      <p>
        <strong>Average Rating:</strong> {restaurant.avg_rating}
      </p>
      <p>
        <strong>Delivery Available:</strong>{" "}
        {restaurant.delivery ? "Yes" : "No"}
      </p>
      <p>
        <strong>Price Range:</strong> {restaurant.price}
      </p>
      <h3>Hours:</h3>
      <ul>
        {Object.entries(restaurant.hours).map(([day, hours]) => (
          <li key={day}>
            {day}: {hours}
          </li>
        ))}
      </ul>
      <p>
        <strong>Accepted Payments:</strong>{" "}
        {formatAcceptedPayments(restaurant.accepted_payments)}
      </p>
      <p>
        <strong>Nutrition Types:</strong>{" "}
        {formatNutritionTypes(restaurant.nutrition_types)}
      </p>
      <h3>Reviews:</h3>
      {reviews.length > 0 ? (
        reviews.map((review, index) => (
          <Card key={index} style={{ margin: "10px 0" }}>
            <Card.Body>
              <Card.Title>{review.item}</Card.Title>
              <Card.Text>{review.review}</Card.Text>
              <Card.Text>
                <strong>Rating:</strong> {review.rating}
              </Card.Text>
            </Card.Body>
          </Card>
        ))
      ) : (
        <p>No reviews yet.</p>
      )}
    </div>
  );
};

export default RestaurantDetails;
