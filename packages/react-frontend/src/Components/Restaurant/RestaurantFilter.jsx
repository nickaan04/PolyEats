import React, { useState } from "react";
import { Button, Modal, Form } from "react-bootstrap";
import { useFilters } from "./FiltersContext"

const RestaurantFilter = () => {
  const { filters, setFilters } = useFilters();
  const [showModal, setShowModal] = useState(false);
  const [filterValues, setFilterValues] = useState({
    name: filters.name || "",
    minRating: filters.minRating || "",
    price: filters.price || "",
    cuisine: filters.cuisine || "",
    delivery: filters.delivery || false,
    accepted_payments: filters.accepted_payments || {},
    nutrition_types: filters.nutrition_types || {},
    hours: filters.hours || {}
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilterValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e, category) => {
    const { name, checked } = e.target;
    setFilterValues((prev) => ({
      ...prev,
      [category]: { ...prev[category], [name]: checked }
    }));
  };

  const applyFilters = () => {
    setFilters(filterValues); // Persist the filters in the context
    setShowModal(false);
  };

  const clearFilters = () => {
    const clearedFilters = {
      name: "",
      minRating: "",
      price: "",
      cuisine: "",
      delivery: "",
      accepted_payments: {},
      nutrition_types: {},
      hours: {}
    };
    setFilterValues(clearedFilters);
    setFilters(clearedFilters);
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
            <Form.Group controlId="filterPayments">
              <Form.Label>Accepted Payments</Form.Label>
              {["PolyCard", "CreditDebit", "Cash"].map((payment) => (
                <Form.Check
                  key={payment}
                  type="checkbox"
                  label={payment}
                  name={payment}
                  checked={filterValues.accepted_payments[payment] || false}
                  onChange={(e) => handleCheckboxChange(e, "accepted_payments")}
                />
              ))}
            </Form.Group>
            <Form.Group controlId="filterNutrition">
              <Form.Label>Nutrition Types</Form.Label>
              {["Vegan", "GlutenFree", "Vegetarian"].map((type) => (
                <Form.Check
                  key={type}
                  type="checkbox"
                  label={type}
                  name={type}
                  checked={filterValues.nutrition_types[type] || false}
                  onChange={(e) => handleCheckboxChange(e, "nutrition_types")}
                />
              ))}
            </Form.Group>
            <Form.Group controlId="filterHours">
              <Form.Label>Days Open</Form.Label>
              {[
                "M",
                "T",
                "W",
                "TH",
                "F",
                "SAT",
                "SUN"
              ].map((day) => (
                <Form.Check
                  key={day}
                  type="checkbox"
                  label={day}
                  name={day}
                  checked={filterValues.hours[day] || false}
                  onChange={(e) => handleCheckboxChange(e, "hours")}
                />
              ))}
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
