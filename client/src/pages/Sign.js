import "./styles/Sign.css";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// import {jwtDecode } from 'jwt-decode';
// import moment from 'moment-timezone';

const Sign = ({ setAuth }) => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isRegistered, setIsRegistered] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [testSamePwd, setTestSamePwd] = useState("");
  if (localStorage.getItem("authToken")) {
    navigate("/dashboard");
  }

    const handleRegisterTrue = () => {
      setIsRegistered(true);
    };
    const handleRegisterFalse = () => {
      setIsRegistered(false);
    };
    const handleSubmit = async (e) => {
      e.preventDefault();
      if (isRegistered) {
        try {
          const request = await axios.post(
            '/api/auth/login',
            { email, password }
          );
          // console.log(request.data.token);

          if (request.data.token) {
            // console.log(request.data.token);
            setAuth(request.data.token);
            navigate("/dashboard");
          }
        } catch (error) {
          if (error.response) {
            // Check for 400 and 500 error codes
            if (error.response.status === 401) {
              setError(error.response.data); // Show the error message from the server for 400 error
            } else if (error.response.status === 500) {
              setError(
                "An ,internal server error occurred. Please try again later."
              );
            } else {
              setError("An unexpected error occurred. Please try again.");
            }
          } else {
            // Handle errors not related to the server (e.g., network issues)
            setError(
              "Unable to connect to the server. Please check your network connection."
            );
          }
        }
      }
      if (!isRegistered) {
        checkSamePwd();
        if (testSamePwd === true) {
          try {
            const res = await axios.post("/api/auth/register", {
              email,
              username,
              password,
              name,
            });
            console.log(res.data.token);
            if (res.data.token) {
              console.log(request.data.token);
              setAuth(request.data.token);
              navigate("/dashboard");
            }
          } catch (error) {
            if (error.response) {
              setError(error.response.data);
            } else {
              setError(
                "An unexpected error occurred. You can not reatch the server. Please try again."
              );
            }
          }
        }
      }

    };
    const checkSamePwd = () => {
      if (password !== confirmPassword) {
        setError("Passwords don't match");
        // alert("Passwords don't match");// for debug
        setTestSamePwd(false);
      }
      // console.log("Passwords match"); // for debug
      setTestSamePwd(true);
    };

    return (
      <div className="form-container">
        {isRegistered ? (
          <p className="title">Login</p>
        ) : (
          <p className="title">Register</p>
        )}
        <form onSubmit={handleSubmit} className="form">
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              onChange={(e) => {
                setEmail(e.target.value);
              }}
              type="email"
              name="email"
              id="email"
              placeholder="example@lmsc.com"
            />
          </div>
          {!isRegistered && (
            <div className="input-group">
              <label htmlFor="name">Name</label>
              <input
                onChange={(e) => {
                  setName(e.target.value);
                }}
                type="text"
                name="name"
                id="name"
                placeholder="John Doe"
              />
            </div>
          )}
          {!isRegistered && (
            <div className="input-group">
              <label htmlFor="username">Username</label>
              <input
                onChange={(e) => {
                  setUsername(e.target.value);
                }}
                type="text"
                name="username"
                id="username"
                placeholder="johndoe67"
              />
            </div>
          )}
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              onChange={(e) => {
                setPassword(e.target.value);
              }}
              type="password"
              name="password"
              id="password"
              placeholder="Min 8 characters and 1 number"
            />
            {!isRegistered && (
              <label htmlFor="confirmpassword">Confirm Password</label>
            )}
            {!isRegistered && (
              <input
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                }}
                type="password"
                name="confirmpassword"
                id="confirmpassword"
                placeholder="Same password plz ..."
              />
            )}
            {/* {isRegistered && (
            <div className="forgot">
              <a rel="noopener noreferrer" href="#">
                Forgot Password ?
              </a>
            </div>
          )} */}
          </div>
          {/* Conditionally render the error message if it exists */}
          {error && <p className="error-message">{error}</p>}
          <br />
          {isRegistered ? (
            <button type="submit" className="sign">
              Sign in
            </button>
          ) : (
            <button type="submit" className="sign">
              Sign Up
            </button>
          )}
        </form>
        <br />

        {isRegistered ? (
          <p className="signup">
            Don't have an account?
            <a
              rel="noopener noreferrer"
              href="#"
              onClick={handleRegisterFalse}
              className=""
            >
              Sign up
            </a>
          </p>
        ) : (
          <p className="signup">
            Already have an account?
            <a
              rel="noopener noreferrer"
              href="#"
              onClick={handleRegisterTrue}
              className=""
            >
              Sign in
            </a>
          </p>
        )}
      </div>
    );
  };

  export default Sign;
