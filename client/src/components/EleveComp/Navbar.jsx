import React from "react";
import { Home, LibraryBig, BookOpen, Settings, Sun } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const NavigationBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeRoute, setActiveRoute] = React.useState(location.pathname);

  React.useEffect(() => {
    setActiveRoute(location.pathname);
  }, [location.pathname]);

  const navItems = [
    { icon: Home, path: "/", label: "Home" },
    { icon: LibraryBig, path: "/courses-library", label: "Courses" },
    {
      icon: BookOpen,
      path: "/course-reader",
      label: "Reader",
      clickable: false,
    },
    { icon: Sun, path: "/theme", label: "Theme" },
    { icon: Settings, path: "/settings", label: "Settings" },
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <aside className="h-full w-16 flex flex-col items-center justify-center bg-gray-800 text-white py-4 space-y-4">
      {navItems.map((item, index) => (
        <button
          key={index}
          {...(item.clickable !== false && {
            onClick: () => handleNavigation(item.path),
          })}
          className={`p-2 rounded-lg hover:bg-white hover:text-gray-800 transition-all duration-300 ${
            activeRoute === item.path ? "bg-white text-gray-800" : ""
          }`}
          aria-label={item.label}
        >
          <item.icon className="h-6 w-6" />
        </button>
      ))}
    </aside>
  );
};

export default NavigationBar;
