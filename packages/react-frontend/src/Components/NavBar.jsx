import React from "react";
import { Container, Row, Col, Nav } from "react-bootstrap";
import { FaHome, FaBookmark, FaRegUserCircle } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import "../css/navbar.css";

function NavBar() {
  return (
    <div className="page-container">
      <Nav
        className="bottom-nav"
        activeKey="/home"
        onSelect={(selectedKey) => alert(`selected ${selectedKey}`)}
        justify>
        <Nav.Item>
          <Nav.Link href="/home" eventKey="home">
            <FaHome size={24} />
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="link-2">
            <FaBookmark size={24} />
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="settings">
            <FaRegUserCircle size={24} />
          </Nav.Link>
        </Nav.Item>
      </Nav>
    </div>
  );
}
export default NavBar;
