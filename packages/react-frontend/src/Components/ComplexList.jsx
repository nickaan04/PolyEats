import React from "react";
import Card from "react-bootstrap/Card";
import { Link } from "react-router-dom";
import campusMarketImage from "../assets/campus_market.jpg";

const ComplexList = ({ complexes }) => {
  return (
    <div>
      <h2>Complexes</h2>
      {complexes.map((complex, index) => (
        <Card style={{ width: "18rem" }} key={index}>
          <Card.Img variant="top" src={campusMarketImage} />
          <Card.Body>
            <Card.Title>
              <Link to={`/complex/${complex._id}`}>{complex.name}</Link>
            </Card.Title>
          </Card.Body>
        </Card>
      ))}
    </div>
  );
};

export default ComplexList;
