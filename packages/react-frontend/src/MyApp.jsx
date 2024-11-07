import React, { useState, useEffect } from "react";
import Table from "./Table";
import Form from "./Form";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import campusMarketImage from "./assets/campus_market.jpg";
import "./App.scss";

function MyApp() {
  const [complexes, setComplexes] = useState([]);

  function removeOneCharacter(index) {
    const deletedUser = characters.find((character, i) => i === index);
    const id = deletedUser["_id"];

    fetch(`http://localhost:8000/users/${id}`, {
      method: "DELETE"
    })
      .then((res) => {
        if (res.status === 204) {
          const updated = characters.filter((character, i) => i !== index);
          setCharacters(updated);
        } else {
          console.log(`Expected status 204, instead got ${res.status}`);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  function fetchUsers() {
    const promise = fetch("http://localhost:8000/users");
    return promise;
  }

  function fetchComplexes() {
    const promise = fetch("http://localhost:8000/complexes");
    return promise;
  }

  //TODO: Convert to Mongo call
  const complex_data = [
    { name: "1901 Marketplace" },
    { name: "University Union" },
    { name: "Campus Market" },
    { name: "Vista Grande" },
    { name: "Poly Canyon Village" }
  ];

  useEffect(() => {
    fetchComplexes()
      .then((res) => res.json())
      .then((json) => setComplexes(json.complexes_list))
      .catch((error) => {
        console.log(error);
      });
  }, []);

  function postUser(person) {
    const promise = fetch("http://localhost:8000/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(person)
    });

    return promise;
  }

  function updateList(person) {
    postUser(person)
      .then((res) => {
        if (res.status === 201) {
          return res.json();
        } else {
          console.log(`Expected status 201, instead got ${res.status}`);
        }
      })
      .then((json) => setCharacters([...characters, json]))
      .catch((error) => {
        console.log(error);
      });
  }
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
