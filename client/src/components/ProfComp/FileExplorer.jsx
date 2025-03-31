"use client";

import React, { useContext } from "react";
import { FilesystemItem } from "./FilesystemItem";
import videoData from "../../utils/tmp34.json";
import { ThemeContext } from "../../contexts/ThemeContext";

// Fonction pour transformer le JSON en structure d'arborescence (nodes)
function transformData(data) {
  const transform = (obj, keyName) => {
    // Si l'objet possède une propriété "videos", c'est un dossier de vidéos
    if (obj && typeof obj === "object" && obj.videos) {
      return {
        name: keyName,
        nodes: obj.videos.map((video) => ({
          name: video.titre,
        })),
      };
    }
    // Sinon, traiter récursivement les clés de l'objet
    return {
      name: keyName,
      nodes: Object.keys(obj).map((key) => transform(obj[key], key)),
    };
  };

  return Object.keys(data).map((key) => transform(data[key], key));
}

const nodes = transformData(videoData);

export default function Page({ onDashboard }) {
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);

  return (
    <div
      className={`rounded-xl p-4 ${
        darkMode
          ? "bg-gradient-to-br from-neutral-800 to-neutral-900"
          : "bg-gradient-to-br from-neutral-400 to-neutral-500"
      }`}
    >
      {" "}
      {!onDashboard && (
        <h1 className="text-2xl font-bold mb-4 text-[--white]">
          Explorateur de vidéos
        </h1>
      )}
      <ul className="text-[--white]">
        {nodes.map((node) => (
          <FilesystemItem key={node.name} node={node} />
        ))}
      </ul>
    </div>
  );
}
