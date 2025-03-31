import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Send } from "lucide-react";
import SubmitButton from "../components/SubmitButton";

// import {jwtDecode } from 'jwt-decode';
// import moment from 'moment-timezone';

const Sign = ({ setAuth, unsetLoggedOut }) => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [isRegistered, setIsRegistered] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [testSamePwd, setTestSamePwd] = useState("");
  const [classCode, setClassCode] = useState("");
  if (localStorage.getItem("authToken")) {
    navigate("/dashboard");
    z;
  }

  const handleRegisterTrue = () => {
    setIsRegistered(true);
  };
  const handleRegisterFalse = () => {
    setIsRegistered(false);
    setError("");
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isRegistered) {
      try {
        const request = await axios.post("/api/auth/login", {
          email,
          password,
        });
        // console.log(request.data.token);

        if (request.data.token) {
          // console.log(request.data.token);
          setAuth(request.data.token);
          unsetLoggedOut(false);
          navigate("/dashboard");
        }
      } catch (error) {
        if (error.response) {
          // Check for 400 and 500 error codes
          if (error.response.status === 400) {
            setError(error.response.data.message); // Show the error message from the server for 400 error
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
    } else if (!isRegistered) {
      checkSamePwd();
      if (testSamePwd) {
        try {
          const res = await axios.post("/api/auth/register", {
            email,
            username,
            password,
            name,
          });
          if (res.data.token) {
            setAuth(res.data.token);
            unsetLoggedOut(false);
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
  const handleIsRegister = (e) => {
    e.preventDefault();
    setIsRegistered(!isRegistered);
  };
  return (
    <div className="flex justify-center items-center w-full h-full">
      <div className="space-y-4 mt-4 flex flex-col justify-center items-center bg-gradient-to-br from-neutral-600 via-neutral-500 to-neutral-950 p-4 rounded-xl">
        <div>
          <h1 className="text-[--white] text-2xl font-bold">
            {isRegistered ? "Sign In" : "Sign Up"}
          </h1>
        </div>
        <form action="" onSubmit={handleSubmit} className="space-y-4 ">
          {isRegistered ? (
            <div>
              <div className="flex flex-col">
                <label
                  htmlFor="email"
                  className="requiredp w-full h-fit m-2 text-lg labelSign flex items-center justify-center font-semibold text-[--white]  "
                >
                  Email{" "}
                </label>
                <input
                  type="email"
                  id="email"
                  placeholder={"exemple@gmail.com"}
                  onChange={(e) => setEmail(e.target.value)}
                  className="placeholder:italic outline-none placeholder:text-gray-400 placeholder: text-lg rounded-lg p-1 valid:border-solid valid:border-lime-500"
                />
              </div>
              <div className="flex flex-col">
                <label
                  htmlFor="password"
                  className="requiredp w-full labelSign flex items-center justify-center h-fit m-2 text-lg font-semibold text-[--white]  "
                >
                  Password{" "}
                </label>
                <input
                  type="password"
                  id="password"
                  placeholder={"Your password here..."}
                  onChange={(e) => setPassword(e.target.value)}
                  className="placeholder:italic outline-none placeholder:text-gray-400 placeholder: text-lg rounded-lg p-1 valid:border-solid valid:border-lime-500"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-col-2 grid-row-4 gap-4">
              <div>
                <div className="flex flex-col ">
                  <div>
                    <label
                      htmlFor="email"
                      className="requiredp w-full labelSign flex items-center justify-center h-fit m-2 text-lg font-semibold text-[--white]  "
                    >
                      Email{" "}
                    </label>
                    <input
                      type="email"
                      id="email"
                      placeholder={"exemple@gmail.com"}
                      onChange={(e) => setEmail(e.target.value)}
                      className="placeholder:italic outline-none placeholder:text-gray-400 placeholder: text-lg rounded-lg p-1 valid:border-solid valid:border-lime-500"
                    />
                  </div>
                </div>
              </div>
              <div className="row-start-2">
                <div className="flex flex-col">
                  <label
                    htmlFor="username"
                    className="requiredp w-full labelSign flex items-center justify-center h-fit m-2 text-lg font-semibold text-[--white]  "
                  >
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    placeholder={"Your username"}
                    onChange={(e) => setUsername(e.target.value)}
                    className="placeholder:italic outline-none placeholder:text-gray-400 placeholder: text-lg rounded-lg p-1 valid:border-solid valid:border-lime-500"
                  />
                </div>
              </div>
              <div className="row-start-2">
                <div className="flex flex-col">
                  <label
                    htmlFor="name"
                    className="requiredp w-full labelSign flex items-center justify-center h-fit m-2 text-lg font-semibold text-[--white]  "
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    placeholder={"Your name"}
                    onChange={(e) => setName(e.target.value)}
                    className="placeholder:italic outline-none placeholder:text-gray-400 placeholder: text-lg rounded-lg p-1 valid:border-solid valid:border-lime-500"
                  />
                </div>
              </div>
              <div className="row-start-3">
                <div className="flex flex-col">
                  <label
                    htmlFor="password"
                    className="requiredp w-full labelSign flex items-center justify-center h-fit m-2 text-lg font-semibold text-[--white]  "
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    placeholder={"Your password here..."}
                    onChange={(e) => setPassword(e.target.value)}
                    className="placeholder:italic outline-none placeholder:text-gray-400 placeholder: text-lg rounded-lg p-1 valid:border-solid valid:border-lime-500"
                  />
                </div>
              </div>
              <div className="row-start-3">
                <div className="flex flex-col">
                  <label
                    htmlFor="confirmPassword"
                    className="requiredp w-full labelSign flex items-center justify-center h-fit m-2 text-lg font-semibold text-[--white]  "
                  >
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    placeholder={"Confirm your password"}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="placeholder:italic outline-none placeholder:text-gray-400 placeholder: text-lg rounded-lg p-1 valid:border-solid valid:border-lime-500"
                  />
                </div>
              </div>
              <div className="col-span-2">
                <div className="flex flex-col">
                  <label
                    htmlFor="classCode"
                    className="requiredp w-full labelSign flex items-center justify-center h-fit m-2 text-lg font-semibold text-[--white]  "
                  >
                    Your class Code Gift by your teacher
                  </label>
                  <input
                    type="text"
                    id="classCode"
                    placeholder={"Your class code here"}
                    onChange={(e) => setClassCode(e.target.value)}
                    className="placeholder:italic outline-none placeholder:text-gray-400 placeholder: text-lg rounded-lg p-1 valid:border-solid valid:border-lime-500"
                  />
                </div>
              </div>
            </div>
          )}
          <div className=" flex flex-col items-center justify-center w-full ">
            <SubmitButton onclicl={handleSubmit} />
          </div>
          <div className=" flex flex-col items-center justify-center w-full text-[--white]  ">
            {isRegistered ? (
              <h1>
                You don't have an account ? Please{" "}
                <a
                  className="text-blue-600 hover:underline hover:text-cyan-400"
                  onClick={handleIsRegister}
                  href=""
                >
                  Sign Up
                </a>
              </h1>
            ) : (
              <h1>
                You already have an account ? Please{" "}
                <a
                  className="text-blue-600 hover:underline hover:text-cyan-400"
                  onClick={handleIsRegister}
                  href=""
                >
                  Sign In
                </a>
              </h1>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Sign;
