import Card from "react-bootstrap/Card";
import { Link } from "react-router-dom";

// reusable card for complexes, restaurants, and reviews
function Cards({ image, title, link, removeButton }) {
  return (
    // link directs to next page of application
    <Link to={link} style={{ textDecoration: "none", color: "inherit" }}>
      <Card className="card">
        {/* button to remove card from applicaton */}
        {removeButton && <div className="card-remove">{removeButton}</div>}
        {/* use image from database to display on card */}
        <Card.Img variant="top" src={image} />
        <Card.Body className="card-body">
          {/* use title from database to display on card */}
          <Card.Title className="card-title">{title}</Card.Title>
        </Card.Body>
      </Card>
    </Link>
  );
}

export default Cards;
