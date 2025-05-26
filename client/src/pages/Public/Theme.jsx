// import { useState, useContext } from "react";
// import { ThemeContext } from "../../contexts/ThemeProvider";

const ThemeSettings = () => {
  // const { darkMode, toggleDarkMode } = useContext(ThemeContext); // Use ThemeContext
  // const [theme, setTheme] = useState("default");

  // const themes = [
  //   { name: "default", primary: "indigo", secondary: "yellow" },
  //   { name: "blue", primary: "blue", secondary: "teal" },
  //   { name: "green", primary: "green", secondary: "lime" },
  //   { name: "purple", primary: "purple", secondary: "pink" },
  // ];

  // return (
  //   <div
  //     className={`min-h-screen p-8 transition-colors duration-300 ${
  //       darkMode ? "dark:bg-gray-900 dark:text-white" : "bg-white text-gray-900"
  //     }`}
  //   >
  //     <div className="max-w-2xl mx-auto">
  //       <h1 className="text-4xl font-bold mb-8">Theme Switcher</h1>

  //       <div className="mb-8 flex items-center gap-4">
  //         <span className="text-lg">Dark Mode:</span>
  //         <button
  //           onClick={toggleDarkMode}
  //           className={`px-4 py-2 rounded-lg ${
  //             darkMode ? "bg-gray-800 text-white" : "bg-gray-200 text-gray-800"
  //           }`}
  //         >
  //           {darkMode ? "Dark" : "Light"}
  //         </button>
  //       </div>

  //       <div className="mb-8">
  //         <h2 className="text-2xl font-semibold mb-4">Choose Theme:</h2>
  //         <div className="flex flex-wrap gap-4">
  //           {themes.map((t) => (
  //             <button
  //               key={t.name}
  //               onClick={() => setTheme(t.name)}
  //               className={`px-6 py-3 rounded-lg font-medium transition-all ${
  //                 theme === t.name ? "ring-4 ring-opacity-50" : ""
  //               } ${
  //                 darkMode
  //                   ? `bg-${t.primary}-700 text-white ring-${t.primary}-300`
  //                   : `bg-${t.primary}-500 text-white ring-${t.primary}-200`
  //               }`}
  //             >
  //               {t.name.charAt(0).toUpperCase() + t.name.slice(1)}
  //             </button>
  //           ))}
  //         </div>
  //       </div>

  //       <div className="space-y-6">
  //         <div className={`p-6 rounded-lg bg-primary-500 text-white`}>
  //           <h3 className="text-xl font-bold mb-2">Primary Color</h3>
  //           <p>This section uses the primary color of the selected theme</p>
  //         </div>

  //         <div className={`p-6 rounded-lg bg-secondary-500 text-white`}>
  //           <h3 className="text-xl font-bold mb-2">Secondary Color</h3>
  //           <p>This section uses the secondary color of the selected theme</p>
  //         </div>

  //         <div className="p-6 rounded-lg bg-gray-100 dark:bg-gray-800">
  //           <h3 className="text-xl font-bold mb-2">Sample Content</h3>
  //           <p className="mb-4">
  //             This is some sample text to demonstrate the theme colors.
  //           </p>
  //           <button className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg">
  //             Theme Button
  //           </button>
  //         </div>
  //       </div>
  //     </div>
  //   </div>
  // );
};

export default ThemeSettings;
