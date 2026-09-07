import { createContext, useContext, useState, useMemo } from 'react';

const SearchContext = createContext(null);

function formatDate(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function defaultDates() {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  const dayAfter = new Date();
  dayAfter.setDate(today.getDate() + 2);
  return { checkIn: formatDate(tomorrow), checkOut: formatDate(dayAfter) };
}

export function SearchProvider({ children }) {
  const initial = useMemo(defaultDates, []);
  const [checkIn, setCheckIn] = useState(initial.checkIn);
  const [checkOut, setCheckOut] = useState(initial.checkOut);
  const [adults, setAdults] = useState(2);
  const [roomsCount, setRoomsCount] = useState(1);

  const value = { checkIn, setCheckIn, checkOut, setCheckOut, adults, setAdults, roomsCount, setRoomsCount };

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

export function useSearch() {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error('useSearch must be used within SearchProvider');
  return ctx;
}
