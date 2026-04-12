import { Filter, Heart, MapPin, NotebookText, Pencil, Star, Store, Trash2, UtensilsCrossed } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";

import {
  DASHBOARD_CARD_STYLES,
  DELETE_BUTTON_STYLE,
  EDIT_BUTTON_STYLE,
  SECTION_CONTAINER,
} from "@/lib/app/constants";
import { ratingPillClass } from "@/lib/app/data";

import { Stars } from "../shared";

export function DashboardTab({
  dashboardStats,
  recentExperiences,
  dishesById,
  restaurantsById,
  branchesById,
  editExperience,
  deleteExperience,
  restaurantSummaries,
  defaultStatsView,
}) {
  return (
    <TabsContent value="dashboard" className="space-y-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {[
          ["Restaurants", dashboardStats.restaurants, <Store className="h-5 w-5" key="a" />],
          ["Dishes", dashboardStats.dishes, <UtensilsCrossed className="h-5 w-5" key="b" />],
          ["Experiences", dashboardStats.experiences, <NotebookText className="h-5 w-5" key="c" />],
          ["Tried", dashboardStats.triedDishes, <Star className="h-5 w-5" key="d" />],
          ["Wishlist", dashboardStats.wishlistDishes, <Heart className="h-5 w-5" key="e" />],
          ["Avg Dish Rating", dashboardStats.avgDishRating.toFixed(1), <Filter className="h-5 w-5" key="f" />],
        ].map(([label, value, icon]) => (
          <Card key={label} className={`rounded-3xl border shadow-sm ${DASHBOARD_CARD_STYLES[label] || "border-slate-200 bg-white"}`}>
            <CardContent className="flex flex-col items-center justify-center gap-2 p-4 text-center sm:p-5">
              <div className="flex items-center justify-center gap-2 text-slate-500">
                <span>{icon}</span>
                <span className="text-xl font-bold text-slate-900 sm:text-2xl">{value}</span>
              </div>
              <div className="min-w-0">
                <div className="text-sm font-extrabold leading-tight text-slate-700 sm:text-[0.95rem]">{label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className={`${SECTION_CONTAINER} grid gap-6 xl:grid-cols-2`}>
        <div className="rounded-2xl border border-slate-300 bg-slate-200/70 px-4 py-3 text-center xl:hidden">
          <div className="text-base font-black uppercase tracking-[0.08em] text-slate-900">Recent Experiences</div>
        </div>

        <Card className="rounded-3xl border-0 shadow-sm">
          <CardHeader className="hidden xl:block"><CardTitle className="font-bold">Recent Experiences</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {recentExperiences.length === 0 ? <div className="text-sm text-slate-500">No experiences yet.</div> : recentExperiences.map((experience) => {
              const dish = dishesById[experience.dishId];
              const restaurant = dish ? restaurantsById[dish.restaurantId] : null;
              const branch = experience.branchId ? branchesById[experience.branchId] : null;
              return (
                <div key={experience.id} className="rounded-2xl border p-4">
                  <div className="min-w-0">
                    <div className="font-semibold">{dish?.name || "Unknown dish"}</div>
                    <div className="text-sm text-slate-500">{restaurant?.name} • {experience.orderType} • {experience.date}</div>
                    {branch && <div className="mt-1 text-xs text-slate-500">Branch: {branch.name}</div>}
                  </div>
                  {((experience.price != null && experience.price !== "") || experience.valueForMoney || experience.notes || experience.images?.length > 0 || experience.rating != null) && (
                    <div className="mt-3 text-sm text-slate-600">
                      {((experience.price != null && experience.price !== "") || experience.valueForMoney) ? (
                        <div>
                          {experience.price != null && experience.price !== "" ? (
                            <><span className="font-semibold text-slate-900">Price:</span> {`$${Number(experience.price).toFixed(1)}`}</>
                          ) : ""}
                          {experience.price != null && experience.price !== "" && experience.valueForMoney ? " • " : ""}
                          {experience.valueForMoney ? <><span className="font-semibold text-slate-900">Value:</span> {experience.valueForMoney}</> : ""}
                        </div>
                      ) : null}
                      {experience.rating != null ? (
                        <div className="mt-2 flex items-center gap-2">
                          <span className="font-semibold text-slate-900">Rating:</span>
                          <Stars value={experience.rating} />
                        </div>
                      ) : null}
                      {experience.notes ? (
                        <div className="mt-2 flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">{experience.notes}</div>
                          <div className="flex shrink-0 items-center gap-2">
                            <Button variant="outline" size="sm" className={`px-2 sm:px-3 ${EDIT_BUTTON_STYLE}`} onClick={() => editExperience(experience)}>
                              <Pencil className="h-4 w-4 sm:mr-2" />
                              <span className="hidden sm:inline">Edit</span>
                            </Button>
                            <Button variant="outline" size="sm" className={`px-2 sm:px-3 ${DELETE_BUTTON_STYLE}`} onClick={() => deleteExperience(experience.id)}>
                              <Trash2 className="h-4 w-4 sm:mr-2" />
                              <span className="hidden sm:inline">Delete</span>
                            </Button>
                          </div>
                        </div>
                      ) : null}
                      {experience.images?.length > 0 ? <div className="mt-2 text-xs text-slate-500">{experience.images.length} image(s)</div> : null}
                    </div>
                  )}
                  {!experience.notes ? (
                    <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
                      <Button variant="outline" size="sm" className={`px-2 sm:px-3 ${EDIT_BUTTON_STYLE}`} onClick={() => editExperience(experience)}>
                        <Pencil className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Edit</span>
                      </Button>
                      <Button variant="outline" size="sm" className={`px-2 sm:px-3 ${DELETE_BUTTON_STYLE}`} onClick={() => deleteExperience(experience.id)}>
                        <Trash2 className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Delete</span>
                      </Button>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </CardContent>
        </Card>

        <div className="rounded-2xl border border-slate-300 bg-slate-200/70 px-4 py-3 text-center xl:hidden">
          <div className="text-base font-black uppercase tracking-[0.08em] text-slate-900">Restaurants Overview</div>
        </div>

        <Card className="rounded-3xl border-0 shadow-sm xl:col-start-auto">
          <CardHeader className="hidden xl:block"><CardTitle className="font-bold">Restaurants Overview</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {restaurantSummaries.length === 0 ? <div className="text-sm text-slate-500">No restaurants yet.</div> : restaurantSummaries.map((summary) => (
              <RestaurantOverviewCard key={summary.restaurant.id} statsView={defaultStatsView} {...summary} />
            ))}
          </CardContent>
        </Card>
      </div>
    </TabsContent>
  );
}

function RestaurantOverviewCard({ restaurant, dishesCount, experiencesCount, avgDishRating, avgDishPrice, statsView }) {
  const cuisines = restaurant.cuisines?.length ? restaurant.cuisines : ["No cuisine"];
  const hasLocation = restaurant.area || restaurant.city;
  const isInlineView = statsView === "rows";

  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/60 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-emerald-100 p-2 text-emerald-700">
              <Store className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="truncate text-base font-bold text-slate-900 sm:text-lg">{restaurant.name}</div>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500 sm:text-sm">
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {hasLocation ? [restaurant.area, restaurant.city].filter(Boolean).join(", ") : "No location"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {cuisines.map((cuisine) => (
              <Badge key={cuisine} variant="secondary" className="bg-amber-50 text-amber-800 border-amber-200">
                {cuisine}
              </Badge>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 sm:min-w-[10rem]">
          <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">Overview</div>
          <div className="mt-1 text-sm font-semibold text-slate-900">{dishesCount} dishes • {experiencesCount} experiences</div>
        </div>
      </div>

      {isInlineView ? (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white">
          <InlineMetricRow label="Restaurant Score" value={restaurant.rating ? Number(restaurant.rating).toFixed(1) : "—"} className={ratingPillClass(restaurant.rating ? Number(restaurant.rating) : null)} />
          <div className="border-t border-slate-200" />
          <InlineMetricRow label="Avg Dish Rating" value={avgDishRating ? avgDishRating.toFixed(1) : "—"} className={ratingPillClass(avgDishRating)} />
          <div className="border-t border-slate-200" />
          <InlineMetricRow label="Avg Dish Price" value={avgDishPrice ? `$${avgDishPrice.toFixed(1)}` : "—"} className="text-emerald-900" labelClassName="text-emerald-700" />
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className={`min-w-0 rounded-xl border p-3 text-center sm:rounded-2xl sm:p-4 ${ratingPillClass(restaurant.rating ? Number(restaurant.rating) : null)}`}>
            <div className="text-[0.68rem] font-semibold leading-tight text-slate-500 sm:text-[0.82rem] sm:uppercase sm:tracking-[0.18em]">Restaurant Score</div>
            <div className="mt-2 text-lg font-bold text-slate-900 sm:mt-3 sm:text-2xl">{restaurant.rating ? Number(restaurant.rating).toFixed(1) : "—"}</div>
          </div>
          <div className={`min-w-0 rounded-xl border p-3 text-center sm:rounded-2xl sm:p-4 ${ratingPillClass(avgDishRating)}`}>
            <div className="text-[0.68rem] font-semibold leading-tight text-slate-500 sm:text-[0.82rem] sm:uppercase sm:tracking-[0.18em]">Avg Dish Rating</div>
            <div className="mt-2 text-lg font-bold text-slate-900 sm:mt-3 sm:text-2xl">{avgDishRating ? avgDishRating.toFixed(1) : "—"}</div>
          </div>
          <div className="min-w-0 rounded-xl border border-emerald-200 bg-white p-3 text-center text-emerald-900 sm:rounded-2xl sm:p-4">
            <div className="text-[0.68rem] font-semibold leading-tight text-emerald-700 sm:text-[0.82rem] sm:uppercase sm:tracking-[0.18em]">Avg Dish Price</div>
            <div className="mt-2 text-lg font-bold sm:mt-3 sm:text-2xl">{avgDishPrice ? `$${avgDishPrice.toFixed(1)}` : "—"}</div>
          </div>
        </div>
      )}
    </div>
  );
}

function InlineMetricRow({ label, value, className = "", labelClassName = "text-slate-500" }) {
  return (
    <div className={`flex items-center justify-between gap-4 px-4 py-3 ${className}`}>
      <span className={`text-sm font-medium ${labelClassName}`}>{label}</span>
      <span className="text-base font-bold text-slate-900">{value}</span>
    </div>
  );
}
