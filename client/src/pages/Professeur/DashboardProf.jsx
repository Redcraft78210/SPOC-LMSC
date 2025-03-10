import React from "react";
import NavBar from "../../components/ProfComp/NavBar";
import Darkmode from "../../components/ProfComp/Darkmode";
import Card from "../../components/ProfComp/Card";

const DashboardProf = () => {
  return (
    <div className="w-11/12">
      <div className="grid grid-cols-12 grid-rows-12 gap-2">
        <div className="row-span-12 h-full  w-fit">
          <NavBar />
        </div>
        <p className="col-span-11 text-5xl   text-blue-700 backdrop-blur-3xl w-fit h-fit">
          SPOC LMSC 218
        </p>
        <div className=" col-span-11 row-span-11 col-start-2 row-start-2">
          <div className="grid grid-cols-3 grid-rows-3 gap-2 grid-auto-rows-[minmax(50px,_auto)]">
            <div className="col-start-1 row-start-1">
              <Darkmode />
            </div>
            <div className="col-start-2 row-start-1">
              <Card className={"h-full"} content={"13"} />
            </div>
            <div className="row-start-2 col-span-2">
              <Card className={"w-full h-full"} content={"14"} />
            </div>
            <div className="row-start-3 col-span-2">
              <Card className={"w-full h-full"} content={"16"} />
            </div>
            <div className="row-span-3 col-start-3 row-start-1">
              <Card className={"w-full h-full"} content={"11"} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardProf;
