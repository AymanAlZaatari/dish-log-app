import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  Star,
  Upload,
  Download,
  Trash2,
  MapPin,
  Store,
  UtensilsCrossed,
  Heart,
  Filter,
  NotebookText,
  X,
  Pencil,
} from 'lucide-react';

const STORAGE_KEY = 'dish-tracker-webapp-v2';
const ORDER_TYPES = ['Dine-in', 'Delivery', 'Takeaway'];
const PORTION_SIZES = ['Taster', 'Kids', 'Not enough for adult', 'Adult', 'Big adult', 'Shareable', 'Huge'];
const DEFAULT_CUISINES = ['Lebanese', 'Italian', 'Japanese', 'American', 'Mexican', 'Indian', 'Chinese', 'Thai', 'Turkish', 'French', 'Fast Food', 'Bakery', 'Dessert', 'Cafe', 'Pizza', 'Burgers', 'Seafood', 'Sushi', 'Middle Eastern'];
const DEFAULT_AREAS = ['Achrafieh', 'Aley', 'Amchit', 'Antelias', 'Baabda', 'Baalbek', 'Batroun', 'Beirut', 'Bhamdoun', 'Bint Jbeil', 'Broummana', 'Byblos', 'Chekka', 'Chouf', 'Dbayeh', 'Deir El Qamar', 'Ehden', 'Halat', 'Hamra', 'Hazmieh', 'Jal El Dib', 'Jbeil', 'Jezzine', 'Jounieh', 'Kaslik', 'Kfardebian', 'Koura', 'Mansourieh', 'Mar Mikhael', 'Matn', 'Mina', 'Mkalles', 'Nabatieh', 'Saida', 'Sin El Fil', 'Sour', 'Tripoli', 'Verdun', 'Zahle', 'Zalka', 'Zgharta'];
const VALUE_OPTIONS = ['Very bad value', 'Bad value', 'Okay value', 'Good value', 'Great value', 'Excellent value'];

const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

const emptyRestaurantForm = {
  id: null,
  name: '',
  area: '',
  locationText: '',
  mapsLink: '',
  cuisine: '',
  rating: '',
  notes: '',
  recommendedBy: '',
  halalChecked: true,
  kidsFriendly: false,
};

const emptyBranchForm = {
  id: null,
  restaurantId: '',
  name: '',
  area: '',
  locationText: '',
  mapsLink: '',
  notes: '',
};

const emptyDishForm = {
  id: null,
  restaurantId: '',
  name: '',
  branchId: 'none',
  isWishlist: false,
  recommendations: [],
  alerts: [],
  recommendationInput: '',
  alertInput: '',
  tags: [],
  tagInput: '',
  notes: '',
  recommendedBy: '',
  portionSize: '',
};

const emptyExperienceForm = {
  id: null,
  dishId: '',
  restaurantId: '',
  branchId: 'none',
  date: new Date().toISOString().slice(0, 10),
  orderType: 'Dine-in',
  rating: '',
  price: '',
  valueForMoney: '',
  notes: '',
  images: [],
};

const sampleRestaurantId = uid();
const sampleDishId = uid();
const sampleExperienceId = uid();

const sampleData = {
  cuisines: DEFAULT_CUISINES,
  areas: DEFAULT_AREAS,
  restaurants: [{
    id: sampleRestaurantId,
    name: 'Cedar Bite',
    area: 'Mar Mikhael',
    locationText: 'Beirut',
    mapsLink: '',
    cuisine: 'Lebanese',
    rating: 4,
    notes: 'Great late-night option.',
    recommendedBy: 'Rami',
    halalChecked: true,
    kidsFriendly: false,
  }],
  branches: [],
  dishes: [{
    id: sampleDishId,
    restaurantId: sampleRestaurantId,
    name: 'Cheese Manoushe',
    branchId: null,
    isWishlist: false,
    recommendations: ['Best fresh in the morning'],
    alerts: ['Can get oily late at night'],
    tags: ['cheesy', 'breakfast'],
    notes: 'Very consistent.',
    recommendedBy: 'Maya',
    portionSize: 'Adult',
  }],
  experiences: [{
    id: sampleExperienceId,
    dishId: sampleDishId,
    restaurantId: sampleRestaurantId,
    branchId: null,
    date: new Date().toISOString().slice(0, 10),
    orderType: 'Dine-in',
    rating: 4,
    price: 8,
    valueForMoney: 'Good value',
    notes: 'Crispy edges and generous cheese.',
    images: [],
  }],
};

function safeParse(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function migrateData(parsed) {
  const restaurants = (parsed.restaurants || []).map((r) => ({
    halalChecked: r.halalChecked ?? true,
    kidsFriendly: r.kidsFriendly ?? false,
    recommendedBy: r.recommendedBy || '',
    ...r,
  }));

  const dishes = (parsed.dishes || []).map((d) => ({
    recommendations: Array.isArray(d.recommendations)
      ? d.recommendations
      : typeof d.recommendations === 'string'
        ? d.recommendations.split('\n').map((x) => x.trim()).filter(Boolean)
        : [],
    alerts: Array.isArray(d.alerts)
      ? d.alerts
      : typeof d.alerts === 'string'
        ? d.alerts.split('\n').map((x) => x.trim()).filter(Boolean)
        : [],
    tags: Array.isArray(d.tags)
      ? d.tags
      : typeof d.tags === 'string'
        ? d.tags.split(',').map((x) => x.trim()).filter(Boolean)
        : [],
    recommendedBy: d.recommendedBy || '',
    portionSize: d.portionSize || '',
    ...d,
  }));

  const experiences = (parsed.experiences || []).map((e) => ({
    valueForMoney: typeof e.valueForMoney === 'number'
      ? VALUE_OPTIONS[Math.max(0, Math.min(VALUE_OPTIONS.length - 1, e.valueForMoney - 1))]
      : e.valueForMoney || '',
    images: e.images || [],
    ...e,
  }));

  return {
    cuisines: parsed.cuisines?.length ? parsed.cuisines : DEFAULT_CUISINES,
    areas: parsed.areas?.length ? parsed.areas : DEFAULT_AREAS,
    restaurants,
    branches: parsed.branches || [],
    dishes,
    experiences,
  };
}

function loadData() {
  if (typeof window === 'undefined') return sampleData;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return sampleData;
  return migrateData(safeParse(raw, sampleData));
}

function exportData(data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `dish-tracker-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function average(list) {
  const nums = list.filter((n) => n != null && !Number.isNaN(Number(n))).map(Number);
  if (!nums.length) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function ButtonBase({ children, className = '', variant = 'solid', ...props }) {
  return <button className={`btn ${variant} ${className}`.trim()} {...props}>{children}</button>;
}

function Card({ children, className = '' }) {
  return <div className={`card ${className}`.trim()}>{children}</div>;
}

function Input({ className = '', ...props }) {
  return <input className={`input ${className}`.trim()} {...props} />;
}

function Textarea({ className = '', ...props }) {
  return <textarea className={`textarea ${className}`.trim()} {...props} />;
}

function Badge({ children, tone = 'default' }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}

function Field({ label, children }) {
  return <div className="field"><label className="label">{label}</label>{children}</div>;
}

function Stars({ value }) {
  const n = Number(value || 0);
  return <div className="stars">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={16} className={i < Math.round(n) ? 'star filled' : 'star'} />)}</div>;
}

function Modal({ open, title, onClose, children }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="icon-btn" onClick={onClose}><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Select({ value, onChange, options, placeholder = 'Select...' }) {
  return (
    <select className="input" value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
  );
}

function TagInput({ label, color = 'slate', values, setValues, inputValue, setInputValue, suggestions = [] }) {
  const filteredSuggestions = suggestions
    .filter((s) => inputValue.trim() && s.toLowerCase().includes(inputValue.trim().toLowerCase()) && !values.includes(s))
    .slice(0, 6);

  function addValue(raw) {
    const value = raw.trim();
    if (!value) return;
    if (values.some((v) => v.toLowerCase() === value.toLowerCase())) {
      setInputValue('');
      return;
    }
    setValues([...values, value]);
    setInputValue('');
  }

  function onKeyDown(e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addValue(inputValue);
    }
  }

  return (
    <div className="field">
      <label className="label">{label}</label>
      <Input value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={onKeyDown} placeholder="Type and press Enter" />
      {!!filteredSuggestions.length && (
        <div className="chip-row">
          {filteredSuggestions.map((s) => (
            <button key={s} type="button" className="suggestion-chip" onClick={() => addValue(s)}>{s}</button>
          ))}
        </div>
      )}
      <div className="chip-row">
        {values.map((value) => (
          <span key={value} className={`tag-pill ${color}`}>
            {value}
            <button type="button" onClick={() => setValues(values.filter((v) => v !== value))}><X size={12} /></button>
          </span>
        ))}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <Card className="stat-card">
      <div>
        <div className="muted small">{label}</div>
        <div className="stat-value">{value}</div>
      </div>
      <div className="stat-icon">{icon}</div>
    </Card>
  );
}

export default function App() {
  const [data, setData] = useState(loadData);
  const [tab, setTab] = useState('dashboard');
  const [search, setSearch] = useState('');
  const [areaFilter, setAreaFilter] = useState('all');
  const [cuisineFilter, setCuisineFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [restaurantOpen, setRestaurantOpen] = useState(false);
  const [branchOpen, setBranchOpen] = useState(false);
  const [dishOpen, setDishOpen] = useState(false);
  const [experienceOpen, setExperienceOpen] = useState(false);
  const [cuisineOpen, setCuisineOpen] = useState(false);
  const [areaOpen, setAreaOpen] = useState(false);

  const [restaurantForm, setRestaurantForm] = useState(emptyRestaurantForm);
  const [branchForm, setBranchForm] = useState(emptyBranchForm);
  const [dishForm, setDishForm] = useState(emptyDishForm);
  const [experienceForm, setExperienceForm] = useState(emptyExperienceForm);
  const [newCuisine, setNewCuisine] = useState('');
  const [newArea, setNewArea] = useState('');
  const [duplicateDishSuggestion, setDuplicateDishSuggestion] = useState(null);

  const importRef = useRef(null);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const restaurantsById = useMemo(() => Object.fromEntries(data.restaurants.map((r) => [r.id, r])), [data.restaurants]);
  const branchesById = useMemo(() => Object.fromEntries(data.branches.map((b) => [b.id, b])), [data.branches]);
  const dishesById = useMemo(() => Object.fromEntries(data.dishes.map((d) => [d.id, d])), [data.dishes]);

  const allDishTags = useMemo(() => [...new Set(data.dishes.flatMap((d) => d.tags || []))].sort(), [data.dishes]);
  const allRecommendationTags = useMemo(() => [...new Set(data.dishes.flatMap((d) => d.recommendations || []))].sort(), [data.dishes]);
  const allAlertTags = useMemo(() => [...new Set(data.dishes.flatMap((d) => d.alerts || []))].sort(), [data.dishes]);

  const areaOptions = useMemo(() => [...new Set([...(data.areas || []), ...data.restaurants.map((r) => r.area).filter(Boolean), ...data.branches.map((b) => b.area).filter(Boolean)])].sort(), [data]);

  const dishExperienceMap = useMemo(() => Object.fromEntries(data.dishes.map((dish) => [dish.id, data.experiences.filter((e) => e.dishId === dish.id)])), [data.dishes, data.experiences]);
  const computedDishRating = (dishId) => average((dishExperienceMap[dishId] || []).map((e) => e.rating));

  const filteredDishes = useMemo(() => {
    const q = search.trim().toLowerCase();
    return data.dishes.filter((dish) => {
      const restaurant = restaurantsById[dish.restaurantId];
      const haystack = [dish.name, dish.notes, dish.recommendations?.join(' '), dish.alerts?.join(' '), dish.tags?.join(' '), dish.recommendedBy, restaurant?.name, restaurant?.area, restaurant?.cuisine].join(' ').toLowerCase();
      if (q && !haystack.includes(q)) return false;
      if (areaFilter !== 'all' && restaurant?.area !== areaFilter) return false;
      if (cuisineFilter !== 'all' && restaurant?.cuisine !== cuisineFilter) return false;
      if (statusFilter === 'wishlist' && !dish.isWishlist) return false;
      if (statusFilter === 'tried' && dish.isWishlist) return false;
      return true;
    });
  }, [data.dishes, restaurantsById, search, areaFilter, cuisineFilter, statusFilter]);

  const dashboardStats = useMemo(() => {
    const triedDishes = data.dishes.filter((d) => !d.isWishlist).length;
    const wishlistDishes = data.dishes.filter((d) => d.isWishlist).length;
    return {
      restaurants: data.restaurants.length,
      dishes: data.dishes.length,
      experiences: data.experiences.length,
      triedDishes,
      wishlistDishes,
      avgDishRating: average(data.dishes.map((d) => computedDishRating(d.id))) || 0,
    };
  }, [data, dishExperienceMap]);

  const recentExperiences = useMemo(() => [...data.experiences].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8), [data.experiences]);
  const restaurantSummaries = useMemo(() => data.restaurants.map((restaurant) => {
    const dishes = data.dishes.filter((d) => d.restaurantId === restaurant.id);
    const experiences = data.experiences.filter((e) => e.restaurantId === restaurant.id);
    return { restaurant, dishesCount: dishes.length, experiencesCount: experiences.length, avgDishRating: average(dishes.map((d) => computedDishRating(d.id))) };
  }), [data, dishExperienceMap]);

  function resetRestaurantForm() { setRestaurantForm(emptyRestaurantForm); }
  function resetBranchForm() { setBranchForm(emptyBranchForm); }
  function resetDishForm() { setDishForm(emptyDishForm); setDuplicateDishSuggestion(null); }
  function resetExperienceForm() { setExperienceForm(emptyExperienceForm); }

  function saveRestaurant() {
    if (!restaurantForm.name.trim()) return;
    const payload = { ...restaurantForm, id: restaurantForm.id || uid(), name: restaurantForm.name.trim(), area: restaurantForm.area.trim(), locationText: restaurantForm.locationText.trim(), mapsLink: restaurantForm.mapsLink.trim(), rating: restaurantForm.rating ? Number(restaurantForm.rating) : null, notes: restaurantForm.notes.trim(), recommendedBy: restaurantForm.recommendedBy.trim(), halalChecked: !!restaurantForm.halalChecked, kidsFriendly: !!restaurantForm.kidsFriendly };
    setData((prev) => ({
      ...prev,
      restaurants: restaurantForm.id ? prev.restaurants.map((r) => r.id === restaurantForm.id ? payload : r) : [payload, ...prev.restaurants],
      areas: payload.area && !prev.areas.includes(payload.area) ? [...prev.areas, payload.area].sort() : prev.areas,
    }));
    setRestaurantOpen(false); resetRestaurantForm();
  }

  function saveBranch() {
    if (!branchForm.restaurantId || !branchForm.name.trim()) return;
    const payload = { ...branchForm, id: branchForm.id || uid(), name: branchForm.name.trim(), area: branchForm.area.trim(), locationText: branchForm.locationText.trim(), mapsLink: branchForm.mapsLink.trim(), notes: branchForm.notes.trim() };
    setData((prev) => ({
      ...prev,
      branches: branchForm.id ? prev.branches.map((b) => b.id === branchForm.id ? payload : b) : [payload, ...prev.branches],
      areas: payload.area && !prev.areas.includes(payload.area) ? [...prev.areas, payload.area].sort() : prev.areas,
    }));
    setBranchOpen(false); resetBranchForm();
  }

  function saveDish() {
    if (!dishForm.restaurantId || !dishForm.name.trim()) return;
    const duplicate = data.dishes.find((d) => d.restaurantId === dishForm.restaurantId && d.name.trim().toLowerCase() === dishForm.name.trim().toLowerCase() && d.id !== dishForm.id);
    if (duplicate) { setDuplicateDishSuggestion(duplicate); return; }
    const payload = { ...dishForm, id: dishForm.id || uid(), name: dishForm.name.trim(), branchId: dishForm.branchId === 'none' ? null : dishForm.branchId, notes: dishForm.notes.trim(), recommendedBy: dishForm.recommendedBy.trim() };
    setData((prev) => ({ ...prev, dishes: dishForm.id ? prev.dishes.map((d) => d.id === dishForm.id ? payload : d) : [payload, ...prev.dishes] }));
    setDishOpen(false); resetDishForm();
  }

  function saveExperience() {
    if (!experienceForm.dishId || !experienceForm.restaurantId) return;
    const payload = { ...experienceForm, id: experienceForm.id || uid(), branchId: experienceForm.branchId === 'none' ? null : experienceForm.branchId, rating: experienceForm.rating ? Number(experienceForm.rating) : null, price: experienceForm.price ? Number(experienceForm.price) : null, notes: experienceForm.notes.trim(), images: experienceForm.images || [] };
    setData((prev) => ({
      ...prev,
      experiences: experienceForm.id ? prev.experiences.map((e) => e.id === experienceForm.id ? payload : e) : [payload, ...prev.experiences],
      dishes: prev.dishes.map((dish) => dish.id === experienceForm.dishId ? { ...dish, isWishlist: false } : dish),
    }));
    setExperienceOpen(false); resetExperienceForm();
  }

  function addCuisine() {
    const value = newCuisine.trim();
    if (!value || data.cuisines.includes(value)) return;
    setData((prev) => ({ ...prev, cuisines: [...prev.cuisines, value].sort() }));
    setNewCuisine(''); setCuisineOpen(false);
  }

  function addArea() {
    const value = newArea.trim();
    if (!value || data.areas.includes(value)) return;
    setData((prev) => ({ ...prev, areas: [...prev.areas, value].sort() }));
    setNewArea(''); setAreaOpen(false);
  }

  function deleteRestaurant(id) {
    const dishIds = data.dishes.filter((d) => d.restaurantId === id).map((d) => d.id);
    setData((prev) => ({ ...prev, restaurants: prev.restaurants.filter((r) => r.id !== id), branches: prev.branches.filter((b) => b.restaurantId !== id), dishes: prev.dishes.filter((d) => d.restaurantId !== id), experiences: prev.experiences.filter((e) => e.restaurantId !== id && !dishIds.includes(e.dishId)) }));
  }
  function deleteDish(id) { setData((prev) => ({ ...prev, dishes: prev.dishes.filter((d) => d.id !== id), experiences: prev.experiences.filter((e) => e.dishId !== id) })); }
  function deleteBranch(id) { setData((prev) => ({ ...prev, branches: prev.branches.filter((b) => b.id !== id), dishes: prev.dishes.map((d) => d.branchId === id ? { ...d, branchId: null } : d), experiences: prev.experiences.map((e) => e.branchId === id ? { ...e, branchId: null } : e) })); }
  function deleteExperience(id) { setData((prev) => ({ ...prev, experiences: prev.experiences.filter((e) => e.id !== id) })); }

  function editRestaurant(r) { setRestaurantForm({ ...emptyRestaurantForm, ...r, rating: r.rating ?? '' }); setRestaurantOpen(true); }
  function editBranch(b) { setBranchForm({ ...emptyBranchForm, ...b }); setBranchOpen(true); }
  function editDish(d) { setDishForm({ ...emptyDishForm, ...d, branchId: d.branchId || 'none', recommendationInput: '', alertInput: '', tagInput: '' }); setDuplicateDishSuggestion(null); setDishOpen(true); }
  function editExperience(e) { setExperienceForm({ ...emptyExperienceForm, ...e, branchId: e.branchId || 'none', rating: e.rating ?? '', price: e.price ?? '', valueForMoney: e.valueForMoney || '' }); setExperienceOpen(true); }
  function prepareLogExperience(restaurantId, dishId) { setExperienceForm({ ...emptyExperienceForm, restaurantId, dishId, branchId: 'none' }); setExperienceOpen(true); }

  function importJson(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const parsed = safeParse(reader.result, null);
      if (!parsed) return;
      setData(migrateData(parsed));
    };
    reader.readAsText(file);
    event.target.value = '';
  }

  function handleExperienceImageUpload(event) {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    Promise.all(files.map((file) => new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ id: uid(), name: file.name, dataUrl: reader.result });
      reader.readAsDataURL(file);
    }))).then((images) => setExperienceForm((prev) => ({ ...prev, images: [...prev.images, ...images] })));
    event.target.value = '';
  }

  const dishOptionsForExperience = data.dishes.filter((d) => !experienceForm.restaurantId || d.restaurantId === experienceForm.restaurantId);
  const branchOptionsForDish = data.branches.filter((b) => b.restaurantId === dishForm.restaurantId);
  const branchOptionsForExperience = data.branches.filter((b) => b.restaurantId === experienceForm.restaurantId);

  useEffect(() => {
    if (!dishForm.restaurantId || !dishForm.name.trim()) { setDuplicateDishSuggestion(null); return; }
    const duplicate = data.dishes.find((d) => d.restaurantId === dishForm.restaurantId && d.name.trim().toLowerCase() === dishForm.name.trim().toLowerCase() && d.id !== dishForm.id);
    setDuplicateDishSuggestion(duplicate || null);
  }, [dishForm.restaurantId, dishForm.name, dishForm.id, data.dishes]);

  return (
    <div className="app-shell">
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="hero">
          <div>
            <h1>Dish Tracker</h1>
            <p>Track restaurants, dishes, branches, and every tasting experience.</p>
          </div>
          <div className="toolbar-wrap">
            <ButtonBase variant="outline" onClick={() => exportData(data)}><Download size={16} /> Export JSON</ButtonBase>
            <ButtonBase variant="outline" onClick={() => importRef.current?.click()}><Upload size={16} /> Import JSON</ButtonBase>
            <input ref={importRef} type="file" accept="application/json" className="hidden" onChange={importJson} />
            <ButtonBase onClick={() => setRestaurantOpen(true)}><Plus size={16} /> Add Restaurant</ButtonBase>
            <ButtonBase variant="outline" onClick={() => setDishOpen(true)}><Plus size={16} /> Add Dish</ButtonBase>
            <ButtonBase variant="outline" onClick={() => setExperienceOpen(true)}><Plus size={16} /> Add Experience</ButtonBase>
          </div>
        </motion.div>

        <div className="tabbar">
          {['dashboard', 'restaurants', 'dishes', 'experiences', 'settings'].map((item) => (
            <button key={item} className={`tab ${tab === item ? 'active' : ''}`} onClick={() => setTab(item)}>{item[0].toUpperCase() + item.slice(1)}</button>
          ))}
        </div>

        {tab === 'dashboard' && (
          <div className="section-stack">
            <div className="grid stats-grid">
              <StatCard label="Restaurants" value={dashboardStats.restaurants} icon={<Store size={20} />} />
              <StatCard label="Dishes" value={dashboardStats.dishes} icon={<UtensilsCrossed size={20} />} />
              <StatCard label="Experiences" value={dashboardStats.experiences} icon={<NotebookText size={20} />} />
              <StatCard label="Tried" value={dashboardStats.triedDishes} icon={<Star size={20} />} />
              <StatCard label="Wishlist" value={dashboardStats.wishlistDishes} icon={<Heart size={20} />} />
              <StatCard label="Avg Dish Rating" value={dashboardStats.avgDishRating.toFixed(1)} icon={<Filter size={20} />} />
            </div>

            <div className="grid two-col">
              <Card>
                <div className="card-header"><h3>Recent Experiences</h3></div>
                <div className="list-stack">
                  {!recentExperiences.length ? <div className="muted">No experiences yet.</div> : recentExperiences.map((experience) => {
                    const dish = dishesById[experience.dishId];
                    const restaurant = restaurantsById[experience.restaurantId];
                    const branch = experience.branchId ? branchesById[experience.branchId] : null;
                    return (
                      <div key={experience.id} className="item-box">
                        <div className="split-row">
                          <div>
                            <div className="item-title">{dish?.name || 'Unknown dish'}</div>
                            <div className="muted small">{restaurant?.name} • {experience.orderType} • {experience.date}</div>
                            {branch && <div className="muted small">Branch: {branch.name}</div>}
                          </div>
                          <div className="row gap-sm"><Stars value={experience.rating} /><button className="icon-btn" onClick={() => deleteExperience(experience.id)}><Trash2 size={16} /></button></div>
                        </div>
                        {(experience.price || experience.valueForMoney || experience.notes || experience.images?.length) && (
                          <div className="muted top-gap">
                            {experience.price ? `Price: ${experience.price}` : ''}
                            {experience.price && experience.valueForMoney ? ' • ' : ''}
                            {experience.valueForMoney ? `Value: ${experience.valueForMoney}` : ''}
                            {experience.notes ? <div className="top-gap small">{experience.notes}</div> : null}
                            {experience.images?.length ? <div className="top-gap small">{experience.images.length} image(s)</div> : null}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>

              <Card>
                <div className="card-header"><h3>Restaurants Overview</h3></div>
                <div className="list-stack">
                  {!restaurantSummaries.length ? <div className="muted">No restaurants yet.</div> : restaurantSummaries.map(({ restaurant, dishesCount, experiencesCount, avgDishRating }) => (
                    <div key={restaurant.id} className="item-box">
                      <div className="split-row">
                        <div>
                          <div className="item-title">{restaurant.name}</div>
                          <div className="muted small">{restaurant.area || 'No area'} • {restaurant.cuisine || 'No cuisine'}</div>
                        </div>
                        <Stars value={restaurant.rating} />
                      </div>
                      <div className="chip-row top-gap">
                        <Badge tone="muted">{dishesCount} dishes</Badge>
                        <Badge tone="muted">{experiencesCount} experiences</Badge>
                        <Badge tone="outline">Avg dish rating: {avgDishRating ? avgDishRating.toFixed(1) : '—'}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {tab === 'restaurants' && (
          <div className="section-stack">
            <div><ButtonBase variant="outline" onClick={() => setBranchOpen(true)}><Plus size={16} /> Add Branch</ButtonBase></div>
            <div className="grid two-col">
              {data.restaurants.map((restaurant) => {
                const branches = data.branches.filter((b) => b.restaurantId === restaurant.id);
                const dishes = data.dishes.filter((d) => d.restaurantId === restaurant.id);
                const avgDishRating = average(dishes.map((d) => computedDishRating(d.id)));
                return (
                  <Card key={restaurant.id}>
                    <div className="split-row">
                      <div>
                        <h3>{restaurant.name}</h3>
                        <div className="chip-row top-gap">
                          {restaurant.area && <Badge tone="muted">{restaurant.area}</Badge>}
                          {restaurant.cuisine && <Badge tone="muted">{restaurant.cuisine}</Badge>}
                          {restaurant.halalChecked && <Badge tone="outline">Halal checked</Badge>}
                          {restaurant.kidsFriendly && <Badge tone="outline">Kids friendly</Badge>}
                        </div>
                      </div>
                      <div className="row gap-sm"><button className="icon-btn" onClick={() => editRestaurant(restaurant)}><Pencil size={16} /></button><button className="icon-btn" onClick={() => deleteRestaurant(restaurant.id)}><Trash2 size={16} /></button></div>
                    </div>
                    <div className="list-stack top-gap">
                      <div className="row gap-sm"><strong>Restaurant rating:</strong> <Stars value={restaurant.rating} /></div>
                      <div className="row gap-sm"><strong>Avg dish rating:</strong> {avgDishRating ? <Stars value={avgDishRating} /> : <span>—</span>}</div>
                      {restaurant.locationText && <div>Location: {restaurant.locationText}</div>}
                      {restaurant.recommendedBy && <div><strong>Recommended by:</strong> {restaurant.recommendedBy}</div>}
                      {restaurant.mapsLink && <a href={restaurant.mapsLink} target="_blank" rel="noreferrer" className="inline-link"><MapPin size={14} /> Open Maps Link</a>}
                      {restaurant.notes && <div>{restaurant.notes}</div>}
                      <div>
                        <div className="section-label">Branches</div>
                        {!branches.length ? <div className="muted small">No branches added.</div> : (
                          <div className="list-stack">
                            {branches.map((branch) => (
                              <div key={branch.id} className="item-box compact">
                                <div>
                                  <div className="item-title">{branch.name}</div>
                                  <div className="muted small">{branch.area || branch.locationText || 'No location'}</div>
                                </div>
                                <div className="row gap-sm"><button className="icon-btn" onClick={() => editBranch(branch)}><Pencil size={16} /></button><button className="icon-btn" onClick={() => deleteBranch(branch.id)}><X size={16} /></button></div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {tab === 'dishes' && (
          <div className="section-stack">
            <Card>
              <div className="filters-grid">
                <div className="search-wrap"><Search size={16} /><Input placeholder="Search dishes, tags, restaurants..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
                <Select value={areaFilter === 'all' ? '' : areaFilter} onChange={(value) => setAreaFilter(value || 'all')} options={areaOptions.map((area) => ({ value: area, label: area }))} placeholder="All areas" />
                <Select value={cuisineFilter === 'all' ? '' : cuisineFilter} onChange={(value) => setCuisineFilter(value || 'all')} options={data.cuisines.map((cuisine) => ({ value: cuisine, label: cuisine }))} placeholder="All cuisines" />
                <Select value={statusFilter === 'all' ? '' : statusFilter} onChange={(value) => setStatusFilter(value || 'all')} options={[{ value: 'tried', label: 'Tried' }, { value: 'wishlist', label: 'Wishlist' }]} placeholder="All statuses" />
              </div>
            </Card>

            <div className="grid three-col">
              {filteredDishes.map((dish) => {
                const restaurant = restaurantsById[dish.restaurantId];
                const branch = dish.branchId ? branchesById[dish.branchId] : null;
                const experiences = dishExperienceMap[dish.id] || [];
                const avgRating = computedDishRating(dish.id);
                return (
                  <Card key={dish.id}>
                    <div className="split-row">
                      <div>
                        <h3>{dish.name}</h3>
                        <div className="muted small">{restaurant?.name || 'Unknown restaurant'}</div>
                      </div>
                      <div className="row gap-sm"><button className="icon-btn" onClick={() => editDish(dish)}><Pencil size={16} /></button><button className="icon-btn" onClick={() => deleteDish(dish.id)}><Trash2 size={16} /></button></div>
                    </div>
                    <div className="chip-row top-gap">
                      {dish.isWishlist ? <Badge>Wishlist</Badge> : <Badge tone="muted">Tried</Badge>}
                      {restaurant?.area && <Badge tone="muted">{restaurant.area}</Badge>}
                      {restaurant?.cuisine && <Badge tone="muted">{restaurant.cuisine}</Badge>}
                      {branch && <Badge tone="muted">Branch: {branch.name}</Badge>}
                      {dish.portionSize && <Badge tone="outline">{dish.portionSize}</Badge>}
                      {(dish.tags || []).map((tag) => <Badge key={tag} tone="outline">{tag}</Badge>)}
                    </div>
                    <div className="list-stack top-gap">
                      <div className="row gap-sm"><strong>Dish rating:</strong>{avgRating ? <Stars value={avgRating} /> : <span>—</span>}</div>
                      {dish.recommendedBy && <div><strong>Recommended by:</strong> {dish.recommendedBy}</div>}
                      {!!dish.recommendations?.length && <div><strong>Recommendations:</strong><div className="chip-row top-gap">{dish.recommendations.map((item) => <span key={item} className="tag-pill blue">{item}</span>)}</div></div>}
                      {!!dish.alerts?.length && <div><strong>Alerts:</strong><div className="chip-row top-gap">{dish.alerts.map((item) => <span key={item} className="tag-pill red">{item}</span>)}</div></div>}
                      {dish.notes && <div>{dish.notes}</div>}
                      <div className="item-box compact alt-bg">
                        <div><strong>Experience count: {experiences.length}</strong></div>
                        {!!experiences.length && <div className="muted small">Latest: {[...experiences].sort((a, b) => new Date(b.date) - new Date(a.date))[0].date}</div>}
                      </div>
                      <ButtonBase variant="outline" className="full" onClick={() => prepareLogExperience(dish.restaurantId, dish.id)}>Log another experience</ButtonBase>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {tab === 'experiences' && (
          <div className="list-stack">
            {[...data.experiences].sort((a, b) => new Date(b.date) - new Date(a.date)).map((experience) => {
              const dish = dishesById[experience.dishId];
              const restaurant = restaurantsById[experience.restaurantId];
              const branch = experience.branchId ? branchesById[experience.branchId] : null;
              return (
                <Card key={experience.id}>
                  <div className="split-row wrap-mobile">
                    <div className="list-stack grow">
                      <div className="item-title">{dish?.name || 'Unknown dish'}</div>
                      <div className="muted small">{restaurant?.name} • {experience.date}</div>
                      <div className="chip-row">
                        <Badge tone="muted">{experience.orderType}</Badge>
                        {branch && <Badge tone="muted">{branch.name}</Badge>}
                        {experience.price != null && <Badge tone="outline">Price: {experience.price}</Badge>}
                        {experience.valueForMoney && <Badge tone="outline">Value: {experience.valueForMoney}</Badge>}
                      </div>
                      {experience.notes && <div>{experience.notes}</div>}
                      {!!experience.images?.length && (
                        <div className="image-grid">
                          {experience.images.map((img) => <div key={img.id} className="image-frame"><img src={img.dataUrl} alt={img.name} /></div>)}
                        </div>
                      )}
                    </div>
                    <div className="row gap-sm"><Stars value={experience.rating} /><button className="icon-btn" onClick={() => editExperience(experience)}><Pencil size={16} /></button><button className="icon-btn" onClick={() => deleteExperience(experience.id)}><Trash2 size={16} /></button></div>
                  </div>
                </Card>
              );
            })}
            {!data.experiences.length && <Card><div className="muted">No experiences logged yet.</div></Card>}
          </div>
        )}

        {tab === 'settings' && (
          <div className="section-stack">
            <Card>
              <div className="split-row"><h3>Cuisines</h3><ButtonBase variant="outline" onClick={() => setCuisineOpen(true)}><Plus size={16} /> Add Cuisine</ButtonBase></div>
              <div className="chip-row top-gap">{data.cuisines.map((cuisine) => <Badge key={cuisine} tone="muted">{cuisine}</Badge>)}</div>
            </Card>
            <Card>
              <div className="split-row"><h3>Areas</h3><ButtonBase variant="outline" onClick={() => setAreaOpen(true)}><Plus size={16} /> Add Area</ButtonBase></div>
              <div className="chip-row top-gap">{areaOptions.map((area) => <Badge key={area} tone="muted">{area}</Badge>)}</div>
            </Card>
            <Card>
              <h3>Data Notes</h3>
              <div className="list-stack top-gap muted">
                <div>Your data is saved locally in the browser using JSON-backed local storage.</div>
                <div>Use <strong>Export JSON</strong> regularly to keep a portable backup file.</div>
                <div>Images are stored inside your local browser data and JSON export, so large image libraries can make the file bigger.</div>
                <div>You can later host this as a static site on GitHub Pages with no backend cost.</div>
              </div>
            </Card>
          </div>
        )}
      </div>

      <Modal open={restaurantOpen} title={restaurantForm.id ? 'Edit Restaurant' : 'Add Restaurant'} onClose={() => { setRestaurantOpen(false); resetRestaurantForm(); }}>
        <div className="form-grid two">
          <Field label="Name"><Input value={restaurantForm.name} onChange={(e) => setRestaurantForm({ ...restaurantForm, name: e.target.value })} /></Field>
          <Field label="Area"><Select value={restaurantForm.area} onChange={(value) => setRestaurantForm({ ...restaurantForm, area: value })} options={areaOptions.map((area) => ({ value: area, label: area }))} placeholder="Select area" /></Field>
          <Field label="Location text"><Input value={restaurantForm.locationText} onChange={(e) => setRestaurantForm({ ...restaurantForm, locationText: e.target.value })} /></Field>
          <Field label="Google Maps link"><Input value={restaurantForm.mapsLink} onChange={(e) => setRestaurantForm({ ...restaurantForm, mapsLink: e.target.value })} /></Field>
          <Field label="Cuisine"><Select value={restaurantForm.cuisine} onChange={(value) => setRestaurantForm({ ...restaurantForm, cuisine: value })} options={data.cuisines.map((cuisine) => ({ value: cuisine, label: cuisine }))} placeholder="Select cuisine" /></Field>
          <Field label="Restaurant rating (1-5)"><Input type="number" min="1" max="5" value={restaurantForm.rating} onChange={(e) => setRestaurantForm({ ...restaurantForm, rating: e.target.value })} /></Field>
          <Field label="Recommended by"><Input value={restaurantForm.recommendedBy} onChange={(e) => setRestaurantForm({ ...restaurantForm, recommendedBy: e.target.value })} /></Field>
          <div className="checkbox-field"><input type="checkbox" checked={restaurantForm.halalChecked} onChange={(e) => setRestaurantForm({ ...restaurantForm, halalChecked: e.target.checked })} /><label>Halal checked</label></div>
          <div className="checkbox-field"><input type="checkbox" checked={restaurantForm.kidsFriendly} onChange={(e) => setRestaurantForm({ ...restaurantForm, kidsFriendly: e.target.checked })} /><label>Kids friendly</label></div>
          <div className="full-span"><Field label="Notes"><Textarea rows={4} value={restaurantForm.notes} onChange={(e) => setRestaurantForm({ ...restaurantForm, notes: e.target.value })} /></Field></div>
        </div>
        <div className="modal-actions"><ButtonBase onClick={saveRestaurant}>{restaurantForm.id ? 'Save Changes' : 'Save Restaurant'}</ButtonBase></div>
      </Modal>

      <Modal open={branchOpen} title={branchForm.id ? 'Edit Branch' : 'Add Branch'} onClose={() => { setBranchOpen(false); resetBranchForm(); }}>
        <div className="form-grid two">
          <Field label="Restaurant"><Select value={branchForm.restaurantId} onChange={(value) => setBranchForm({ ...branchForm, restaurantId: value })} options={data.restaurants.map((restaurant) => ({ value: restaurant.id, label: restaurant.name }))} placeholder="Select restaurant" /></Field>
          <Field label="Branch name"><Input value={branchForm.name} onChange={(e) => setBranchForm({ ...branchForm, name: e.target.value })} /></Field>
          <Field label="Area"><Select value={branchForm.area} onChange={(value) => setBranchForm({ ...branchForm, area: value })} options={areaOptions.map((area) => ({ value: area, label: area }))} placeholder="Select area" /></Field>
          <Field label="Location text"><Input value={branchForm.locationText} onChange={(e) => setBranchForm({ ...branchForm, locationText: e.target.value })} /></Field>
          <Field label="Google Maps link"><Input value={branchForm.mapsLink} onChange={(e) => setBranchForm({ ...branchForm, mapsLink: e.target.value })} /></Field>
          <div className="full-span"><Field label="Notes"><Textarea rows={4} value={branchForm.notes} onChange={(e) => setBranchForm({ ...branchForm, notes: e.target.value })} /></Field></div>
        </div>
        <div className="modal-actions"><ButtonBase onClick={saveBranch}>{branchForm.id ? 'Save Changes' : 'Save Branch'}</ButtonBase></div>
      </Modal>

      <Modal open={dishOpen} title={dishForm.id ? 'Edit Dish' : 'Add Dish'} onClose={() => { setDishOpen(false); resetDishForm(); }}>
        <div className="form-grid two">
          <Field label="Restaurant"><Select value={dishForm.restaurantId} onChange={(value) => setDishForm({ ...dishForm, restaurantId: value, branchId: 'none' })} options={data.restaurants.map((restaurant) => ({ value: restaurant.id, label: restaurant.name }))} placeholder="Select restaurant" /></Field>
          <Field label="Dish name"><Input value={dishForm.name} onChange={(e) => setDishForm({ ...dishForm, name: e.target.value })} /></Field>
          {duplicateDishSuggestion && (
            <div className="full-span warning-box">
              This dish already exists in this restaurant. You probably want to log a new experience instead.
              <div className="top-gap"><ButtonBase variant="outline" onClick={() => { setDishOpen(false); prepareLogExperience(duplicateDishSuggestion.restaurantId, duplicateDishSuggestion.id); }}>Log Experience for Existing Dish</ButtonBase></div>
            </div>
          )}
          <Field label="Default branch (optional)"><Select value={dishForm.branchId === 'none' ? '' : dishForm.branchId} onChange={(value) => setDishForm({ ...dishForm, branchId: value || 'none' })} options={branchOptionsForDish.map((branch) => ({ value: branch.id, label: branch.name }))} placeholder="No default branch" /></Field>
          <Field label="Portion size"><Select value={dishForm.portionSize} onChange={(value) => setDishForm({ ...dishForm, portionSize: value })} options={PORTION_SIZES.map((size) => ({ value: size, label: size }))} placeholder="Select portion size" /></Field>
          <Field label="Recommended by"><Input value={dishForm.recommendedBy} onChange={(e) => setDishForm({ ...dishForm, recommendedBy: e.target.value })} /></Field>
          <div className="checkbox-field"><input type="checkbox" checked={dishForm.isWishlist} onChange={(e) => setDishForm({ ...dishForm, isWishlist: e.target.checked })} /><label>Wishlist item (not tried yet)</label></div>
          <div className="full-span"><TagInput label="Dish tags" color="slate" values={dishForm.tags} setValues={(vals) => setDishForm({ ...dishForm, tags: vals })} inputValue={dishForm.tagInput} setInputValue={(v) => setDishForm({ ...dishForm, tagInput: v })} suggestions={allDishTags} /></div>
          <div className="full-span"><TagInput label="Recommendations" color="blue" values={dishForm.recommendations} setValues={(vals) => setDishForm({ ...dishForm, recommendations: vals })} inputValue={dishForm.recommendationInput} setInputValue={(v) => setDishForm({ ...dishForm, recommendationInput: v })} suggestions={allRecommendationTags} /></div>
          <div className="full-span"><TagInput label="Alerts / warnings" color="red" values={dishForm.alerts} setValues={(vals) => setDishForm({ ...dishForm, alerts: vals })} inputValue={dishForm.alertInput} setInputValue={(v) => setDishForm({ ...dishForm, alertInput: v })} suggestions={allAlertTags} /></div>
          <div className="full-span"><Field label="Notes"><Textarea rows={4} value={dishForm.notes} onChange={(e) => setDishForm({ ...dishForm, notes: e.target.value })} /></Field></div>
        </div>
        <div className="modal-actions"><ButtonBase onClick={saveDish}>{dishForm.id ? 'Save Changes' : 'Save Dish'}</ButtonBase></div>
      </Modal>

      <Modal open={experienceOpen} title={experienceForm.id ? 'Edit Experience' : 'Log Dish Experience'} onClose={() => { setExperienceOpen(false); resetExperienceForm(); }}>
        <div className="form-grid two">
          <Field label="Restaurant"><Select value={experienceForm.restaurantId} onChange={(value) => setExperienceForm({ ...experienceForm, restaurantId: value, dishId: '', branchId: 'none' })} options={data.restaurants.map((restaurant) => ({ value: restaurant.id, label: restaurant.name }))} placeholder="Select restaurant" /></Field>
          <Field label="Dish"><Select value={experienceForm.dishId} onChange={(value) => setExperienceForm({ ...experienceForm, dishId: value })} options={dishOptionsForExperience.map((dish) => ({ value: dish.id, label: dish.name }))} placeholder="Select dish" /></Field>
          <Field label="Branch (optional)"><Select value={experienceForm.branchId === 'none' ? '' : experienceForm.branchId} onChange={(value) => setExperienceForm({ ...experienceForm, branchId: value || 'none' })} options={branchOptionsForExperience.map((branch) => ({ value: branch.id, label: branch.name }))} placeholder="No branch" /></Field>
          <Field label="Date"><Input type="date" value={experienceForm.date} onChange={(e) => setExperienceForm({ ...experienceForm, date: e.target.value })} /></Field>
          <Field label="Order type"><Select value={experienceForm.orderType} onChange={(value) => setExperienceForm({ ...experienceForm, orderType: value })} options={ORDER_TYPES.map((type) => ({ value: type, label: type }))} /></Field>
          <Field label="Rating (1-5)"><Input type="number" min="1" max="5" value={experienceForm.rating} onChange={(e) => setExperienceForm({ ...experienceForm, rating: e.target.value })} /></Field>
          <Field label="Price"><Input type="number" value={experienceForm.price} onChange={(e) => setExperienceForm({ ...experienceForm, price: e.target.value })} /></Field>
          <Field label="Value for money"><Select value={experienceForm.valueForMoney} onChange={(value) => setExperienceForm({ ...experienceForm, valueForMoney: value })} options={VALUE_OPTIONS.map((option) => ({ value: option, label: option }))} placeholder="Select value" /></Field>
          <div className="full-span field">
            <label className="label">Images</label>
            <Input type="file" accept="image/*" multiple onChange={handleExperienceImageUpload} />
            {!!experienceForm.images.length && (
              <div className="image-grid top-gap">
                {experienceForm.images.map((image) => (
                  <div key={image.id} className="image-frame editable">
                    <img src={image.dataUrl} alt={image.name} />
                    <button type="button" className="remove-image" onClick={() => setExperienceForm((prev) => ({ ...prev, images: prev.images.filter((img) => img.id !== image.id) }))}><X size={12} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="full-span"><Field label="Notes"><Textarea rows={4} value={experienceForm.notes} onChange={(e) => setExperienceForm({ ...experienceForm, notes: e.target.value })} /></Field></div>
        </div>
        <div className="modal-actions"><ButtonBase onClick={saveExperience}>{experienceForm.id ? 'Save Changes' : 'Save Experience'}</ButtonBase></div>
      </Modal>

      <Modal open={cuisineOpen} title="Add Cuisine" onClose={() => setCuisineOpen(false)}>
        <div className="field"><Input value={newCuisine} onChange={(e) => setNewCuisine(e.target.value)} placeholder="Enter cuisine name" /></div>
        <div className="modal-actions"><ButtonBase onClick={addCuisine}>Save</ButtonBase></div>
      </Modal>

      <Modal open={areaOpen} title="Add Area" onClose={() => setAreaOpen(false)}>
        <div className="field"><Input value={newArea} onChange={(e) => setNewArea(e.target.value)} placeholder="Enter area / city" /></div>
        <div className="modal-actions"><ButtonBase onClick={addArea}>Save</ButtonBase></div>
      </Modal>
    </div>
  );
}
