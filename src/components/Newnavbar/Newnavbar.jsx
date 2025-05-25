import React from "react";
import { Link } from "react-router-dom"; // Import Link
import "./Newnavbar.css";

const Newnavbar = () => {
  return (
    <nav className="navbar">
      <ul className="nav-links">
        <li><Link to="/Mainpage">Home</Link></li>
      </ul>
      <img src="" className="logo" alt="logo" />
    </nav>
  );
};

export default Newnavbar;
