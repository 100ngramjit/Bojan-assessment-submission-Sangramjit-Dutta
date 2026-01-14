import React, { useState } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import Items from "./Items";
import ItemDetail from "./ItemDetail";
import { DataProvider } from "../state/DataContext";

function App() {
  const NavButton = () => {
    const { pathname } = useLocation();
    const [isHovered, setIsHovered] = useState(false);
    const [isPressed, setIsPressed] = useState(false);
    const style = {
      padding: "4px 8px",
      fontSize: "16px",
      border: "3px solid #000",
      borderRadius: "0px",
      outline: "none",
      boxSizing: "border-box",
      fontWeight: "bold",
      textDecoration: "none",
      color: "#000",
      backgroundColor: isHovered ? "#928fe8" : "#fff",
      boxShadow: isPressed ? "none" : "4px 4px 0px #000",
      transform: isPressed ? "translate(4px, 4px)" : "translate(0, 0)",
      transition: "all 0.1s ease-in-out",
      display: "inline-block",
    };

    return (
      <Link
        to="/"
        style={style}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setIsPressed(false);
        }}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
      >
        {pathname === "/" ? "Items" : "< Back to items"}
      </Link>
    );
  };

  return (
    <DataProvider>
      <nav style={{ padding: 16, borderBottom: "1px solid #ddd" }}>
        <NavButton />
      </nav>
      <Routes>
        <Route path="/" element={<Items />} />
        <Route path="/items/:id" element={<ItemDetail />} />
      </Routes>
    </DataProvider>
  );
}

export default App;
