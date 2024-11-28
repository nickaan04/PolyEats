import React, { useState } from "react";
import { Button, Modal, Form } from "react-bootstrap";

const RestaurantFilter = ({ setFilters }) => {
  const [showModal, setShowModal] = useState(false);
  const [filterValues, setFilterValues] = useState({
    name: "",
    avg_rating: "",
    price: "",
    cuisine: "",
    delivery: ""
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilterValues((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    setFilters(filterValues); // Pass the selected filters to the parent component
    setShowModal(false);
  };

  const clearFilters = () => {
    setFilterValues({}); // Clear all filter fields
    setFilters({}); // Reset filters in parent
    setShowModal(false);
  };

  return (
    <>
      <Button variant="primary" onClick={() => setShowModal(true)}>
        Filter
      </Button>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Filter Restaurants</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="filterName">
              <Form.Label>Restaurant Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Search by name"
                name="name"
                value={filterValues.name || ""}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group controlId="filterRating">
              <Form.Label>Minimum Rating</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter rating (1-5)"
                name="minRating"
                value={filterValues.minRating || ""}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group controlId="filterPrice">
              <Form.Label>Price</Form.Label>
              <Form.Control
                as="select"
                name="price"
                value={filterValues.price || ""}
                onChange={handleInputChange}>
                <option value="">All</option>
                <option value="$">$</option>
                <option value="$$">$$</option>
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="filterCuisine">
              <Form.Label>Cuisine</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter cuisine (e.g., Mexican)"
                name="cuisine"
                value={filterValues.cuisine || ""}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group controlId="filterDelivery">
              <Form.Label>Delivery</Form.Label>
              <Form.Check
                type="checkbox"
                label="Offers delivery"
                name="delivery"
                checked={filterValues.delivery || false}
                onChange={(e) =>
                  setFilterValues((prev) => ({
                    ...prev,
                    delivery: e.target.checked
                  }))
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={clearFilters}>
            Clear Filters
          </Button>
          <Button variant="primary" onClick={applyFilters}>
            Apply Filters
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default RestaurantFilter;
