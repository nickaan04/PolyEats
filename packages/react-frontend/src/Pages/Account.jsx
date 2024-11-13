import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  ListGroup,
  Image,
  Badge
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "../css/account.css";
import NavBar from "../Components/Navbar";

function Account(props) {
  const [userInformation, setUserInformation] = useState({
    calpoly_email: "",
    password: "",
    first_name: "John",
    last_name: "Wick",
    confirm_password: ""
  });

  

  return (
      <Container className="page-container">
        {/* User Info Section */}
        <Row className="user-info mb-4">
          <Col xs={12} className="text-center">
            <Image
              src="/abstract_user.svg"
              alt="User Icon"
              width={100}
            />
            <h5 className="mb-2">
              {userInformation.first_name} {userInformation.last_name}
            </h5>
          </Col>
        </Row>
  
        {/* Settings List Section */}
        <Row className="settings-section">
          <Col xs={12} md={8} lg={6} className="mx-auto">
            {/* Contributions */}
            <div className="list-group-container">
              <label>Contributions</label>
              <ListGroup className="custom-list-group">
                <ListGroup.Item className="custom-list-item">
                  <a href="#reviews" className="custom-link">
                    Reviews <Badge bg="secondary">9</Badge>
                  </a>
                </ListGroup.Item>
                <ListGroup.Item className="custom-list-item">
                  <a href="#photos" className="custom-link">
                    Photos <Badge bg="secondary">23</Badge>
                  </a>
                </ListGroup.Item>
              </ListGroup>
            </div>
  
            {/* Activity */}
            <div className="list-group-container">
              <label>Activity</label>
              <ListGroup className="custom-list-group">
                <ListGroup.Item className="custom-list-item">
                  <a href="#Order History" className="custom-link">
                    Order History
                  </a>
                </ListGroup.Item>
                <ListGroup.Item className="custom-list-item">
                  <a href="#favorites" className="custom-link">
                    Favorites
                  </a>
                </ListGroup.Item>
              </ListGroup>
            </div>
  
            {/* Settings */}
            <div className="list-group-container">
              <label>Settings</label>
              <ListGroup className="custom-list-group">
                <ListGroup.Item className="custom-list-item">
                  <a href="#preferences" className="custom-link">
                    Preferences
                  </a>
                </ListGroup.Item>
                <ListGroup.Item className="custom-list-item">
                  <a href="#account-information" className="custom-link">
                    Account Information
                  </a>
                </ListGroup.Item>
                <ListGroup.Item className="custom-list-item">
                  <a href="#email-notifications" className="custom-link">
                    Email Notifications
                  </a>
                </ListGroup.Item>
                <ListGroup.Item className="custom-list-item">
                  <a href="#privacy-information" className="custom-link">
                    Privacy Information
                  </a>
                </ListGroup.Item>
                <ListGroup.Item className="custom-list-item">
                  <a href="#log-out" className="custom-link">
                    Log Out
                  </a>
                </ListGroup.Item>
              </ListGroup>
            </div>
          </Col>
        </Row>
  
        {/* Navbar */}
        <NavBar />
      </Container>
  );
}
export default Account;
