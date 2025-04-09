import React, { useContext } from "react";
import NavBar from "../../components/ProfComp/NavBar";
import Darkmode2 from "../../components/ProfComp/Darkmode2";
import OnAir2 from "../../components/ProfComp/OnAir2";
import { ThemeContext } from "../../contexts/ThemeContext";

const DashboardProf = () => {
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);

  return (
    <div className="w-full h-full">
      <div className="absolute h-fit w-5/6 top-2 left-32 flex flex-row justify-between ">
        <h1 className=" text-5xl text-blue-700 font-bold w-fit h-fit ">
          SPOC LMSC 218
        </h1>
        <p className="w-fit -mt-6">
          <Darkmode2 /> 
        </p>
      </div>
      <div className="flex mt-[4rem] md:w-screen ">
        <div className=" w-1/12 h-screen">
          <NavBar />
        </div>
        {/* dashboard */}
        <div className="w-11/12">
          {/* GRID du dashboard */}
          <div className="grid grid-cols-3 xl:grid-cols-3 gap-4 px-4 py-6">
            <div
              className={`w-full h-36 rounded-xl ${
                darkMode
                  ? "bg-gradient-to-br from-neutral-800 to-neutral-900"
                  : "bg-gradient-to-br from-neutral-400 to-neutral-500"
              }`}
            >
              <OnAir2 />
            </div>
            <div
              className={`w-full h-36 rounded-xl ${
                darkMode
                  ? "bg-gradient-to-br from-neutral-800 to-neutral-900"
                  : "bg-gradient-to-br from-neutral-400 to-neutral-500"
              }`}
            >
              55
            </div>
            <div
              className={`w-full h-36 rounded-xl col-span-2 ${
                darkMode
                  ? "bg-gradient-to-br from-neutral-800 to-neutral-900"
                  : "bg-gradient-to-br from-neutral-400 to-neutral-500"
              }`}
            >
              3
            </div>
            <div
              className={`w-full row-start-1 col-start-3 row-span-3 rounded-xl ${
                darkMode
                  ? "bg-gradient-to-br from-neutral-800 to-neutral-900"
                  : "bg-gradient-to-br from-neutral-400 to-neutral-500"
              }`}
            ></div>
            <div
              className={`w-full h-36 rounded-xl ${
                darkMode
                  ? "bg-gradient-to-br from-neutral-800 to-neutral-900"
                  : "bg-gradient-to-br from-neutral-400 to-neutral-500"
              }`}
            >
              2
            </div>
            <div
              className={`w-full h-36 rounded-xl ${
                darkMode
                  ? "bg-gradient-to-br from-neutral-800 to-neutral-900"
                  : "bg-gradient-to-br from-neutral-400 to-neutral-500"
              }`}
            >
              6
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardProf;
