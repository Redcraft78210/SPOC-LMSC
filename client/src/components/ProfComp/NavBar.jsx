import { useEffect, useState } from "react";
import {
  Radio,
  LibraryBig,
  UserRoundCog,
  AlignJustify,
  Home,
  FileVideo2,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
const NavBar = () => {
  const [isActive, setIsActive] = useState(true);
  const [page, setPage] = useState("");
  const navigate = useNavigate();
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
    {
      name: "Video Management",
      path: "/videomanager",
      icon: <FileVideo2 size={32} strokeWidth={2} />,
    },
  ];
  useEffect(() => {
    setPage(window.location.pathname);
  },[]);

  return (
    <nav className="w-14  h-full">
      <div className="p-4 space-y-8">
        <li className="list-none ">
          <a
            href=""
            className="text-2xl text-[--white] hover:text-blue-500"
            onClick={(e) => {
              e.preventDefault();
              setIsActive(!isActive);
            }}
          >
            <AlignJustify size={32} strokeWidth={2.5} />
          </a>
        </li>
        {isActive && (
          <ul className="space-y-8">
            {navItems
              .filter((item) => item.path !== page)
              .map((item) => (
                <li className="" key={item.name}>
                  <a
                    className="text-[--white] hover:text-blue-500 "
                    onClick={() => navigate(item.path)}
                    href="#"
                  >
                    {item.icon}
                  </a>
                </li>
              ))}
          </ul>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
