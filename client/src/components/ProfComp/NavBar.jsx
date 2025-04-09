import React, { useState } from "react";
import {
  Radio,
  LibraryBig,
  UserRoundCog,
  AlignJustify,
  Home,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const NavBar = () => {
  const [isActive, setIsActive] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { name: "home", path: "/tmp", icon: <Home size={32} strokeWidth={2} /> },
    {
      name: "Lives",
      path: "/livehandler",
      icon: <Radio size={32} strokeWidth={2} />,
    },
    {
      name: "Courses",
      path: "/courses-library",
      icon: <LibraryBig size={32} strokeWidth={2} />,
    },
    {
      name: "Profile",
      path: "/profile",
      icon: <UserRoundCog size={32} strokeWidth={2} />,
    },
  ];

  return (
    <nav className="w-14 h-full">
      <div className="p-4 space-y-8">
        <li className="list-none">
          <button
            className="text-2xl text-[--white] hover:text-blue-500"
            onClick={(e) => {
              e.preventDefault();
              setIsActive(!isActive);
            }}
          >
            <AlignJustify size={32} strokeWidth={2.5} />
          </button>
        </li>
        {isActive && (
          <ul className="space-y-8">
            {navItems.map((item) => (
              <li key={item.name}>
                <button
                  className={`hover:text-blue-500 ${
                    currentPath === item.path ? "text-blue-500" : "text-[--white]"
                  }`}
                  onClick={() => navigate(item.path)}
                >
                  {React.cloneElement(item.icon, {
                    strokeWidth: currentPath === item.path ? 2.5 : 2
                  })}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </nav>
  );
};

export default NavBar;