import React from "react";
// import { useNavigate } from 'react-router-dom';
import "./styles/Dashboard.module.css";

import DarkmodeButton from "../../components/DarkmodeButton";

function DashboardHome() {
  return (
    <main className="flex-1 overflow-y-auto p-4 bg-gray-50">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {
          <div
            key={1}
            className="h-60 rounded-lg bg-white shadow-sm p-4 hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-medium">
              e
            </h3>
            <p className="text-gray-600 mt-2">
              Sample content for demonstration
            </p>
          </div>
        }
      </div>
    </main>
  );
}

export default DashboardHome;
