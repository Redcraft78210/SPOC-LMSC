import React, { useContext } from "react";
import Clock from "react-live-clock";
import { ThemeContext } from "../../contexts/ThemeContext";

const DarkmodeButton = () => {
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  return (
    <div className="w-50 h-32">
      <input
        id="switch"
        type="checkbox"
        onChange={toggleDarkMode}
        checked={darkMode}
        className="hidden"
      />

      <div className={`app w-50 ${darkMode ? "dark" : ""}`}>
        <div
          className={`body relative flex items-center justify-center w-full h-full rounded-3xl shadow-lg p-4 transition-colors duration-300 ${
            darkMode
              ? "bg-gradient-to-r from-gray-800 via-gray-900 to-black"
              : "bg-gradient-to-r from-white via-gray-100 to-gray-200"
          }`}
        >
          <div className="phone relative z-10 flex flex-col items-center justify-center w-full h-full bg-inherit">
            <div className="menu flex justify-between items-center w-full px-4 py-2 mt-4 opacity-40">
              <div className="time text-black dark:text-white">
                <Clock
                  format={"HH:mm:ss"}
                  ticking={true}
                  timezone={"Europe/Paris"}
                />
              </div>
              <div className="icons flex space-x-2">
                <div className="network w-0 h-0 border-solid border-l-[6.8px] border-r-[6.8px] border-b-[7.2px] border-l-transparent border-r-transparent border-b-black dark:border-b-white rotate-[135deg]"></div>
                <div className="battery w-2 h-1 bg-black dark:bg-white"></div>
              </div>
            </div>
            <div className="content flex flex-col items-center mt-4">
              <div
                className={`circle relative w-20 h-20 rounded-full transition-colors duration-600 ease-in-out ${
                  darkMode
                    ? "bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500"
                    : "bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500"
                }`}
              >
                <div
                  className={`crescent absolute top-0 right-0 w-16 h-16 rounded-full transform origin-top-right transition-transform duration-600 ease-in-out ${
                    darkMode ? "bg-gray-900 scale-100" : "bg-white scale-0"
                  }`}
                ></div>
              </div>

              {/* Label et Switch ajustés */}
              <label
                htmlFor="switch"
                className="relative w-45 h-11 bg-gray-200 rounded-3xl mt-7 mb-10 cursor-pointer"
              >
                <div
                  className={`toggle absolute w-1/2 h-full bg-white dark:bg-gray-700 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${
                    darkMode ? "translate-x-full" : ""
                  }`}
                ></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DarkmodeButton;
    