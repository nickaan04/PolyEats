import { useEffect } from "react";
import Cards from "./Cards";
import campusMarketImage from "../Assets/campus_market.jpg";
import logo from "../Assets/logo.png";
import "../Styles/App.scss";
import { useFilters } from "./Restaurant/FiltersContext";

// list complexes as cards and set order with no filters
const ComplexList = ({ complexes }) => {
  const { setFilters } = useFilters();

  // Reset filters when ComplexList is rendered
  useEffect(() => {
    const defaultFilters = {
      name: "",
      minRating: "",
      price: "",
      cuisine: "",
      delivery: "",
      accepted_payments: {},
      nutrition_types: {},
      hours: {}
    };
    setFilters(defaultFilters); // Reset filters to default values
  }, [setFilters]);

  return (
    <div>
      <div className="top-image">
        {/* display logo at top of page */}
        <img src={logo} alt="Top Banner" />
      </div>
      <h2 className="heading">Dining Complexes</h2>
      <div className="card-container">
        {/* iterate through complexes in database and define a card with info */}
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
