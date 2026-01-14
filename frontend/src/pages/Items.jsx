import React, { useEffect, useState, useCallback } from "react";
import { useData } from "../state/DataContext";
import { Link, useNavigate } from "react-router-dom";
import { List } from "react-window";

const Row = ({ index, style, items }) => {
  const item = items[index];
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = React.useState(false);
  const [isPressed, setIsPressed] = React.useState(false);

  if (!item) return null;

  return (
    <div
      style={{
        ...style,
        padding: "10px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "8px 16px",
          border: "3px solid #000",
          boxShadow: isPressed ? "none" : "4px 4px 0px #000",
          background: isHovered ? "#928fe8" : "#fff",
          height: "100%",
          boxSizing: "border-box",
          cursor: "pointer",
          transform: isPressed ? "translate(4px, 4px)" : "translate(0, 0)",
          transition: "all 0.1s ease-in-out",
        }}
        onClick={() => navigate(`/items/${item.id}`)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setIsPressed(false);
        }}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
      >
        <Link
          to={`/items/${item.id}`}
          style={{ textDecoration: "none", color: "#000", fontWeight: "700" }}
          onClick={(e) => e.stopPropagation()}
        >
          {item.name}
        </Link>
        <span
          style={{
            marginLeft: "auto",
            color: "#000",
            fontSize: "14px",
            fontWeight: "bold",
            background: "#bbf7d0", // Light green for price tag feel
            padding: "4px 8px",
            border: "2px solid #000",
          }}
        >
          ${item.price}
        </span>
      </div>
    </div>
  );
};

function Items() {
  const { items, pagination, loading, error, fetchItems } = useData();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 6;

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setCurrentPage(1); // Reset to page 1 on new search
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch items with AbortController for cleanup
  useEffect(() => {
    const controller = new AbortController();

    fetchItems(
      { page: currentPage, limit: limit, q: debouncedQuery },
      controller.signal
    ).catch((err) => {
      if (err && err.name !== "AbortError") {
        console.error("Fetch error:", err);
      }
    });

    return () => controller.abort();
  }, [fetchItems, currentPage, limit, debouncedQuery]);

  const handlePageChange = useCallback(
    (newPage) => {
      if (newPage >= 1 && newPage <= pagination.totalPages) {
        setCurrentPage(newPage);
      }
    },
    [pagination.totalPages]
  );

  // Loading skeleton
  if (loading && items.length === 0) {
    return (
      <div style={{ padding: "20px" }}>
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            style={{
              height: "60px",
              background: "#e0e0e0",
              border: "3px solid #000",
              boxShadow: "4px 4px 0px #000",
              animation: "pulse 0.8s infinite alternate",
              marginBottom: "16px",
            }}
          />
        ))}
        <style>{`
          @keyframes pulse {
            0% { opacity: 1; }
            100% { opacity: 0.5; }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return <p style={{ color: "red", padding: "20px" }}>Error: {error}</p>;
  }

  return (
    <div style={{ padding: "20px" }}>
      {/* Search Input */}
      <div style={{ marginBottom: "16px" }}>
        <input
          type="text"
          placeholder="Search items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: "100%",
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
          onFocus={(e) => (e.target.style.backgroundColor = "#fffde7")}
          onBlur={(e) => (e.target.style.backgroundColor = "#fff")}
          aria-label="Search items"
        />
      </div>

      {/* Results Info */}
      <div style={{ marginBottom: "12px", color: "#666", fontSize: "14px" }}>
        Showing {items.length} of {pagination.total} items
        {debouncedQuery && ` matching "${debouncedQuery}"`}
      </div>

      {items.length > 0 ? (
        <div
          style={{
            border: "2px solid #000",
            backgroundColor: "#f3f4f6",
          }}
        >
          <List
            height={400}
            width="100%"
            rowCount={items.length}
            rowHeight={80}
            rowComponent={Row}
            rowProps={{ items }}
          />
        </div>
      ) : (
        <p style={{ textAlign: "center", color: "#666", padding: "40px" }}>
          No items found.
        </p>
      )}

      {/* Pagination Controls */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "16px",
          marginTop: "20px",
        }}
      >
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage <= 1 || loading}
          style={{
            padding: "10px 20px",
            fontSize: "14px",
            border: "2px solid #000",
            borderRadius: "0px",
            boxShadow: currentPage <= 1 ? "none" : "2px 2px 0px #000",
            background: currentPage <= 1 ? "#e5e7eb" : "#fff",
            color: currentPage <= 1 ? "#9ca3af" : "#000",
            cursor: currentPage <= 1 ? "not-allowed" : "pointer",
            fontWeight: "bold",
            transition: "all 0.1s",
          }}
          aria-label="Previous page"
        >
          Previous
        </button>

        <span style={{ fontSize: "14px", color: "#374151" }}>
          Page {currentPage} of {pagination.totalPages || 1}
        </span>

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= pagination.totalPages || loading}
          style={{
            padding: "10px 20px",
            fontSize: "14px",
            border: "2px solid #000",
            borderRadius: "0px",
            boxShadow:
              currentPage >= pagination.totalPages
                ? "none"
                : "2px 2px 0px #000",
            background:
              currentPage >= pagination.totalPages ? "#e5e7eb" : "#000",
            color: currentPage >= pagination.totalPages ? "#9ca3af" : "#fff",
            cursor:
              currentPage >= pagination.totalPages ? "not-allowed" : "pointer",
            fontWeight: "bold",
            transition: "all 0.1s",
          }}
          aria-label="Next page"
        >
          Next
        </button>
      </div>

      {/* Loading overlay */}
      {loading && items.length > 0 && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(255,255,255,0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div style={{ fontSize: "18px", color: "#2563eb" }}>Loading...</div>
        </div>
      )}
    </div>
  );
}

export default Items;
