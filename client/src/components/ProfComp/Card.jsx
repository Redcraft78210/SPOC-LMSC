import React, {useContext} from "react";
import clsx from "clsx";
import { ThemeContext } from "../../contexts/ThemeContext";

const Card = ({ content, className }) => {
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  return (
    <div className={clsx("flex items-center justify-center", className)}>
      <div className="bg-neutral-700 w-full h-full rounded-2xl">
        <p>{content}</p>
      </div>
    </div>
  );
};

export default Card;
