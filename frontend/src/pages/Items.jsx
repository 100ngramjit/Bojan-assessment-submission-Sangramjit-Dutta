import React, { useEffect, useState, useCallback } from "react";
import { useData } from "../state/DataContext";
import { Link } from "react-router-dom";
import { List } from "react-window";

const Row = ({ index, style, items }) => {
  const item = items[index];
  if (!item) return null;

  return (
    <div
      style={{
        ...style,
        display: "flex",
        alignItems: "center",
        padding: "8px 16px",
        borderBottom: "1px solid #eee",
        boxSizing: "border-box",
      }}
    >
      <Link
        to={`/items/${item.id}`}
        style={{ textDecoration: "none", color: "#2563eb" }}
      >
        {item.name}
      </Link>
      <span style={{ marginLeft: "auto", color: "#666", fontSize: "14px" }}>
        ${item.price}
      </span>
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
              height: "40px",
              background:
                "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 1.5s infinite",
              marginBottom: "8px",
              borderRadius: "4px",
            }}
          />
        ))}
        <style>{`
          @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
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
            border: "2px solid #e5e7eb",
            borderRadius: "8px",
            outline: "none",
            transition: "border-color 0.2s",
            boxSizing: "border-box",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#2563eb")}
          onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
          aria-label="Search items"
        />
      </div>

      {/* Results Info */}
      <div style={{ marginBottom: "12px", color: "#666", fontSize: "14px" }}>
        Showing {items.length} of {pagination.total} items
        {debouncedQuery && ` matching "${debouncedQuery}"`}
      </div>

      {/* Virtualized List - react-window v2 API */}
      {items.length > 0 ? (
        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          <List
            height={400}
            width="100%"
            rowCount={items.length}
            rowHeight={50}
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
            border: "none",
            borderRadius: "6px",
            background: currentPage <= 1 ? "#e5e7eb" : "#2563eb",
            color: currentPage <= 1 ? "#9ca3af" : "white",
            cursor: currentPage <= 1 ? "not-allowed" : "pointer",
            transition: "background 0.2s",
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
            border: "none",
            borderRadius: "6px",
            background:
              currentPage >= pagination.totalPages ? "#e5e7eb" : "#2563eb",
            color: currentPage >= pagination.totalPages ? "#9ca3af" : "white",
            cursor:
              currentPage >= pagination.totalPages ? "not-allowed" : "pointer",
            transition: "background 0.2s",
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
