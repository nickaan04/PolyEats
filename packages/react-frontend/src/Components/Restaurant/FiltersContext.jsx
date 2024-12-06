import { createContext, useState, useContext } from "react";

// provide filter data
const FiltersContext = createContext();

// access filters state and set filters 
export const FiltersProvider = ({ children }) => {
  const [filters, setFilters] = useState({});
  return (
    <FiltersContext.Provider value={{ filters, setFilters }}>
      {children}
    </FiltersContext.Provider>
  );
};

export const useFilters = () => useContext(FiltersContext);
