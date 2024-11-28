import React from "react";
import { Form } from "react-bootstrap";

const RestaurantFilter = ({ onFilterChange }) => {
  const handleFilterChange = (e) => {
    onFilterChange(e.target.value);
  };

  return (
    <Form>
      <Form.Group controlId="priceFilter">
        <Form.Label>Filter by Price</Form.Label>
        <Form.Control as="select" onChange={handleFilterChange}>
          <option value="all">All</option>
          <option value="$">$</option>
          <option value="$$">$$</option>
          <option value="$$$">$$$</option>
          <option value="$$$$">$$$$</option>
        </Form.Control>
      </Form.Group>
    </Form>
  );
};

export default RestaurantFilter;
