import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
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
  Image as ImageIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const STORAGE_KEY = "dish-tracker-webapp-v2";
const ORDER_TYPES = ["Dine-in", "Delivery", "Takeaway"];
const PORTION_SIZES = [
  "Taster",
  "Kids",
  "Not enough for adult",
  "Adult",
  "Big adult",
  "Shareable",
  "Huge",
];
const DEFAULT_CUISINES = [
  "Lebanese",
  "Italian",
  "Japanese",
  "American",
  "Mexican",
  "Indian",
  "Chinese",
  "Thai",
  "Turkish",
  "French",
  "Fast Food",
  "Bakery",
  "Dessert",
  "Cafe",
  "Pizza",
  "Burgers",
  "Seafood",
  "Sushi",
  "Middle Eastern",
];
const DEFAULT_AREAS = [
  "Achrafieh",
  "Aley",
  "Amchit",
  "Antelias",
  "Baabda",
  "Baalbek",
  "Batroun",
  "Beirut",
  "Bhamdoun",
  "Bint Jbeil",
  "Broummana",
  "Byblos",
  "Chekka",
  "Chouf",
  "Dbayeh",
  "Deir El Qamar",
  "Ehden",
  "Halat",
  "Hamra",
  "Hazmieh",
  "Jal El Dib",
  "Jbeil",
  "Jezzine",
  "Jounieh",
  "Kaslik",
  "Kfardebian",
  "Koura",
  "Mansourieh",
  "Mar Mikhael",
  "Matn",
  "Mina",
  "Mkalles",
  "Nabatieh",
  "Saida",
  "Sin El Fil",
  "Sour",
  "Tripoli",
  "Verdun",
  "Zahle",
  "Zalka",
  "Zgharta",
];
const VALUE_OPTIONS = [
  "Very bad value",
  "Bad value",
  "Okay value",
  "Good value",
  "Great value",
  "Excellent value",
];
const TOP_NAV_STYLES = {
  dashboard: "bg-sky-50 text-sky-900 border-sky-200 data-[state=active]:bg-sky-100 data-[state=active]:text-sky-950 data-[state=active]:ring-2 data-[state=active]:ring-sky-300",
  restaurants: "bg-emerald-50 text-emerald-900 border-emerald-200 data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-950 data-[state=active]:ring-2 data-[state=active]:ring-emerald-300",
  dishes: "bg-amber-50 text-amber-900 border-amber-200 data-[state=active]:bg-amber-100 data-[state=active]:text-amber-950 data-[state=active]:ring-2 data-[state=active]:ring-amber-300",
  experiences: "bg-rose-50 text-rose-900 border-rose-200 data-[state=active]:bg-rose-100 data-[state=active]:text-rose-950 data-[state=active]:ring-2 data-[state=active]:ring-rose-300",
  settings: "bg-violet-50 text-violet-900 border-violet-200 data-[state=active]:bg-violet-100 data-[state=active]:text-violet-950 data-[state=active]:ring-2 data-[state=active]:ring-violet-300",
};
const DASHBOARD_CARD_STYLES = {
  Restaurants: "border-emerald-200 bg-emerald-50",
  Dishes: "border-amber-200 bg-amber-50",
  Experiences: "border-rose-200 bg-rose-50",
  Tried: "border-sky-200 bg-sky-50",
  Wishlist: "border-pink-200 bg-pink-50",
  "Avg Dish Rating": "border-violet-200 bg-violet-50",
};
const SECTION_CONTAINER = "rounded-[2rem] border border-slate-200 bg-slate-100/70 p-4 md:p-5";
const TOP_ACTION_BUTTON_STYLES = {
  addDish: "border-amber-300 bg-amber-500 text-white hover:bg-amber-600",
  addRestaurant: "border-emerald-200 bg-emerald-50 text-emerald-900 hover:bg-emerald-100",
  addExperience: "border-rose-200 bg-rose-50 text-rose-900 hover:bg-rose-100",
  import: "border-sky-200 bg-sky-50 text-sky-900 hover:bg-sky-100",
  export: "border-violet-200 bg-violet-50 text-violet-900 hover:bg-violet-100",
};

const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

const emptyRestaurantForm = {
  id: null,
  name: "",
  area: "",
  locationText: "",
  mapsLink: "",
  cuisine: "",
  rating: "",
  notes: "",
  recommendedBy: "",
  halalChecked: true,
  kidsFriendly: false,
};

const emptyBranchForm = {
  id: null,
  restaurantId: "",
  name: "",
  area: "",
  locationText: "",
  mapsLink: "",
  notes: "",
};

const emptyDishForm = {
  id: null,
  restaurantId: "",
  name: "",
  branchId: "none",
  isWishlist: false,
  recommendations: [],
  alerts: [],
  recommendationInput: "",
  alertInput: "",
  tags: [],
  tagInput: "",
  notes: "",
  recommendedBy: "",
  portionSize: "",
};

const emptyExperienceForm = {
  id: null,
  dishId: "",
  restaurantId: "",
  branchId: "none",
  date: new Date().toISOString().slice(0, 10),
  orderType: "Dine-in",
  rating: "",
  price: "",
  valueForMoney: "",
  notes: "",
  images: [],
};

const inlineRestaurantFormDefault = {
  name: "",
  area: "",
  locationText: "",
  mapsLink: "",
  cuisine: "",
  rating: "",
  notes: "",
  recommendedBy: "",
  halalChecked: true,
  kidsFriendly: false,
};

const sampleRestaurantId = uid();
const sampleDishId = uid();
const sampleExperienceId = uid();

const sampleData = {
  cuisines: DEFAULT_CUISINES,
  areas: DEFAULT_AREAS,
  restaurants: [
    {
      id: sampleRestaurantId,
      name: "Cedar Bite",
      area: "Mar Mikhael",
      locationText: "Beirut",
      mapsLink: "",
      cuisine: "Lebanese",
      rating: 4,
      notes: "Great late-night option.",
      recommendedBy: "Rami",
      halalChecked: true,
      kidsFriendly: false,
    },
  ],
  branches: [],
  dishes: [
    {
      id: sampleDishId,
      restaurantId: sampleRestaurantId,
      name: "Cheese Manoushe",
      branchId: null,
      isWishlist: false,
      recommendations: ["Best fresh in the morning"],
      alerts: ["Can get oily late at night"],
      tags: ["cheesy", "breakfast"],
      notes: "Very consistent.",
      recommendedBy: "Maya",
      portionSize: "Adult",
    },
  ],
  experiences: [
    {
      id: sampleExperienceId,
      dishId: sampleDishId,
      restaurantId: sampleRestaurantId,
      branchId: null,
      date: new Date().toISOString().slice(0, 10),
      orderType: "Dine-in",
      rating: 4,
      price: 8,
      valueForMoney: "Good value",
      notes: "Crispy edges and generous cheese.",
      images: [],
    },
  ],
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
    recommendedBy: r.recommendedBy || "",
    ...r,
  }));

  const dishes = (parsed.dishes || []).map((d) => ({
    recommendations: Array.isArray(d.recommendations)
      ? d.recommendations
      : typeof d.recommendations === "string"
        ? d.recommendations.split("\n").map((x) => x.trim()).filter(Boolean)
        : [],
    alerts: Array.isArray(d.alerts)
      ? d.alerts
      : typeof d.alerts === "string"
        ? d.alerts.split("\n").map((x) => x.trim()).filter(Boolean)
        : [],
    tags: Array.isArray(d.tags)
      ? d.tags
      : typeof d.tags === "string"
        ? d.tags.split(",").map((x) => x.trim()).filter(Boolean)
        : [],
    recommendedBy: d.recommendedBy || "",
    portionSize: d.portionSize || "",
    ...d,
  }));

  const experiences = (parsed.experiences || []).map((e) => ({
    valueForMoney: typeof e.valueForMoney === "number" ? VALUE_OPTIONS[Math.max(0, Math.min(VALUE_OPTIONS.length - 1, e.valueForMoney - 1))] : e.valueForMoney || "",
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
  if (typeof window === "undefined") return sampleData;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return sampleData;
  return migrateData(safeParse(raw, sampleData));
}

function exportData(data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `dish-tracker-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function Field({ label, children }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function Stars({ value }) {
  const n = Number(value || 0);
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`h-4 w-4 ${i < Math.round(n) ? "fill-current text-yellow-500" : "text-slate-300"}`} />
      ))}
    </div>
  );
}

function average(list) {
  const nums = list.filter((n) => n != null && !Number.isNaN(Number(n))).map(Number);
  if (!nums.length) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function normalizeDishName(name) {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

function TagInput({ label, color = "slate", values, setValues, inputValue, setInputValue, suggestions = [] }) {
  const filteredSuggestions = suggestions
    .filter((s) => inputValue.trim() && s.toLowerCase().includes(inputValue.trim().toLowerCase()) && !values.includes(s))
    .slice(0, 6);

  function addValue(raw) {
    const value = raw.trim();
    if (!value) return;
    if (values.some((v) => v.toLowerCase() === value.toLowerCase())) {
      setInputValue("");
      return;
    }
    setValues([...values, value]);
    setInputValue("");
  }

  function onKeyDown(e) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addValue(inputValue);
    }
  }

  const colorClasses = color === "red"
    ? "bg-red-100 text-red-700 border-red-200"
    : color === "blue"
      ? "bg-blue-100 text-blue-700 border-blue-200"
      : "bg-slate-100 text-slate-700 border-slate-200";

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={onKeyDown} placeholder="Type and press Enter" />
      {filteredSuggestions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {filteredSuggestions.map((s) => (
            <button key={s} type="button" className="rounded-full border px-3 py-1 text-xs text-slate-600" onClick={() => addValue(s)}>
              {s}
            </button>
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {values.map((value) => (
          <Badge key={value} variant="outline" className={`${colorClasses} flex items-center gap-1`}>
            {value}
            <button type="button" onClick={() => setValues(values.filter((v) => v !== value))}>
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
    </div>
  );
}

export default function DishTrackerWebApp() {
  const [data, setData] = useState(loadData);
  const [tab, setTab] = useState("dashboard");
  const [search, setSearch] = useState("");
  const [dishReportSearch, setDishReportSearch] = useState("");
  const [showDishNameSuggestions, setShowDishNameSuggestions] = useState(false);
  const [areaFilter, setAreaFilter] = useState("all");
  const [cuisineFilter, setCuisineFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

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
  const [newCuisine, setNewCuisine] = useState("");
  const [newArea, setNewArea] = useState("");
  const [duplicateDishSuggestion, setDuplicateDishSuggestion] = useState(null);
  const [showInlineRestaurantForDish, setShowInlineRestaurantForDish] = useState(false);
  const [showInlineRestaurantForExperience, setShowInlineRestaurantForExperience] = useState(false);
  const [inlineRestaurantForDish, setInlineRestaurantForDish] = useState(inlineRestaurantFormDefault);
  const [inlineRestaurantForExperience, setInlineRestaurantForExperience] = useState(inlineRestaurantFormDefault);
  const [logExperienceWithDish, setLogExperienceWithDish] = useState(true);

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

  const dishExperienceMap = useMemo(() => {
    return Object.fromEntries(
      data.dishes.map((dish) => [dish.id, data.experiences.filter((e) => e.dishId === dish.id)])
    );
  }, [data.dishes, data.experiences]);

  const dishCatalogMatches = useMemo(() => {
    const query = normalizeDishName(dishForm.name || "");
    if (!query) return [];

    return data.dishes
      .filter((dish) => dish.id !== dishForm.id)
      .filter((dish) => normalizeDishName(dish.name).includes(query))
      .sort((a, b) => {
        const aCurrent = a.restaurantId === dishForm.restaurantId ? 1 : 0;
        const bCurrent = b.restaurantId === dishForm.restaurantId ? 1 : 0;
        if (aCurrent !== bCurrent) return bCurrent - aCurrent;

        const aExact = normalizeDishName(a.name) === query ? 1 : 0;
        const bExact = normalizeDishName(b.name) === query ? 1 : 0;
        if (aExact !== bExact) return bExact - aExact;

        return a.name.localeCompare(b.name);
      })
      .slice(0, 8);
  }, [data.dishes, dishForm.id, dishForm.name, dishForm.restaurantId]);

  const dishComparisonGroups = useMemo(() => {
    const groups = new Map();

    data.dishes.forEach((dish) => {
      const key = normalizeDishName(dish.name);
      if (!key) return;

      const existing = groups.get(key);
      if (existing) {
        existing.items.push(dish);
      } else {
        groups.set(key, { key, label: dish.name.trim(), items: [dish] });
      }
    });

    return Array.from(groups.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [data.dishes]);

  const dishComparisonSuggestions = useMemo(() => {
    const query = normalizeDishName(dishReportSearch || "");
    if (!query) return dishComparisonGroups.slice(0, 8);

    return dishComparisonGroups
      .filter((group) => normalizeDishName(group.label).includes(query))
      .slice(0, 8);
  }, [dishComparisonGroups, dishReportSearch]);

  const activeDishComparison = useMemo(() => {
    const query = normalizeDishName(dishReportSearch || "");
    if (!query) return null;

    return dishComparisonGroups.find((group) => group.key === query)
      || dishComparisonGroups.find((group) => group.key.includes(query))
      || null;
  }, [dishComparisonGroups, dishReportSearch]);

  const activeDishComparisonRows = useMemo(() => {
    if (!activeDishComparison) return [];

    return activeDishComparison.items
      .map((dish) => {
        const restaurant = restaurantsById[dish.restaurantId];
        const branch = dish.branchId ? branchesById[dish.branchId] : null;
        const experiences = [...(dishExperienceMap[dish.id] || [])].sort((a, b) => new Date(b.date) - new Date(a.date));
        const latestExperience = experiences[0] || null;
        const avgRating = average(experiences.map((experience) => experience.rating));
        const bestRating = experiences.length ? Math.max(...experiences.map((experience) => Number(experience.rating || 0))) : null;

        return {
          dish,
          restaurant,
          branch,
          experiences,
          latestExperience,
          avgRating,
          bestRating,
        };
      })
      .sort((a, b) => {
        const avgDiff = (b.avgRating ?? -1) - (a.avgRating ?? -1);
        if (avgDiff !== 0) return avgDiff;

        const latestDiff = (b.latestExperience?.rating ?? -1) - (a.latestExperience?.rating ?? -1);
        if (latestDiff !== 0) return latestDiff;

        return b.experiences.length - a.experiences.length;
      });
  }, [activeDishComparison, branchesById, dishExperienceMap, restaurantsById]);

  const computedDishRating = (dishId) => average((dishExperienceMap[dishId] || []).map((e) => e.rating));

  const filteredDishes = useMemo(() => {
    const q = search.trim().toLowerCase();
    return data.dishes.filter((dish) => {
      const restaurant = restaurantsById[dish.restaurantId];
      const haystack = [
        dish.name,
        dish.notes,
        dish.recommendations?.join(" "),
        dish.alerts?.join(" "),
        dish.tags?.join(" "),
        dish.recommendedBy,
        restaurant?.name,
        restaurant?.area,
        restaurant?.cuisine,
      ].join(" ").toLowerCase();

      if (q && !haystack.includes(q)) return false;
      if (areaFilter !== "all" && restaurant?.area !== areaFilter) return false;
      if (cuisineFilter !== "all" && restaurant?.cuisine !== cuisineFilter) return false;
      if (statusFilter === "wishlist" && !dish.isWishlist) return false;
      if (statusFilter === "tried" && dish.isWishlist) return false;
      return true;
    });
  }, [data.dishes, restaurantsById, search, areaFilter, cuisineFilter, statusFilter]);

  const dashboardStats = useMemo(() => {
    const triedDishes = data.dishes.filter((d) => !d.isWishlist).length;
    const wishlistDishes = data.dishes.filter((d) => d.isWishlist).length;
    const avgDishRating = average(data.dishes.map((d) => computedDishRating(d.id)));
    return {
      restaurants: data.restaurants.length,
      dishes: data.dishes.length,
      experiences: data.experiences.length,
      triedDishes,
      wishlistDishes,
      avgDishRating: avgDishRating || 0,
    };
  }, [data, dishExperienceMap]);

  const recentExperiences = useMemo(() => [...data.experiences].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8), [data.experiences]);

  const restaurantSummaries = useMemo(() => {
    return data.restaurants.map((restaurant) => {
      const dishes = data.dishes.filter((d) => d.restaurantId === restaurant.id);
      const experiences = data.experiences.filter((e) => e.restaurantId === restaurant.id);
      const avgDishRating = average(dishes.map((d) => computedDishRating(d.id)));
      return { restaurant, dishesCount: dishes.length, experiencesCount: experiences.length, avgDishRating };
    });
  }, [data, dishExperienceMap]);

  function resetRestaurantForm() { setRestaurantForm(emptyRestaurantForm); }
  function resetBranchForm() { setBranchForm(emptyBranchForm); }
  function resetDishForm() {
    setDishForm(emptyDishForm);
    setDuplicateDishSuggestion(null);
    setShowDishNameSuggestions(false);
    setShowInlineRestaurantForDish(false);
    setInlineRestaurantForDish(inlineRestaurantFormDefault);
    setLogExperienceWithDish(true);
  }
  function resetExperienceForm() {
    setExperienceForm(emptyExperienceForm);
    setShowInlineRestaurantForExperience(false);
    setInlineRestaurantForExperience(inlineRestaurantFormDefault);
  }

  function createRestaurantRecord(form) {
    return {
      id: uid(),
      name: form.name.trim(),
      area: form.area.trim(),
      locationText: form.locationText.trim(),
      mapsLink: form.mapsLink.trim(),
      cuisine: form.cuisine,
      rating: form.rating ? Number(form.rating) : null,
      notes: form.notes.trim(),
      recommendedBy: form.recommendedBy.trim(),
      halalChecked: !!form.halalChecked,
      kidsFriendly: !!form.kidsFriendly,
    };
  }

  function saveRestaurant() {
    if (!restaurantForm.name.trim()) return;
    const payload = {
      id: restaurantForm.id || uid(),
      name: restaurantForm.name.trim(),
      area: restaurantForm.area.trim(),
      locationText: restaurantForm.locationText.trim(),
      mapsLink: restaurantForm.mapsLink.trim(),
      cuisine: restaurantForm.cuisine,
      rating: restaurantForm.rating ? Number(restaurantForm.rating) : null,
      notes: restaurantForm.notes.trim(),
      recommendedBy: restaurantForm.recommendedBy.trim(),
      halalChecked: !!restaurantForm.halalChecked,
      kidsFriendly: !!restaurantForm.kidsFriendly,
    };

    setData((prev) => ({
      ...prev,
      restaurants: restaurantForm.id
        ? prev.restaurants.map((r) => (r.id === restaurantForm.id ? payload : r))
        : [payload, ...prev.restaurants],
      areas: payload.area && !prev.areas.includes(payload.area) ? [...prev.areas, payload.area].sort() : prev.areas,
    }));
    resetRestaurantForm();
    setRestaurantOpen(false);
  }

  function saveBranch() {
    if (!branchForm.restaurantId || !branchForm.name.trim()) return;
    const payload = {
      id: branchForm.id || uid(),
      restaurantId: branchForm.restaurantId,
      name: branchForm.name.trim(),
      area: branchForm.area.trim(),
      locationText: branchForm.locationText.trim(),
      mapsLink: branchForm.mapsLink.trim(),
      notes: branchForm.notes.trim(),
    };
    setData((prev) => ({
      ...prev,
      branches: branchForm.id
        ? prev.branches.map((b) => (b.id === branchForm.id ? payload : b))
        : [payload, ...prev.branches],
      areas: payload.area && !prev.areas.includes(payload.area) ? [...prev.areas, payload.area].sort() : prev.areas,
    }));
    resetBranchForm();
    setBranchOpen(false);
  }

  function saveDish() {
    let restaurantId = dishForm.restaurantId;

    if (showInlineRestaurantForDish) {
      if (!inlineRestaurantForDish.name.trim()) return;
      const newRestaurant = createRestaurantRecord(inlineRestaurantForDish);
      restaurantId = newRestaurant.id;

      setData((prev) => ({
        ...prev,
        restaurants: [newRestaurant, ...prev.restaurants],
        areas: newRestaurant.area && !prev.areas.includes(newRestaurant.area) ? [...prev.areas, newRestaurant.area].sort() : prev.areas,
      }));
    }

    if (!restaurantId || !dishForm.name.trim()) return;
    const duplicate = data.dishes.find(
      (d) => d.restaurantId === restaurantId && d.name.trim().toLowerCase() === dishForm.name.trim().toLowerCase() && d.id !== dishForm.id
    );
    if (duplicate) {
      setDuplicateDishSuggestion(duplicate);
      return;
    }

    const dishId = dishForm.id || uid();
    const payload = {
      id: dishId,
      restaurantId,
      name: dishForm.name.trim(),
      branchId: dishForm.branchId === "none" ? null : dishForm.branchId,
      isWishlist: dishForm.isWishlist,
      recommendations: dishForm.recommendations,
      alerts: dishForm.alerts,
      tags: dishForm.tags,
      notes: dishForm.notes.trim(),
      recommendedBy: dishForm.recommendedBy.trim(),
      portionSize: dishForm.portionSize,
    };

    const shouldLogExperience = !dishForm.isWishlist && logExperienceWithDish && experienceForm.rating;
    const experiencePayload = shouldLogExperience
      ? {
          id: uid(),
          dishId,
          restaurantId,
          branchId: experienceForm.branchId === "none" ? null : experienceForm.branchId,
          date: experienceForm.date,
          orderType: experienceForm.orderType,
          rating: experienceForm.rating ? Number(experienceForm.rating) : null,
          price: experienceForm.price ? Number(experienceForm.price) : null,
          valueForMoney: experienceForm.valueForMoney,
          notes: experienceForm.notes.trim(),
          images: experienceForm.images || [],
        }
      : null;

    setData((prev) => ({
      ...prev,
      dishes: dishForm.id ? prev.dishes.map((d) => (d.id === dishForm.id ? payload : d)) : [payload, ...prev.dishes],
      experiences: experiencePayload ? [experiencePayload, ...prev.experiences] : prev.experiences,
    }));

    resetDishForm();
    setExperienceForm(emptyExperienceForm);
    setDishOpen(false);
  }

  function saveExperience() {
    let restaurantId = experienceForm.restaurantId;

    if (showInlineRestaurantForExperience) {
      if (!inlineRestaurantForExperience.name.trim()) return;
      const newRestaurant = createRestaurantRecord(inlineRestaurantForExperience);
      restaurantId = newRestaurant.id;
      setData((prev) => ({
        ...prev,
        restaurants: [newRestaurant, ...prev.restaurants],
        areas: newRestaurant.area && !prev.areas.includes(newRestaurant.area) ? [...prev.areas, newRestaurant.area].sort() : prev.areas,
      }));
    }

    if (!experienceForm.dishId || !restaurantId) return;
    const payload = {
      id: experienceForm.id || uid(),
      dishId: experienceForm.dishId,
      restaurantId,
      branchId: experienceForm.branchId === "none" ? null : experienceForm.branchId,
      date: experienceForm.date,
      orderType: experienceForm.orderType,
      rating: experienceForm.rating ? Number(experienceForm.rating) : null,
      price: experienceForm.price ? Number(experienceForm.price) : null,
      valueForMoney: experienceForm.valueForMoney,
      notes: experienceForm.notes.trim(),
      images: experienceForm.images || [],
    };
    setData((prev) => ({
      ...prev,
      experiences: experienceForm.id
        ? prev.experiences.map((e) => (e.id === experienceForm.id ? payload : e))
        : [payload, ...prev.experiences],
      dishes: prev.dishes.map((dish) => dish.id === experienceForm.dishId ? { ...dish, isWishlist: false } : dish),
    }));
    resetExperienceForm();
    setExperienceOpen(false);
  }

  function addCuisine() {
    const value = newCuisine.trim();
    if (!value || data.cuisines.includes(value)) return;
    setData((prev) => ({ ...prev, cuisines: [...prev.cuisines, value].sort() }));
    setNewCuisine("");
  }

  function addArea() {
    const value = newArea.trim();
    if (!value || data.areas.includes(value)) return;
    setData((prev) => ({ ...prev, areas: [...prev.areas, value].sort() }));
    setNewArea("");
  }

  function deleteRestaurant(id) {
    const dishIds = data.dishes.filter((d) => d.restaurantId === id).map((d) => d.id);
    setData((prev) => ({
      ...prev,
      restaurants: prev.restaurants.filter((r) => r.id !== id),
      branches: prev.branches.filter((b) => b.restaurantId !== id),
      dishes: prev.dishes.filter((d) => d.restaurantId !== id),
      experiences: prev.experiences.filter((e) => e.restaurantId !== id && !dishIds.includes(e.dishId)),
    }));
  }

  function deleteDish(id) {
    setData((prev) => ({ ...prev, dishes: prev.dishes.filter((d) => d.id !== id), experiences: prev.experiences.filter((e) => e.dishId !== id) }));
  }

  function deleteBranch(id) {
    setData((prev) => ({
      ...prev,
      branches: prev.branches.filter((b) => b.id !== id),
      dishes: prev.dishes.map((d) => (d.branchId === id ? { ...d, branchId: null } : d)),
      experiences: prev.experiences.map((e) => (e.branchId === id ? { ...e, branchId: null } : e)),
    }));
  }

  function deleteExperience(id) {
    setData((prev) => ({ ...prev, experiences: prev.experiences.filter((e) => e.id !== id) }));
  }

  function editRestaurant(r) { setRestaurantForm({ ...emptyRestaurantForm, ...r, rating: r.rating ?? "" }); setRestaurantOpen(true); }
  function editBranch(b) { setBranchForm({ ...emptyBranchForm, ...b }); setBranchOpen(true); }
  function editDish(d) {
    setDishForm({ ...emptyDishForm, ...d, branchId: d.branchId || "none", recommendationInput: "", alertInput: "", tagInput: "" });
    setDuplicateDishSuggestion(null);
    setShowDishNameSuggestions(false);
    setLogExperienceWithDish(false);
    setExperienceForm(emptyExperienceForm);
    setDishOpen(true);
  }
  function editExperience(e) { setExperienceForm({ ...emptyExperienceForm, ...e, branchId: e.branchId || "none", rating: e.rating ?? "", price: e.price ?? "", valueForMoney: e.valueForMoney || "" }); setExperienceOpen(true); }

  function prepareLogExperience(restaurantId, dishId) {
    setExperienceForm({ ...emptyExperienceForm, restaurantId, dishId, branchId: "none" });
    setExperienceOpen(true);
    setTab("dishes");
  }

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
    event.target.value = "";
  }

  function handleExperienceImageUpload(event) {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    Promise.all(files.map((file) => new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ id: uid(), name: file.name, dataUrl: reader.result });
      reader.readAsDataURL(file);
    }))).then((images) => setExperienceForm((prev) => ({ ...prev, images: [...prev.images, ...images] })));
    event.target.value = "";
  }

  const effectiveExperienceRestaurantId = showInlineRestaurantForExperience ? "" : experienceForm.restaurantId;
  const dishOptionsForExperience = data.dishes.filter((d) => !effectiveExperienceRestaurantId || d.restaurantId === effectiveExperienceRestaurantId);
  const effectiveDishRestaurantId = showInlineRestaurantForDish ? "" : dishForm.restaurantId;
  const branchOptionsForDish = data.branches.filter((b) => b.restaurantId === effectiveDishRestaurantId);
  const branchOptionsForDishExperience = data.branches.filter((b) => b.restaurantId === effectiveDishRestaurantId);
  const branchOptionsForExperience = data.branches.filter((b) => b.restaurantId === experienceForm.restaurantId);

  function openExistingDish(dish) {
    editDish(dish);
  }

  function selectDishNameSuggestion(dish) {
    if (dish.restaurantId === dishForm.restaurantId) {
      setShowDishNameSuggestions(false);
      editDish(dish);
      return;
    }

    setShowDishNameSuggestions(false);
    setDishForm((prev) => ({
      ...prev,
      name: dish.name,
    }));
  }

  useEffect(() => {
    if (!dishForm.restaurantId || !dishForm.name.trim()) {
      setDuplicateDishSuggestion(null);
      return;
    }
    const duplicate = data.dishes.find((d) => d.restaurantId === dishForm.restaurantId && d.name.trim().toLowerCase() === dishForm.name.trim().toLowerCase() && d.id !== dishForm.id);
    setDuplicateDishSuggestion(duplicate || null);
  }, [dishForm.restaurantId, dishForm.name, dishForm.id, data.dishes]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl p-4 md:p-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dish Tracker</h1>
              <p className="mt-1 text-sm text-slate-600">Track restaurants, dishes, branches, and every tasting experience.</p>
            </div>
            <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 lg:flex lg:w-auto lg:flex-wrap lg:justify-end">
              <Button variant="outline" className={`order-5 w-full justify-center sm:w-auto ${TOP_ACTION_BUTTON_STYLES.export}`} onClick={() => exportData(data)}><Download className="mr-2 h-4 w-4" /> Export JSON</Button>
              <Button variant="outline" className={`order-4 w-full justify-center sm:w-auto ${TOP_ACTION_BUTTON_STYLES.import}`} onClick={() => importRef.current?.click()}><Upload className="mr-2 h-4 w-4" /> Import JSON</Button>
              <input ref={importRef} type="file" accept="application/json" className="hidden" onChange={importJson} />


              <Dialog open={restaurantOpen} onOpenChange={(open) => { setRestaurantOpen(open); if (!open) resetRestaurantForm(); }}>
                <DialogTrigger asChild><Button variant="outline" className={`order-2 w-full justify-center sm:w-auto ${TOP_ACTION_BUTTON_STYLES.addRestaurant}`}><Plus className="mr-2 h-4 w-4" /> Add Restaurant</Button></DialogTrigger>
                <DialogContent className="max-h-[90vh] overflow-auto sm:max-w-2xl">
                  <DialogHeader><DialogTitle>{restaurantForm.id ? "Edit Restaurant" : "Add Restaurant"}</DialogTitle></DialogHeader>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Name"><Input value={restaurantForm.name} onChange={(e) => setRestaurantForm({ ...restaurantForm, name: e.target.value })} /></Field>
                    <Field label="Area">
                      <Select value={restaurantForm.area || "__none"} onValueChange={(value) => setRestaurantForm({ ...restaurantForm, area: value === "__none" ? "" : value })}>
                        <SelectTrigger><SelectValue placeholder="Select area" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none">No area</SelectItem>
                          {areaOptions.map((area) => <SelectItem key={area} value={area}>{area}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="Location text"><Input value={restaurantForm.locationText} onChange={(e) => setRestaurantForm({ ...restaurantForm, locationText: e.target.value })} /></Field>
                    <Field label="Google Maps link"><Input value={restaurantForm.mapsLink} onChange={(e) => setRestaurantForm({ ...restaurantForm, mapsLink: e.target.value })} /></Field>
                    <Field label="Cuisine">
                      <Select value={restaurantForm.cuisine || "__none"} onValueChange={(value) => setRestaurantForm({ ...restaurantForm, cuisine: value === "__none" ? "" : value })}>
                        <SelectTrigger><SelectValue placeholder="Select cuisine" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none">No cuisine</SelectItem>
                          {data.cuisines.map((cuisine) => <SelectItem key={cuisine} value={cuisine}>{cuisine}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="Restaurant rating (1-5)"><Input type="number" min="1" max="5" value={restaurantForm.rating} onChange={(e) => setRestaurantForm({ ...restaurantForm, rating: e.target.value })} /></Field>
                    <Field label="Recommended by"><Input value={restaurantForm.recommendedBy} onChange={(e) => setRestaurantForm({ ...restaurantForm, recommendedBy: e.target.value })} /></Field>
                    <div className="flex items-center gap-3 pt-8"><Checkbox checked={restaurantForm.halalChecked} onCheckedChange={(checked) => setRestaurantForm({ ...restaurantForm, halalChecked: !!checked })} /><Label>Halal checked</Label></div>
                    <div className="flex items-center gap-3 pt-8"><Checkbox checked={restaurantForm.kidsFriendly} onCheckedChange={(checked) => setRestaurantForm({ ...restaurantForm, kidsFriendly: !!checked })} /><Label>Kids friendly</Label></div>
                    <div className="md:col-span-2"><Field label="Notes"><Textarea value={restaurantForm.notes} onChange={(e) => setRestaurantForm({ ...restaurantForm, notes: e.target.value })} rows={4} /></Field></div>
                  </div>
                  <div className="mt-4 flex justify-end"><Button onClick={saveRestaurant}>{restaurantForm.id ? "Save Changes" : "Save Restaurant"}</Button></div>
                </DialogContent>
              </Dialog>

              <Dialog open={dishOpen} onOpenChange={(open) => { setDishOpen(open); if (!open) resetDishForm(); }}>
                <DialogTrigger asChild><Button className={`order-1 w-full justify-center sm:w-auto ${TOP_ACTION_BUTTON_STYLES.addDish}`}><Plus className="mr-2 h-4 w-4" /> Add Dish</Button></DialogTrigger>
                <DialogContent className="max-h-[90vh] overflow-auto sm:max-w-3xl">
                  <DialogHeader><DialogTitle>{dishForm.id ? "Edit Dish" : "Add Dish"}</DialogTitle></DialogHeader>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Restaurant">
                      {!showInlineRestaurantForDish ? (
                        <>
                          <Select value={dishForm.restaurantId} onValueChange={(value) => setDishForm({ ...dishForm, restaurantId: value, branchId: "none" })}>
                            <SelectTrigger><SelectValue placeholder="Select restaurant" /></SelectTrigger>
                            <SelectContent>{data.restaurants.map((restaurant) => <SelectItem key={restaurant.id} value={restaurant.id}>{restaurant.name}</SelectItem>)}</SelectContent>
                          </Select>
                          <button type="button" className="mt-2 text-sm text-blue-600 underline" onClick={() => { setShowInlineRestaurantForDish(true); setDishForm({ ...dishForm, restaurantId: "", branchId: "none" }); }}>
                            Add a new restaurant now
                          </button>
                        </>
                      ) : (
                        <div className="space-y-3 rounded-2xl border p-3">
                          <Input placeholder="Restaurant name" value={inlineRestaurantForDish.name} onChange={(e) => setInlineRestaurantForDish({ ...inlineRestaurantForDish, name: e.target.value })} />
                          <Select value={inlineRestaurantForDish.area || "__none"} onValueChange={(value) => setInlineRestaurantForDish({ ...inlineRestaurantForDish, area: value === "__none" ? "" : value })}>
                            <SelectTrigger><SelectValue placeholder="Select area" /></SelectTrigger>
                            <SelectContent><SelectItem value="__none">No area</SelectItem>{areaOptions.map((area) => <SelectItem key={area} value={area}>{area}</SelectItem>)}</SelectContent>
                          </Select>
                          <Input placeholder="Location text" value={inlineRestaurantForDish.locationText} onChange={(e) => setInlineRestaurantForDish({ ...inlineRestaurantForDish, locationText: e.target.value })} />
                          <Input placeholder="Google Maps link" value={inlineRestaurantForDish.mapsLink} onChange={(e) => setInlineRestaurantForDish({ ...inlineRestaurantForDish, mapsLink: e.target.value })} />
                          <Select value={inlineRestaurantForDish.cuisine || "__none"} onValueChange={(value) => setInlineRestaurantForDish({ ...inlineRestaurantForDish, cuisine: value === "__none" ? "" : value })}>
                            <SelectTrigger><SelectValue placeholder="Select cuisine" /></SelectTrigger>
                            <SelectContent><SelectItem value="__none">No cuisine</SelectItem>{data.cuisines.map((cuisine) => <SelectItem key={cuisine} value={cuisine}>{cuisine}</SelectItem>)}</SelectContent>
                          </Select>
                          <div className="flex gap-4">
                            <div className="flex items-center gap-2"><Checkbox checked={inlineRestaurantForDish.halalChecked} onCheckedChange={(checked) => setInlineRestaurantForDish({ ...inlineRestaurantForDish, halalChecked: !!checked })} /><Label>Halal checked</Label></div>
                            <div className="flex items-center gap-2"><Checkbox checked={inlineRestaurantForDish.kidsFriendly} onCheckedChange={(checked) => setInlineRestaurantForDish({ ...inlineRestaurantForDish, kidsFriendly: !!checked })} /><Label>Kids friendly</Label></div>
                          </div>
                          <button type="button" className="text-sm text-slate-600 underline" onClick={() => { setShowInlineRestaurantForDish(false); setInlineRestaurantForDish(inlineRestaurantFormDefault); }}>
                            Back to existing restaurants
                          </button>
                        </div>
                      )}
                    </Field>
                    <div className="relative md:col-span-2">
                      <Field label="Dish name">
                        <Input
                          value={dishForm.name}
                          onChange={(e) => {
                            setDishForm({ ...dishForm, name: e.target.value });
                            setShowDishNameSuggestions(true);
                          }}
                          onFocus={() => setShowDishNameSuggestions(true)}
                          onBlur={() => window.setTimeout(() => setShowDishNameSuggestions(false), 150)}
                          placeholder="Start typing a dish name"
                        />
                      </Field>
                      {showDishNameSuggestions && dishCatalogMatches.length > 0 && (
                        <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-2xl border bg-white shadow-lg">
                          {dishCatalogMatches.map((dish) => {
                            const restaurant = restaurantsById[dish.restaurantId];
                            const branch = dish.branchId ? branchesById[dish.branchId] : null;
                            const avgRating = computedDishRating(dish.id);
                            const isCurrentRestaurant = dish.restaurantId === dishForm.restaurantId;

                            return (
                              <button
                                key={dish.id}
                                type="button"
                                className="flex w-full items-start justify-between gap-3 border-b px-4 py-3 text-left last:border-b-0 hover:bg-slate-50"
                                onClick={() => selectDishNameSuggestion(dish)}
                              >
                                <div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-medium text-slate-900">{dish.name}</span>
                                    {isCurrentRestaurant && <Badge variant="secondary">Current restaurant</Badge>}
                                    {!isCurrentRestaurant && <Badge variant="outline">Use name here</Badge>}
                                    {dish.isWishlist && <Badge>Wishlist</Badge>}
                                  </div>
                                  <div className="mt-1 text-sm text-slate-600">
                                    {restaurant?.name || "Unknown restaurant"}
                                    {branch ? ` • ${branch.name}` : ""}
                                    {avgRating ? ` • Avg ${avgRating.toFixed(1)}/5` : ""}
                                  </div>
                                </div>
                                <div className="shrink-0 text-xs text-slate-500">
                                  {isCurrentRestaurant ? "Open existing" : "Copy name"}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    {duplicateDishSuggestion && (
                      <div className="md:col-span-2 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                        This dish already exists in this restaurant. You probably want to log a new experience instead.
                        <div className="mt-2"><Button size="sm" variant="outline" onClick={() => prepareLogExperience(duplicateDishSuggestion.restaurantId, duplicateDishSuggestion.id)}>Log Experience for Existing Dish</Button></div>
                      </div>
                    )}
                    <Field label="Default branch (optional)">
                      <Select value={dishForm.branchId} onValueChange={(value) => setDishForm({ ...dishForm, branchId: value })}>
                        <SelectTrigger><SelectValue placeholder="Select branch" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No default branch</SelectItem>
                          {branchOptionsForDish.map((branch) => <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="Portion size">
                      <Select value={dishForm.portionSize || "__none"} onValueChange={(value) => setDishForm({ ...dishForm, portionSize: value === "__none" ? "" : value })}>
                        <SelectTrigger><SelectValue placeholder="Select portion size" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none">No portion size</SelectItem>
                          {PORTION_SIZES.map((size) => <SelectItem key={size} value={size}>{size}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="Recommended by"><Input value={dishForm.recommendedBy} onChange={(e) => setDishForm({ ...dishForm, recommendedBy: e.target.value })} /></Field>
                    <div className="flex items-center gap-3 pt-8"><Checkbox checked={dishForm.isWishlist} onCheckedChange={(checked) => setDishForm({ ...dishForm, isWishlist: !!checked })} /><Label>Wishlist item (not tried yet)</Label></div>
                    <div className="md:col-span-2 rounded-2xl border bg-slate-50 p-4 space-y-4">
                      <div className="flex items-center gap-3"><Checkbox checked={!dishForm.isWishlist && logExperienceWithDish} onCheckedChange={(checked) => setLogExperienceWithDish(!!checked)} disabled={dishForm.isWishlist} /><Label>Add first experience now</Label></div>
                      {!dishForm.isWishlist && logExperienceWithDish && (
                        <div className="grid gap-4 md:grid-cols-2">
                          <Field label="Branch (optional)">
                            <Select value={experienceForm.branchId} onValueChange={(value) => setExperienceForm({ ...experienceForm, branchId: value })}>
                              <SelectTrigger><SelectValue placeholder="Select branch" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">No branch</SelectItem>
                                {branchOptionsForDishExperience.map((branch) => <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </Field>
                          <Field label="Date"><Input type="date" value={experienceForm.date} onChange={(e) => setExperienceForm({ ...experienceForm, date: e.target.value })} /></Field>
                          <Field label="Order type">
                            <Select value={experienceForm.orderType} onValueChange={(value) => setExperienceForm({ ...experienceForm, orderType: value })}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>{ORDER_TYPES.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent>
                            </Select>
                          </Field>
                          <Field label="Rating (1-5)"><Input type="number" min="1" max="5" value={experienceForm.rating} onChange={(e) => setExperienceForm({ ...experienceForm, rating: e.target.value })} /></Field>
                          <Field label="Price"><Input type="number" value={experienceForm.price} onChange={(e) => setExperienceForm({ ...experienceForm, price: e.target.value })} /></Field>
                          <Field label="Value for money">
                            <Select value={experienceForm.valueForMoney || "__none"} onValueChange={(value) => setExperienceForm({ ...experienceForm, valueForMoney: value === "__none" ? "" : value })}>
                              <SelectTrigger><SelectValue placeholder="Select value" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__none">No value</SelectItem>
                                {VALUE_OPTIONS.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </Field>
                          <div className="md:col-span-2">
                            <Field label="Images"><Input type="file" accept="image/*" multiple onChange={handleExperienceImageUpload} /></Field>
                          </div>
                          <div className="md:col-span-2"><Field label="Experience notes"><Textarea value={experienceForm.notes} onChange={(e) => setExperienceForm({ ...experienceForm, notes: e.target.value })} rows={3} /></Field></div>
                        </div>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <TagInput label="Dish tags" color="slate" values={dishForm.tags} setValues={(vals) => setDishForm({ ...dishForm, tags: vals })} inputValue={dishForm.tagInput} setInputValue={(v) => setDishForm({ ...dishForm, tagInput: v })} suggestions={allDishTags} />
                    </div>
                    <div className="md:col-span-2">
                      <TagInput label="Recommendations" color="blue" values={dishForm.recommendations} setValues={(vals) => setDishForm({ ...dishForm, recommendations: vals })} inputValue={dishForm.recommendationInput} setInputValue={(v) => setDishForm({ ...dishForm, recommendationInput: v })} suggestions={allRecommendationTags} />
                    </div>
                    <div className="md:col-span-2">
                      <TagInput label="Alerts / warnings" color="red" values={dishForm.alerts} setValues={(vals) => setDishForm({ ...dishForm, alerts: vals })} inputValue={dishForm.alertInput} setInputValue={(v) => setDishForm({ ...dishForm, alertInput: v })} suggestions={allAlertTags} />
                    </div>
                    <div className="md:col-span-2"><Field label="Notes"><Textarea value={dishForm.notes} onChange={(e) => setDishForm({ ...dishForm, notes: e.target.value })} rows={4} /></Field></div>
                  </div>
                  <div className="mt-4 flex justify-end"><Button onClick={saveDish}>{dishForm.id ? "Save Changes" : "Save Dish"}</Button></div>
                </DialogContent>
              </Dialog>

              <Dialog open={experienceOpen} onOpenChange={(open) => { setExperienceOpen(open); if (!open) resetExperienceForm(); }}>
                <DialogTrigger asChild><Button variant="outline" className={`order-3 w-full justify-center sm:w-auto ${TOP_ACTION_BUTTON_STYLES.addExperience}`}><Plus className="mr-2 h-4 w-4" /> Add Experience</Button></DialogTrigger>
                <DialogContent className="max-h-[90vh] overflow-auto sm:max-w-3xl">
                  <DialogHeader><DialogTitle>{experienceForm.id ? "Edit Experience" : "Log Dish Experience"}</DialogTitle></DialogHeader>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Restaurant">
                      {!showInlineRestaurantForExperience ? (
                        <>
                          <Select value={experienceForm.restaurantId} onValueChange={(value) => setExperienceForm({ ...experienceForm, restaurantId: value, dishId: "", branchId: "none" })}>
                            <SelectTrigger><SelectValue placeholder="Select restaurant" /></SelectTrigger>
                            <SelectContent>{data.restaurants.map((restaurant) => <SelectItem key={restaurant.id} value={restaurant.id}>{restaurant.name}</SelectItem>)}</SelectContent>
                          </Select>
                          <button type="button" className="mt-2 text-sm text-blue-600 underline" onClick={() => { setShowInlineRestaurantForExperience(true); setExperienceForm({ ...experienceForm, restaurantId: "", dishId: "", branchId: "none" }); }}>
                            Add a new restaurant now
                          </button>
                        </>
                      ) : (
                        <div className="space-y-3 rounded-2xl border p-3">
                          <Input placeholder="Restaurant name" value={inlineRestaurantForExperience.name} onChange={(e) => setInlineRestaurantForExperience({ ...inlineRestaurantForExperience, name: e.target.value })} />
                          <Select value={inlineRestaurantForExperience.area || "__none"} onValueChange={(value) => setInlineRestaurantForExperience({ ...inlineRestaurantForExperience, area: value === "__none" ? "" : value })}>
                            <SelectTrigger><SelectValue placeholder="Select area" /></SelectTrigger>
                            <SelectContent><SelectItem value="__none">No area</SelectItem>{areaOptions.map((area) => <SelectItem key={area} value={area}>{area}</SelectItem>)}</SelectContent>
                          </Select>
                          <Input placeholder="Location text" value={inlineRestaurantForExperience.locationText} onChange={(e) => setInlineRestaurantForExperience({ ...inlineRestaurantForExperience, locationText: e.target.value })} />
                          <Input placeholder="Google Maps link" value={inlineRestaurantForExperience.mapsLink} onChange={(e) => setInlineRestaurantForExperience({ ...inlineRestaurantForExperience, mapsLink: e.target.value })} />
                          <Select value={inlineRestaurantForExperience.cuisine || "__none"} onValueChange={(value) => setInlineRestaurantForExperience({ ...inlineRestaurantForExperience, cuisine: value === "__none" ? "" : value })}>
                            <SelectTrigger><SelectValue placeholder="Select cuisine" /></SelectTrigger>
                            <SelectContent><SelectItem value="__none">No cuisine</SelectItem>{data.cuisines.map((cuisine) => <SelectItem key={cuisine} value={cuisine}>{cuisine}</SelectItem>)}</SelectContent>
                          </Select>
                          <div className="flex gap-4">
                            <div className="flex items-center gap-2"><Checkbox checked={inlineRestaurantForExperience.halalChecked} onCheckedChange={(checked) => setInlineRestaurantForExperience({ ...inlineRestaurantForExperience, halalChecked: !!checked })} /><Label>Halal checked</Label></div>
                            <div className="flex items-center gap-2"><Checkbox checked={inlineRestaurantForExperience.kidsFriendly} onCheckedChange={(checked) => setInlineRestaurantForExperience({ ...inlineRestaurantForExperience, kidsFriendly: !!checked })} /><Label>Kids friendly</Label></div>
                          </div>
                          <button type="button" className="text-sm text-slate-600 underline" onClick={() => { setShowInlineRestaurantForExperience(false); setInlineRestaurantForExperience(inlineRestaurantFormDefault); }}>
                            Back to existing restaurants
                          </button>
                        </div>
                      )}
                    </Field>
                    <Field label="Dish">
                      <Select value={experienceForm.dishId} onValueChange={(value) => setExperienceForm({ ...experienceForm, dishId: value })}>
                        <SelectTrigger><SelectValue placeholder="Select dish" /></SelectTrigger>
                        <SelectContent>{dishOptionsForExperience.map((dish) => <SelectItem key={dish.id} value={dish.id}>{dish.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </Field>
                    <Field label="Branch (optional)">
                      <Select value={experienceForm.branchId} onValueChange={(value) => setExperienceForm({ ...experienceForm, branchId: value })}>
                        <SelectTrigger><SelectValue placeholder="Select branch" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No branch</SelectItem>
                          {branchOptionsForExperience.map((branch) => <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="Date"><Input type="date" value={experienceForm.date} onChange={(e) => setExperienceForm({ ...experienceForm, date: e.target.value })} /></Field>
                    <Field label="Order type">
                      <Select value={experienceForm.orderType} onValueChange={(value) => setExperienceForm({ ...experienceForm, orderType: value })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{ORDER_TYPES.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent>
                      </Select>
                    </Field>
                    <Field label="Rating (1-5)"><Input type="number" min="1" max="5" value={experienceForm.rating} onChange={(e) => setExperienceForm({ ...experienceForm, rating: e.target.value })} /></Field>
                    <Field label="Price"><Input type="number" value={experienceForm.price} onChange={(e) => setExperienceForm({ ...experienceForm, price: e.target.value })} /></Field>
                    <Field label="Value for money">
                      <Select value={experienceForm.valueForMoney || "__none"} onValueChange={(value) => setExperienceForm({ ...experienceForm, valueForMoney: value === "__none" ? "" : value })}>
                        <SelectTrigger><SelectValue placeholder="Select value" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none">No value</SelectItem>
                          {VALUE_OPTIONS.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </Field>
                    <div className="md:col-span-2">
                      <Field label="Images"><Input type="file" accept="image/*" multiple onChange={handleExperienceImageUpload} /></Field>
                      {experienceForm.images.length > 0 && (
                        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
                          {experienceForm.images.map((image) => (
                            <div key={image.id} className="relative overflow-hidden rounded-2xl border bg-white">
                              <img src={image.dataUrl} alt={image.name} className="h-28 w-full object-cover" />
                              <button type="button" className="absolute right-2 top-2 rounded-full bg-white/90 p-1" onClick={() => setExperienceForm((prev) => ({ ...prev, images: prev.images.filter((img) => img.id !== image.id) }))}>
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="md:col-span-2"><Field label="Notes"><Textarea value={experienceForm.notes} onChange={(e) => setExperienceForm({ ...experienceForm, notes: e.target.value })} rows={4} /></Field></div>
                  </div>
                  <div className="mt-4 flex justify-end"><Button onClick={saveExperience}>{experienceForm.id ? "Save Changes" : "Save Experience"}</Button></div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </motion.div>

        <Tabs value={tab} onValueChange={setTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 gap-2 rounded-2xl bg-transparent p-0 md:grid-cols-5">
            <TabsTrigger value="dashboard" className={`rounded-2xl border shadow-sm transition-colors ${TOP_NAV_STYLES.dashboard}`}>Dashboard</TabsTrigger>
            <TabsTrigger value="restaurants" className={`rounded-2xl border shadow-sm transition-colors ${TOP_NAV_STYLES.restaurants}`}>Restaurants</TabsTrigger>
            <TabsTrigger value="dishes" className={`rounded-2xl border shadow-sm transition-colors ${TOP_NAV_STYLES.dishes}`}>Dishes</TabsTrigger>
            <TabsTrigger value="experiences" className={`rounded-2xl border shadow-sm transition-colors ${TOP_NAV_STYLES.experiences}`}>Experiences</TabsTrigger>
            <TabsTrigger value="settings" className={`rounded-2xl border shadow-sm transition-colors ${TOP_NAV_STYLES.settings}`}>Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
              {[
                ["Restaurants", dashboardStats.restaurants, <Store className="h-5 w-5" key="a" />],
                ["Dishes", dashboardStats.dishes, <UtensilsCrossed className="h-5 w-5" key="b" />],
                ["Experiences", dashboardStats.experiences, <NotebookText className="h-5 w-5" key="c" />],
                ["Tried", dashboardStats.triedDishes, <Star className="h-5 w-5" key="d" />],
                ["Wishlist", dashboardStats.wishlistDishes, <Heart className="h-5 w-5" key="e" />],
                ["Avg Dish Rating", dashboardStats.avgDishRating.toFixed(1), <Filter className="h-5 w-5" key="f" />],
              ].map(([label, value, icon]) => (
                <Card key={label} className={`rounded-3xl border shadow-sm ${DASHBOARD_CARD_STYLES[label] || "border-slate-200 bg-white"}`}><CardContent className="flex items-center justify-between p-5"><div><div className="text-sm text-slate-600">{label}</div><div className="mt-1 text-2xl font-bold">{value}</div></div><div className="text-slate-500">{icon}</div></CardContent></Card>
              ))}
            </div>

            <div className={`${SECTION_CONTAINER} grid gap-6 xl:grid-cols-2`}>
              <Card className="rounded-3xl border-0 shadow-sm">
                <CardHeader><CardTitle>Recent Experiences</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {recentExperiences.length === 0 ? <div className="text-sm text-slate-500">No experiences yet.</div> : recentExperiences.map((experience) => {
                    const dish = dishesById[experience.dishId];
                    const restaurant = restaurantsById[experience.restaurantId];
                    const branch = experience.branchId ? branchesById[experience.branchId] : null;
                    return (
                      <div key={experience.id} className="rounded-2xl border p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="font-semibold">{dish?.name || "Unknown dish"}</div>
                            <div className="text-sm text-slate-500">{restaurant?.name} • {experience.orderType} • {experience.date}</div>
                            {branch && <div className="mt-1 text-xs text-slate-500">Branch: {branch.name}</div>}
                          </div>
                          <div className="flex items-center gap-2"><Stars value={experience.rating} /><Button variant="ghost" size="icon" onClick={() => deleteExperience(experience.id)}><Trash2 className="h-4 w-4" /></Button></div>
                        </div>
                        {(experience.price || experience.valueForMoney || experience.notes || experience.images?.length) && (
                          <div className="mt-3 text-sm text-slate-600">
                            {experience.price ? `Price: ${experience.price}` : ""}
                            {experience.price && experience.valueForMoney ? " • " : ""}
                            {experience.valueForMoney ? `Value: ${experience.valueForMoney}` : ""}
                            {experience.notes ? <div className="mt-2">{experience.notes}</div> : null}
                            {experience.images?.length ? <div className="mt-2 text-xs text-slate-500">{experience.images.length} image(s)</div> : null}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <Card className="rounded-3xl border-0 shadow-sm">
                <CardHeader><CardTitle>Restaurants Overview</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {restaurantSummaries.length === 0 ? <div className="text-sm text-slate-500">No restaurants yet.</div> : restaurantSummaries.map(({ restaurant, dishesCount, experiencesCount, avgDishRating }) => (
                    <div key={restaurant.id} className="rounded-2xl border p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="font-semibold">{restaurant.name}</div>
                          <div className="text-sm text-slate-500">{restaurant.area || "No area"} • {restaurant.cuisine || "No cuisine"}</div>
                        </div>
                        <Stars value={restaurant.rating} />
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
                        <Badge variant="secondary">{dishesCount} dishes</Badge>
                        <Badge variant="secondary">{experiencesCount} experiences</Badge>
                        <Badge variant="outline">Avg dish rating: {avgDishRating ? avgDishRating.toFixed(1) : "—"}</Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="restaurants" className="space-y-6">
            <div className={SECTION_CONTAINER}>
              <div className="flex flex-wrap gap-2">
                <Dialog open={branchOpen} onOpenChange={(open) => { setBranchOpen(open); if (!open) resetBranchForm(); }}>
                  <DialogTrigger asChild><Button variant="outline"><Plus className="mr-2 h-4 w-4" /> Add Branch</Button></DialogTrigger>
                  <DialogContent className="sm:max-w-2xl">
                    <DialogHeader><DialogTitle>{branchForm.id ? "Edit Branch" : "Add Branch"}</DialogTitle></DialogHeader>
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Restaurant">
                        <Select value={branchForm.restaurantId} onValueChange={(value) => setBranchForm({ ...branchForm, restaurantId: value })}>
                          <SelectTrigger><SelectValue placeholder="Select restaurant" /></SelectTrigger>
                          <SelectContent>{data.restaurants.map((restaurant) => <SelectItem key={restaurant.id} value={restaurant.id}>{restaurant.name}</SelectItem>)}</SelectContent>
                        </Select>
                      </Field>
                      <Field label="Branch name"><Input value={branchForm.name} onChange={(e) => setBranchForm({ ...branchForm, name: e.target.value })} /></Field>
                      <Field label="Area">
                        <Select value={branchForm.area || "__none"} onValueChange={(value) => setBranchForm({ ...branchForm, area: value === "__none" ? "" : value })}>
                          <SelectTrigger><SelectValue placeholder="Select area" /></SelectTrigger>
                          <SelectContent><SelectItem value="__none">No area</SelectItem>{areaOptions.map((area) => <SelectItem key={area} value={area}>{area}</SelectItem>)}</SelectContent>
                        </Select>
                      </Field>
                      <Field label="Location text"><Input value={branchForm.locationText} onChange={(e) => setBranchForm({ ...branchForm, locationText: e.target.value })} /></Field>
                      <Field label="Google Maps link"><Input value={branchForm.mapsLink} onChange={(e) => setBranchForm({ ...branchForm, mapsLink: e.target.value })} /></Field>
                      <div className="md:col-span-2"><Field label="Notes"><Textarea value={branchForm.notes} onChange={(e) => setBranchForm({ ...branchForm, notes: e.target.value })} rows={4} /></Field></div>
                    </div>
                    <div className="mt-4 flex justify-end"><Button onClick={saveBranch}>{branchForm.id ? "Save Changes" : "Save Branch"}</Button></div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div className={`${SECTION_CONTAINER} grid gap-5 lg:grid-cols-2`}>
              {data.restaurants.map((restaurant) => {
                const branches = data.branches.filter((b) => b.restaurantId === restaurant.id);
                const dishes = data.dishes.filter((d) => d.restaurantId === restaurant.id);
                const avgDishRating = average(dishes.map((d) => computedDishRating(d.id)));
                return (
                  <Card key={restaurant.id} className="rounded-3xl border-2 border-slate-200 bg-white shadow-sm">
                    <CardHeader className="px-6 pt-6 flex flex-row items-start justify-between gap-4 space-y-0">
                      <div>
                        <CardTitle className="text-2xl font-bold tracking-tight">{restaurant.name}</CardTitle>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600">
                          {restaurant.area && <Badge variant="secondary">{restaurant.area}</Badge>}
                          {restaurant.cuisine && <Badge variant="secondary">{restaurant.cuisine}</Badge>}
                          {restaurant.halalChecked && <Badge variant="outline">Halal checked</Badge>}
                          {restaurant.kidsFriendly && <Badge variant="outline">Kids friendly</Badge>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => editRestaurant(restaurant)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteRestaurant(restaurant.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </CardHeader>
                    <CardContent className="px-6 pb-6 space-y-4 text-sm text-slate-600">
                      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
                        <div className="flex items-center gap-2"><span className="font-medium text-slate-900">Restaurant rating:</span><Stars value={restaurant.rating} /></div>
                        <div className="flex items-center gap-2"><span className="font-medium text-slate-900">Avg dish rating:</span>{avgDishRating ? <Stars value={avgDishRating} /> : <span>—</span>}</div>
                        {restaurant.locationText && <div><span className="font-medium text-slate-900">Location:</span> {restaurant.locationText}</div>}
                        {restaurant.recommendedBy && <div><span className="font-medium text-slate-900">Recommended by:</span> {restaurant.recommendedBy}</div>}
                        {restaurant.mapsLink && <a href={restaurant.mapsLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-slate-900 underline"><MapPin className="h-4 w-4" /> Open Maps Link</a>}
                      </div>
                      {restaurant.notes && <div className="rounded-2xl border border-slate-200 bg-white p-4"><div className="mb-1 font-medium text-slate-900">Notes</div>{restaurant.notes}</div>}
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="mb-3 font-medium text-slate-900">Branches</div>
                        {branches.length === 0 ? <div className="text-sm text-slate-500">No branches added.</div> : <div className="space-y-2">{branches.map((branch) => <div key={branch.id} className="flex items-start justify-between rounded-2xl border border-slate-200 bg-white p-3"><div><div className="font-medium text-slate-900">{branch.name}</div><div>{branch.area || branch.locationText || "No location"}</div></div><div className="flex gap-1"><Button variant="ghost" size="icon" onClick={() => editBranch(branch)}><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={() => deleteBranch(branch.id)}><X className="h-4 w-4" /></Button></div></div>)}</div>}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="dishes" className="space-y-6">
            <Card className="rounded-3xl border border-amber-200 bg-amber-50/60 shadow-sm">
              <CardHeader>
                <CardTitle>Dish Comparison Across Restaurants</CardTitle>
                <div className="text-sm text-slate-600">
                  Compare one dish across every restaurant you have logged so you can decide where you liked it most.
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Input
                    placeholder="Type a dish name like Tawouk"
                    value={dishReportSearch}
                    onChange={(e) => setDishReportSearch(e.target.value)}
                  />
                  {dishComparisonSuggestions.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {dishComparisonSuggestions.map((group) => (
                        <button
                          key={group.key}
                          type="button"
                          className="rounded-full border px-3 py-1 text-xs text-slate-600"
                          onClick={() => setDishReportSearch(group.label)}
                        >
                          {group.label} ({group.items.length})
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {!activeDishComparison ? (
                  <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                    Start typing a dish name to compare the same dish across restaurants.
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <div className="text-lg font-semibold text-slate-900">{activeDishComparison.label}</div>
                      <div className="mt-1 text-sm text-slate-600">
                        {activeDishComparisonRows.length} restaurant{activeDishComparisonRows.length === 1 ? "" : "s"} tracked for this dish.
                      </div>
                    </div>

                    <div className="overflow-x-auto rounded-2xl border">
                      <table className="min-w-full text-sm">
                        <thead className="bg-slate-50 text-left text-slate-600">
                          <tr>
                            <th className="px-4 py-3 font-medium">Restaurant</th>
                            <th className="px-4 py-3 font-medium">Average</th>
                            <th className="px-4 py-3 font-medium">Latest</th>
                            <th className="px-4 py-3 font-medium">Best</th>
                            <th className="px-4 py-3 font-medium">Experiences</th>
                            <th className="px-4 py-3 font-medium">Latest notes</th>
                            <th className="px-4 py-3 font-medium"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {activeDishComparisonRows.map(({ dish, restaurant, branch, experiences, latestExperience, avgRating, bestRating }) => (
                            <tr key={dish.id} className="border-t align-top">
                              <td className="px-4 py-3">
                                <div className="font-medium text-slate-900">{restaurant?.name || "Unknown restaurant"}</div>
                                <div className="mt-1 text-xs text-slate-500">
                                  {restaurant?.area || "No area"}
                                  {restaurant?.cuisine ? ` • ${restaurant.cuisine}` : ""}
                                  {branch ? ` • ${branch.name}` : ""}
                                </div>
                              </td>
                              <td className="px-4 py-3">{avgRating ? avgRating.toFixed(1) : "—"}</td>
                              <td className="px-4 py-3">
                                {latestExperience?.rating ?? "—"}
                                {latestExperience?.date ? <div className="mt-1 text-xs text-slate-500">{latestExperience.date}</div> : null}
                              </td>
                              <td className="px-4 py-3">{bestRating || "—"}</td>
                              <td className="px-4 py-3">
                                {experiences.length}
                                {latestExperience?.price != null ? <div className="mt-1 text-xs text-slate-500">Latest price: {latestExperience.price}</div> : null}
                              </td>
                              <td className="max-w-xs px-4 py-3 text-slate-600">
                                {latestExperience?.notes || dish.notes || "—"}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm" onClick={() => openExistingDish(dish)}>Open</Button>
                                  <Button variant="ghost" size="sm" onClick={() => prepareLogExperience(dish.restaurantId, dish.id)}>Log</Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="rounded-3xl bg-white p-5 shadow-sm">
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-slate-900">Dish Library</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Browse, filter, and manage all saved dishes across restaurants.
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-5">
                <div className="relative md:col-span-2"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input className="pl-9" placeholder="Search dishes, tags, restaurants..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
                <Select value={areaFilter} onValueChange={setAreaFilter}><SelectTrigger><SelectValue placeholder="Area" /></SelectTrigger><SelectContent><SelectItem value="all">All areas</SelectItem>{areaOptions.map((area) => <SelectItem key={area} value={area}>{area}</SelectItem>)}</SelectContent></Select>
                <Select value={cuisineFilter} onValueChange={setCuisineFilter}><SelectTrigger><SelectValue placeholder="Cuisine" /></SelectTrigger><SelectContent><SelectItem value="all">All cuisines</SelectItem>{data.cuisines.map((cuisine) => <SelectItem key={cuisine} value={cuisine}>{cuisine}</SelectItem>)}</SelectContent></Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="all">All statuses</SelectItem><SelectItem value="tried">Tried</SelectItem><SelectItem value="wishlist">Wishlist</SelectItem></SelectContent></Select>
              </div>
            </div>

            <div className={`${SECTION_CONTAINER} grid gap-4 lg:grid-cols-2 xl:grid-cols-3`}>
              {filteredDishes.map((dish) => {
                const restaurant = restaurantsById[dish.restaurantId];
                const branch = dish.branchId ? branchesById[dish.branchId] : null;
                const experiences = dishExperienceMap[dish.id] || [];
                const avgRating = computedDishRating(dish.id);
                return (
                  <Card key={dish.id} className="rounded-3xl border-0 shadow-sm">
                    <CardHeader className="space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <CardTitle className="text-xl">{dish.name}</CardTitle>
                          <div className="mt-1 text-sm text-slate-500">{restaurant?.name || "Unknown restaurant"}</div>
                        </div>
                        <div className="flex gap-1"><Button variant="ghost" size="icon" onClick={() => editDish(dish)}><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={() => deleteDish(dish.id)}><Trash2 className="h-4 w-4" /></Button></div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {dish.isWishlist ? <Badge>Wishlist</Badge> : <Badge variant="secondary">Tried</Badge>}
                        {restaurant?.area && <Badge variant="secondary">{restaurant.area}</Badge>}
                        {restaurant?.cuisine && <Badge variant="secondary">{restaurant.cuisine}</Badge>}
                        {branch && <Badge variant="secondary">Branch: {branch.name}</Badge>}
                        {dish.portionSize && <Badge variant="outline">{dish.portionSize}</Badge>}
                        {(dish.tags || []).map((tag) => <Badge key={tag} variant="outline">{tag}</Badge>)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm text-slate-600">
                      <div className="flex items-center gap-2"><span className="font-medium text-slate-900">Dish rating:</span>{avgRating ? <Stars value={avgRating} /> : <span>—</span>}</div>
                      {dish.recommendedBy ? <div><span className="font-medium text-slate-900">Recommended by:</span> {dish.recommendedBy}</div> : null}
                      {dish.recommendations?.length ? <div><span className="font-medium text-slate-900">Recommendations:</span><div className="mt-2 flex flex-wrap gap-2">{dish.recommendations.map((item) => <Badge key={item} className="bg-blue-100 text-blue-700">{item}</Badge>)}</div></div> : null}
                      {dish.alerts?.length ? <div><span className="font-medium text-slate-900">Alerts:</span><div className="mt-2 flex flex-wrap gap-2">{dish.alerts.map((item) => <Badge key={item} className="bg-red-100 text-red-700">{item}</Badge>)}</div></div> : null}
                      {dish.notes ? <div>{dish.notes}</div> : null}
                      <div className="rounded-2xl bg-slate-50 p-3">
                        <div className="font-medium text-slate-900">Experience count: {experiences.length}</div>
                        {experiences.length > 0 && <div className="mt-1 text-xs text-slate-500">Latest: {[...experiences].sort((a, b) => new Date(b.date) - new Date(a.date))[0].date}</div>}
                      </div>
                      <Button variant="outline" className="w-full" onClick={() => prepareLogExperience(dish.restaurantId, dish.id)}>Log another experience</Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="experiences" className="space-y-4">
            <div className={`${SECTION_CONTAINER} space-y-3`}>
              {[...data.experiences].sort((a, b) => new Date(b.date) - new Date(a.date)).map((experience) => {
                const dish = dishesById[experience.dishId];
                const restaurant = restaurantsById[experience.restaurantId];
                const branch = experience.branchId ? branchesById[experience.branchId] : null;
                return (
                  <Card key={experience.id} className="rounded-3xl border-0 shadow-sm">
                    <CardContent className="p-5">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-2">
                          <div className="text-lg font-semibold">{dish?.name || "Unknown dish"}</div>
                          <div className="text-sm text-slate-500">{restaurant?.name} • {experience.date}</div>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary">{experience.orderType}</Badge>
                            {branch && <Badge variant="secondary">{branch.name}</Badge>}
                            {experience.price != null && <Badge variant="outline">Price: {experience.price}</Badge>}
                            {experience.valueForMoney ? <Badge variant="outline">Value: {experience.valueForMoney}</Badge> : null}
                          </div>
                          {experience.notes && <div className="text-sm text-slate-700">{experience.notes}</div>}
                          {experience.images?.length > 0 && (
                            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                              {experience.images.map((img) => <div key={img.id} className="overflow-hidden rounded-2xl border"><img src={img.dataUrl} alt={img.name} className="h-24 w-full object-cover" /></div>)}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-3"><Stars value={experience.rating} /><Button variant="ghost" size="icon" onClick={() => editExperience(experience)}><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={() => deleteExperience(experience.id)}><Trash2 className="h-4 w-4" /></Button></div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              {data.experiences.length === 0 && <Card className="rounded-3xl border-0 shadow-sm"><CardContent className="p-6 text-sm text-slate-500">No experiences logged yet.</CardContent></Card>}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className={SECTION_CONTAINER}>
              <Card className="rounded-3xl border-0 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Cuisines</CardTitle><Dialog open={cuisineOpen} onOpenChange={setCuisineOpen}><DialogTrigger asChild><Button variant="outline"><Plus className="mr-2 h-4 w-4" /> Add Cuisine</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Add Cuisine</DialogTitle></DialogHeader><div className="space-y-4"><Input value={newCuisine} onChange={(e) => setNewCuisine(e.target.value)} placeholder="Enter cuisine name" /><div className="flex justify-end"><Button onClick={addCuisine}>Save</Button></div></div></DialogContent></Dialog></CardHeader>
                <CardContent><div className="flex flex-wrap gap-2">{data.cuisines.map((cuisine) => <Badge key={cuisine} variant="secondary">{cuisine}</Badge>)}</div></CardContent>
              </Card>
            </div>

            <div className={SECTION_CONTAINER}>
              <Card className="rounded-3xl border-0 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Areas</CardTitle><Dialog open={areaOpen} onOpenChange={setAreaOpen}><DialogTrigger asChild><Button variant="outline"><Plus className="mr-2 h-4 w-4" /> Add Area</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Add Area</DialogTitle></DialogHeader><div className="space-y-4"><Input value={newArea} onChange={(e) => setNewArea(e.target.value)} placeholder="Enter area / city" /><div className="flex justify-end"><Button onClick={addArea}>Save</Button></div></div></DialogContent></Dialog></CardHeader>
                <CardContent><div className="flex flex-wrap gap-2">{areaOptions.map((area) => <Badge key={area} variant="secondary">{area}</Badge>)}</div></CardContent>
              </Card>
            </div>

            <div className={SECTION_CONTAINER}>
              <Card className="rounded-3xl border-0 shadow-sm">
                <CardHeader><CardTitle>Data Notes</CardTitle></CardHeader>
                <CardContent className="space-y-3 text-sm text-slate-600">
                  <div>Your data is saved locally in the browser using JSON-backed local storage.</div>
                  <div>Use <span className="font-medium text-slate-900">Export JSON</span> regularly to keep a portable backup file.</div>
                  <div>Images are stored inside your local browser data and JSON export, so large image libraries can make the file bigger.</div>
                  <div>You can later host this as a static site on GitHub Pages with no backend cost.</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
