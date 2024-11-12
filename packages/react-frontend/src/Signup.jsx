import React, { useState } from "react";
import { Link } from "react-router-dom";

function Signup(props) {
  const [userInformation, setUserInformation] = useState({
    calpoly_email: "",
    password: "",
    first_name: "",
    last_name: "",
    confirm_password: ""
  });

  function handleChange(event) {
    const { name, value } = event.target;
    setUserInformation((prevCreds) => ({ ...prevCreds, [name]: value }));
  }

  function submitForm() {
    props.handleSubmit(userInformation);
    setUserInformation({ calpoly_email: "", password: "" });
  }

  return (
    <div>
      <form>
        <label htmlFor="first_name">First Name</label>
        <input
          type="text"
          name="First Name"
          id="first_name"
          value={userInformation.first_name}
          onChange={handleChange}
        />
        <label htmlFor="last_name">Last Name</label>
        <input
          type="text"
          name="Last Name"
          id="last_name"
          value={userInformation.last_name}
          onChange={handleChange}
        />
        <label htmlFor="calpoly_email">Cal Poly Email</label>
        <input
          type="text"
          name="calpoly_email"
          id="calpoly_email"
          value={userInformation.calpoly_email}
          onChange={handleChange}
        />
        <label htmlFor="password">Password</label>
        <input
          type="password"
          name="password"
          id="password"
          value={userInformation.password}
          onChange={handleChange}
        />
        <label htmlFor="confirm_password">Confirm Password</label>
        <input
          type="password"
          name="confirm_password"
          id="confirm_password"
          value={userInformation.confirm_password}
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
          Already have an account? <Link to="/login">Log In</Link>
        </p>
      ) : (
        <p>
          Don’t have an account? <Link to="/signup">Sign Up</Link>
        </p>
      )}

      {props.message && <p>{props.message}</p>}
    </div>
  );
}
export default Signup;
