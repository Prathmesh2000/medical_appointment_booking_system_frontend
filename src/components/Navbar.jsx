import React from "react";
import { Link } from "react-router-dom";

function Navbar() {
  
  return (
    <nav className="bg-gray-800 text-white fixed top-0 w-full z-10">
      <ul className="flex space-x-4 p-4">
        <li>
          <Link to="/doctors" className="hover:underline">Doctors</Link>
        </li>
        <li>
          <Link to="/dashboard" className="hover:underline">Dashboard</Link>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
