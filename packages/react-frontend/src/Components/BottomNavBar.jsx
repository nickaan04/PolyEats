import { Link, useLocation } from "react-router-dom";
import "../Styles/BottomNavBar.scss";
import { Star, Person, House } from "react-bootstrap-icons";

// bar displayed on bottom of webpage with ability to open important pages
const BottomNavBar = () => {
  const location = useLocation();

  return (
    <div className="bottom-nav">
      {/* link home button to complexes page */}
      <Link
        to="/complexes"
        className={location.pathname === "/complexes" ? "active" : ""}>
        <House />
        Home
      </Link>
      {/* link favorites button to favorites page */}
      <Link
        to="/favorites"
        className={location.pathname === "/favorites" ? "active" : ""}>
        <Star />
        Favorite
      </Link>
      {/* link account button to account page */}
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
