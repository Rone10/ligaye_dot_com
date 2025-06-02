'use client';

import { createContext, useContext } from 'react';

interface FilterContextType {
  isFiltering: boolean;
}

const FilterContext = createContext<FilterContextType>({ isFiltering: false });

export const useFilterContext = () => useContext(FilterContext);

export const FilterProvider = ({ children, isFiltering }: { children: React.ReactNode; isFiltering: boolean }) => {
  return (
    <FilterContext.Provider value={{ isFiltering }}>
      {children}
    </FilterContext.Provider>
  );
}; 