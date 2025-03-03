import React, { useState} from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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
  if (localStorage.getItem("authToken")) {
    navigate("/dashboard");
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
        const request = await axios.post(
          '/api/auth/login',
          { email, password }
        );
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

  return (
    <div className="flex justify-center items-center w-full">
      {isRegistered ? (
        <div className="flex-col items-center justify-center p-4 bg-neutral-900 rounded-3xl w-5/12 h-fulll">
          <h1 className="text-2xl m-auto w-3/6 font-bold text-white bg-neutral-500 rounded-2xl text-center">
            Sign In
          </h1>
          <form action="" onSubmit={handleSubmit} className="flex flex-col gap-2  ">
            <div className="block">
              <label htmlFor="email" className="text-xl bg-transparent mb-0 after:ml-0.5 after:text-red-500 after:content-['*']"> Email </label>
              <input
                className="bg-neutral-600 peer p-1 w-full text-white text-xl placeholder:text-xl rounded-2xl m-auto
              invalid:border-red-600 invalid:text-red-600 focus:border-black focus:outline focus:outline-green-600 focus:invalid:border-red-600 focus:invalid:outline-red-600"
                type="email"
                id="email"
                placeholder="Your Email here..."
                onChange={(e) => setEmail(e.target.value)}

              />
            </div>
            <div className="">
              <label
                htmlFor="password" className="text-2xl bg-transparent mb-0 requiredp ">Password</label>
              <input
                className="bg-neutral-600 focus:border-none p-1 text-white text-xl placeholder:text-xl w-full h-12 rounded-2xl m-auto"
                type="password"
                id="password"
                placeholder="Your password here..."
                onChange={(e) => setPassword(e.target.value)}

              />
            </div>
            <div className="flex justify-center items-center">
              {error && <h1 className="font-bold text-red-600 text-lg">{error}</h1>}
            </div>
            <div className="flex justify-center items-center mt-4">
              <button
                className="bg-neutral-600  w-2/6 h-auto text-[--white] rounded-[15px]
              p-3 hover:">
                Submit
              </button>
            </div>
            <div className="flex justify-center items-center mt-2">
                <h1>You don't have an account ? please
                  <a onClick={handleRegisterFalse} className="text-blue-600 underline decoration-dotted hover:text-blue-400 hover:decoration-wavy">
                    Sign Up
                  </a>
                </h1>
            </div>

          </form>
        </div>
      ) : (
        <div className="flex-col items-center justify-center p-4 bg-neutral-900 rounded-3xl w-5/12 h-fulll">
          <h1 className="text-2xl m-auto w-3/6 font-bold text-white bg-neutral-500 rounded-2xl text-center">
            Sign Up
          </h1>
          <form action="" onSubmit={handleSubmit} className="flex flex-col gap-2  ">
            <div className="block">
              <label htmlFor="email"
                     className="text-xl bg-transparent mb-0 after:ml-0.5 after:text-red-500 after:content-['*']">
                Email
              </label>
              <input
                className="bg-neutral-600 peer p-1 w-full text-white text-xl placeholder:text-xl rounded-2xl m-auto
              invalid:border-red-600 invalid:text-red-600 focus:border-black focus:outline focus:outline-green-600 focus:invalid:border-red-600 focus:invalid:outline-red-600"
                type="email"
                id="email"
                placeholder="Your Email here..."

                onChange={(e) => setEmail(e.target.value)}
              />

            </div>
            <div className="flex flex-row gap-2 mt-4">
              <div className="mr-4">
                <label htmlFor="name" className="text-2xl bg-transparent mb-0 requiredp" >Name</label>
                <input
                  className="bg-neutral-600 focus:border-none p-1 text-white text-xl placeholder:text-xl w-full h-12 rounded-2xl m-auto"
                  type="text"
                  id="name"
                  placeholder="Your name here..."

                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="">
                <label htmlFor="username" className="text-2xl bg-transparent mb-0 requiredp" >Username</label>
                <input
                  className="bg-neutral-600 focus:border-none p-1 text-white text-xl placeholder:text-xl w-full h-12 rounded-2xl m-auto"
                  type="text"
                  id="username"
                  placeholder="Your username here..."

                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-row gap-2 mt-4">
              <div className="mr-4">
                <label htmlFor="password" className="text-2xl bg-transparent mb-0 requiredp" >Password</label>
                <input
                  className="bg-neutral-600 focus:border-none p-1 text-white text-xl placeholder:text-xl w-full h-12 rounded-2xl m-auto"
                  type="password"
                  id="password"
                  placeholder="Your password here..."

                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="">
                <label htmlFor="password" className="text-2xl bg-transparent mb-0 requiredp" >Confirm password</label>
                <input
                  className="bg-neutral-600 focus:border-none p-1 text-white text-xl placeholder:text-xl w-full h-12 rounded-2xl m-auto"
                  type="password"
                  id="password"
                  placeholder="The password confirmation here..."

                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-center items-center">
              {error && <h1 className="font-bold text-red-600 text-lg">{error}</h1>}
            </div>
            <div className="flex justify-center items-center mt-4">
              <button
                className="bg-neutral-600  w-2/6 h-auto text-[--white] rounded-[15px]
              p-3 hover:">
                Submit
              </button>
            </div>
            <div className="flex justify-center items-center mt-2">
              <h1>You already have an account ? please
                <a onClick={handleRegisterTrue} className="text-blue-600 underline decoration-dotted hover:text-blue-400 hover:decoration-wavy">
                  Sign In
                </a>
              </h1>
            </div>

          </form>
        </div>
        )

      }
    </div>
  );
};

export default Sign;
