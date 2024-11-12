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
    <div className="page-container">
    <Container className="mt-3">
      <Row className="justify-content-center">
        <Col md={6} className="text-center">
          <Image
            src="/abstract_user.svg"
            alt="User Icon"
            width={100}
            className=""
          />
          <h5 className="mb-2">
            {userInformation.first_name} {userInformation.last_name}
          </h5>
        </Col>
      </Row>
      <Row>
        <Col md={6} className="mx-auto">
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
              <a href="#account-information" className="custom-link">
                Email Notifications
              </a>
            </ListGroup.Item>
            <ListGroup.Item className="custom-list-item">
              <a href="#account-information" className="custom-link">
                Privacy Information
              </a>
            </ListGroup.Item>
            <ListGroup.Item className="custom-list-item">
              <a href="#account-information" className="custom-link">
                Log Out
              </a>
            </ListGroup.Item>
          </ListGroup>
        </Col>
      </Row>
    </Container>
    <NavBar/>
    </div>
  );
}
export default Account;
