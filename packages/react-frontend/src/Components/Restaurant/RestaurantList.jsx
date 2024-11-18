import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Card from "react-bootstrap/Card";
import campusMarketImage from "../../assets/campus_market.jpg";

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
      <h2>Restaurants</h2>
      {restaurants.map((restaurant, index) => (
        <Card style={{ width: "18rem" }} key={index}>
          <Card.Img variant="top" src={campusMarketImage} />
          <Card.Body>
            <Card.Title>
              {" "}
              <Link to={`/restaurant/${restaurant._id}`}>
                {restaurant.name}
              </Link>
            </Card.Title>
          </Card.Body>
        </Card>
      ))}
    </div>
  );
};

export default RestaurantList;
