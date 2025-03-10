import React from "react";
import clsx from "clsx";

const PresentationCard = ({ className, content, title }) => {
  return (
    <article
      className={clsx(
        "w-72 bg-gray-700 shadow p-4 space-y-2 rounded-md hover:-translate-y-2 duration-300",
        className
      )}
    >
      <h1>{title}</h1>
      {content}
    </article>
  );
};

export default PresentationCard;
