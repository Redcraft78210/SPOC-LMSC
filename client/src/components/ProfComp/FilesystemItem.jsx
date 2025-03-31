import React, { useState } from "react";
import { ChevronRight, File, Folder } from "lucide-react";

export function FilesystemItem({ node }) {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = node.nodes && node.nodes.length > 0;

  return (
    <li>
      <div className="flex items-center gap-1.5 py-1">
        {hasChildren && (
          <button onClick={() => setIsOpen(!isOpen)} className="p-1 -m-1">
            <ChevronRight
              className={`w-4 h-4 text-gray-500 ${isOpen ? "rotate-90" : ""}`}
            />
          </button>
        )}
        {hasChildren ? (
          <Folder
            className={`w-6 h-6 text-sky-500 ${
              !hasChildren ? "ml-[22px]" : ""
            }`}
          />
        ) : (
          <File className="ml-[22px] w-6 h-6 text-[--gray]" />
        )}
        <span>{node.name}</span>
      </div>

      {isOpen && hasChildren && (
        <ul className="pl-6">
          {node.nodes.map((child) => (
            <FilesystemItem key={child.name} node={child} />
          ))}
        </ul>
      )}
    </li>
  );
}
