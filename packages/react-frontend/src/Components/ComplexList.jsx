import React from "react";
import Cards from "./Cards";
import campusMarketImage from "../Assets/campus_market.jpg";
import logo from "../Assets/logo.png";
import "../Styles/App.scss";

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
            image={complex.image || campusMarketImage} // Fallback to campusMarketImage
            title={complex.name}
            link={`/complex/${complex._id}`} // Link to each item’s unique page
          />
        ))}
      </div>
    </div>
  );
};

export default ComplexList;
