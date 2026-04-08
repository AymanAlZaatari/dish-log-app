export const emptyRestaurantForm = {
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

export const emptyBranchForm = {
  id: null,
  restaurantId: "",
  name: "",
  area: "",
  locationText: "",
  mapsLink: "",
  notes: "",
};

export const emptyDishForm = {
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

export const emptyExperienceForm = {
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

export const inlineRestaurantFormDefault = {
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
