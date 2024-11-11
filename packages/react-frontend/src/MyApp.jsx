import React, { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import campusMarketImage from "./assets/campus_market.jpg";
import "./App.scss";
import Login from "./Login";
import VerifyEmail from "./VerifyEmail";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate
} from "react-router-dom";

function MyApp() {
  const API_PREFIX = "http://localhost:8000";
  const INVALID_TOKEN = "INVALID_TOKEN";
  const [token, setToken] = useState(
    localStorage.getItem("authToken") || INVALID_TOKEN
  );
  const [message, setMessage] = useState("");
  const [complexes, setComplexes] = useState([]);

  useEffect(() => {
    //save token to localStorage whenever it updates
    if (token && token !== INVALID_TOKEN) {
      localStorage.setItem("authToken", token);
    } else {
      localStorage.removeItem("authToken");
    }
  }, [token]);

  function addAuthHeader(otherHeaders = {}) {
    return token === INVALID_TOKEN
      ? otherHeaders
      : { ...otherHeaders, Authorization: `Bearer ${token}` };
  }

  function fetchComplexes() {
    const promise = fetch(`${API_PREFIX}/complexes`, {
      headers: addAuthHeader()
    });

    return promise;
  }

  useEffect(() => {
    if (token !== INVALID_TOKEN) {
      fetchComplexes()
        .then((res) => (res.status === 200 ? res.json() : undefined))
        .then((json) => setComplexes(json ? json.complexes_list : null))
        .catch((error) => {
          console.log(error);
        });
    }
  }, [token]);

function loginUser(creds) {
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
          setMessage("Login successful");
        });
      } else {
        response.text().then((text) => {
          setMessage(`Login Error ${response.status}: ${text}`);
        });
      }
    })
    .catch((error) => {
      setMessage(`Login Error: ${error.message}`);
    });

  return promise;
}


  function signupUser(creds) {
    const promise = fetch(`${API_PREFIX}/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(creds)
    })
      .then((response) => {
        if (response.status === 201) {
          response.json().then((payload) => setToken(payload.token));
          setMessage("Signup successful. Email verfication sent.");
        } else {
          response.text().then((text) => {
            setMessage(`Signup Error ${response.status}: ${text}`);
          });
        }
      })
      .catch((error) => {
        setMessage(`Signup Error: ${error}`);
      });

    return promise;
  }

  function logoutUser() {
    setToken(INVALID_TOKEN);
    setMessage("You have been logged out");
  }

  const cards = complexes.map((row, index) => {
    return (
      <Card style={{ width: "18rem" }} key={index}>
        <Card.Img variant="top" src={campusMarketImage} />
        <Card.Body>
          <Card.Title>{row.name}</Card.Title>
        </Card.Body>
      </Card>
    );
  });

  return (
    <div className="container">
      <Router>
        <Routes>
          <Route
            path="/login"
            element={
              token === INVALID_TOKEN ? (
                <Login handleSubmit={loginUser} message={message} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/signup"
            element={
              token === INVALID_TOKEN ? (
                <Login
                  handleSubmit={signupUser}
                  buttonLabel="Sign Up"
                  message={message}
                />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/auth/verify-email"
            element={<VerifyEmail />}
          />
          <Route
            path="/"
            element={
              token === INVALID_TOKEN ? (
                <Navigate to="/login" replace />
              ) : (
                <>
                  <>{cards}</>
                  <button onClick={logoutUser}>Sign Out</button>
                </>
              )
            }
          />
        </Routes>
      </Router>
    </div>
  );
}
export default MyApp;