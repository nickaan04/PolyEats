import React, { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import campusMarketImage from "./assets/campus_market.jpg";
import "./App.scss";

function MyApp() {
  const [complexes, setComplexes] = useState([]);

  function fetchComplexes() {
    const promise = fetch("http://localhost:8000/complexes");
    return promise;
  }

  useEffect(() => {
    fetchComplexes()
      .then((res) => res.json())
      .then((json) => setComplexes(json.complexes_list))
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const cards = complexes.map((row, index) => {
    return (
      <Card style={{ width: "18rem" }} key={index}>
        <Card.Img variant="top" src={campusMarketImage} />
        <Card.Body>
          <Card.Title>{row.name}</Card.Title>
        </Card.Body>
      </Card>
    );
  });

  return (
    <>
      <div className="container">{cards}</div>
    </>
  );
}
export default MyApp;
