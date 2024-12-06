import { useState } from "react";
import { Link } from "react-router-dom";
import "./Styles/Login.scss";

// handle login and signup using authentication
function Login(props) {
  // initiate empty credentials
  const [creds, setCreds] = useState({
    calpoly_email: "",
    password: "",
    firstname: "",
    lastname: ""
  });

  // adjust credentials with user input
  function handleChange(event) {
    const { name, value } = event.target;
    setCreds((prevCreds) => ({ ...prevCreds, [name]: value }));
  }

  // submit user info on click
  function submitForm() {
    const { firstname, lastname, calpoly_email, password } = creds;
    //conditionally include the name in the submitted credentials for signup
    const userCreds =
      props.buttonLabel === "Sign Up"
        ? { firstname, lastname, calpoly_email, password }
        : { calpoly_email, password };
    props.handleSubmit(userCreds);
    setCreds({ calpoly_email: "", password: "", firstname: "", lastname: "" });
  }

  return (
    // display login or sign up page
    <div className="login-page">
      {/* check status for header display */}
      <h1 className="login-title">
        {props.buttonLabel === "Sign Up" ? "Create an Account" : "Welcome Back"}
      </h1>
      <form>
        {/* display sign up form and handle submission */}
        {props.buttonLabel === "Sign Up" && (
          <div>
            <>
              <label htmlFor="firstname">First Name</label>
              <input
                type="text"
                name="firstname"
                id="firstname"
                value={creds.firstname}
                onChange={handleChange}
              />
            </>
            <>
              <label htmlFor="lastname">Last Name</label>
              <input
                type="text"
                name="lastname"
                id="lastname"
                value={creds.lastname}
                onChange={handleChange}
              />
            </>
          </div>
        )}
        <label htmlFor="calpoly_email">Cal Poly Email</label>
        <input
          type="text"
          name="calpoly_email"
          id="calpoly_email"
          value={creds.calpoly_email}
          onChange={handleChange}
        />
        <label htmlFor="password">Password</label>
        <input
          type="password"
          name="password"
          id="password"
          value={creds.password}
          onChange={handleChange}
        />
        <input
          type="button"
          value={props.buttonLabel || "Log In"}
          onClick={submitForm}
        />
      </form>

      {props.buttonLabel === "Sign Up" ? (
        <p>
          {/* define link to login page */}
          Already have an account? <Link to="/login">Log In</Link>
        </p>
      ) : (
        <p>
          {/* define link to signup page */}
          Don’t have an account? <Link to="/signup">Sign Up</Link>
        </p>
      )}
    </div>
  );
}
export default Login;
