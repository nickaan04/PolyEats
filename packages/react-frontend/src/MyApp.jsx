import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate
} from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Styles/App.scss";
import "./Styles/ToastStyles.scss";
import { FiltersProvider } from "./Components/Restaurant/FiltersContext.jsx";
import Login from "./Login.jsx";
import VerifyEmail from "./VerifyEmail.jsx";
import ComplexList from "./Components/ComplexList.jsx";
import RestaurantList from "./Components/Restaurant/RestaurantList.jsx";
import RestaurantReviews from "./Components/Restaurant/RestaurantReviews.jsx";
import ImageList from "./Components/Restaurant/ImageList.jsx";
import BottomNavBar from "./Components/BottomNavBar.jsx";
import AccountPage from "./Components/AccountPage.jsx";
import FavoritesPage from "./Components/FavoritesPage.jsx";
import WelcomePage from "./Components/WelcomePage.jsx";

function MyApp() {
  // backend request prefix
  const API_PREFIX =
    "https://polyeats1901-awh8hmbsa9a4hsdf.westus-01.azurewebsites.net";
  const INVALID_TOKEN = "INVALID_TOKEN";
  const [token, setToken] = useState(
    localStorage.getItem("authToken") || INVALID_TOKEN
  );
  const [complexes, setComplexes] = useState([]);

  useEffect(() => {
    //save token to localStorage whenever it updates
    if (token && token !== INVALID_TOKEN) {
      localStorage.setItem("authToken", token);
    } else {
      localStorage.removeItem("authToken");
    }
  }, [token]);

  // add authentication header with user's bearer token
  function addAuthHeader(otherHeaders = {}) {
    return token === INVALID_TOKEN
      ? otherHeaders
      : { ...otherHeaders, Authorization: `Bearer ${token}` };
  }

  // fetch complex data to display on home page
  function fetchComplexes() {
    const promise = fetch(`${API_PREFIX}/complexes`, {
      headers: addAuthHeader()
    });

    return promise;
  }

  useEffect(() => {
    if (token !== INVALID_TOKEN) {
      // save complex data into complexes state
      fetchComplexes()
        .then((res) => (res.status === 200 ? res.json() : undefined))
        .then((json) => setComplexes(json ? json.complexes_list : null))
        .catch((error) => {
          console.log(error);
        });
    }
  }, [token]);

  // give user access to website with user credentials
  function loginUser(creds) {
    // attempt login with authentication
    const promise = fetch(`${API_PREFIX}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(creds)
    })
      .then((response) => {
        if (response.status === 200) {
          response.json().then((payload) => {
            setToken(payload.token);
            toast.success("Login successful");
          });
        } else {
          response.text().then((text) => {
            toast.error(`${text}`);
          });
        }
      })
      .catch((error) => {
        toast.error(`${error.message}`);
      });

    return promise;
  }

  // add user to database with authentication
  function signupUser(creds) {
    // attempt signup request
    const promise = fetch(`${API_PREFIX}/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(creds)
    })
      .then((response) => {
        if (response.status === 201) {
          // add token to token var
          response.json().then((payload) => setToken(payload.token));
          toast.success(
            "Signup successful. Email verification sent. Check spam if not in inbox"
          );
        } else {
          response.text().then((text) => {
            toast.error(`${text}`);
          });
        }
      })
      .catch((error) => {
        toast.error(`${error}`);
      });

    return promise;
  }

  // remove user access until next login
  function logoutUser(showLogoutMessage = true) {
    setToken(INVALID_TOKEN);
    if (showLogoutMessage) {
      toast.info("You have been logged out");
    }
  }

  // define page navigation and send appropriate paramaters into function
  return (
    <div className="container">
      <FiltersProvider>
        <Router>
          <div
            style={{ paddingBottom: token !== INVALID_TOKEN ? "85px" : "0" }}>
            {/* start all entry with welcome page */}
            <Routes>
              <Route path="/" element={<WelcomePage />} />
              <Route
                path="/login"
                element={
                  token === INVALID_TOKEN ? (
                    <Login handleSubmit={loginUser} />
                  ) : (
                    <Navigate to="/complexes" replace />
                  )
                }
              />
              <Route
                path="/signup"
                element={
                  token === INVALID_TOKEN ? (
                    <Login handleSubmit={signupUser} buttonLabel="Sign Up" />
                  ) : (
                    <Navigate to="/complexes" replace />
                  )
                }
              />
              {/* enter into "home"/ list of complexes when granted access */}
              <Route
                path="/complexes"
                element={
                  token === INVALID_TOKEN ? (
                    <Navigate to="/" replace />
                  ) : (
                    <ComplexList complexes={complexes} />
                  )
                }
              />
              <Route
                path="/complex/:complexId"
                element={
                  <RestaurantList
                    API_PREFIX={API_PREFIX}
                    addAuthHeader={addAuthHeader}
                  />
                }
              />
              <Route
                path="/restaurant/:id"
                element={
                  <RestaurantReviews
                    API_PREFIX={API_PREFIX}
                    addAuthHeader={addAuthHeader}
                  />
                }
              />
              <Route
                path="/restaurant/:id/images"
                element={
                  <ImageList
                    API_PREFIX={API_PREFIX}
                    addAuthHeader={addAuthHeader}
                  />
                }
              />
              <Route
                path="/auth/verify-email"
                element={<VerifyEmail API_PREFIX={API_PREFIX} />}
              />
              <Route
                path="/account"
                element={
                  token === INVALID_TOKEN ? (
                    <Navigate to="/" replace />
                  ) : (
                    <AccountPage
                      API_PREFIX={API_PREFIX}
                      addAuthHeader={addAuthHeader}
                      logoutUser={logoutUser}
                    />
                  )
                }
              />
              <Route
                path="/favorites"
                element={
                  token === INVALID_TOKEN ? (
                    <Navigate to="/" replace />
                  ) : (
                    <FavoritesPage
                      API_PREFIX={API_PREFIX}
                      addAuthHeader={addAuthHeader}
                    />
                  )
                }
              />
            </Routes>
            {token !== INVALID_TOKEN && <BottomNavBar />}
          </div>
        </Router>
      </FiltersProvider>
      <ToastContainer
        className="custom-toast-container"
        toastClassName="custom-toast"
        closeButton={({ closeToast }) => (
          <button className="custom-close-button" onClick={closeToast}>
            &times;
          </button>
        )}
      />
    </div>
  );
}
export default MyApp;
