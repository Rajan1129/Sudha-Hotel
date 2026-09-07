import { useNavigate } from 'react-router-dom';
import { useSearch } from '../context/SearchContext';

export default function StickyBookingBar() {
  const navigate = useNavigate();
  const { checkIn, checkOut } = useSearch();

  return (
    <div className="fixed bottom-14 sm:bottom-0 left-0 right-0 z-30 bg-primary text-on-primary">
      <div className="max-w-container-max mx-auto flex items-center justify-between gap-space-md px-gutter-mobile py-space-sm">
        <div className="flex flex-col">
          <span className="text-label-sm uppercase tracking-widest text-primary-fixed-dim">Plan Sanctuary</span>
          <span className="text-label-md font-semibold">Check Dates &amp; Rates</span>
        </div>
        <button
          onClick={() => navigate(`/rooms?checkIn=${checkIn}&checkOut=${checkOut}`)}
          className="py-space-xs px-space-lg rounded-full bg-terracotta text-white font-label-lg font-bold tracking-wide shadow-md active:scale-95 transition-transform"
        >
          Reserve
        </button>
      </div>
    </div>
  );
}
