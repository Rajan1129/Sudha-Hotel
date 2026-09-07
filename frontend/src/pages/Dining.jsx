import { useEffect, useState } from 'react';
import Icon from '../components/Icon';
import Modal from '../components/Modal';
import { fetchMenu } from '../api/menu';
import { fetchSettings } from '../api/settings';

const DINING_HERO_IMAGE =
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1400&auto=format&fit=crop';

export default function Dining() {
  const [menu, setMenu] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [dietaryFilter, setDietaryFilter] = useState('all'); // 'all' | 'veg' | 'non-veg'
  const [searchQuery, setSearchQuery] = useState('');
  
  // Tray / Cart State
  const [cart, setCart] = useState({});
  const [trayOpen, setTrayOpen] = useState(false);
  const [fulfillmentType, setFulfillmentType] = useState('in_room'); // 'in_room' | 'table_preorder' | 'takeaway'
  const [guestDetails, setGuestDetails] = useState({ name: '', roomOrPhone: '', notes: '' });

  useEffect(() => {
    Promise.all([fetchMenu(), fetchSettings()])
      .then(([menuData, settingsData]) => {
        setMenu(menuData.items || []);
        setSettings(settingsData.settings || null);
      })
      .finally(() => setLoading(false));
  }, []);

  const categories = ['All', ...new Set(menu.map((i) => i.category))];

  const filteredMenu = menu.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesDiet =
      dietaryFilter === 'all' ||
      (dietaryFilter === 'veg' && item.isVeg) ||
      (dietaryFilter === 'non-veg' && !item.isVeg);
    const matchesQuery =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesDiet && matchesQuery;
  });

  const phoneNum = settings?.phone || '094187 03201';
  const whatsappNum = (settings?.whatsapp || '094187 03201').replace(/\D/g, '');

  function handleAddToCart(item) {
    setCart((prev) => {
      const current = prev[item._id]?.quantity || 0;
      return {
        ...prev,
        [item._id]: { item, quantity: current + 1 },
      };
    });
  }

  function handleRemoveFromCart(itemId) {
    setCart((prev) => {
      const current = prev[itemId]?.quantity || 0;
      if (current <= 1) {
        const copy = { ...prev };
        delete copy[itemId];
        return copy;
      }
      return {
        ...prev,
        [itemId]: { ...prev[itemId], quantity: current - 1 },
      };
    });
  }

  const cartList = Object.values(cart);
  const cartItemCount = cartList.reduce((sum, c) => sum + c.quantity, 0);
  const cartSubtotal = cartList.reduce((sum, c) => sum + c.item.price * c.quantity, 0);

  function generateWhatsAppOrderMessage() {
    const lines = [
      `*🍽️ Sudha Hotel Kitchen Order*`,
      `*Type:* ${fulfillmentType === 'in_room' ? 'In-Room Dining' : fulfillmentType === 'table_preorder' ? 'Table Pre-Order' : 'Highway Express Takeaway'}`,
      `*Guest:* ${guestDetails.name || 'Guest'} (${guestDetails.roomOrPhone || 'Room/Contact'})`,
      ``,
      `*Items Ordered:*`,
    ];

    cartList.forEach(({ item, quantity }) => {
      lines.push(`• ${item.name} x${quantity} - ₹${item.price * quantity}`);
    });

    lines.push(``);
    lines.push(`*Subtotal:* ₹${cartSubtotal}`);
    if (guestDetails.notes) {
      lines.push(`*Notes:* ${guestDetails.notes}`);
    }
    lines.push(`_Sent via Sudha Hotel Web App_`);

    return encodeURIComponent(lines.join('\n'));
  }

  return (
    <main className="flex flex-col w-full pt-20 pb-40 px-gutter-mobile bg-surface max-w-container-max mx-auto space-y-space-xl">
      {/* 1. HERO BANNER */}
      <section className="relative w-full rounded-3xl overflow-hidden shadow-2xl bg-primary">
        <div className="relative w-full h-[320px] sm:h-[380px] overflow-hidden">
          <img
            src={DINING_HERO_IMAGE}
            alt="Sudha Hotel Kitchen & Dining"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07241A] via-[#07241A]/70 to-transparent" />

          <div className="absolute top-space-sm right-space-sm">
            <span className="inline-flex items-center gap-1.5 px-space-sm py-space-2xs rounded-full bg-surface/90 backdrop-blur-md text-primary text-label-sm font-semibold shadow-md">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Kitchen Open (7 AM – 11 PM)
            </span>
          </div>

          <div className="absolute inset-x-0 bottom-0 p-space-md sm:p-space-lg flex flex-col gap-space-xs text-on-primary">
            <span className="inline-flex items-center gap-1.5 px-space-xs py-1 rounded-full bg-terracotta/90 text-white text-label-sm font-bold w-fit">
              <Icon name="restaurant" className="text-[14px]" /> Authentic Himachali &amp; North Indian Kitchen
            </span>
            <h1 className="font-display text-headline-lg-mobile sm:text-headline-lg font-bold text-surface tracking-tight">
              Sudha Dining &amp; Kitchen
            </h1>
            <p className="text-body-md text-surface-container-high/90 max-w-xl">
              Fresh mountain flavors, slow-cooked dal makhani, wood-fired tandoor, and authentic Himachali Dham pre-orders.
            </p>
          </div>
        </div>
      </section>

      {/* 2. SEARCH & DIETARY CONTROLS */}
      <section className="flex flex-col gap-space-md">
        <div className="flex flex-col sm:flex-row gap-space-xs items-stretch sm:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Icon name="search" className="absolute left-space-sm top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes (e.g. Paneer, Tandoori, Dal, Chai)..."
              className="w-full pl-10 pr-space-md py-space-sm rounded-2xl border border-outline-variant/40 bg-surface-container-lowest text-label-md font-semibold text-primary focus:outline-none focus:border-primary shadow-sm"
            />
          </div>

          {/* Veg / Non-Veg Toggle */}
          <div className="flex items-center p-1 rounded-2xl bg-surface-container-high border border-outline-variant/20 self-start sm:self-auto">
            <button
              onClick={() => setDietaryFilter('all')}
              className={`px-space-md py-1 rounded-xl text-label-sm font-bold transition-all ${
                dietaryFilter === 'all' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setDietaryFilter('veg')}
              className={`px-space-md py-1 rounded-xl text-label-sm font-bold flex items-center gap-1 transition-all ${
                dietaryFilter === 'veg' ? 'bg-emerald-700 text-white shadow-sm' : 'text-on-surface-variant'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white" /> Pure Veg
            </button>
            <button
              onClick={() => setDietaryFilter('non-veg')}
              className={`px-space-md py-1 rounded-xl text-label-sm font-bold flex items-center gap-1 transition-all ${
                dietaryFilter === 'non-veg' ? 'bg-rose-700 text-white shadow-sm' : 'text-on-surface-variant'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 border border-white" /> Non-Veg
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-space-xs overflow-x-auto pb-space-2xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap px-space-md py-space-xs rounded-full text-label-md font-bold transition-all ${
                selectedCategory === cat
                  ? 'bg-terracotta text-white shadow-md'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* 3. MENU ITEMS GRID */}
      <section className="flex flex-col gap-space-md">
        {loading && <p className="text-body-md text-on-surface-variant text-center py-space-xl">Loading kitchen menu...</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-space-md">
          {filteredMenu.map((item) => {
            const inCartQty = cart[item._id]?.quantity || 0;
            return (
              <div
                key={item._id}
                className="p-space-md rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between gap-space-xs"
              >
                <div>
                  <div className="flex items-start justify-between gap-space-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{item.emoji || '🍲'}</span>
                      <span
                        className={`w-3 h-3 rounded-full border ${
                          item.isVeg ? 'bg-emerald-600 border-emerald-800' : 'bg-rose-600 border-rose-800'
                        }`}
                        title={item.isVeg ? 'Pure Vegetarian' : 'Non-Vegetarian'}
                      />
                      <h3 className="font-display text-label-lg text-primary font-bold">{item.name}</h3>
                    </div>
                    <span className="font-display text-label-lg font-bold text-terracotta">₹{item.price}</span>
                  </div>

                  <p className="text-body-sm text-on-surface-variant line-clamp-2 mt-space-2xs">
                    {item.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-space-xs border-t border-outline-variant/20 mt-space-2xs">
                  <span className="text-label-sm text-secondary font-semibold uppercase tracking-wider">
                    {item.category}
                  </span>

                  {inCartQty > 0 ? (
                    <div className="flex items-center gap-space-2xs bg-surface-container-high rounded-full p-1 border border-outline-variant/30">
                      <button
                        onClick={() => handleRemoveFromCart(item._id)}
                        className="w-7 h-7 rounded-full bg-surface-container-lowest flex items-center justify-center text-primary font-bold shadow-sm active:scale-90"
                      >
                        -
                      </button>
                      <span className="text-label-md font-bold text-primary px-2">{inCartQty}</span>
                      <button
                        onClick={() => handleAddToCart(item)}
                        className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center font-bold shadow-sm active:scale-90"
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="px-space-md py-space-xs rounded-full bg-primary hover:bg-primary/90 text-white text-label-sm font-bold shadow-sm active:scale-95 transition-all flex items-center gap-1"
                    >
                      <Icon name="add" className="text-[16px]" /> Add to Tray
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {!loading && filteredMenu.length === 0 && (
          <div className="p-space-xl text-center flex flex-col items-center gap-space-xs bg-surface-container-low rounded-2xl">
            <Icon name="search_off" className="text-4xl text-on-surface-variant" />
            <p className="text-body-md text-on-surface-variant font-medium">No dishes match your filter criteria.</p>
          </div>
        )}
      </section>

      {/* 4. FLOATING TRAY BAR */}
      {cartItemCount > 0 && (
        <div className="fixed bottom-20 inset-x-4 max-w-xl mx-auto z-40">
          <div className="p-space-sm px-space-md rounded-2xl bg-primary text-white shadow-2xl border border-white/20 flex items-center justify-between gap-space-sm animate-bounce-in">
            <div className="flex items-center gap-space-xs">
              <div className="w-10 h-10 rounded-xl bg-terracotta text-white flex items-center justify-center font-bold text-label-md shadow-inner">
                {cartItemCount}
              </div>
              <div className="flex flex-col">
                <span className="text-label-sm text-surface-container-high/90">Dining Tray Subtotal</span>
                <span className="font-display text-headline-sm font-bold text-white">₹{cartSubtotal}</span>
              </div>
            </div>

            <button
              onClick={() => setTrayOpen(true)}
              className="py-space-xs px-space-md rounded-full bg-terracotta hover:bg-terracotta/90 text-white font-label-md font-bold shadow-md flex items-center gap-1.5 active:scale-95 transition-all"
            >
              View Order Tray <Icon name="arrow_forward" className="text-[18px]" />
            </button>
          </div>
        </div>
      )}

      {/* 5. TRAY & ORDER DISPATCH MODAL */}
      <Modal open={trayOpen} onClose={() => setTrayOpen(false)} title="Kitchen Dining Tray">
        <div className="flex flex-col gap-space-md max-h-[75vh] overflow-y-auto pr-1">
          {/* Itemized Tray Summary */}
          <div className="flex flex-col gap-space-xs border-b border-outline-variant/30 pb-space-sm">
            <span className="text-label-sm text-secondary uppercase font-bold tracking-wider">Selected Items:</span>
            {cartList.map(({ item, quantity }) => (
              <div key={item._id} className="flex items-center justify-between py-space-xs border-b border-outline-variant/10">
                <div className="flex items-center gap-space-xs">
                  <span className="text-xl">{item.emoji || '🍲'}</span>
                  <div>
                    <p className="text-label-md font-bold text-primary">{item.name}</p>
                    <p className="text-label-sm text-on-surface-variant">₹{item.price} each</p>
                  </div>
                </div>

                <div className="flex items-center gap-space-xs">
                  <div className="flex items-center gap-space-2xs bg-surface-container-high rounded-full p-1">
                    <button
                      onClick={() => handleRemoveFromCart(item._id)}
                      className="w-6 h-6 rounded-full bg-surface-container-lowest flex items-center justify-center text-primary font-bold shadow-sm"
                    >
                      -
                    </button>
                    <span className="text-label-md font-bold px-1.5">{quantity}</span>
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center font-bold shadow-sm"
                    >
                      +
                    </button>
                  </div>
                  <span className="font-bold text-terracotta text-label-md w-14 text-right">
                    ₹{item.price * quantity}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Fulfillment Type Toggle */}
          <div className="flex flex-col gap-space-xs">
            <label className="text-label-sm text-secondary uppercase font-bold">Fulfillment Type</label>
            <div className="grid grid-cols-3 gap-space-2xs">
              {[
                ['in_room', 'In-Room Service', 'bed'],
                ['table_preorder', 'Table Reservation', 'table_restaurant'],
                ['takeaway', 'Express Takeaway', 'takeout_dining'],
              ].map(([type, label, icon]) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFulfillmentType(type)}
                  className={`p-space-xs rounded-xl flex flex-col items-center gap-1 border text-center transition-all ${
                    fulfillmentType === type
                      ? 'border-primary bg-primary/10 text-primary font-bold'
                      : 'border-outline-variant/30 text-on-surface-variant'
                  }`}
                >
                  <Icon name={icon} className="text-[20px]" />
                  <span className="text-label-sm">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Guest Context Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-xs">
            <div>
              <label className="text-label-sm text-secondary uppercase font-bold">Guest Name</label>
              <input
                type="text"
                value={guestDetails.name}
                onChange={(e) => setGuestDetails({ ...guestDetails, name: e.target.value })}
                placeholder="e.g. Rahul Sharma"
                className="w-full mt-1 p-space-sm rounded-xl border border-outline-variant/40 bg-surface-container-low text-label-md font-semibold focus:outline-none"
              />
            </div>
            <div>
              <label className="text-label-sm text-secondary uppercase font-bold">
                {fulfillmentType === 'in_room' ? 'Room Number' : 'Phone Number'}
              </label>
              <input
                type="text"
                value={guestDetails.roomOrPhone}
                onChange={(e) => setGuestDetails({ ...guestDetails, roomOrPhone: e.target.value })}
                placeholder={fulfillmentType === 'in_room' ? 'e.g. Room 204' : 'e.g. 98160XXXXX'}
                className="w-full mt-1 p-space-sm rounded-xl border border-outline-variant/40 bg-surface-container-low text-label-md font-semibold focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-label-sm text-secondary uppercase font-bold">Special Preparation Notes</label>
            <input
              type="text"
              value={guestDetails.notes}
              onChange={(e) => setGuestDetails({ ...guestDetails, notes: e.target.value })}
              placeholder="e.g. Less spicy, extra green chutney, serve hot at 8:30 PM..."
              className="w-full mt-1 p-space-sm rounded-xl border border-outline-variant/40 bg-surface-container-low text-label-md focus:outline-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-space-xs pt-space-xs">
            <a
              href={`https://wa.me/91${whatsappNum}?text=${generateWhatsAppOrderMessage()}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-space-md rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-label-lg font-bold shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all text-center"
            >
              <Icon name="chat" className="text-[20px]" /> Dispatch Order via WhatsApp (₹{cartSubtotal})
            </a>
            <a
              href={`tel:${phoneNum}`}
              className="w-full py-space-sm rounded-full bg-surface-container-high hover:bg-surface-container-highest text-primary font-label-md font-bold text-center"
            >
              Call Kitchen Desk ({phoneNum})
            </a>
          </div>
        </div>
      </Modal>
    </main>
  );
}
