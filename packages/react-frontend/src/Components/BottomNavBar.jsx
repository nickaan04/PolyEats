import { Link, useLocation } from "react-router-dom";
import "../Styles/BottomNavBar.scss";
import { Star, Person, House } from "react-bootstrap-icons";

const BottomNavBar = () => {
  const location = useLocation();

  return (
    <div className="bottom-nav">
      <Link
        to="/complexes"
        className={location.pathname === "/complexes" ? "active" : ""}>
        <House />
        Home
      </Link>
      <Link
        to="/favorites"
        className={location.pathname === "/favorites" ? "active" : ""}>
        <Star />
        Favorite
      </Link>
      <Link
        to="/account"
        className={location.pathname === "/account" ? "active" : ""}>
        <Person />
        Account
      </Link>
    </div>
  );
};

export default BottomNavBar;
