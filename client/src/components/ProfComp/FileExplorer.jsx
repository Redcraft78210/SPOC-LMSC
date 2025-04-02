import React, { useContext } from "react";
import { FilesystemItem } from "./FilesystemItem";
import { ThemeContext } from "../../contexts/ThemeContext";

function transformData(data) {
  if (!data || typeof data !== "object") return [];

  const transform = (obj, keyName, visited = new WeakSet()) => {
    if (!obj) return { name: keyName, nodes: [] };
    if (visited.has(obj)) return { name: keyName, nodes: [] };
    visited.add(obj);
    if (Array.isArray(obj)) {
      return {
        name: keyName,
        nodes: obj.map((file) => ({
          name: file.split("*").pop(), 
        })),
      };
    }
    return {
      name: keyName,
      nodes: Object.keys(obj).map((key) => transform(obj[key], key, visited)),
    };
  };

  return Object.keys(data).map((key) =>
    transform(data[key], key, new WeakSet())
  );
}

export default function Page({ onDashboard, data }) {
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  const nodes = data && typeof data === "object" ? transformData(data) : [];
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
