import React from "react";
import Cards from "./Cards";
import campusMarketImage from "../assets/campus_market.jpg";
import logo from "../Assets/logo.png";
import "../Styles/App.scss";

const colors = ["#2b46b7", "#86d561", "#47bff9", "#ffe05d", "#fe933b", "#f74943", "#ee75de", "#7356d3", "#1a602a"];

const ComplexList = ({ complexes }) => {
  return (
    <div>
      <div className="top-image">
        <img src={logo} alt="Top Banner" />
      </div>
      <h2>Dining Complexes</h2>
      <div className="card-container">
      {complexes.map((complex, index) => (
        <Cards
          key={index} 
          color={colors[index % colors.length] || campusMarketImage}  // Fallback to campusMarketImage
          title={complex.name}
          link={`/complex/${complex._id}`} // Link to each item’s unique page
        />
      ))}
    </div>
    </div>
  );
};

export default ComplexList;
