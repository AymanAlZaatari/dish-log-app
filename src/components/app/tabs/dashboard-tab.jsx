import { Filter, Heart, NotebookText, Pencil, Star, Store, Trash2, UtensilsCrossed } from "lucide-react";

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
                    <span>Avg Dish Rating</span>
                    <Stars value={avgDishRating} />
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
                  <Badge variant="secondary">{dishesCount} dishes</Badge>
                  <Badge variant="secondary">{experiencesCount} experiences</Badge>
                  <Badge variant="outline">Restaurant score: {restaurant.rating ? Number(restaurant.rating).toFixed(1) : "—"}</Badge>
                  <Badge variant="outline">Avg Dish Price: {avgDishPrice ? `$${avgDishPrice.toFixed(1)}` : "—"}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </TabsContent>
  );
}
