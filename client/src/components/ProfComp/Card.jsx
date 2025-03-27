import React from "react";
import clsx from "clsx";
const Card = ({ content, className }) => {
  return (
    <div className={clsx("flex items-center justify-center", className)}>
      <div className="bg-neutral-700 w-full h-full rounded-2xl">
        <p>{content}</p>
      </div>
    </div>
  );
};

export default Card;
