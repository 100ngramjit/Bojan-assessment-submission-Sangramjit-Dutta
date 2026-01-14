import React, { createContext, useCallback, useContext, useState } from "react";

const DataContext = createContext();

export function DataProvider({ children }) {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchItems = useCallback(async (params = {}, signal) => {
    setLoading(true);
    setError(null);
    try {
      const queryString = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 10,
        ...(params.q && { q: params.q }),
      }).toString();

      const res = await fetch(
        `http://localhost:4001/api/items?${queryString}`,
        { signal }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch items");
      }

      const json = await res.json();
      setItems(json.items);
      setPagination({
        total: json.total,
        page: json.page,
        limit: json.limit,
        totalPages: json.totalPages,
      });
      return json;
    } catch (err) {
      if (err.name !== "AbortError") {
        setError(err.message);
        throw err;
      }
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <DataContext.Provider
      value={{ items, pagination, loading, error, fetchItems, setItems }}
    >
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
