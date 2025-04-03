import React, { useContext, useDebugValue, useEffect, useState } from "react";
import { ThemeContext } from "../../contexts/ThemeContext";
import { FilesystemItem } from "./FilesystemItem";

function transformData(data) {
  if (!data || typeof data !== "object") return [];

  const transform = (obj, keyName, visited = new WeakSet()) => {
    if (obj === null || typeof obj !== "object") {
      return { type: "leaf", name: `${keyName}: ${obj}`, nodes: [] };
    }

    if (visited.has(obj)) return { type: "folder", name: keyName, nodes: [] };
    visited.add(obj);

    if (typeof obj === "object" && "video_id" in obj) {
      const tmp_name = `${obj.video_desc} | upload the: (${new Date(
        obj.upload_date
      ).toLocaleDateString()})`;
      return {
        type: "video",
        video_id: obj.video_id,
        name: tmp_name,
      };
    }

    if (Array.isArray(obj)) {
      return {
        type: "folder",
        name: keyName,
        nodes: obj.map((item, index) => transform(item, `[${index}]`, visited)),
      };
    }

    // Supprimer les champs "description" et "upload_date" du rendu
    const filteredKeys = Object.keys(obj).filter(
      (key) => key !== "description" && key !== "upload_date"
    );

    return {
      type: "folder",
      name: keyName,
      nodes: filteredKeys.map((key) => transform(obj[key], key, visited)),
    };
  };

  return Object.keys(data).map((key) =>
    transform(data[key], key, new WeakSet())
  );
}

export default function Page({ setIdVideo, data }) {
  const { darkMode } = useContext(ThemeContext);
  const nodes = data && typeof data === "object" ? transformData(data) : [];
  const [id, setId] = useState("");
  useEffect(() => {
    if (id) {
      setIdVideo(id);
    }
  });
  return (
    <div
      className={`rounded-xl p-4 ${
        darkMode
          ? "bg-gradient-to-br from-neutral-800 to-neutral-900"
          : "bg-gradient-to-br from-neutral-400 to-neutral-500"
      }`}
    >
      <h1 className="text-2xl font-bold mb-4 text-[--white]">
        Explorateur de vidéos
      </h1>

      <ul className="text-[--white]">
        {nodes.filter(Boolean).map((node) => (
          <FilesystemItem key={node.name} node={node} setId={setId} />
        ))}
      </ul>
    </div>
  );
}
