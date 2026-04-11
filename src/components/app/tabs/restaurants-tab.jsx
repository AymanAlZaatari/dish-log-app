import { useEffect, useState } from "react";

import { ChevronDown, ChevronUp, Eye, MapPin, NotebookText, Pencil, Plus, Search, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

import {
  DELETE_BUTTON_STYLE,
  EDIT_BUTTON_STYLE,
  LOG_BUTTON_STYLE,
  SECTION_CONTAINER,
  VIEW_BUTTON_STYLE,
} from "@/lib/app/constants";
import { average, ratingPillClass, summarizeTags } from "@/lib/app/data";

import { Field, ModalActions, ModalHeader, Stars } from "../shared";

export function RestaurantsTab({
  branchOpen,
  setBranchOpen,
  resetBranchForm,
  branchForm,
  setBranchForm,
  branchFormError,
  setBranchFormError,
  saveBranch,
  data,
  areaOptions,
  restaurantSearch,
  setRestaurantSearch,
  restaurantCityFilter,
  setRestaurantCityFilter,
  restaurantFilterCityOptions,
  restaurantAreaFilter,
  setRestaurantAreaFilter,
  restaurantFilterAreaOptions,
  restaurantCuisineFilter,
  setRestaurantCuisineFilter,
  restaurantFilterCuisineOptions,
  restaurantKidsFilter,
  setRestaurantKidsFilter,
  filteredRestaurants,
  computedDishRating,
  editRestaurant,
  deleteRestaurant,
  editDish,
  prepareLogExperience,
  editBranch,
  deleteBranch,
}) {
  const [expandAllDishes, setExpandAllDishes] = useState(false);
  const [expandedDishRestaurantIds, setExpandedDishRestaurantIds] = useState([]);
  const [statsView, setStatsView] = useState("cards");

  useEffect(() => {
    const visibleRestaurantIds = new Set(filteredRestaurants.map((restaurant) => restaurant.id));
    setExpandedDishRestaurantIds((currentIds) => currentIds.filter((id) => visibleRestaurantIds.has(id)));
  }, [filteredRestaurants]);

  const toggleRestaurantDishes = (restaurantId) => {
    if (expandAllDishes) {
      setExpandAllDishes(false);
      setExpandedDishRestaurantIds(
        filteredRestaurants
          .map((restaurant) => restaurant.id)
          .filter((id) => id !== restaurantId)
      );
      return;
    }

    setExpandedDishRestaurantIds((currentIds) =>
      currentIds.includes(restaurantId)
        ? currentIds.filter((id) => id !== restaurantId)
        : [...currentIds, restaurantId]
    );
  };

  return (
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

      <div className={SECTION_CONTAINER}>
        <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Restaurant Library</h2>
            <p className="mt-1 text-sm text-slate-600">
              Search and filter restaurants by name, branch, dish, area, city, or cuisine.
            </p>
          </div>
          <div className="flex flex-col gap-3 md:items-end">
            <div className="inline-flex rounded-2xl border border-slate-200 bg-slate-50 p-1">
              <Button
                type="button"
                variant={statsView === "cards" ? "secondary" : "ghost"}
                size="sm"
                className="rounded-xl"
                onClick={() => setStatsView("cards")}
                aria-pressed={statsView === "cards"}
              >
                KPI
              </Button>
              <Button
                type="button"
                variant={statsView === "rows" ? "secondary" : "ghost"}
                size="sm"
                className="rounded-xl"
                onClick={() => setStatsView("rows")}
                aria-pressed={statsView === "rows"}
              >
                Rows
              </Button>
            </div>
            <Button
              type="button"
              variant="outline"
              className="rounded-2xl"
              onClick={() => {
                setExpandAllDishes((current) => !current);
                setExpandedDishRestaurantIds([]);
              }}
              aria-pressed={expandAllDishes}
            >
              {expandAllDishes ? <ChevronUp className="mr-2 h-4 w-4" /> : <ChevronDown className="mr-2 h-4 w-4" />}
              {expandAllDishes ? "Collapse All Dishes" : "Expand All Dishes"}
            </Button>
          </div>
        </div>

        <div className="mb-5 grid gap-3 md:grid-cols-6">
          <div className="relative md:col-span-2"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input className="pl-9" placeholder="Search restaurants, branches, dishes..." value={restaurantSearch} onChange={(e) => setRestaurantSearch(e.target.value)} /></div>
          <Select value={restaurantCityFilter} onValueChange={setRestaurantCityFilter}><SelectTrigger><SelectValue placeholder="City" /></SelectTrigger><SelectContent><SelectItem value="all">All cities</SelectItem>{restaurantFilterCityOptions.map((city) => <SelectItem key={city} value={city}>{city}</SelectItem>)}</SelectContent></Select>
          <Select value={restaurantAreaFilter} onValueChange={setRestaurantAreaFilter}><SelectTrigger><SelectValue placeholder="Area" /></SelectTrigger><SelectContent><SelectItem value="all">All areas</SelectItem>{restaurantFilterAreaOptions.map((area) => <SelectItem key={area} value={area}>{area}</SelectItem>)}</SelectContent></Select>
          <Select value={restaurantCuisineFilter} onValueChange={setRestaurantCuisineFilter}><SelectTrigger><SelectValue placeholder="Cuisine" /></SelectTrigger><SelectContent><SelectItem value="all">All cuisines</SelectItem>{restaurantFilterCuisineOptions.map((cuisine) => <SelectItem key={cuisine} value={cuisine}>{cuisine}</SelectItem>)}</SelectContent></Select>
          <Select value={restaurantKidsFilter} onValueChange={setRestaurantKidsFilter}><SelectTrigger><SelectValue placeholder="Kids friendly" /></SelectTrigger><SelectContent><SelectItem value="all">All restaurants</SelectItem><SelectItem value="kids">Kids friendly only</SelectItem></SelectContent></Select>
        </div>

        <div className="mb-5 border-t border-slate-200" />

        <div className="grid gap-5 lg:grid-cols-2">
          {filteredRestaurants.map((restaurant) => {
            const branches = data.branches.filter((b) => b.restaurantId === restaurant.id);
            const dishes = data.dishes.filter((d) => d.restaurantId === restaurant.id);
            const avgDishRating = average(dishes.map((d) => computedDishRating(d.id)));
            const avgDishPrice = average(dishes.map((dish) => dish.price));
            const areDishesExpanded = expandAllDishes || expandedDishRestaurantIds.includes(restaurant.id);
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
                  <div className="grid gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:gap-3 sm:p-4">
                    {statsView === "cards" ? (
                      <div className="grid grid-cols-3 gap-2 sm:gap-3">
                        <div className={`min-w-0 rounded-xl border p-3 text-center sm:rounded-2xl sm:p-4 ${ratingPillClass(restaurant.rating ? Number(restaurant.rating) : null)}`}>
                          <div className="text-[0.68rem] font-semibold leading-tight text-slate-500 sm:text-[0.82rem] sm:uppercase sm:tracking-[0.18em]">Restaurant Score</div>
                          {restaurant.rating ? (
                            <>
                              <div className="mt-2 text-lg font-bold text-slate-900 sm:mt-3 sm:text-2xl">{Number(restaurant.rating).toFixed(1)}</div>
                              <div className="mt-2 hidden sm:flex sm:justify-center"><Stars value={restaurant.rating} /></div>
                            </>
                          ) : (
                            <div className="mt-2 text-lg font-bold text-slate-400 sm:mt-3 sm:text-2xl">—</div>
                          )}
                        </div>
                        <div className={`min-w-0 rounded-xl border p-3 text-center sm:rounded-2xl sm:p-4 ${ratingPillClass(avgDishRating)}`}>
                          <div className="text-[0.68rem] font-semibold leading-tight text-slate-500 sm:text-[0.82rem] sm:uppercase sm:tracking-[0.18em]">Avg Dish Rating</div>
                          {avgDishRating ? (
                            <>
                              <div className="mt-2 text-lg font-bold text-slate-900 sm:mt-3 sm:text-2xl">{avgDishRating.toFixed(1)}</div>
                              <div className="mt-2 hidden sm:flex sm:justify-center"><Stars value={avgDishRating} /></div>
                            </>
                          ) : (
                            <div className="mt-2 text-lg font-bold text-slate-400 sm:mt-3 sm:text-2xl">—</div>
                          )}
                        </div>
                        <div className="min-w-0 rounded-xl border border-emerald-200 bg-white p-3 text-center text-emerald-900 sm:rounded-2xl sm:p-4">
                          <div className="text-[0.68rem] font-semibold leading-tight text-emerald-700 sm:text-[0.82rem] sm:uppercase sm:tracking-[0.18em]">Avg Dish Price</div>
                          <div className="mt-2 text-lg font-bold sm:mt-3 sm:text-2xl">{avgDishPrice ? `$${avgDishPrice.toFixed(1)}` : "—"}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-slate-200 bg-white">
                        <div className={`flex items-center justify-between gap-4 px-4 py-3 ${ratingPillClass(restaurant.rating ? Number(restaurant.rating) : null)}`}>
                          <span className="text-sm font-medium text-slate-500">Restaurant Score</span>
                          <span className="text-base font-bold text-slate-900">{restaurant.rating ? Number(restaurant.rating).toFixed(1) : "—"}</span>
                        </div>
                        <div className="border-t border-slate-200" />
                        <div className={`flex items-center justify-between gap-4 px-4 py-3 ${ratingPillClass(avgDishRating)}`}>
                          <span className="text-sm font-medium text-slate-500">Avg Dish Rating</span>
                          <span className="text-base font-bold text-slate-900">{avgDishRating ? avgDishRating.toFixed(1) : "—"}</span>
                        </div>
                        <div className="border-t border-slate-200" />
                        <div className="flex items-center justify-between gap-4 px-4 py-3">
                          <span className="text-sm font-medium text-emerald-700">Avg Dish Price</span>
                          <span className="text-base font-bold text-emerald-900">{avgDishPrice ? `$${avgDishPrice.toFixed(1)}` : "—"}</span>
                        </div>
                      </div>
                    )}
                    {(restaurant.fullAddress || restaurant.recommendedBy) && (
                      <div className="grid gap-3 sm:grid-cols-2">
                        {restaurant.fullAddress && <div><span className="font-medium text-slate-900">Full Address:</span> {restaurant.fullAddress}</div>}
                        {restaurant.recommendedBy && <div><span className="font-medium text-slate-900">Recommended By:</span> {restaurant.recommendedBy}</div>}
                      </div>
                    )}
                    {restaurant.mapsLink && <a href={restaurant.mapsLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-slate-900 underline"><MapPin className="h-5 w-5 text-red-500" /> Open Maps Link</a>}
                  </div>
                  {restaurant.notes && <div className="rounded-2xl border border-slate-200 bg-white p-4"><div className="mb-1 font-medium text-slate-900">Notes</div>{restaurant.notes}</div>}
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 text-left font-medium text-slate-900"
                        onClick={() => toggleRestaurantDishes(restaurant.id)}
                        aria-expanded={areDishesExpanded}
                      >
                        <span>Dishes</span>
                        <Badge variant="outline">{dishes.length}</Badge>
                        {areDishesExpanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                      </button>
                    </div>
                    {!areDishesExpanded ? null : dishes.length === 0 ? (
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
      </div>
    </TabsContent>
  );
}
