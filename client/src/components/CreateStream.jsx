import React from "react";
import { useState, useEffect } from "react";

const CreateStream = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  useEffect(() => {
    const fakeClasses = [
      "Mathématiques Avancées",
      "Physique Quantique",
      "Chimie Organique",
      "Biologie Moléculaire",
      "Histoire de l'Art",
      "Littérature Moderne",
      "Informatique et Réseaux",
      "Économie Globale",
      "Sociologie Urbaine",
      "Philosophie Contemporaine",
    ];
    setClasses(fakeClasses);
  }, []);
  const handleClassChange = (event) => {
    setSelectedClass(event.target.value);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    const title = e.target[0].value;
    const description = e.target[1].value;
    console.log("titre", title, "desc", description, "class", selectedClass);
  };

  return (
    <>
      {/* main containter */}
      <div className="flex-col items-center justify-center p-4 bg-neutral-900 rounded-3xl">
        {/* title */}
        <h1 className="text-3xl m-auto w-4/6 font-bold text-[--white] bg-neutral-500 rounded-2xl text-center">
          Create Stream
        </h1>
        {/* form */}
        <form
          action=""
          onSubmit={handleSubmit}
          className="flex flex-col items-start gap-2"
        >
          <div className="">
            <label htmlFor="titled" className="text-2xl text-[--white] bg-transparent mb-0">
              Title
            </label>
            <input
              className="bg-neutral-600 p-1 text-[--white] text-xl placeholder:text-xl w-full h-12 rounded-2xl m-auto"
              type="text"
              id="titled"
              placeholder="add a title here ..."
            />
          </div>
          <div className="">
            <label
              htmlFor="description"
              className="text-[--white] text-2xl bg-transparent mb-0"
            >
              Description
            </label>
            <input
              className="bg-neutral-600 p-1 text-[--white] text-xl placeholder:text-xl w-full h-12 rounded-2xl m-auto"
              type="text"
              id="description"
              placeholder="add a description here ..."
            />
          </div>
          <div>
            <label htmlFor="class" className="text-[--white] text-2xl bg-transparent mb-0">
              Class
            </label>
            <select
              name="class"
              className="bg-neutral-600 p-2  w-full rounded-2xl m-auto"
              id="class"
              value={selectedClass}
              onChange={handleClassChange}
            >
              <option className="text-xl " value="">
                Choose the class for the stream ...
              </option>
              {classes.map((cls, index) => (
                <option className="text-base" key={index} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end mt-8">
            <button
              className="bg-neutral-600 p-2  text-[--white] text-2xl  rounded-2xl justify-end"
              type="submit"
            >
              Start Stream
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default CreateStream;
