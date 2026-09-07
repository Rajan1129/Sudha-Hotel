import { useEffect, useState } from 'react';
import Icon from '../components/Icon';
import { fetchGallery } from '../api/gallery';

const CATEGORIES = ['All', 'Rooms', 'Dining', 'Property', 'Events'];

export default function Gallery() {
  const [items, setItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeLightboxIndex, setActiveLightboxIndex] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError('');
    fetchGallery({ category: activeCategory })
      .then((data) => setItems(data.items || []))
      .catch((err) => setError(err?.response?.data?.message || 'Could not load photo gallery.'))
      .finally(() => setLoading(false));
  }, [activeCategory]);

  const currentItem = activeLightboxIndex !== null ? items[activeLightboxIndex] : null;

  function handlePrev() {
    if (activeLightboxIndex > 0) {
      setActiveLightboxIndex(activeLightboxIndex - 1);
    } else {
      setActiveLightboxIndex(items.length - 1);
    }
  }

  function handleNext() {
    if (activeLightboxIndex < items.length - 1) {
      setActiveLightboxIndex(activeLightboxIndex + 1);
    } else {
      setActiveLightboxIndex(0);
    }
  }

  return (
    <main className="flex flex-col w-full pt-20 pb-40 px-gutter-mobile bg-surface max-w-container-max mx-auto space-y-space-lg">
      {/* Header */}
      <div className="flex flex-col gap-space-2xs text-center sm:text-left">
        <span className="text-label-sm text-secondary font-bold uppercase tracking-widest">Visual Experience</span>
        <h1 className="font-display text-headline-md sm:text-headline-lg text-primary font-bold">
          Sudha Hotel Photo Gallery
        </h1>
        <p className="text-body-md text-on-surface-variant max-w-xl">
          Explore our rooms, mountain-style kitchen dining, courtyard parking, and celebratory banquet lawns in Amb, Himachal Pradesh.
        </p>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-space-xs overflow-x-auto pb-space-xs">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`whitespace-nowrap px-space-md py-space-xs rounded-full text-label-md font-bold transition-all ${
              activeCategory === cat
                ? 'bg-primary text-surface shadow-md'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {error && <p className="text-body-md text-error">{error}</p>}
      {loading && <p className="text-body-md text-on-surface-variant">Loading photo gallery...</p>}

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-space-md">
        {items.map((item, index) => (
          <div
            key={item._id}
            onClick={() => setActiveLightboxIndex(index)}
            className="group relative rounded-2xl overflow-hidden bg-surface-container-lowest shadow-md border border-outline-variant/30 cursor-pointer flex flex-col hover:shadow-xl transition-all"
          >
            <div className="relative h-60 overflow-hidden">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-space-md">
                <span className="text-surface font-label-md font-bold flex items-center gap-1">
                  <Icon name="zoom_in" className="text-[18px]" /> View Full Resolution
                </span>
              </div>
              <span className="absolute top-space-xs left-space-xs px-space-xs py-0.5 rounded-full bg-surface/90 backdrop-blur-md text-primary text-label-sm font-semibold shadow-sm">
                {item.category}
              </span>
            </div>
            <div className="p-space-sm flex flex-col gap-1 bg-surface-container-lowest">
              <h3 className="font-display text-title-md text-primary font-bold group-hover:text-terracotta transition-colors">
                {item.title}
              </h3>
              {item.caption && <p className="text-body-sm text-on-surface-variant">{item.caption}</p>}
            </div>
          </div>
        ))}

        {!loading && items.length === 0 && !error && (
          <p className="text-body-md text-on-surface-variant col-span-3 text-center py-space-xl">
            No photos found in this category.
          </p>
        )}
      </div>

      {/* LIGHTBOX MODAL */}
      {currentItem && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-space-md animate-fade-in"
          onClick={() => setActiveLightboxIndex(null)}
        >
          {/* Close button */}
          <button
            onClick={() => setActiveLightboxIndex(null)}
            className="absolute top-space-md right-space-md w-10 h-10 rounded-full bg-surface/20 hover:bg-surface/40 text-white flex items-center justify-center z-10 transition-colors"
          >
            <Icon name="close" className="text-[24px]" />
          </button>

          {/* Previous button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="absolute left-space-sm sm:left-space-md top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-surface/20 hover:bg-surface/40 text-white flex items-center justify-center z-10 transition-colors"
          >
            <Icon name="chevron_left" className="text-[28px]" />
          </button>

          {/* Next button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-space-sm sm:right-space-md top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-surface/20 hover:bg-surface/40 text-white flex items-center justify-center z-10 transition-colors"
          >
            <Icon name="chevron_right" className="text-[28px]" />
          </button>

          {/* Lightbox Content Container */}
          <div
            className="max-w-4xl w-full flex flex-col items-center gap-space-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={currentItem.image}
              alt={currentItem.title}
              className="max-h-[75vh] w-auto max-w-full rounded-xl object-contain shadow-2xl"
            />
            <div className="text-center text-surface max-w-lg flex flex-col gap-1">
              <span className="text-label-sm font-semibold text-terracotta uppercase tracking-wider">
                {currentItem.category} ({activeLightboxIndex + 1} of {items.length})
              </span>
              <h2 className="font-display text-headline-sm text-surface font-bold">{currentItem.title}</h2>
              {currentItem.caption && <p className="text-body-sm text-surface-variant/90">{currentItem.caption}</p>}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
