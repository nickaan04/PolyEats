import { useNavigate } from "react-router-dom";
import "../Styles/WelcomePage.scss";

// display login and signup buttons with logo
const WelcomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="welcome-page">
      <div className="welcome-buttons">
        {/* login button */}
        <button className="welcome-btn" onClick={() => navigate("/login")}>
          Login
        </button>
        {/* signup button */}
        <button className="welcome-btn" onClick={() => navigate("/signup")}>
          Sign Up
        </button>
      </div>
    </div>
  );
};

export default WelcomePage;
