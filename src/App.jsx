import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
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
  Eye,
  Image as ImageIcon,
  LogOut,
  ChevronDown,
  ChevronUp,
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
import { auth, db, hasFirebaseConfig } from "./lib/firebase";

const STORAGE_KEY = "dish-tracker-webapp-v2";
const APP_VERSION = "v0.2.0";
const CLOUD_DOC_VERSION = 1;
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
const DEFAULT_CITIES = [
  "Beirut",
  "Metn",
  "Keserwan",
  "Mount Lebanon",
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
  addDish: "!border-blue-600 !bg-blue-600 !text-white hover:!bg-blue-700",
  addRestaurant: "!border-emerald-200 !bg-emerald-50 !text-emerald-900 hover:!bg-emerald-100",
  addExperience: "!border-rose-200 !bg-rose-50 !text-rose-900 hover:!bg-rose-100",
  import: "!border-sky-200 !bg-sky-50 !text-sky-900 hover:!bg-sky-100",
  export: "!border-violet-200 !bg-violet-50 !text-violet-900 hover:!bg-violet-100",
  auth: "!border-slate-300 !bg-slate-100 !text-slate-800 hover:!bg-slate-200",
};
const SAVE_BUTTON_STYLE = "border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700";
const CANCEL_BUTTON_STYLE = "border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200";
const EDIT_BUTTON_STYLE = "!border-blue-300 !bg-blue-100 !text-blue-800 hover:!bg-blue-200";
const DELETE_BUTTON_STYLE = "!border-red-300 !bg-red-100 !text-red-800 hover:!bg-red-200";
const VIEW_BUTTON_STYLE = "!border-sky-300 !bg-sky-100 !text-sky-800 hover:!bg-sky-200";
const LOG_BUTTON_STYLE = "!border-amber-300 !bg-amber-100 !text-amber-800 hover:!bg-amber-200";
const LOG_EXPERIENCE_BUTTON_STYLE = "!border-violet-300 !bg-violet-100 !text-violet-800 hover:!bg-violet-200";

const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

const emptyRestaurantForm = {
  id: null,
  name: "",
  area: "",
  city: "",
  fullAddress: "",
  mapsLink: "",
  cuisines: [],
  cuisineInput: "",
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
  price: "",
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
  city: "",
  fullAddress: "",
  mapsLink: "",
  cuisines: [],
  cuisineInput: "",
  rating: "",
  notes: "",
  recommendedBy: "",
  halalChecked: true,
  kidsFriendly: false,
};

function daysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

function createSampleData() {
  const cedarBiteId = uid();
  const cedarBiteHamraBranchId = uid();
  const cedarBiteAchrafiehBranchId = uid();
  const falafelHubId = uid();
  const falafelHubVerdunBranchId = uid();
  const nonaSliceId = uid();
  const nonaSliceDbayehBranchId = uid();
  const sushiLoopId = uid();
  const sushiLoopJalElDibBranchId = uid();
  const burgerYardId = uid();
  const burgerYardJouniehBranchId = uid();
  const sweetLeafId = uid();
  const sweetLeafBadaroBranchId = uid();

  const cheeseManousheId = uid();
  const tawoukWrapId = uid();
  const falafelSandwichId = uid();
  const spicyPotatoesId = uid();
  const trufflePizzaId = uid();
  const tiramisuId = uid();
  const acaiBowlId = uid();
  const salmonMakiId = uid();
  const dragonRollId = uid();
  const wagyuBurgerId = uid();
  const loadedFriesId = uid();
  const moltenCookieId = uid();
  const avocadoToastId = uid();
  const pistachioCheesecakeId = uid();

  return {
    cuisines: DEFAULT_CUISINES,
    areas: DEFAULT_AREAS,
    cities: DEFAULT_CITIES,
    tagColors: {
      cheesy: "#2563eb",
      breakfast: "#f59e0b",
      crispy: "#f97316",
      spicy: "#ef4444",
      comfort: "#8b5cf6",
      fresh: "#10b981",
      dessert: "#ec4899",
    },
    restaurants: [
      {
        id: cedarBiteId,
        name: "Cedar Bite",
        area: "Mar Mikhael",
        city: "Beirut",
        fullAddress: "Mar Mikhael, Beirut",
        mapsLink: "",
        cuisines: ["Lebanese"],
        rating: 4,
        notes: "Reliable for breakfast and quick late-night orders.",
        recommendedBy: "Rami",
        halalChecked: true,
        kidsFriendly: true,
      },
      {
        id: falafelHubId,
        name: "Falafel Hub",
        area: "Hamra",
        city: "Beirut",
        fullAddress: "Hamra, Beirut",
        mapsLink: "",
        cuisines: ["Middle Eastern"],
        rating: 5,
        notes: "Fast service and very consistent wraps.",
        recommendedBy: "Nadine",
        halalChecked: true,
        kidsFriendly: false,
      },
      {
        id: nonaSliceId,
        name: "Nona Slice",
        area: "Dbayeh",
        city: "Metn",
        fullAddress: "Dbayeh, Metn",
        mapsLink: "",
        cuisines: ["Italian", "Pizza"],
        rating: 4,
        notes: "Good spot for pizza nights and dessert.",
        recommendedBy: "Karim",
        halalChecked: false,
        kidsFriendly: true,
      },
      {
        id: sushiLoopId,
        name: "Sushi Loop",
        area: "Jal El Dib",
        city: "Metn",
        fullAddress: "Jal El Dib, Metn",
        mapsLink: "",
        cuisines: ["Japanese", "Sushi"],
        rating: 4,
        notes: "Clean flavors and good rice texture.",
        recommendedBy: "Lea",
        halalChecked: false,
        kidsFriendly: true,
      },
      {
        id: burgerYardId,
        name: "Burger Yard",
        area: "Jounieh",
        city: "Keserwan",
        fullAddress: "Jounieh, Keserwan",
        mapsLink: "",
        cuisines: ["American", "Burgers"],
        rating: 4,
        notes: "Strong smash burgers and late-night fries.",
        recommendedBy: "Ziad",
        halalChecked: true,
        kidsFriendly: true,
      },
      {
        id: sweetLeafId,
        name: "Sweet Leaf",
        area: "Badaro",
        city: "Beirut",
        fullAddress: "Badaro, Beirut",
        mapsLink: "",
        cuisines: ["Cafe", "Dessert"],
        rating: 5,
        notes: "Excellent breakfast and dessert stop.",
        recommendedBy: "Tala",
        halalChecked: true,
        kidsFriendly: true,
      },
    ],
    branches: [
      {
        id: cedarBiteHamraBranchId,
        restaurantId: cedarBiteId,
        name: "Hamra Branch",
        area: "Hamra",
        locationText: "Main street near AUB",
        mapsLink: "",
        notes: "Best dine-in experience.",
      },
      {
        id: cedarBiteAchrafiehBranchId,
        restaurantId: cedarBiteId,
        name: "Achrafieh Branch",
        area: "Achrafieh",
        locationText: "Near Sassine Square",
        mapsLink: "",
        notes: "Usually faster for takeaway.",
      },
      {
        id: falafelHubVerdunBranchId,
        restaurantId: falafelHubId,
        name: "Verdun Branch",
        area: "Verdun",
        locationText: "Facing the mall entrance",
        mapsLink: "",
        notes: "",
      },
      {
        id: nonaSliceDbayehBranchId,
        restaurantId: nonaSliceId,
        name: "Waterfront Branch",
        area: "Dbayeh",
        locationText: "Near the marina",
        mapsLink: "",
        notes: "Parking is easier on weekdays.",
      },
      {
        id: sushiLoopJalElDibBranchId,
        restaurantId: sushiLoopId,
        name: "Main Branch",
        area: "Jal El Dib",
        locationText: "Near the highway exit",
        mapsLink: "",
        notes: "Quieter on weekday lunches.",
      },
      {
        id: burgerYardJouniehBranchId,
        restaurantId: burgerYardId,
        name: "Seaside Branch",
        area: "Jounieh",
        locationText: "Next to the coastal road",
        mapsLink: "",
        notes: "Best for dine-in burgers.",
      },
      {
        id: sweetLeafBadaroBranchId,
        restaurantId: sweetLeafId,
        name: "Garden Branch",
        area: "Badaro",
        locationText: "Behind the main strip",
        mapsLink: "",
        notes: "Nice outdoor seating in the morning.",
      },
    ],
    dishes: [
      {
        id: cheeseManousheId,
        restaurantId: cedarBiteId,
        name: "Cheese Manoushe",
        branchId: cedarBiteHamraBranchId,
        price: 8,
        isWishlist: false,
        recommendations: ["Best fresh in the morning", "Ask for extra akkawi"],
        alerts: ["Can get oily late at night"],
        tags: ["cheesy", "breakfast", "comfort"],
        notes: "Very consistent.",
        recommendedBy: "Maya",
        portionSize: "Adult",
      },
      {
        id: tawoukWrapId,
        restaurantId: cedarBiteId,
        name: "Tawouk Wrap",
        branchId: cedarBiteAchrafiehBranchId,
        price: 11,
        isWishlist: false,
        recommendations: ["Extra garlic sauce works well"],
        alerts: ["Fries inside can go soggy on delivery"],
        tags: ["fresh", "comfort"],
        notes: "Strong lunch option.",
        recommendedBy: "Rami",
        portionSize: "Big adult",
      },
      {
        id: falafelSandwichId,
        restaurantId: falafelHubId,
        name: "Falafel Sandwich",
        branchId: falafelHubVerdunBranchId,
        price: 4,
        isWishlist: false,
        recommendations: ["Add extra pickles and parsley"],
        alerts: [],
        tags: ["crispy", "fresh"],
        notes: "Crunchy and balanced.",
        recommendedBy: "Nadine",
        portionSize: "Adult",
      },
      {
        id: spicyPotatoesId,
        restaurantId: falafelHubId,
        name: "Spicy Potatoes",
        branchId: falafelHubVerdunBranchId,
        price: 3.5,
        isWishlist: false,
        recommendations: ["Works well as a side for sharing"],
        alerts: ["Heat level varies a lot"],
        tags: ["spicy", "crispy"],
        notes: "",
        recommendedBy: "",
        portionSize: "Shareable",
      },
      {
        id: trufflePizzaId,
        restaurantId: nonaSliceId,
        name: "Truffle Mushroom Pizza",
        branchId: nonaSliceDbayehBranchId,
        price: 18,
        isWishlist: false,
        recommendations: ["Best eaten in-house"],
        alerts: ["Rich, not for every mood"],
        tags: ["cheesy", "comfort"],
        notes: "Good crust and strong mushroom flavor.",
        recommendedBy: "Karim",
        portionSize: "Shareable",
      },
      {
        id: tiramisuId,
        restaurantId: nonaSliceId,
        name: "Tiramisu",
        branchId: nonaSliceDbayehBranchId,
        price: 6.5,
        isWishlist: false,
        recommendations: ["Good to split after pizza"],
        alerts: [],
        tags: ["dessert"],
        notes: "",
        recommendedBy: "Lynn",
        portionSize: "Taster",
      },
      {
        id: acaiBowlId,
        restaurantId: nonaSliceId,
        name: "Acai Bowl",
        branchId: null,
        price: 9,
        isWishlist: true,
        recommendations: [],
        alerts: [],
        tags: ["fresh", "breakfast"],
        notes: "Looks promising for a lighter option.",
        recommendedBy: "Sara",
        portionSize: "Adult",
      },
      {
        id: salmonMakiId,
        restaurantId: sushiLoopId,
        name: "Salmon Maki",
        branchId: sushiLoopJalElDibBranchId,
        price: 7,
        isWishlist: false,
        recommendations: ["Good starter if you want something safe"],
        alerts: [],
        tags: ["fresh"],
        notes: "Simple and well executed.",
        recommendedBy: "Lea",
        portionSize: "Taster",
      },
      {
        id: dragonRollId,
        restaurantId: sushiLoopId,
        name: "Dragon Roll",
        branchId: sushiLoopJalElDibBranchId,
        price: 13,
        isWishlist: false,
        recommendations: ["Best shared with another roll"],
        alerts: ["Sauce can overpower the eel"],
        tags: ["fresh", "comfort"],
        notes: "",
        recommendedBy: "Lea",
        portionSize: "Adult",
      },
      {
        id: wagyuBurgerId,
        restaurantId: burgerYardId,
        name: "Wagyu Smash Burger",
        branchId: burgerYardJouniehBranchId,
        price: 14,
        isWishlist: false,
        recommendations: ["Medium sauce is the right balance"],
        alerts: ["Messy to eat in the car"],
        tags: ["comfort", "crispy"],
        notes: "Very good crust on the patties.",
        recommendedBy: "Ziad",
        portionSize: "Big adult",
      },
      {
        id: loadedFriesId,
        restaurantId: burgerYardId,
        name: "Loaded Fries",
        branchId: burgerYardJouniehBranchId,
        price: 6,
        isWishlist: false,
        recommendations: ["Share between two"],
        alerts: ["Gets soggy fast on delivery"],
        tags: ["cheesy", "comfort"],
        notes: "",
        recommendedBy: "",
        portionSize: "Shareable",
      },
      {
        id: moltenCookieId,
        restaurantId: burgerYardId,
        name: "Molten Cookie Skillet",
        branchId: null,
        price: 8,
        isWishlist: true,
        recommendations: [],
        alerts: [],
        tags: ["dessert"],
        notes: "Looks heavy but worth trying once.",
        recommendedBy: "Dana",
        portionSize: "Shareable",
      },
      {
        id: avocadoToastId,
        restaurantId: sweetLeafId,
        name: "Avocado Toast",
        branchId: sweetLeafBadaroBranchId,
        price: 9.5,
        isWishlist: false,
        recommendations: ["Add poached egg if hungry"],
        alerts: [],
        tags: ["breakfast", "fresh"],
        notes: "Clean and balanced breakfast option.",
        recommendedBy: "Tala",
        portionSize: "Adult",
      },
      {
        id: pistachioCheesecakeId,
        restaurantId: sweetLeafId,
        name: "Pistachio Cheesecake",
        branchId: sweetLeafBadaroBranchId,
        price: 7,
        isWishlist: false,
        recommendations: ["Best with coffee"],
        alerts: [],
        tags: ["dessert", "comfort"],
        notes: "Creamy with a strong pistachio finish.",
        recommendedBy: "Tala",
        portionSize: "Taster",
      },
    ],
    experiences: [
      {
        id: uid(),
        dishId: cheeseManousheId,
        restaurantId: cedarBiteId,
        branchId: cedarBiteHamraBranchId,
        date: daysAgo(2),
        orderType: "Dine-in",
        rating: 4,
        price: 8,
        valueForMoney: "Good value",
        notes: "Crispy edges and generous cheese.",
        images: [],
      },
      {
        id: uid(),
        dishId: cheeseManousheId,
        restaurantId: cedarBiteId,
        branchId: cedarBiteAchrafiehBranchId,
        date: daysAgo(18),
        orderType: "Takeaway",
        rating: 3,
        price: 7.5,
        valueForMoney: "Okay value",
        notes: "Still solid, but less crisp.",
        images: [],
      },
      {
        id: uid(),
        dishId: tawoukWrapId,
        restaurantId: cedarBiteId,
        branchId: cedarBiteAchrafiehBranchId,
        date: daysAgo(5),
        orderType: "Delivery",
        rating: 4,
        price: 11,
        valueForMoney: "Good value",
        notes: "Juicy chicken, bread held up well.",
        images: [],
      },
      {
        id: uid(),
        dishId: falafelSandwichId,
        restaurantId: falafelHubId,
        branchId: falafelHubVerdunBranchId,
        date: daysAgo(1),
        orderType: "Takeaway",
        rating: 5,
        price: 4,
        valueForMoney: "Excellent value",
        notes: "Still the benchmark.",
        images: [],
      },
      {
        id: uid(),
        dishId: spicyPotatoesId,
        restaurantId: falafelHubId,
        branchId: falafelHubVerdunBranchId,
        date: daysAgo(1),
        orderType: "Takeaway",
        rating: 4,
        price: 3.5,
        valueForMoney: "Great value",
        notes: "Extra coriander and chili.",
        images: [],
      },
      {
        id: uid(),
        dishId: trufflePizzaId,
        restaurantId: nonaSliceId,
        branchId: nonaSliceDbayehBranchId,
        date: daysAgo(9),
        orderType: "Dine-in",
        rating: 4,
        price: 18,
        valueForMoney: "Okay value",
        notes: "Rich but satisfying for two people.",
        images: [],
      },
      {
        id: uid(),
        dishId: tiramisuId,
        restaurantId: nonaSliceId,
        branchId: nonaSliceDbayehBranchId,
        date: daysAgo(9),
        orderType: "Dine-in",
        rating: 5,
        price: 6.5,
        valueForMoney: "Good value",
        notes: "Light texture, not too sweet.",
        images: [],
      },
      {
        id: uid(),
        dishId: salmonMakiId,
        restaurantId: sushiLoopId,
        branchId: sushiLoopJalElDibBranchId,
        date: daysAgo(4),
        orderType: "Dine-in",
        rating: 4,
        price: 7,
        valueForMoney: "Okay value",
        notes: "Fresh fish and neat cuts.",
        images: [],
      },
      {
        id: uid(),
        dishId: dragonRollId,
        restaurantId: sushiLoopId,
        branchId: sushiLoopJalElDibBranchId,
        date: daysAgo(14),
        orderType: "Dine-in",
        rating: 4,
        price: 13,
        valueForMoney: "Okay value",
        notes: "Good texture contrast, slightly sweet sauce.",
        images: [],
      },
      {
        id: uid(),
        dishId: wagyuBurgerId,
        restaurantId: burgerYardId,
        branchId: burgerYardJouniehBranchId,
        date: daysAgo(3),
        orderType: "Dine-in",
        rating: 5,
        price: 14,
        valueForMoney: "Good value",
        notes: "Excellent crust and still juicy.",
        images: [],
      },
      {
        id: uid(),
        dishId: wagyuBurgerId,
        restaurantId: burgerYardId,
        branchId: burgerYardJouniehBranchId,
        date: daysAgo(21),
        orderType: "Delivery",
        rating: 4,
        price: 14,
        valueForMoney: "Okay value",
        notes: "Still good, but fries were softer.",
        images: [],
      },
      {
        id: uid(),
        dishId: loadedFriesId,
        restaurantId: burgerYardId,
        branchId: burgerYardJouniehBranchId,
        date: daysAgo(3),
        orderType: "Dine-in",
        rating: 4,
        price: 6,
        valueForMoney: "Great value",
        notes: "Good to share with burgers.",
        images: [],
      },
      {
        id: uid(),
        dishId: avocadoToastId,
        restaurantId: sweetLeafId,
        branchId: sweetLeafBadaroBranchId,
        date: daysAgo(6),
        orderType: "Dine-in",
        rating: 4,
        price: 9.5,
        valueForMoney: "Okay value",
        notes: "Fresh ingredients and good bread.",
        images: [],
      },
      {
        id: uid(),
        dishId: pistachioCheesecakeId,
        restaurantId: sweetLeafId,
        branchId: sweetLeafBadaroBranchId,
        date: daysAgo(6),
        orderType: "Dine-in",
        rating: 5,
        price: 7,
        valueForMoney: "Good value",
        notes: "One of the best desserts in the seed set.",
        images: [],
      },
    ],
  };
}

function safeParse(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function migrateData(parsed) {
  const experiences = (parsed.experiences || []).map(({ restaurantId: _restaurantId, ...e }) => ({
    valueForMoney: typeof e.valueForMoney === "number" ? VALUE_OPTIONS[Math.max(0, Math.min(VALUE_OPTIONS.length - 1, e.valueForMoney - 1))] : e.valueForMoney || "",
    images: e.images || [],
    ...e,
  }));

  const restaurants = (parsed.restaurants || []).map((r) => ({
    ...r,
    halalChecked: r.halalChecked ?? true,
    kidsFriendly: r.kidsFriendly ?? false,
    recommendedBy: r.recommendedBy || "",
    city: r.city || "",
    fullAddress: r.fullAddress || r.locationText || "",
    cuisines: Array.isArray(r.cuisines)
      ? r.cuisines
      : typeof r.cuisine === "string"
        ? [r.cuisine].filter(Boolean)
        : [],
  }));

  const dishes = (parsed.dishes || []).map((d) => ({
    price: d.price ?? [...experiences]
      .filter((e) => e.dishId === d.id && e.price != null)
      .sort((a, b) => new Date(b.date) - new Date(a.date))[0]?.price ?? null,
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

  return {
    cuisines: parsed.cuisines?.length ? parsed.cuisines : DEFAULT_CUISINES,
    areas: parsed.areas?.length ? parsed.areas : DEFAULT_AREAS,
    cities: parsed.cities?.length
      ? parsed.cities
      : [...new Set((parsed.restaurants || []).map((restaurant) => restaurant.city).filter(Boolean).concat(DEFAULT_CITIES))].sort(),
    tagColors: parsed.tagColors || {},
    restaurants,
    branches: parsed.branches || [],
    dishes,
    experiences,
  };
}

function loadData() {
  if (typeof window === "undefined") return createSampleData();
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return createSampleData();
  return migrateData(safeParse(raw, createSampleData()));
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

function ModalHeader({ title, onClose }) {
  return (
    <DialogHeader className="relative pr-10">
      <DialogTitle className="text-xl font-bold tracking-tight">{title}</DialogTitle>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute right-0 top-0 h-9 w-9 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900"
        onClick={onClose}
      >
        <span className="text-sm font-semibold leading-none">X</span>
      </Button>
    </DialogHeader>
  );
}

function ModalActions({ onCancel, onSave, saveLabel, cancelLabel = "Cancel" }) {
  return (
    <div className="mt-6 flex justify-end gap-3">
      <Button type="button" variant="outline" className={CANCEL_BUTTON_STYLE} onClick={onCancel}>
        {cancelLabel}
      </Button>
      <Button type="button" className={SAVE_BUTTON_STYLE} onClick={onSave}>
        {saveLabel}
      </Button>
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

function normalizeNumericInput(value) {
  if (value === "" || value == null) return null;
  const num = Number(value);
  return Number.isNaN(num) ? null : num;
}

function summarizeTags(tags = [], maxChars = 24, maxItems = 3) {
  const visible = [];
  let usedChars = 0;
  for (const tag of tags) {
    if (visible.length >= maxItems) break;
    const nextChars = usedChars + tag.length;
    if (visible.length > 0 && nextChars > maxChars) break;
    visible.push(tag);
    usedChars = nextChars;
  }
  const hiddenCount = tags.length - visible.length;
  return { visible, hiddenCount };
}

function ratingPillClass(value) {
  if (value == null) return "border-slate-200 bg-slate-50 text-slate-700";
  if (value >= 4.75) return "border-emerald-300 bg-emerald-100 text-emerald-900";
  if (value >= 3.75) return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (value >= 2.75) return "border-amber-200 bg-amber-50 text-amber-800";
  if (value >= 1.75) return "border-rose-200 bg-rose-50 text-rose-800";
  return "border-red-300 bg-red-100 text-red-900";
}

function valuePillClass(value) {
  if (!value) return "border-slate-200 bg-slate-50 text-slate-700";
  if (value === "Excellent value") return "border-emerald-300 bg-emerald-100 text-emerald-900";
  if (value === "Great value") return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (value === "Good value") return "border-sky-200 bg-sky-50 text-sky-800";
  if (value === "Okay value") return "border-amber-200 bg-amber-50 text-amber-800";
  if (value === "Bad value") return "border-rose-200 bg-rose-50 text-rose-800";
  return "border-red-300 bg-red-100 text-red-900";
}

function normalizeDishName(name) {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

function hasValidRating(value) {
  const num = Number(value);
  return !Number.isNaN(num) && num >= 1 && num <= 5;
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

function tagChipStyle(colorValue) {
  if (!colorValue) return undefined;

  return {
    backgroundColor: `${colorValue}22`,
    borderColor: `${colorValue}55`,
    color: colorValue,
  };
}

function serializeData(data) {
  return JSON.stringify(data);
}

function cloudDataDoc(userId) {
  return doc(db, "userData", userId);
}

function SetupRequiredScreen() {
  return (
    <div className="min-h-screen bg-slate-50 p-4 text-slate-900 md:p-8">
      <div className="mx-auto max-w-3xl">
        <Card className="rounded-3xl border border-amber-200 bg-white p-8 shadow-sm">
          <CardHeader className="space-y-3 px-0 pt-0">
            <Badge className="w-fit !border-amber-200 !bg-amber-100 !text-amber-800">{APP_VERSION}</Badge>
            <CardTitle className="text-3xl font-bold tracking-tight">Firebase Setup Required</CardTitle>
            <div className="text-sm text-slate-600">
              Add your Firebase web app environment variables, then restart `npm run dev`.
            </div>
          </CardHeader>
          <CardContent className="space-y-4 px-0 pb-0 text-sm text-slate-600">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="font-medium text-slate-900">Required `.env.local` keys</div>
              <pre className="mt-3 overflow-x-auto text-xs leading-6 text-slate-700">{`VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...`}</pre>
            </div>
            <div>Manual account creation is still handled in the Firebase Authentication console.</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AuthScreen({ email, password, authError, isSigningIn, onEmailChange, onPasswordChange, onSubmit }) {
  return (
    <div className="min-h-screen bg-slate-50 p-4 text-slate-900 md:p-8">
      <div className="mx-auto max-w-md">
        <Card className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <CardHeader className="space-y-3 px-0 pt-0">
            <Badge className="w-fit !border-slate-200 !bg-slate-100 !text-slate-700">{APP_VERSION}</Badge>
            <CardTitle className="text-3xl font-bold tracking-tight">Sign In</CardTitle>
            <div className="text-sm text-slate-600">Use the manually-created Firebase account for this app.</div>
          </CardHeader>
          <CardContent className="space-y-4 px-0 pb-0">
            <Field label="Email">
              <Input type="email" value={email} onChange={(e) => onEmailChange(e.target.value)} placeholder="name@example.com" />
            </Field>
            <Field label="Password">
              <Input type="password" value={password} onChange={(e) => onPasswordChange(e.target.value)} placeholder="Password" />
            </Field>
            {authError ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{authError}</div> : null}
            <Button type="button" className="w-full" onClick={onSubmit} disabled={isSigningIn}>
              {isSigningIn ? "Signing In..." : "Sign In"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function LoadingScreen({ title, body }) {
  return (
    <div className="min-h-screen bg-slate-50 p-4 text-slate-900 md:p-8">
      <div className="mx-auto max-w-md">
        <Card className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <CardHeader className="space-y-3 px-0 py-0">
            <Badge className="w-fit !border-slate-200 !bg-slate-100 !text-slate-700">{APP_VERSION}</Badge>
            <CardTitle className="text-3xl font-bold tracking-tight">{title}</CardTitle>
            <div className="text-sm text-slate-600">{body}</div>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}

function DishTrackerAppContent({ data, setData, userEmail, cloudStatus, onLogout }) {
  const [tab, setTab] = useState("dashboard");
  const [search, setSearch] = useState("");
  const [dishReportSearch, setDishReportSearch] = useState("");
  const [showDishNameSuggestions, setShowDishNameSuggestions] = useState(false);
  const [restaurantSearch, setRestaurantSearch] = useState("");
  const [restaurantAreaFilter, setRestaurantAreaFilter] = useState("all");
  const [restaurantCityFilter, setRestaurantCityFilter] = useState("all");
  const [restaurantCuisineFilter, setRestaurantCuisineFilter] = useState("all");
  const [restaurantKidsFilter, setRestaurantKidsFilter] = useState("all");
  const [areaFilter, setAreaFilter] = useState("all");
  const [cuisineFilter, setCuisineFilter] = useState("all");
  const [restaurantFilter, setRestaurantFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [restaurantOpen, setRestaurantOpen] = useState(false);
  const [branchOpen, setBranchOpen] = useState(false);
  const [dishOpen, setDishOpen] = useState(false);
  const [experienceOpen, setExperienceOpen] = useState(false);
  const [cuisineOpen, setCuisineOpen] = useState(false);
  const [areaOpen, setAreaOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);

  const [restaurantForm, setRestaurantForm] = useState(emptyRestaurantForm);
  const [branchForm, setBranchForm] = useState(emptyBranchForm);
  const [branchFormError, setBranchFormError] = useState("");
  const [dishForm, setDishForm] = useState(emptyDishForm);
  const [experienceForm, setExperienceForm] = useState(emptyExperienceForm);
  const [experienceFormError, setExperienceFormError] = useState("");
  const [experienceRatingError, setExperienceRatingError] = useState("");
  const [newCuisine, setNewCuisine] = useState("");
  const [newArea, setNewArea] = useState("");
  const [newCity, setNewCity] = useState("");
  const [duplicateDishSuggestion, setDuplicateDishSuggestion] = useState(null);
  const [showInlineRestaurantForDish, setShowInlineRestaurantForDish] = useState(false);
  const [showInlineRestaurantForExperience, setShowInlineRestaurantForExperience] = useState(false);
  const [inlineRestaurantForDish, setInlineRestaurantForDish] = useState(inlineRestaurantFormDefault);
  const [inlineRestaurantForExperience, setInlineRestaurantForExperience] = useState(inlineRestaurantFormDefault);
  const [logExperienceWithDish, setLogExperienceWithDish] = useState(true);
  const [expandedTag, setExpandedTag] = useState(null);
  const [expandedCuisine, setExpandedCuisine] = useState(null);
  const [expandedArea, setExpandedArea] = useState(null);
  const [expandedCity, setExpandedCity] = useState(null);

  const importRef = useRef(null);
  const previousExperienceDishIdRef = useRef("");

  const restaurantsById = useMemo(() => Object.fromEntries(data.restaurants.map((r) => [r.id, r])), [data.restaurants]);
  const branchesById = useMemo(() => Object.fromEntries(data.branches.map((b) => [b.id, b])), [data.branches]);
  const dishesById = useMemo(() => Object.fromEntries(data.dishes.map((d) => [d.id, d])), [data.dishes]);

  const allDishTags = useMemo(() => [...new Set(data.dishes.flatMap((d) => d.tags || []))].sort(), [data.dishes]);
  const allRecommendationTags = useMemo(() => [...new Set(data.dishes.flatMap((d) => d.recommendations || []))].sort(), [data.dishes]);
  const allAlertTags = useMemo(() => [...new Set(data.dishes.flatMap((d) => d.alerts || []))].sort(), [data.dishes]);

  const areaOptions = useMemo(() => [...new Set([...(data.areas || []), ...data.restaurants.map((r) => r.area).filter(Boolean), ...data.branches.map((b) => b.area).filter(Boolean)])].sort(), [data]);
  const cityOptions = useMemo(() => [...new Set([...(data.cities || []), ...data.restaurants.map((r) => r.city).filter(Boolean)])].sort(), [data]);
  const restaurantFilterAreaOptions = useMemo(() => [...new Set(data.restaurants.map((r) => r.area).filter(Boolean))].sort(), [data.restaurants]);
  const restaurantFilterCityOptions = useMemo(() => [...new Set(data.restaurants.map((r) => r.city).filter(Boolean))].sort(), [data.restaurants]);
  const restaurantFilterCuisineOptions = useMemo(() => [...new Set(data.restaurants.flatMap((r) => r.cuisines || []))].sort(), [data.restaurants]);
  const dishFilterRestaurantOptions = useMemo(
    () => [...new Set(data.dishes.map((dish) => restaurantsById[dish.restaurantId]?.name).filter(Boolean))].sort(),
    [data.dishes, restaurantsById]
  );
  const dishFilterAreaOptions = useMemo(
    () => [...new Set(data.dishes.map((dish) => restaurantsById[dish.restaurantId]?.area).filter(Boolean))].sort(),
    [data.dishes, restaurantsById]
  );
  const dishFilterCuisineOptions = useMemo(
    () => [...new Set(data.dishes.flatMap((dish) => restaurantsById[dish.restaurantId]?.cuisines || []))].sort(),
    [data.dishes, restaurantsById]
  );
  const dishStatusOptions = useMemo(() => {
    const options = [];
    if (data.dishes.some((dish) => !dish.isWishlist)) options.push({ value: "tried", label: "Tried" });
    if (data.dishes.some((dish) => dish.isWishlist)) options.push({ value: "wishlist", label: "Wishlist" });
    return options;
  }, [data.dishes]);

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
        ...(restaurant?.cuisines || []),
      ].join(" ").toLowerCase();

      if (q && !haystack.includes(q)) return false;
      if (restaurantFilter !== "all" && restaurant?.name !== restaurantFilter) return false;
      if (areaFilter !== "all" && restaurant?.area !== areaFilter) return false;
      if (cuisineFilter !== "all" && !(restaurant?.cuisines || []).includes(cuisineFilter)) return false;
      if (statusFilter === "wishlist" && !dish.isWishlist) return false;
      if (statusFilter === "tried" && dish.isWishlist) return false;
      return true;
    });
  }, [data.dishes, restaurantsById, search, restaurantFilter, areaFilter, cuisineFilter, statusFilter]);

  const filteredRestaurants = useMemo(() => {
    const q = restaurantSearch.trim().toLowerCase();

    return data.restaurants.filter((restaurant) => {
      const restaurantBranches = data.branches.filter((branch) => branch.restaurantId === restaurant.id);
      const restaurantDishes = data.dishes.filter((dish) => dish.restaurantId === restaurant.id);

      const haystack = [
        restaurant.name,
        restaurant.area,
        restaurant.city,
        ...(restaurant.cuisines || []),
        restaurant.fullAddress,
        restaurant.notes,
        restaurant.recommendedBy,
        ...restaurantBranches.flatMap((branch) => [branch.name, branch.area, branch.locationText, branch.notes]),
        ...restaurantDishes.flatMap((dish) => [dish.name, dish.notes, dish.recommendedBy, ...(dish.tags || [])]),
      ].join(" ").toLowerCase();

      if (q && !haystack.includes(q)) return false;
      if (restaurantAreaFilter !== "all" && restaurant.area !== restaurantAreaFilter) return false;
      if (restaurantCityFilter !== "all" && restaurant.city !== restaurantCityFilter) return false;
      if (restaurantCuisineFilter !== "all" && !(restaurant.cuisines || []).includes(restaurantCuisineFilter)) return false;
      if (restaurantKidsFilter === "kids" && !restaurant.kidsFriendly) return false;
      return true;
    });
  }, [data.branches, data.dishes, data.restaurants, restaurantAreaFilter, restaurantCityFilter, restaurantCuisineFilter, restaurantKidsFilter, restaurantSearch]);

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
      const dishIds = new Set(dishes.map((dish) => dish.id));
      const experiences = data.experiences.filter((e) => dishIds.has(e.dishId));
      const avgDishRating = average(dishes.map((d) => computedDishRating(d.id)));
      const avgDishPrice = average(dishes.map((dish) => dish.price));
      return { restaurant, dishesCount: dishes.length, experiencesCount: experiences.length, avgDishRating, avgDishPrice };
    });
  }, [data, dishExperienceMap]);

  function resetRestaurantForm() { setRestaurantForm(emptyRestaurantForm); }
  function resetBranchForm() { setBranchForm(emptyBranchForm); setBranchFormError(""); }
  function resetDishForm() {
    setDishForm(emptyDishForm);
    setDuplicateDishSuggestion(null);
    setShowDishNameSuggestions(false);
    setExperienceFormError("");
    setExperienceRatingError("");
    setShowInlineRestaurantForDish(false);
    setInlineRestaurantForDish(inlineRestaurantFormDefault);
    setLogExperienceWithDish(true);
  }
  function resetExperienceForm() {
    setExperienceForm(emptyExperienceForm);
    setExperienceFormError("");
    setExperienceRatingError("");
    setShowInlineRestaurantForExperience(false);
    setInlineRestaurantForExperience(inlineRestaurantFormDefault);
  }

  function seedSampleData() {
    if (typeof window !== "undefined") {
      const confirmed = window.confirm("Replace the current local data with sample seed data? This will overwrite the data currently shown in the app.");
      if (!confirmed) return;
    }

    setData(createSampleData());
    resetRestaurantForm();
    resetBranchForm();
    resetDishForm();
    resetExperienceForm();
    setRestaurantOpen(false);
    setBranchOpen(false);
    setDishOpen(false);
    setExperienceOpen(false);
    setSearch("");
    setRestaurantSearch("");
    setDishReportSearch("");
  }

  function createRestaurantRecord(form) {
    return {
      id: uid(),
      name: form.name.trim(),
      area: form.area.trim(),
      city: form.city.trim(),
      fullAddress: form.fullAddress.trim(),
      mapsLink: form.mapsLink.trim(),
      cuisines: form.cuisines,
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
      city: restaurantForm.city.trim(),
      fullAddress: restaurantForm.fullAddress.trim(),
      mapsLink: restaurantForm.mapsLink.trim(),
      cuisines: restaurantForm.cuisines,
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
      cities: payload.city && !prev.cities?.includes(payload.city) ? [...(prev.cities || []), payload.city].sort() : (prev.cities || []),
    }));
    resetRestaurantForm();
    setRestaurantOpen(false);
  }

  function saveBranch() {
    if (!branchForm.restaurantId) {
      setBranchFormError("Select a restaurant before saving the branch.");
      return;
    }
    if (!branchForm.name.trim()) {
      setBranchFormError("Enter a branch name before saving.");
      return;
    }
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
        cities: newRestaurant.city && !prev.cities?.includes(newRestaurant.city) ? [...(prev.cities || []), newRestaurant.city].sort() : (prev.cities || []),
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
      branchId: null,
      price: normalizeNumericInput(dishForm.price),
      isWishlist: dishForm.isWishlist,
      recommendations: dishForm.recommendations,
      alerts: dishForm.alerts,
      tags: dishForm.tags,
      notes: dishForm.notes.trim(),
      recommendedBy: dishForm.recommendedBy.trim(),
      portionSize: dishForm.portionSize,
    };

    if (!dishForm.isWishlist && logExperienceWithDish && !hasValidRating(experienceForm.rating)) {
      setExperienceRatingError("Rating is required. Enter a value from 1 to 5.");
      return;
    }

    const shouldLogExperience = !dishForm.isWishlist && logExperienceWithDish;
    const defaultExperiencePrice = normalizeNumericInput(experienceForm.price) ?? payload.price;
    const experiencePayload = shouldLogExperience
      ? {
          id: uid(),
          dishId,
          branchId: experienceForm.branchId === "none" ? null : experienceForm.branchId,
          date: experienceForm.date,
          orderType: experienceForm.orderType,
          rating: experienceForm.rating ? Number(experienceForm.rating) : null,
          price: defaultExperiencePrice,
          valueForMoney: experienceForm.valueForMoney,
          notes: experienceForm.notes.trim(),
          images: experienceForm.images || [],
        }
      : null;

    const finalDishPayload = experiencePayload?.price != null
      ? { ...payload, price: experiencePayload.price }
      : payload;

    setData((prev) => ({
      ...prev,
      dishes: dishForm.id ? prev.dishes.map((d) => (d.id === dishForm.id ? finalDishPayload : d)) : [finalDishPayload, ...prev.dishes],
      experiences: experiencePayload ? [experiencePayload, ...prev.experiences] : prev.experiences,
    }));

    resetDishForm();
    setExperienceForm(emptyExperienceForm);
    setDishOpen(false);
  }

  function saveExperience() {
    const selectedDish = dishesById[experienceForm.dishId];

    setExperienceFormError("");

    if (showInlineRestaurantForExperience) {
      if (!inlineRestaurantForExperience.name.trim()) return;
      const newRestaurant = createRestaurantRecord(inlineRestaurantForExperience);
      setData((prev) => ({
        ...prev,
        restaurants: [newRestaurant, ...prev.restaurants],
        areas: newRestaurant.area && !prev.areas.includes(newRestaurant.area) ? [...prev.areas, newRestaurant.area].sort() : prev.areas,
        cities: newRestaurant.city && !prev.cities?.includes(newRestaurant.city) ? [...(prev.cities || []), newRestaurant.city].sort() : (prev.cities || []),
      }));
    }

    if (!experienceForm.dishId) {
      setExperienceFormError("Select a dish before saving the experience.");
      return;
    }

    if (!hasValidRating(experienceForm.rating)) {
      setExperienceRatingError("Rating is required. Enter a value from 1 to 5.");
      return;
    }

    const payload = {
      id: experienceForm.id || uid(),
      dishId: experienceForm.dishId,
      branchId: experienceForm.branchId === "none" ? null : experienceForm.branchId,
      date: experienceForm.date,
      orderType: experienceForm.orderType,
      rating: experienceForm.rating ? Number(experienceForm.rating) : null,
      price: normalizeNumericInput(experienceForm.price),
      valueForMoney: experienceForm.valueForMoney,
      notes: experienceForm.notes.trim(),
      images: experienceForm.images || [],
    };
    setData((prev) => ({
      ...prev,
      experiences: experienceForm.id
        ? prev.experiences.map((e) => (e.id === experienceForm.id ? payload : e))
        : [payload, ...prev.experiences],
      dishes: prev.dishes.map((dish) => dish.id === experienceForm.dishId ? {
        ...dish,
        isWishlist: false,
        price: payload.price != null ? payload.price : dish.price ?? null,
      } : dish),
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

  function renameCuisine(cuisine) {
    const nextCuisine = window.prompt("Rename cuisine", cuisine)?.trim();
    if (!nextCuisine || nextCuisine === cuisine) return;

    const hasDuplicate = data.cuisines.some((existingCuisine) => existingCuisine.toLowerCase() === nextCuisine.toLowerCase() && existingCuisine !== cuisine);
    if (hasDuplicate) {
      window.alert("A cuisine with that name already exists.");
      return;
    }

    setData((prev) => ({
      ...prev,
      cuisines: prev.cuisines.map((existingCuisine) => (existingCuisine === cuisine ? nextCuisine : existingCuisine)).sort(),
      restaurants: prev.restaurants.map((restaurant) => ({
        ...restaurant,
        cuisines: (restaurant.cuisines || []).map((existingCuisine) => (existingCuisine === cuisine ? nextCuisine : existingCuisine)),
      })),
    }));
  }

  function deleteCuisine(cuisine) {
    const linkedRestaurants = data.restaurants.filter((restaurant) => (restaurant.cuisines || []).includes(cuisine));
    const linkedRestaurantNames = linkedRestaurants.map((restaurant) => restaurant.name).join(", ");
    const confirmed = window.confirm(
      linkedRestaurants.length > 0
        ? `Delete cuisine "${cuisine}"? It will also be removed from these restaurants: ${linkedRestaurantNames}.`
        : `Delete cuisine "${cuisine}"?`,
    );
    if (!confirmed) return;

    setData((prev) => ({
      ...prev,
      cuisines: prev.cuisines.filter((existingCuisine) => existingCuisine !== cuisine),
      restaurants: prev.restaurants.map((restaurant) => ({
        ...restaurant,
        cuisines: (restaurant.cuisines || []).filter((existingCuisine) => existingCuisine !== cuisine),
      })),
    }));
  }

  function addArea() {
    const value = newArea.trim();
    if (!value || data.areas.includes(value)) return;
    setData((prev) => ({ ...prev, areas: [...prev.areas, value].sort() }));
    setNewArea("");
  }

  function addCity() {
    const value = newCity.trim();
    if (!value || cityOptions.some((city) => city.toLowerCase() === value.toLowerCase())) return;
    setData((prev) => ({ ...prev, cities: [...(prev.cities || []), value].sort() }));
    setNewCity("");
  }

  function renameArea(area) {
    const nextArea = window.prompt("Rename area", area)?.trim();
    if (!nextArea || nextArea === area) return;

    const hasDuplicate = areaOptions.some((existingArea) => existingArea.toLowerCase() === nextArea.toLowerCase() && existingArea !== area);
    if (hasDuplicate) {
      window.alert("An area with that name already exists.");
      return;
    }

    setData((prev) => ({
      ...prev,
      areas: [...new Set(prev.areas.map((existingArea) => (existingArea === area ? nextArea : existingArea)).concat(nextArea))].sort(),
      restaurants: prev.restaurants.map((restaurant) => (
        restaurant.area === area ? { ...restaurant, area: nextArea } : restaurant
      )),
      branches: prev.branches.map((branch) => (
        branch.area === area ? { ...branch, area: nextArea } : branch
      )),
    }));
  }

  function deleteArea(area) {
    const linkedRestaurants = data.restaurants.filter((restaurant) => restaurant.area === area);
    const linkedBranches = data.branches.filter((branch) => branch.area === area);
    const confirmed = window.confirm(
      linkedRestaurants.length > 0 || linkedBranches.length > 0
        ? `Delete area "${area}"? It will be removed from ${linkedRestaurants.length} restaurant(s) and ${linkedBranches.length} branch(es).`
        : `Delete area "${area}"?`,
    );
    if (!confirmed) return;

    setData((prev) => ({
      ...prev,
      areas: prev.areas.filter((existingArea) => existingArea !== area),
      restaurants: prev.restaurants.map((restaurant) => (
        restaurant.area === area ? { ...restaurant, area: "" } : restaurant
      )),
      branches: prev.branches.map((branch) => (
        branch.area === area ? { ...branch, area: "" } : branch
      )),
    }));
  }

  function renameCity(city) {
    const nextCity = window.prompt("Rename city", city)?.trim();
    if (!nextCity || nextCity === city) return;

    const hasDuplicate = cityOptions.some((existingCity) => existingCity.toLowerCase() === nextCity.toLowerCase() && existingCity !== city);
    if (hasDuplicate) {
      window.alert("A city with that name already exists.");
      return;
    }

    setData((prev) => ({
      ...prev,
      cities: [...new Set((prev.cities || []).map((existingCity) => (existingCity === city ? nextCity : existingCity)).concat(nextCity))].sort(),
      restaurants: prev.restaurants.map((restaurant) => (
        restaurant.city === city ? { ...restaurant, city: nextCity } : restaurant
      )),
    }));
  }

  function deleteCity(city) {
    const linkedRestaurants = data.restaurants.filter((restaurant) => restaurant.city === city);
    const confirmed = window.confirm(
      linkedRestaurants.length > 0
        ? `Delete city "${city}"? It will be removed from ${linkedRestaurants.length} restaurant(s).`
        : `Delete city "${city}"?`,
    );
    if (!confirmed) return;

    setData((prev) => ({
      ...prev,
      cities: (prev.cities || []).filter((existingCity) => existingCity !== city),
      restaurants: prev.restaurants.map((restaurant) => (
        restaurant.city === city ? { ...restaurant, city: "" } : restaurant
      )),
    }));
  }

  function setTagColor(tag, colorValue) {
    setData((prev) => ({
      ...prev,
      tagColors: {
        ...(prev.tagColors || {}),
        [tag]: colorValue,
      },
    }));
  }

  function renameTag(tag) {
    const nextTag = window.prompt("Rename tag", tag)?.trim();
    if (!nextTag || nextTag === tag) return;

    const hasDuplicate = allDishTags.some((existingTag) => existingTag.toLowerCase() === nextTag.toLowerCase() && existingTag !== tag);
    if (hasDuplicate) {
      window.alert("A tag with that name already exists.");
      return;
    }

    setData((prev) => {
      const nextTagColors = { ...(prev.tagColors || {}) };
      if (Object.prototype.hasOwnProperty.call(nextTagColors, tag)) {
        nextTagColors[nextTag] = nextTagColors[tag];
        delete nextTagColors[tag];
      }

      return {
        ...prev,
        dishes: prev.dishes.map((dish) => ({
          ...dish,
          tags: (dish.tags || []).map((existingTag) => (existingTag === tag ? nextTag : existingTag)),
        })),
        tagColors: nextTagColors,
      };
    });
  }

  function confirmDelete(message) {
    return window.confirm(message);
  }

  function deleteRestaurant(id) {
    const restaurant = data.restaurants.find((r) => r.id === id);
    if (!confirmDelete(`Delete restaurant "${restaurant?.name || "this restaurant"}"? This will also remove its branches, dishes, and experiences.`)) return;
    const dishIds = data.dishes.filter((d) => d.restaurantId === id).map((d) => d.id);
    setData((prev) => ({
      ...prev,
      restaurants: prev.restaurants.filter((r) => r.id !== id),
      branches: prev.branches.filter((b) => b.restaurantId !== id),
      dishes: prev.dishes.filter((d) => d.restaurantId !== id),
      experiences: prev.experiences.filter((e) => !dishIds.includes(e.dishId)),
    }));
  }

  function deleteDish(id) {
    const dish = data.dishes.find((d) => d.id === id);
    if (!confirmDelete(`Delete dish "${dish?.name || "this dish"}"? This will also remove its experiences.`)) return;
    setData((prev) => ({ ...prev, dishes: prev.dishes.filter((d) => d.id !== id), experiences: prev.experiences.filter((e) => e.dishId !== id) }));
  }

  function deleteBranch(id) {
    const branch = data.branches.find((b) => b.id === id);
    if (!confirmDelete(`Delete branch "${branch?.name || "this branch"}"? Dishes and experiences will keep their records but lose this branch link.`)) return;
    setData((prev) => ({
      ...prev,
      branches: prev.branches.filter((b) => b.id !== id),
      dishes: prev.dishes.map((d) => (d.branchId === id ? { ...d, branchId: null } : d)),
      experiences: prev.experiences.map((e) => (e.branchId === id ? { ...e, branchId: null } : e)),
    }));
  }

  function deleteExperience(id) {
    if (!confirmDelete("Delete this experience?")) return;
    setData((prev) => ({ ...prev, experiences: prev.experiences.filter((e) => e.id !== id) }));
  }

  function editRestaurant(r) { setRestaurantForm({ ...emptyRestaurantForm, ...r, cuisineInput: "", rating: r.rating ?? "" }); setRestaurantOpen(true); }
  function editBranch(b) { setBranchFormError(""); setBranchForm({ ...emptyBranchForm, ...b }); setBranchOpen(true); }
  function editDish(d) {
    setDishForm({ ...emptyDishForm, ...d, branchId: d.branchId || "none", price: d.price ?? "", recommendationInput: "", alertInput: "", tagInput: "" });
    setDuplicateDishSuggestion(null);
    setShowDishNameSuggestions(false);
    setExperienceFormError("");
    setExperienceRatingError("");
    setLogExperienceWithDish(false);
    setExperienceForm(emptyExperienceForm);
    setDishOpen(true);
  }
  function editExperience(e) { setExperienceFormError(""); setExperienceRatingError(""); setExperienceForm({ ...emptyExperienceForm, ...e, branchId: e.branchId || "none", rating: e.rating ?? "", price: e.price ?? "", valueForMoney: e.valueForMoney || "" }); setExperienceOpen(true); }

  function prepareLogExperience(_restaurantId, dishId) {
    const dish = dishesById[dishId];
    setExperienceFormError("");
    setExperienceRatingError("");
    setExperienceForm({ ...emptyExperienceForm, restaurantId: dish?.restaurantId || "", dishId, branchId: "none", price: dish?.price ?? "" });
    setExperienceOpen(true);
    setTab("dishes");
  }

  function openNewExperienceDialog() {
    resetExperienceForm();
    setExperienceOpen(true);
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

  const selectedExperienceDish = dishesById[experienceForm.dishId];
  const effectiveExperienceRestaurantId = showInlineRestaurantForExperience
    ? ""
    : selectedExperienceDish?.restaurantId || experienceForm.restaurantId;
  const dishOptionsForExperience = data.dishes.filter((d) => !effectiveExperienceRestaurantId || d.restaurantId === effectiveExperienceRestaurantId);
  const effectiveDishRestaurantId = showInlineRestaurantForDish ? "" : dishForm.restaurantId;
  const branchOptionsForDish = data.branches.filter((b) => b.restaurantId === effectiveDishRestaurantId);
  const branchOptionsForDishExperience = data.branches.filter((b) => b.restaurantId === effectiveDishRestaurantId);
  const branchOptionsForExperience = data.branches.filter((b) => b.restaurantId === effectiveExperienceRestaurantId);

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

  useEffect(() => {
    if (showInlineRestaurantForExperience) return;
    if (!experienceForm.restaurantId || !experienceForm.dishId) return;

    const selectedDish = dishesById[experienceForm.dishId];
    if (!selectedDish) return;

    if (selectedDish.restaurantId !== experienceForm.restaurantId) {
      setExperienceForm((prev) => ({ ...prev, dishId: "", branchId: "none" }));
      setExperienceFormError("The selected dish does not belong to this restaurant. Please select a matching dish.");
    }
  }, [dishesById, experienceForm.dishId, experienceForm.restaurantId, showInlineRestaurantForExperience]);

  useEffect(() => {
    if (showInlineRestaurantForExperience) return;
    if (!experienceForm.restaurantId || experienceForm.dishId) return;

    const restaurantDishes = data.dishes.filter((dish) => dish.restaurantId === experienceForm.restaurantId);
    if (restaurantDishes.length === 1) {
      setExperienceForm((prev) => ({ ...prev, dishId: restaurantDishes[0].id }));
      setExperienceFormError("");
    }
  }, [data.dishes, experienceForm.dishId, experienceForm.restaurantId, showInlineRestaurantForExperience]);

  useEffect(() => {
    const selectedDish = dishesById[experienceForm.dishId];
    const previousDish = dishesById[previousExperienceDishIdRef.current];
    const previousDishPrice = previousDish?.price ?? "";

    if (selectedDish && (experienceForm.price === "" || experienceForm.price === previousDishPrice)) {
      setExperienceForm((prev) => ({ ...prev, price: selectedDish.price ?? "" }));
    }

    previousExperienceDishIdRef.current = experienceForm.dishId;
  }, [dishesById, experienceForm.dishId, experienceForm.price]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl p-4 md:p-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3">
                <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
                  {APP_VERSION}
                </span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Dish Tracker</h1>
              <p className="mt-1 text-sm text-slate-600">Track restaurants, dishes, branches, and every tasting experience.</p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-3 py-1 font-semibold text-slate-700">
                  {userEmail}
                </span>
                <span className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 font-semibold text-sky-800">
                  {cloudStatus}
                </span>
              </div>
            </div>
            <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 lg:flex lg:w-auto lg:flex-wrap lg:justify-end">
              <Button variant="outline" className={`order-6 w-full justify-center sm:w-auto ${TOP_ACTION_BUTTON_STYLES.auth}`} onClick={onLogout}><LogOut className="mr-2 h-4 w-4" /> Sign Out</Button>
              <Button variant="outline" className={`order-5 w-full justify-center sm:w-auto ${TOP_ACTION_BUTTON_STYLES.export}`} onClick={() => exportData(data)}><Download className="mr-2 h-4 w-4" /> Export JSON</Button>
              <Button variant="outline" className={`order-4 w-full justify-center sm:w-auto ${TOP_ACTION_BUTTON_STYLES.import}`} onClick={() => importRef.current?.click()}><Upload className="mr-2 h-4 w-4" /> Import JSON</Button>
              <input ref={importRef} type="file" accept="application/json" className="hidden" onChange={importJson} />


              <Dialog open={restaurantOpen} onOpenChange={(open) => { setRestaurantOpen(open); if (!open) resetRestaurantForm(); }}>
                <DialogTrigger asChild><Button variant="outline" className={`order-2 w-full justify-center sm:w-auto ${TOP_ACTION_BUTTON_STYLES.addRestaurant}`}><Plus className="mr-2 h-4 w-4" /> Add Restaurant</Button></DialogTrigger>
                <DialogContent showCloseButton={false} className="max-h-[90vh] overflow-auto sm:max-w-2xl">
                  <ModalHeader title={restaurantForm.id ? "Edit Restaurant" : "Add Restaurant"} onClose={() => { setRestaurantOpen(false); resetRestaurantForm(); }} />
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="md:col-span-2"><Field label="Name"><Input value={restaurantForm.name} onChange={(e) => setRestaurantForm({ ...restaurantForm, name: e.target.value })} /></Field></div>
                    <Field label="City"><Input list="restaurant-city-options" value={restaurantForm.city} onChange={(e) => setRestaurantForm({ ...restaurantForm, city: e.target.value })} placeholder="Select or type a city" /></Field>
                    <Field label="Area"><Input list="restaurant-area-options" value={restaurantForm.area} onChange={(e) => setRestaurantForm({ ...restaurantForm, area: e.target.value })} placeholder="Select or type an area" /></Field>
                    <Field label="Full address"><Input value={restaurantForm.fullAddress} onChange={(e) => setRestaurantForm({ ...restaurantForm, fullAddress: e.target.value })} /></Field>
                    <Field label="Google Maps link"><Input value={restaurantForm.mapsLink} onChange={(e) => setRestaurantForm({ ...restaurantForm, mapsLink: e.target.value })} /></Field>
                    <div className="md:col-span-2">
                      <TagInput
                        label="Cuisines"
                        color="blue"
                        values={restaurantForm.cuisines}
                        setValues={(vals) => setRestaurantForm((prev) => ({ ...prev, cuisines: vals }))}
                        inputValue={restaurantForm.cuisineInput}
                        setInputValue={(v) => setRestaurantForm((prev) => ({ ...prev, cuisineInput: v }))}
                        suggestions={data.cuisines}
                      />
                    </div>
                    <Field label="Restaurant rating (1-5)"><Input type="number" min="1" max="5" value={restaurantForm.rating} onChange={(e) => setRestaurantForm({ ...restaurantForm, rating: e.target.value })} /></Field>
                    <Field label="Recommended by"><Input value={restaurantForm.recommendedBy} onChange={(e) => setRestaurantForm({ ...restaurantForm, recommendedBy: e.target.value })} /></Field>
                    <div className="flex items-center gap-3 pt-8"><Checkbox checked={restaurantForm.halalChecked} onCheckedChange={(checked) => setRestaurantForm({ ...restaurantForm, halalChecked: !!checked })} /><Label>Halal checked</Label></div>
                    <div className="flex items-center gap-3 pt-8"><Checkbox checked={restaurantForm.kidsFriendly} onCheckedChange={(checked) => setRestaurantForm({ ...restaurantForm, kidsFriendly: !!checked })} /><Label>Kids friendly</Label></div>
                    <div className="md:col-span-2"><Field label="Notes"><Textarea value={restaurantForm.notes} onChange={(e) => setRestaurantForm({ ...restaurantForm, notes: e.target.value })} rows={4} /></Field></div>
                  </div>
                  <ModalActions
                    onCancel={() => { setRestaurantOpen(false); resetRestaurantForm(); }}
                    onSave={saveRestaurant}
                    saveLabel={restaurantForm.id ? "Save Changes" : "Save Restaurant"}
                    cancelLabel={restaurantForm.id ? "Discard" : "Cancel"}
                  />
                </DialogContent>
              </Dialog>

              <Dialog open={dishOpen} onOpenChange={(open) => { setDishOpen(open); if (!open) resetDishForm(); }}>
                <DialogTrigger asChild><Button className={`order-1 w-full justify-center sm:w-auto ${TOP_ACTION_BUTTON_STYLES.addDish}`}><Plus className="mr-2 h-4 w-4" /> Add Dish</Button></DialogTrigger>
                <DialogContent showCloseButton={false} className="max-h-[90vh] overflow-auto sm:max-w-3xl">
                  <ModalHeader title={dishForm.id ? "Edit Dish" : "Add Dish"} onClose={() => { setDishOpen(false); resetDishForm(); }} />
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
                          <Input list="restaurant-city-options" placeholder="Select or type a city" value={inlineRestaurantForDish.city} onChange={(e) => setInlineRestaurantForDish({ ...inlineRestaurantForDish, city: e.target.value })} />
                          <Input placeholder="Full address" value={inlineRestaurantForDish.fullAddress} onChange={(e) => setInlineRestaurantForDish({ ...inlineRestaurantForDish, fullAddress: e.target.value })} />
                          <Input placeholder="Google Maps link" value={inlineRestaurantForDish.mapsLink} onChange={(e) => setInlineRestaurantForDish({ ...inlineRestaurantForDish, mapsLink: e.target.value })} />
                          <TagInput
                            label="Cuisines"
                            color="blue"
                            values={inlineRestaurantForDish.cuisines}
                            setValues={(vals) => setInlineRestaurantForDish((prev) => ({ ...prev, cuisines: vals }))}
                            inputValue={inlineRestaurantForDish.cuisineInput}
                            setInputValue={(v) => setInlineRestaurantForDish((prev) => ({ ...prev, cuisineInput: v }))}
                            suggestions={data.cuisines}
                          />
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
                    <Field label="Portion size">
                      <Select value={dishForm.portionSize || "__none"} onValueChange={(value) => setDishForm({ ...dishForm, portionSize: value === "__none" ? "" : value })}>
                        <SelectTrigger><SelectValue placeholder="Select portion size" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none">No portion size</SelectItem>
                          {PORTION_SIZES.map((size) => <SelectItem key={size} value={size}>{size}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="Dish price ($)"><Input type="number" value={dishForm.price} onChange={(e) => setDishForm({ ...dishForm, price: e.target.value })} /></Field>
                    <Field label="Recommended by"><Input value={dishForm.recommendedBy} onChange={(e) => setDishForm({ ...dishForm, recommendedBy: e.target.value })} /></Field>
                    <div className="md:col-span-2 rounded-2xl border bg-slate-50 p-4 space-y-4">
                      <div className="flex items-center gap-3"><Checkbox checked={dishForm.isWishlist} onCheckedChange={(checked) => setDishForm({ ...dishForm, isWishlist: !!checked })} /><Label>Wishlist item (not tried yet)</Label></div>
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
                          <div>
                            <Field label="Rating (1-5) *"><Input type="number" min="1" max="5" required value={experienceForm.rating} onChange={(e) => { setExperienceForm({ ...experienceForm, rating: e.target.value }); if (hasValidRating(e.target.value)) setExperienceRatingError(""); }} className={experienceRatingError ? "border-red-400 focus-visible:ring-red-400" : ""} /></Field>
                            {experienceRatingError ? <div className="mt-2 text-sm text-red-600">{experienceRatingError}</div> : null}
                          </div>
                          <Field label="Price ($)"><Input type="number" value={experienceForm.price} onChange={(e) => setExperienceForm({ ...experienceForm, price: e.target.value })} /></Field>
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
                      <TagInput label="Dish tags" color="slate" values={dishForm.tags} setValues={(vals) => setDishForm((prev) => ({ ...prev, tags: vals }))} inputValue={dishForm.tagInput} setInputValue={(v) => setDishForm((prev) => ({ ...prev, tagInput: v }))} suggestions={allDishTags} />
                    </div>
                    <div className="md:col-span-2">
                      <TagInput label="Recommendations" color="blue" values={dishForm.recommendations} setValues={(vals) => setDishForm((prev) => ({ ...prev, recommendations: vals }))} inputValue={dishForm.recommendationInput} setInputValue={(v) => setDishForm((prev) => ({ ...prev, recommendationInput: v }))} suggestions={allRecommendationTags} />
                    </div>
                    <div className="md:col-span-2">
                      <TagInput label="Alerts / warnings" color="red" values={dishForm.alerts} setValues={(vals) => setDishForm((prev) => ({ ...prev, alerts: vals }))} inputValue={dishForm.alertInput} setInputValue={(v) => setDishForm((prev) => ({ ...prev, alertInput: v }))} suggestions={allAlertTags} />
                    </div>
                    <div className="md:col-span-2"><Field label="Notes"><Textarea value={dishForm.notes} onChange={(e) => setDishForm({ ...dishForm, notes: e.target.value })} rows={4} /></Field></div>
                  </div>
                  <div className="mt-6 flex items-center justify-between gap-3">
                    <div>
                      {dishForm.id ? (
                        <Button type="button" variant="outline" className={DELETE_BUTTON_STYLE} onClick={() => { deleteDish(dishForm.id); setDishOpen(false); resetDishForm(); }}>
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </Button>
                      ) : null}
                    </div>
                    <div className="flex gap-3">
                      <Button type="button" variant="outline" className={CANCEL_BUTTON_STYLE} onClick={() => { setDishOpen(false); resetDishForm(); }}>
                        {dishForm.id ? "Discard" : "Cancel"}
                      </Button>
                      <Button type="button" className={SAVE_BUTTON_STYLE} onClick={saveDish}>
                        {dishForm.id ? "Save Changes" : "Save Dish"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={experienceOpen} onOpenChange={(open) => { setExperienceOpen(open); if (!open) resetExperienceForm(); }}>
                <Button type="button" variant="outline" className={`order-3 w-full justify-center sm:w-auto ${TOP_ACTION_BUTTON_STYLES.addExperience}`} onClick={openNewExperienceDialog}><Plus className="mr-2 h-4 w-4" /> Add Experience</Button>
                <DialogContent showCloseButton={false} className="max-h-[90vh] overflow-auto sm:max-w-3xl">
                  <ModalHeader title={experienceForm.id ? "Edit Experience" : "Log Dish Experience"} onClose={() => { setExperienceOpen(false); resetExperienceForm(); }} />
                  {experienceFormError ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{experienceFormError}</div> : null}
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Restaurant">
                      {!showInlineRestaurantForExperience ? (
                        <>
                          <Select value={experienceForm.restaurantId || "__none"} onValueChange={(value) => { setExperienceForm({ ...experienceForm, restaurantId: value === "__none" ? "" : value, dishId: "", branchId: "none" }); setExperienceFormError(""); }}>
                            <SelectTrigger><SelectValue placeholder="Select restaurant" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__none">Select restaurant</SelectItem>
                              {data.restaurants.map((restaurant) => <SelectItem key={restaurant.id} value={restaurant.id}>{restaurant.name}</SelectItem>)}
                            </SelectContent>
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
                          <Input list="restaurant-city-options" placeholder="Select or type a city" value={inlineRestaurantForExperience.city} onChange={(e) => setInlineRestaurantForExperience({ ...inlineRestaurantForExperience, city: e.target.value })} />
                          <Input placeholder="Full address" value={inlineRestaurantForExperience.fullAddress} onChange={(e) => setInlineRestaurantForExperience({ ...inlineRestaurantForExperience, fullAddress: e.target.value })} />
                          <Input placeholder="Google Maps link" value={inlineRestaurantForExperience.mapsLink} onChange={(e) => setInlineRestaurantForExperience({ ...inlineRestaurantForExperience, mapsLink: e.target.value })} />
                          <TagInput
                            label="Cuisines"
                            color="blue"
                            values={inlineRestaurantForExperience.cuisines}
                            setValues={(vals) => setInlineRestaurantForExperience((prev) => ({ ...prev, cuisines: vals }))}
                            inputValue={inlineRestaurantForExperience.cuisineInput}
                            setInputValue={(v) => setInlineRestaurantForExperience((prev) => ({ ...prev, cuisineInput: v }))}
                            suggestions={data.cuisines}
                          />
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
                      <Select value={experienceForm.dishId || "__none"} onValueChange={(value) => { setExperienceForm((prev) => ({ ...prev, dishId: value === "__none" ? "" : value, restaurantId: prev.restaurantId || dishesById[value]?.restaurantId || "" })); setExperienceFormError(""); }} disabled={!showInlineRestaurantForExperience && !experienceForm.restaurantId}>
                        <SelectTrigger><SelectValue placeholder="Select dish" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none">Select dish</SelectItem>
                          {dishOptionsForExperience.map((dish) => <SelectItem key={dish.id} value={dish.id}>{dish.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      {!showInlineRestaurantForExperience && !!experienceForm.restaurantId && dishOptionsForExperience.length === 0 ? (
                        <div className="mt-2 text-sm text-amber-700">No dishes exist for this restaurant yet.</div>
                      ) : null}
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
                    <div>
                      <Field label="Rating (1-5) *"><Input type="number" min="1" max="5" required value={experienceForm.rating} onChange={(e) => { setExperienceForm({ ...experienceForm, rating: e.target.value }); if (hasValidRating(e.target.value)) setExperienceRatingError(""); }} className={experienceRatingError ? "border-red-400 focus-visible:ring-red-400" : ""} /></Field>
                      {experienceRatingError ? <div className="mt-2 text-sm text-red-600">{experienceRatingError}</div> : null}
                    </div>
                    <Field label="Price ($)"><Input type="number" value={experienceForm.price} onChange={(e) => setExperienceForm({ ...experienceForm, price: e.target.value })} /></Field>
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
                  <ModalActions
                    onCancel={() => { setExperienceOpen(false); resetExperienceForm(); }}
                    onSave={saveExperience}
                    saveLabel={experienceForm.id ? "Save Changes" : "Save Experience"}
                    cancelLabel={experienceForm.id ? "Discard" : "Cancel"}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </motion.div>

        <datalist id="restaurant-area-options">
          {areaOptions.map((area) => <option key={area} value={area} />)}
        </datalist>
        <datalist id="restaurant-city-options">
          {cityOptions.map((city) => <option key={city} value={city} />)}
        </datalist>

        <Tabs value={tab} onValueChange={setTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 gap-2 rounded-2xl bg-transparent p-0 md:grid-cols-5">
            <TabsTrigger value="dashboard" className={`rounded-2xl border font-bold shadow-sm transition-colors ${TOP_NAV_STYLES.dashboard}`}>Dashboard</TabsTrigger>
            <TabsTrigger value="restaurants" className={`rounded-2xl border font-bold shadow-sm transition-colors ${TOP_NAV_STYLES.restaurants}`}>Restaurants</TabsTrigger>
            <TabsTrigger value="dishes" className={`rounded-2xl border font-bold shadow-sm transition-colors ${TOP_NAV_STYLES.dishes}`}>Dishes</TabsTrigger>
            <TabsTrigger value="experiences" className={`rounded-2xl border font-bold shadow-sm transition-colors ${TOP_NAV_STYLES.experiences}`}>Experiences</TabsTrigger>
            <TabsTrigger value="settings" className={`rounded-2xl border font-bold shadow-sm transition-colors ${TOP_NAV_STYLES.settings}`}>Settings</TabsTrigger>
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
                <Card key={label} className={`rounded-3xl border shadow-sm ${DASHBOARD_CARD_STYLES[label] || "border-slate-200 bg-white"}`}><CardContent className="flex items-center justify-between p-5"><div><div className="text-sm font-bold text-slate-600">{label}</div><div className="mt-1 text-2xl font-bold">{value}</div></div><div className="text-slate-500">{icon}</div></CardContent></Card>
              ))}
            </div>

            <div className={`${SECTION_CONTAINER} grid gap-6 xl:grid-cols-2`}>
              <Card className="rounded-3xl border-0 shadow-sm">
                <CardHeader><CardTitle className="font-bold">Recent Experiences</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {recentExperiences.length === 0 ? <div className="text-sm text-slate-500">No experiences yet.</div> : recentExperiences.map((experience) => {
                    const dish = dishesById[experience.dishId];
                    const restaurant = dish ? restaurantsById[dish.restaurantId] : null;
                    const branch = experience.branchId ? branchesById[experience.branchId] : null;
                    return (
                      <div key={experience.id} className="rounded-2xl border p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="font-semibold">{dish?.name || "Unknown dish"}</div>
                            <div className="text-sm text-slate-500">{restaurant?.name} • {experience.orderType} • {experience.date}</div>
                            {branch && <div className="mt-1 text-xs text-slate-500">Branch: {branch.name}</div>}
                          </div>
                          <div className="flex items-center gap-2">
                            <Stars value={experience.rating} />
                            <Button variant="outline" size="sm" className={EDIT_BUTTON_STYLE} onClick={() => editExperience(experience)}>
                              <Pencil className="mr-2 h-4 w-4" /> Edit
                            </Button>
                            <Button variant="outline" size="sm" className={DELETE_BUTTON_STYLE} onClick={() => deleteExperience(experience.id)}>
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </Button>
                          </div>
                        </div>
                        {((experience.price != null && experience.price !== "") || experience.valueForMoney || experience.notes || experience.images?.length > 0) && (
                          <div className="mt-3 text-sm text-slate-600">
                            {experience.price != null && experience.price !== "" ? (
                              <><span className="font-semibold text-slate-900">Price:</span> {`$${Number(experience.price).toFixed(1)}`}</>
                            ) : ""}
                            {experience.price != null && experience.price !== "" && experience.valueForMoney ? " • " : ""}
                            {experience.valueForMoney ? <><span className="font-semibold text-slate-900">Value:</span> {experience.valueForMoney}</> : ""}
                            {experience.notes ? <div className="mt-2">{experience.notes}</div> : null}
                            {experience.images?.length > 0 ? <div className="mt-2 text-xs text-slate-500">{experience.images.length} image(s)</div> : null}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <Card className="rounded-3xl border-0 shadow-sm">
                <CardHeader><CardTitle className="font-bold">Restaurants Overview</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {restaurantSummaries.length === 0 ? <div className="text-sm text-slate-500">No restaurants yet.</div> : restaurantSummaries.map(({ restaurant, dishesCount, experiencesCount, avgDishRating, avgDishPrice }) => (
                    <div key={restaurant.id} className="rounded-2xl border p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="font-semibold">{restaurant.name}</div>
                          <div className="text-sm text-slate-500">
                            {restaurant.area || "No area"}
                            {restaurant.city ? ` • ${restaurant.city}` : ""}
                            {restaurant.cuisines?.length ? ` • ${restaurant.cuisines.join(", ")}` : " • No cuisine"}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <span>Avg dish rating</span>
                          <Stars value={avgDishRating} />
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
                        <Badge variant="secondary">{dishesCount} dishes</Badge>
                        <Badge variant="secondary">{experiencesCount} experiences</Badge>
                        <Badge variant="outline">Restaurant score: {restaurant.rating ? Number(restaurant.rating).toFixed(1) : "—"}</Badge>
                        <Badge variant="outline">Avg dish price: {avgDishPrice ? `$${avgDishPrice.toFixed(1)}` : "—"}</Badge>
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
                    <ModalHeader title={branchForm.id ? "Edit Branch" : "Add Branch"} onClose={() => { setBranchOpen(false); resetBranchForm(); }} />
                    {branchFormError ? <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{branchFormError}</div> : null}
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Restaurant">
                        <Select value={branchForm.restaurantId || "__none"} onValueChange={(value) => { setBranchForm({ ...branchForm, restaurantId: value === "__none" ? "" : value }); setBranchFormError(""); }}>
                          <SelectTrigger><SelectValue placeholder="Select restaurant" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none">Select restaurant</SelectItem>
                            {data.restaurants.map((restaurant) => <SelectItem key={restaurant.id} value={restaurant.id}>{restaurant.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field label="Branch name"><Input value={branchForm.name} onChange={(e) => { setBranchForm({ ...branchForm, name: e.target.value }); setBranchFormError(""); }} /></Field>
                      <Field label="Area">
                        <Select value={branchForm.area || "__none"} onValueChange={(value) => { setBranchForm({ ...branchForm, area: value === "__none" ? "" : value }); setBranchFormError(""); }}>
                          <SelectTrigger><SelectValue placeholder="Select area" /></SelectTrigger>
                          <SelectContent><SelectItem value="__none">No area</SelectItem>{areaOptions.map((area) => <SelectItem key={area} value={area}>{area}</SelectItem>)}</SelectContent>
                        </Select>
                      </Field>
                      <Field label="Location text"><Input value={branchForm.locationText} onChange={(e) => { setBranchForm({ ...branchForm, locationText: e.target.value }); setBranchFormError(""); }} /></Field>
                      <Field label="Google Maps link"><Input value={branchForm.mapsLink} onChange={(e) => { setBranchForm({ ...branchForm, mapsLink: e.target.value }); setBranchFormError(""); }} /></Field>
                      <div className="md:col-span-2"><Field label="Notes"><Textarea value={branchForm.notes} onChange={(e) => { setBranchForm({ ...branchForm, notes: e.target.value }); setBranchFormError(""); }} rows={4} /></Field></div>
                    </div>
                    <ModalActions
                      onCancel={() => { setBranchOpen(false); resetBranchForm(); }}
                      onSave={saveBranch}
                      saveLabel={branchForm.id ? "Save Changes" : "Save Branch"}
                      cancelLabel={branchForm.id ? "Discard" : "Cancel"}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-5 shadow-sm">
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-slate-900">Restaurant Library</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Search and filter restaurants by name, branch, dish, area, city, or cuisine.
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-6">
                <div className="relative md:col-span-2"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input className="pl-9" placeholder="Search restaurants, branches, dishes..." value={restaurantSearch} onChange={(e) => setRestaurantSearch(e.target.value)} /></div>
                <Select value={restaurantCityFilter} onValueChange={setRestaurantCityFilter}><SelectTrigger><SelectValue placeholder="City" /></SelectTrigger><SelectContent><SelectItem value="all">All cities</SelectItem>{restaurantFilterCityOptions.map((city) => <SelectItem key={city} value={city}>{city}</SelectItem>)}</SelectContent></Select>
                <Select value={restaurantAreaFilter} onValueChange={setRestaurantAreaFilter}><SelectTrigger><SelectValue placeholder="Area" /></SelectTrigger><SelectContent><SelectItem value="all">All areas</SelectItem>{restaurantFilterAreaOptions.map((area) => <SelectItem key={area} value={area}>{area}</SelectItem>)}</SelectContent></Select>
                <Select value={restaurantCuisineFilter} onValueChange={setRestaurantCuisineFilter}><SelectTrigger><SelectValue placeholder="Cuisine" /></SelectTrigger><SelectContent><SelectItem value="all">All cuisines</SelectItem>{restaurantFilterCuisineOptions.map((cuisine) => <SelectItem key={cuisine} value={cuisine}>{cuisine}</SelectItem>)}</SelectContent></Select>
                <Select value={restaurantKidsFilter} onValueChange={setRestaurantKidsFilter}><SelectTrigger><SelectValue placeholder="Kids friendly" /></SelectTrigger><SelectContent><SelectItem value="all">All restaurants</SelectItem><SelectItem value="kids">Kids friendly only</SelectItem></SelectContent></Select>
              </div>
            </div>

            <div className={`${SECTION_CONTAINER} grid gap-5 lg:grid-cols-2`}>
              {filteredRestaurants.map((restaurant) => {
                const branches = data.branches.filter((b) => b.restaurantId === restaurant.id);
                const dishes = data.dishes.filter((d) => d.restaurantId === restaurant.id);
                const avgDishRating = average(dishes.map((d) => computedDishRating(d.id)));
                const avgDishPrice = average(dishes.map((dish) => dish.price));
                return (
                  <Card key={restaurant.id} className="rounded-3xl border-2 border-slate-200 bg-white shadow-sm">
                    <CardHeader className="px-6 pt-6 pb-4 flex flex-row items-start justify-between gap-4 space-y-0">
                      <div>
                        <CardTitle className="text-2xl font-bold tracking-tight">{restaurant.name}</CardTitle>
                        <div className="mt-3 flex flex-wrap gap-2.5 text-xs text-slate-600">
                          {restaurant.area && <Badge variant="secondary">{restaurant.area}</Badge>}
                          {restaurant.city && <Badge variant="secondary">{restaurant.city}</Badge>}
                          {(restaurant.cuisines || []).map((cuisine) => <Badge key={cuisine} variant="secondary">{cuisine}</Badge>)}
                          {restaurant.halalChecked && <Badge variant="outline">Halal checked</Badge>}
                          {restaurant.kidsFriendly && <Badge className="!border-blue-200 !bg-blue-100 !text-blue-700">Kids friendly</Badge>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className={EDIT_BUTTON_STYLE} onClick={() => editRestaurant(restaurant)}><Pencil className="mr-2 h-4 w-4" /> Edit</Button>
                        <Button variant="outline" size="sm" className={DELETE_BUTTON_STYLE} onClick={() => deleteRestaurant(restaurant.id)}><Trash2 className="mr-2 h-4 w-4" /> Delete</Button>
                      </div>
                    </CardHeader>
                    <CardContent className="px-6 pb-6 space-y-4 text-sm text-slate-600">
                      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
                        <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[0.8rem] font-semibold ${ratingPillClass(restaurant.rating ? Number(restaurant.rating) : null)}`}>
                          <span>Rest. Score:</span>
                          {restaurant.rating ? <><span>({Number(restaurant.rating).toFixed(1)})</span><Stars value={restaurant.rating} /></> : <span>—</span>}
                        </div>
                        <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[0.8rem] font-semibold ${ratingPillClass(avgDishRating)}`}>
                          <span>Avg dish rating:</span>
                          {avgDishRating ? <><span>({avgDishRating.toFixed(1)})</span><Stars value={avgDishRating} /></> : <span>—</span>}
                        </div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[0.8rem] font-semibold text-emerald-800">
                          <span>Avg dish price:</span>
                          <span>{avgDishPrice ? `$${avgDishPrice.toFixed(1)}` : "—"}</span>
                        </div>
                        {restaurant.fullAddress && <div><span className="font-medium text-slate-900">Full address:</span> {restaurant.fullAddress}</div>}
                        {restaurant.recommendedBy && <div><span className="font-medium text-slate-900">Recommended by:</span> {restaurant.recommendedBy}</div>}
                        {restaurant.mapsLink && <a href={restaurant.mapsLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-slate-900 underline"><MapPin className="h-5 w-5 text-red-500" /> Open Maps Link</a>}
                      </div>
                      {restaurant.notes && <div className="rounded-2xl border border-slate-200 bg-white p-4"><div className="mb-1 font-medium text-slate-900">Notes</div>{restaurant.notes}</div>}
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="mb-3 font-medium text-slate-900">Dishes</div>
                        {dishes.length === 0 ? (
                          <div className="text-sm text-slate-500">No dishes added yet.</div>
                        ) : (
                          <div className="space-y-2">
                            {dishes.map((dish) => {
                              const dishAvgRating = computedDishRating(dish.id);
                              const tagSummary = summarizeTags(dish.tags);
                              return (
                                <div key={dish.id} className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-3">
                                  <div className="min-w-0">
                                    <div className="font-medium text-slate-900">{dish.name}</div>
                                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                                      {dish.isWishlist ? <Badge className="!border-amber-200 !bg-amber-100 !text-amber-800">Wishlist</Badge> : <Badge className="!border-emerald-200 !bg-emerald-100 !text-emerald-800">Tried</Badge>}
                                      {dish.portionSize && dish.portionSize !== "Adult" ? <Badge variant="outline">{dish.portionSize}</Badge> : null}
                                      {tagSummary.visible.map((tag) => <Badge key={tag} variant="outline">{tag}</Badge>)}
                                      {tagSummary.hiddenCount > 0 ? <Badge variant="outline">+{tagSummary.hiddenCount} more</Badge> : null}
                                    </div>
                                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-600">
                                      <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[0.8rem] font-semibold ${ratingPillClass(dishAvgRating)}`}>
                                        <span>Rating:</span>
                                        {dishAvgRating ? <><span>({dishAvgRating.toFixed(1)})</span><Stars value={dishAvgRating} /></> : <span>—</span>}
                                      </div>
                                      <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[0.8rem] font-semibold text-emerald-800">
                                        <span>Price:</span>
                                        <span>{dish.price != null ? `$${Number(dish.price).toFixed(1)}` : "—"}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex shrink-0 items-center gap-2">
                                    <Button variant="outline" size="sm" className={VIEW_BUTTON_STYLE} onClick={() => editDish(dish)} aria-label={`View ${dish.name}`}>
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button variant="outline" size="sm" className={LOG_BUTTON_STYLE} onClick={() => prepareLogExperience(dish.restaurantId, dish.id)} aria-label={`Log experience for ${dish.name}`}>
                                      <NotebookText className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="mb-3 font-medium text-slate-900">Branches</div>
                        {branches.length === 0 ? <div className="text-sm text-slate-500">No branches added.</div> : <div className="space-y-2">{branches.map((branch) => <div key={branch.id} className="flex items-start justify-between rounded-2xl border border-slate-200 bg-white p-3"><div><div className="font-medium text-slate-900">{branch.name}</div><div>{branch.area || branch.locationText || "No location"}</div></div><div className="flex items-center gap-2"><Button variant="outline" size="sm" className={EDIT_BUTTON_STYLE} onClick={() => editBranch(branch)}><Pencil className="mr-2 h-4 w-4" /> Edit</Button><Button variant="outline" size="sm" className={DELETE_BUTTON_STYLE} onClick={() => deleteBranch(branch.id)}><Trash2 className="mr-2 h-4 w-4" /> Delete</Button></div></div>)}</div>}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              {filteredRestaurants.length === 0 && (
                <Card className="rounded-3xl border-2 border-dashed border-slate-300 bg-white shadow-sm lg:col-span-2">
                  <CardContent className="p-6 text-sm text-slate-500">No restaurants match the current filters.</CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="dishes" className="space-y-6">
            <Card className="rounded-3xl border border-amber-200 bg-amber-50/60 shadow-sm">
              <CardHeader className="px-6 pt-6">
                <CardTitle className="text-2xl font-bold tracking-tight text-amber-950">Dish Comparison Across Restaurants</CardTitle>
                <div className="text-sm text-slate-600">
                  Compare one dish across every restaurant you have logged so you can decide where you liked it most.
                </div>
              </CardHeader>
              <CardContent className="px-6 pb-6 space-y-5">
                <div className="space-y-3 rounded-2xl border border-amber-200 bg-white/70 p-4">
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

                {activeDishComparison ? (
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="text-xl font-bold tracking-tight text-slate-900">{activeDishComparison.label}</div>
                      <div className="mt-1 text-sm text-slate-600">
                        {activeDishComparisonRows.length} restaurant{activeDishComparisonRows.length === 1 ? "" : "s"} tracked for this dish.
                      </div>
                    </div>

                    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
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
                                  {restaurant?.cuisines?.length ? ` • ${restaurant.cuisines.join(", ")}` : ""}
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
                ) : null}
              </CardContent>
            </Card>

            <div className="border-t border-slate-200" />

            <div className="rounded-3xl bg-white p-5 shadow-sm">
              <div className="mb-4">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">Dish Library</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Browse, filter, and manage all saved dishes across restaurants.
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-6">
                <div className="relative md:col-span-2"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input className="pl-9" placeholder="Search dishes, tags, restaurants..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
                <Select value={restaurantFilter} onValueChange={setRestaurantFilter}><SelectTrigger><SelectValue placeholder="Restaurant" /></SelectTrigger><SelectContent><SelectItem value="all">All restaurants</SelectItem>{dishFilterRestaurantOptions.map((restaurantName) => <SelectItem key={restaurantName} value={restaurantName}>{restaurantName}</SelectItem>)}</SelectContent></Select>
                <Select value={areaFilter} onValueChange={setAreaFilter}><SelectTrigger><SelectValue placeholder="Area" /></SelectTrigger><SelectContent><SelectItem value="all">All areas</SelectItem>{dishFilterAreaOptions.map((area) => <SelectItem key={area} value={area}>{area}</SelectItem>)}</SelectContent></Select>
                <Select value={cuisineFilter} onValueChange={setCuisineFilter}><SelectTrigger><SelectValue placeholder="Cuisine" /></SelectTrigger><SelectContent><SelectItem value="all">All cuisines</SelectItem>{dishFilterCuisineOptions.map((cuisine) => <SelectItem key={cuisine} value={cuisine}>{cuisine}</SelectItem>)}</SelectContent></Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="all">All statuses</SelectItem>{dishStatusOptions.map((status) => <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>)}</SelectContent></Select>
              </div>
            </div>

            <div className={`${SECTION_CONTAINER} grid gap-5 lg:grid-cols-2 xl:grid-cols-3`}>
              {filteredDishes.map((dish) => {
                const restaurant = restaurantsById[dish.restaurantId];
                const branch = dish.branchId ? branchesById[dish.branchId] : null;
                const experiences = dishExperienceMap[dish.id] || [];
                const avgRating = computedDishRating(dish.id);
                return (
                  <Card key={dish.id} className="rounded-3xl border-2 border-slate-200 bg-white shadow-sm">
                    <CardHeader className="px-6 pt-6 space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <CardTitle className="text-2xl font-bold tracking-tight">{dish.name}</CardTitle>
                          <div className="mt-1 text-sm text-slate-500">{restaurant?.name || "Unknown restaurant"}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" className={EDIT_BUTTON_STYLE} onClick={() => editDish(dish)}><Pencil className="mr-2 h-4 w-4" /> Edit</Button>
                          <Button variant="outline" size="sm" className={DELETE_BUTTON_STYLE} onClick={() => deleteDish(dish.id)}><Trash2 className="mr-2 h-4 w-4" /> Delete</Button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {dish.isWishlist ? <Badge className="!border-amber-200 !bg-amber-100 !text-amber-800">Wishlist</Badge> : <Badge className="!border-emerald-200 !bg-emerald-100 !text-emerald-800">Tried</Badge>}
                        {restaurant?.area && <Badge variant="secondary">{restaurant.area}</Badge>}
                        {(restaurant?.cuisines || []).map((cuisine) => <Badge key={cuisine} variant="secondary">{cuisine}</Badge>)}
                        {branch && <Badge variant="secondary">Branch: {branch.name}</Badge>}
                        {dish.portionSize && dish.portionSize !== "Adult" && <Badge variant="outline">{dish.portionSize}</Badge>}
                        {(dish.tags || []).map((tag) => <Badge key={tag} variant="outline" style={tagChipStyle(data.tagColors?.[tag])}>{tag}</Badge>)}
                      </div>
                    </CardHeader>
                    <CardContent className="px-6 pb-6 space-y-4 text-sm text-slate-600">
                      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[0.8rem] font-semibold ${ratingPillClass(avgRating)}`}>
                          <span>Dish rating:</span>
                          {avgRating ? <><span>({avgRating.toFixed(1)})</span><Stars value={avgRating} /></> : <span>—</span>}
                        </div>
                        {dish.recommendedBy ? <div><span className="font-medium text-slate-900">Recommended by:</span> {dish.recommendedBy}</div> : null}
                      </div>
                      {dish.recommendations?.length ? <div className="rounded-2xl border border-slate-200 bg-white p-4"><div><span className="font-medium text-slate-900">Recommendations:</span><div className="mt-2 flex flex-wrap gap-2">{dish.recommendations.map((item) => <Badge key={item} className="!border-blue-200 !bg-blue-100 !text-blue-700">{item}</Badge>)}</div></div></div> : null}
                      {dish.alerts?.length ? <div className="rounded-2xl border border-slate-200 bg-white p-4"><div><span className="font-medium text-slate-900">Alerts:</span><div className="mt-2 flex flex-wrap gap-2">{dish.alerts.map((item) => <Badge key={item} className="!border-red-200 !bg-red-100 !text-red-700">{item}</Badge>)}</div></div></div> : null}
                      {dish.notes ? <div className="rounded-2xl border border-slate-200 bg-white p-4"><div className="mb-1 font-medium text-slate-900">Notes</div>{dish.notes}</div> : null}
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="font-medium text-slate-900">Experience count: {experiences.length}</div>
                        {experiences.length > 0 && <div className="mt-1 text-xs text-slate-500">Latest: {[...experiences].sort((a, b) => new Date(b.date) - new Date(a.date))[0].date}</div>}
                      </div>
                      <Button variant="outline" className={`w-full ${LOG_EXPERIENCE_BUTTON_STYLE}`} onClick={() => prepareLogExperience(dish.restaurantId, dish.id)}>Log another experience</Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="experiences" className="space-y-4">
            <div className={`${SECTION_CONTAINER} space-y-3`}>
              <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white">
                <table className="min-w-full text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50 text-center text-sm font-semibold uppercase tracking-wide text-slate-600">
                    <tr>
                      <th className="px-5 py-3">Dish</th>
                      <th className="px-5 py-3">Restaurant</th>
                      <th className="px-5 py-3">Price</th>
                      <th className="px-5 py-3">Value</th>
                      <th className="px-5 py-3">Rating</th>
                      <th className="px-5 py-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                  {[...data.experiences].sort((a, b) => new Date(b.date) - new Date(a.date)).map((experience) => {
                    const dish = dishesById[experience.dishId];
                    const restaurant = dish ? restaurantsById[dish.restaurantId] : null;
                    const branch = experience.branchId ? branchesById[experience.branchId] : null;
                    return (
                      <tr key={experience.id} className="align-top odd:bg-white even:bg-slate-50/70">
                        <td className="px-5 py-4">
                          <div className="min-w-0 space-y-2">
                            <div>
                              <div className="text-lg font-semibold text-slate-900">{dish?.name || "Unknown dish"}</div>
                              <div className="text-sm text-slate-500">{experience.date}</div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="secondary">{experience.orderType}</Badge>
                              {branch && <Badge variant="secondary">{branch.name}</Badge>}
                            </div>
                            {(experience.notes || experience.images?.length > 0) && (
                              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                                {experience.notes ? <div className="text-sm text-slate-700">{experience.notes}</div> : null}
                                {experience.images?.length > 0 && (
                                  <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
                                    {experience.images.map((img) => <div key={img.id} className="overflow-hidden rounded-2xl border bg-white"><img src={img.dataUrl} alt={img.name} className="h-24 w-full object-cover" /></div>)}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-slate-700">
                          <div className="font-medium text-slate-900">{restaurant?.name || "Unknown restaurant"}</div>
                          {restaurant?.area || restaurant?.cuisines?.length ? (
                            <div className="mt-1 text-sm text-slate-500">
                              {restaurant?.area || "No area"}
                              {restaurant?.cuisines?.length ? ` • ${restaurant.cuisines.join(", ")}` : ""}
                            </div>
                          ) : null}
                        </td>
                        <td className="px-5 py-4 text-center text-slate-700">
                          {experience.price != null ? <span className="font-semibold text-slate-900">{`$${Number(experience.price).toFixed(1)}`}</span> : "—"}
                        </td>
                        <td className="px-5 py-4 text-center text-slate-700">
                          <div className={`inline-flex items-center rounded-full border px-3 py-1 text-[0.8rem] font-semibold ${valuePillClass(experience.valueForMoney)}`}>
                            {experience.valueForMoney || "—"}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[0.8rem] font-semibold ${ratingPillClass(experience.rating)}`}>
                            {experience.rating != null ? <span>({Number(experience.rating).toFixed(1)})</span> : <span>—</span>}
                            <Stars value={experience.rating} />
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="outline" size="sm" className={EDIT_BUTTON_STYLE} onClick={() => editExperience(experience)}><Pencil className="mr-2 h-4 w-4" /> Edit</Button>
                            <Button variant="outline" size="sm" className={DELETE_BUTTON_STYLE} onClick={() => deleteExperience(experience.id)}><Trash2 className="mr-2 h-4 w-4" /> Delete</Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  </tbody>
                </table>
              </div>
              {data.experiences.length === 0 && <Card className="rounded-3xl border-0 shadow-sm"><CardContent className="p-6 text-sm text-slate-500">No experiences logged yet.</CardContent></Card>}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className={SECTION_CONTAINER}>
              <Card className="rounded-3xl border-0 shadow-sm">
                <CardHeader><CardTitle className="font-bold">Dish Tags</CardTitle></CardHeader>
                <CardContent>
                  {allDishTags.length === 0 ? (
                    <div className="text-sm text-slate-500">No dish tags yet.</div>
                  ) : (
                    <div className="flex flex-wrap gap-3">
                      {allDishTags.map((tag) => {
                        const taggedDishes = data.dishes.filter((dish) => (dish.tags || []).includes(tag));
                        const isExpanded = expandedTag === tag;

                        return (
                        <div key={tag} className={`rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 ${isExpanded ? "min-w-[18rem]" : ""}`}>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              className="flex items-center gap-3 text-left"
                              onClick={() => setExpandedTag(isExpanded ? null : tag)}
                              aria-expanded={isExpanded}
                            >
                              <Badge variant="outline" style={tagChipStyle(data.tagColors?.[tag])}>{tag}</Badge>
                              <span className="text-sm text-slate-500">{taggedDishes.length} dish(es)</span>
                              {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                            </button>
                            <div className="ml-auto flex items-center gap-2">
                            <button
                              type="button"
                              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                              onClick={() => renameTag(tag)}
                              aria-label={`Rename ${tag}`}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <Input
                              type="color"
                              value={data.tagColors?.[tag] || "#64748b"}
                              onChange={(e) => setTagColor(tag, e.target.value)}
                              className="h-8 w-10 cursor-pointer rounded-lg border border-slate-200 bg-white p-1"
                            />
                          </div>
                        </div>
                          {isExpanded ? (
                            <div className="mt-3 space-y-2 border-t border-slate-200 pt-3">
                              {taggedDishes.map((dish) => (
                                <div key={dish.id} className="rounded-xl bg-white px-3 py-2 text-sm text-slate-600">
                                  <div className="font-medium text-slate-900">{dish.name}</div>
                                  <div>{restaurantsById[dish.restaurantId]?.name || "Unknown restaurant"}</div>
                                </div>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      )})}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className={SECTION_CONTAINER}>
              <Card className="rounded-3xl border-0 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="font-bold">Cuisines</CardTitle><Dialog open={cuisineOpen} onOpenChange={setCuisineOpen}><DialogTrigger asChild><Button variant="outline"><Plus className="mr-2 h-4 w-4" /> Add Cuisine</Button></DialogTrigger><DialogContent><ModalHeader title="Add Cuisine" onClose={() => setCuisineOpen(false)} /><div className="space-y-4"><Input value={newCuisine} onChange={(e) => setNewCuisine(e.target.value)} placeholder="Enter cuisine name" /><ModalActions onCancel={() => setCuisineOpen(false)} onSave={addCuisine} saveLabel="Save" /></div></DialogContent></Dialog></CardHeader>
                <CardContent>
                  {data.cuisines.length === 0 ? (
                    <div className="text-sm text-slate-500">No cuisines yet.</div>
                  ) : (
                    <div className="flex flex-wrap gap-3">
                      {data.cuisines.map((cuisine) => {
                        const cuisineRestaurants = data.restaurants.filter((restaurant) => (restaurant.cuisines || []).includes(cuisine));
                        const isExpanded = expandedCuisine === cuisine;
                        return (
                          <div key={cuisine} className={`rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 ${isExpanded ? "min-w-[18rem]" : ""}`}>
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                className="flex items-center gap-3 text-left"
                                onClick={() => setExpandedCuisine(isExpanded ? null : cuisine)}
                                aria-expanded={isExpanded}
                              >
                                <Badge variant="secondary">{cuisine}</Badge>
                                <span className="text-sm text-slate-500">{cuisineRestaurants.length} restaurant(s)</span>
                                {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                              </button>
                              <div className="ml-auto flex items-center gap-2">
                                <button
                                  type="button"
                                  className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                                  onClick={() => renameCuisine(cuisine)}
                                  aria-label={`Rename ${cuisine}`}
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white p-2 text-slate-500 hover:bg-red-50 hover:text-red-700"
                                  onClick={() => deleteCuisine(cuisine)}
                                  aria-label={`Delete ${cuisine}`}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                            {isExpanded ? (
                              <div className="mt-3 space-y-2 border-t border-slate-200 pt-3">
                                {cuisineRestaurants.map((restaurant) => (
                                  <div key={restaurant.id} className="rounded-xl bg-white px-3 py-2 text-sm text-slate-600">
                                    <div className="font-medium text-slate-900">{restaurant.name}</div>
                                    <div>{restaurant.area || restaurant.fullAddress || "No location"}</div>
                                  </div>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className={SECTION_CONTAINER}>
              <Card className="rounded-3xl border-0 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="font-bold">Cities</CardTitle><Dialog open={cityOpen} onOpenChange={setCityOpen}><DialogTrigger asChild><Button variant="outline"><Plus className="mr-2 h-4 w-4" /> Add City</Button></DialogTrigger><DialogContent><ModalHeader title="Add City" onClose={() => setCityOpen(false)} /><div className="space-y-4"><Input value={newCity} onChange={(e) => setNewCity(e.target.value)} placeholder="Enter city name" /><ModalActions onCancel={() => setCityOpen(false)} onSave={addCity} saveLabel="Save" /></div></DialogContent></Dialog></CardHeader>
                <CardContent>
                  {cityOptions.length === 0 ? (
                    <div className="text-sm text-slate-500">No cities yet.</div>
                  ) : (
                    <div className="flex flex-wrap gap-3">
                      {cityOptions.map((city) => {
                        const cityRestaurants = data.restaurants.filter((restaurant) => restaurant.city === city);
                        const isExpanded = expandedCity === city;
                        return (
                          <div key={city} className={`rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 ${isExpanded ? "min-w-[18rem]" : ""}`}>
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                className="flex items-center gap-3 text-left"
                                onClick={() => setExpandedCity(isExpanded ? null : city)}
                                aria-expanded={isExpanded}
                              >
                                <Badge variant="secondary">{city}</Badge>
                                <span className="text-sm text-slate-500">{cityRestaurants.length} restaurant(s)</span>
                                {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                              </button>
                              <div className="ml-auto flex items-center gap-2">
                                <button
                                  type="button"
                                  className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                                  onClick={() => renameCity(city)}
                                  aria-label={`Rename ${city}`}
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white p-2 text-slate-500 hover:bg-red-50 hover:text-red-700"
                                  onClick={() => deleteCity(city)}
                                  aria-label={`Delete ${city}`}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                            {isExpanded ? (
                              <div className="mt-3 space-y-2 border-t border-slate-200 pt-3">
                                {cityRestaurants.map((restaurant) => (
                                  <div key={restaurant.id} className="rounded-xl bg-white px-3 py-2 text-sm text-slate-600">
                                    <div className="font-medium text-slate-900">{restaurant.name}</div>
                                    <div>{restaurant.area || restaurant.cuisines?.join(", ") || "No extra details"}</div>
                                  </div>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className={SECTION_CONTAINER}>
              <Card className="rounded-3xl border-0 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="font-bold">Areas</CardTitle><Dialog open={areaOpen} onOpenChange={setAreaOpen}><DialogTrigger asChild><Button variant="outline"><Plus className="mr-2 h-4 w-4" /> Add Area</Button></DialogTrigger><DialogContent><ModalHeader title="Add Area" onClose={() => setAreaOpen(false)} /><div className="space-y-4"><Input value={newArea} onChange={(e) => setNewArea(e.target.value)} placeholder="Enter area / city" /><ModalActions onCancel={() => setAreaOpen(false)} onSave={addArea} saveLabel="Save" /></div></DialogContent></Dialog></CardHeader>
                <CardContent>
                  {areaOptions.length === 0 ? (
                    <div className="text-sm text-slate-500">No areas yet.</div>
                  ) : (
                    <div className="flex flex-wrap gap-3">
                      {areaOptions.map((area) => {
                        const areaRestaurants = data.restaurants.filter((restaurant) => restaurant.area === area);
                        const isExpanded = expandedArea === area;
                        return (
                          <div key={area} className={`rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 ${isExpanded ? "min-w-[18rem]" : ""}`}>
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                className="flex items-center gap-3 text-left"
                                onClick={() => setExpandedArea(isExpanded ? null : area)}
                                aria-expanded={isExpanded}
                              >
                                <Badge variant="secondary">{area}</Badge>
                                <span className="text-sm text-slate-500">{areaRestaurants.length} restaurant(s)</span>
                                {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                              </button>
                              <div className="ml-auto flex items-center gap-2">
                                <button
                                  type="button"
                                  className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                                  onClick={() => renameArea(area)}
                                  aria-label={`Rename ${area}`}
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white p-2 text-slate-500 hover:bg-red-50 hover:text-red-700"
                                  onClick={() => deleteArea(area)}
                                  aria-label={`Delete ${area}`}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                            {isExpanded ? (
                              <div className="mt-3 space-y-2 border-t border-slate-200 pt-3">
                                {areaRestaurants.map((restaurant) => (
                                  <div key={restaurant.id} className="rounded-xl bg-white px-3 py-2 text-sm text-slate-600">
                                    <div className="font-medium text-slate-900">{restaurant.name}</div>
                                    <div>{restaurant.cuisines?.length ? restaurant.cuisines.join(", ") : restaurant.fullAddress || "No extra details"}</div>
                                  </div>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className={SECTION_CONTAINER}>
              <Card className="rounded-3xl border-0 shadow-sm">
                <CardHeader><CardTitle className="font-bold">Data Notes</CardTitle></CardHeader>
                <CardContent className="space-y-3 text-sm text-slate-600">
                  <div>Your data is saved to Firebase Cloud Firestore and synced per signed-in user.</div>
                  <div>Use <span className="font-medium text-slate-900">Export JSON</span> regularly to keep a portable backup file.</div>
                  <div>Images are stored inside your local browser data and JSON export, so large image libraries can make the file bigger.</div>
                  <div>The browser local copy is kept only as a migration and backup convenience, not as the primary source of truth.</div>
                  <div className="pt-2">
                    <Button type="button" variant="outline" className={TOP_ACTION_BUTTON_STYLES.import} onClick={seedSampleData}>
                      <Download className="mr-2 h-4 w-4" /> Load Seed Data
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function DishTrackerWebApp() {
  const [authUser, setAuthUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [data, setData] = useState(() => createSampleData());
  const [cloudReady, setCloudReady] = useState(false);
  const [cloudStatus, setCloudStatus] = useState("Waiting for sign-in");

  const lastRemoteDataRef = useRef(null);
  const saveTimeoutRef = useRef(null);

  useEffect(() => {
    if (!hasFirebaseConfig || !auth) return undefined;

    return onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
      setAuthReady(true);
      setAuthError("");
      setCloudReady(false);
      setCloudStatus(user ? "Loading cloud data..." : "Waiting for sign-in");
    });
  }, []);

  useEffect(() => {
    if (!authUser || !db) return undefined;

    const unsubscribe = onSnapshot(cloudDataDoc(authUser.uid), async (snapshot) => {
      if (snapshot.exists() && snapshot.data()?.data) {
        const remoteData = migrateData(snapshot.data().data);
        lastRemoteDataRef.current = serializeData(remoteData);
        setData(remoteData);
        setCloudReady(true);
        setCloudStatus("Cloud sync active");
        if (typeof window !== "undefined") {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(remoteData));
        }
        return;
      }

      const localData = loadData();
      const serialized = serializeData(localData);
      lastRemoteDataRef.current = serialized;
      setData(localData);
      setCloudReady(true);
      setCloudStatus("Migrating local data...");

      try {
        await setDoc(cloudDataDoc(authUser.uid), {
          data: localData,
          version: CLOUD_DOC_VERSION,
          updatedAt: serverTimestamp(),
        }, { merge: true });
        setCloudStatus("Cloud sync active");
      } catch (error) {
        console.error(error);
        setCloudStatus("Migration failed");
      }
    }, (error) => {
      console.error(error);
      setCloudReady(true);
      setCloudStatus("Cloud load failed");
    });

    return () => unsubscribe();
  }, [authUser]);

  useEffect(() => {
    if (!authUser || !cloudReady || !db) return undefined;

    const serialized = serializeData(data);
    if (serialized === lastRemoteDataRef.current) return undefined;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = window.setTimeout(async () => {
      try {
        setCloudStatus("Saving...");
        await setDoc(cloudDataDoc(authUser.uid), {
          data,
          version: CLOUD_DOC_VERSION,
          updatedAt: serverTimestamp(),
        }, { merge: true });
        lastRemoteDataRef.current = serialized;
        if (typeof window !== "undefined") {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        }
        setCloudStatus("Cloud sync active");
      } catch (error) {
        console.error(error);
        setCloudStatus("Save failed");
      }
    }, 500);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [authUser, cloudReady, data]);

  async function handleEmailPasswordSignIn() {
    if (!auth || !email.trim() || !password) return;

    setIsSigningIn(true);
    setAuthError("");

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (error) {
      console.error(error);
      setAuthError("Sign-in failed. Check the email/password and try again.");
    } finally {
      setIsSigningIn(false);
    }
  }

  async function handleLogout() {
    if (!auth) return;
    await signOut(auth);
    setData(createSampleData());
    lastRemoteDataRef.current = null;
    setCloudStatus("Signed out");
  }

  if (!hasFirebaseConfig) {
    return <SetupRequiredScreen />;
  }

  if (!authReady) {
    return <LoadingScreen title="Starting App" body="Checking your Firebase session..." />;
  }

  if (!authUser) {
    return (
      <AuthScreen
        email={email}
        password={password}
        authError={authError}
        isSigningIn={isSigningIn}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onSubmit={handleEmailPasswordSignIn}
      />
    );
  }

  if (!cloudReady) {
    return <LoadingScreen title="Loading Data" body="Syncing your dishes, restaurants, and experiences from Firebase..." />;
  }

  return (
    <DishTrackerAppContent
      data={data}
      setData={setData}
      userEmail={authUser.email || "Signed-in user"}
      cloudStatus={cloudStatus}
      onLogout={handleLogout}
    />
  );
}
