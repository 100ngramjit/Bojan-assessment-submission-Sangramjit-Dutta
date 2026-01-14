import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

function ItemDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();

    fetch("http://localhost:4001/api/items/" + id, {
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then(setItem)
      .catch((err) => {
        if (err.name !== "AbortError") navigate("/");
      });

    return () => controller.abort();
  }, [id, navigate]);

  if (!item) return <p>Loading...</p>;

  return (
    <div
      style={{
        width: "75%",
        margin: "16px",
        padding: "12px 16px",
        fontSize: "16px",
        border: "3px solid #000",
        borderRadius: "0px",
        boxShadow: "4px 4px 0px #000",
        outline: "none",
        boxSizing: "border-box",
        backgroundColor: "#fff",
        fontWeight: "bold",
      }}
    >
      <h2>{item.name}</h2>
      <p>
        <strong>Category:</strong> {item.category}
      </p>
      <p>
        <strong>Price:</strong> ${item.price}
      </p>
    </div>
  );
}

export default ItemDetail;
