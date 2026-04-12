import { CalendarDays, Camera, DollarSign, Filter, Heart, MapPin, NotebookText, Pencil, Sparkles, Star, Store, Trash2, UtensilsCrossed } from "lucide-react";

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
import { ratingPillClass, valuePillClass } from "@/lib/app/data";

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
                <RecentExperienceCard
                  key={experience.id}
                  experience={experience}
                  dish={dish}
                  restaurant={restaurant}
                  branch={branch}
                  statsView={defaultStatsView}
                  editExperience={editExperience}
                  deleteExperience={deleteExperience}
                />
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
              <div className="text-base font-bold text-slate-900 sm:text-lg">{restaurant.name}</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500 sm:text-sm">
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1">
              <MapPin className="h-3.5 w-3.5" />
              {hasLocation ? [restaurant.area, restaurant.city].filter(Boolean).join(", ") : "No location"}
            </span>
            {cuisines.map((cuisine) => (
              <Badge key={cuisine} variant="secondary" className="bg-amber-50 text-amber-800 border-amber-200 gap-1.5">
                <UtensilsCrossed className="h-3.5 w-3.5" />
                <span>{cuisine}</span>
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
          <InlineMetricRow
            label="Restaurant Score"
            value={restaurant.rating ? Number(restaurant.rating).toFixed(1) : "—"}
            className={ratingPillClass(restaurant.rating ? Number(restaurant.rating) : null)}
            starsValue={restaurant.rating ? Number(restaurant.rating) : null}
          />
          <div className="border-t border-slate-200" />
          <InlineMetricRow
            label="Avg Dish Rating"
            value={avgDishRating ? avgDishRating.toFixed(1) : "—"}
            className={ratingPillClass(avgDishRating)}
            starsValue={avgDishRating || null}
          />
          <div className="border-t border-slate-200" />
          <InlineMetricRow label="Avg Dish Price" value={avgDishPrice ? `$${avgDishPrice.toFixed(1)}` : "—"} className="text-emerald-900" labelClassName="text-emerald-700" />
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className={`min-w-0 rounded-xl border p-3 text-center sm:rounded-2xl sm:p-4 ${ratingPillClass(restaurant.rating ? Number(restaurant.rating) : null)}`}>
            <div className="text-[0.68rem] font-semibold leading-tight text-slate-500 sm:text-[0.82rem] sm:uppercase sm:tracking-[0.18em]">Restaurant Score</div>
            <div className="mt-2 text-lg font-bold text-slate-900 sm:mt-3 sm:text-2xl">{restaurant.rating ? Number(restaurant.rating).toFixed(1) : "—"}</div>
            {restaurant.rating ? <div className="mt-2 flex justify-center lg:hidden"><Stars value={restaurant.rating} size="sm" /></div> : null}
            {restaurant.rating ? <div className="mt-2 hidden justify-center lg:flex"><Stars value={restaurant.rating} /></div> : null}
          </div>
          <div className={`min-w-0 rounded-xl border p-3 text-center sm:rounded-2xl sm:p-4 ${ratingPillClass(avgDishRating)}`}>
            <div className="text-[0.68rem] font-semibold leading-tight text-slate-500 sm:text-[0.82rem] sm:uppercase sm:tracking-[0.18em]">Avg Dish Rating</div>
            <div className="mt-2 text-lg font-bold text-slate-900 sm:mt-3 sm:text-2xl">{avgDishRating ? avgDishRating.toFixed(1) : "—"}</div>
            {avgDishRating ? <div className="mt-2 flex justify-center lg:hidden"><Stars value={avgDishRating} size="sm" /></div> : null}
            {avgDishRating ? <div className="mt-2 hidden justify-center lg:flex"><Stars value={avgDishRating} /></div> : null}
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

function RecentExperienceCard({ experience, dish, restaurant, branch, statsView, editExperience, deleteExperience }) {
  const hasPrice = experience.price != null && experience.price !== "";
  const hasValue = Boolean(experience.valueForMoney);
  const hasRating = experience.rating != null;
  const hasNotes = Boolean(experience.notes);
  const imageCount = experience.images?.length || 0;
  const isInlineView = statsView === "rows";

  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/60 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="text-base font-bold text-slate-900 sm:text-lg">{dish?.name || "Unknown dish"}</div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500 sm:text-sm">
            {restaurant?.name ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">
                <Store className="h-3.5 w-3.5" />
                {restaurant.name}
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">
              <CalendarDays className="h-3.5 w-3.5" />
              {experience.date}
            </span>
            <Badge variant="secondary" className="gap-1.5 bg-sky-50 text-sky-800 border-sky-200">
              <NotebookText className="h-3.5 w-3.5" />
              <span>{experience.orderType}</span>
            </Badge>
            {branch ? (
              <Badge variant="secondary" className="gap-1.5 bg-amber-50 text-amber-800 border-amber-200">
                <MapPin className="h-3.5 w-3.5" />
                <span>{branch.name}</span>
              </Badge>
            ) : null}
          </div>
        </div>

      </div>

      {(hasPrice || hasValue || hasRating || imageCount > 0) ? (
        <div className="mt-4 space-y-3">
          {isInlineView ? (
            <div className="rounded-2xl border border-slate-200 bg-white">
              <InlineMetricRow
                label="Price"
                value={hasPrice ? `$${Number(experience.price).toFixed(1)}` : "—"}
                className="text-emerald-900"
                labelClassName="text-emerald-700"
              />
              <div className="border-t border-slate-200" />
              <InlineMetricRow
                label="Rating"
                value={hasRating ? Number(experience.rating).toFixed(1) : "—"}
                className={ratingPillClass(hasRating ? Number(experience.rating) : null)}
                starsValue={hasRating ? Number(experience.rating) : null}
              />
              <div className="border-t border-slate-200" />
              <InlineMetricRow
                label="Value"
                value={hasValue ? experience.valueForMoney : "—"}
                className={valuePillClass(experience.valueForMoney)}
              />
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              <ExperienceMetricCard
                label="Price"
                value={hasPrice ? `$${Number(experience.price).toFixed(1)}` : "—"}
                icon={<DollarSign className="h-4 w-4" />}
                className="border-emerald-200 bg-emerald-50 text-emerald-900"
                labelClassName="text-emerald-700"
              />
              <ExperienceMetricCard
                label="Rating"
                value={hasRating ? Number(experience.rating).toFixed(1) : "—"}
                icon={<Star className="h-4 w-4" />}
                className={ratingPillClass(hasRating ? Number(experience.rating) : null)}
              >
                {hasRating ? <div className="mt-2 flex justify-center sm:hidden"><Stars value={experience.rating} size="sm" /></div> : null}
                {hasRating ? <div className="mt-2 hidden justify-center sm:flex"><Stars value={experience.rating} /></div> : null}
              </ExperienceMetricCard>
              <ExperienceMetricCard
                label="Value"
                value={hasValue ? experience.valueForMoney : "—"}
                icon={<Sparkles className="h-4 w-4" />}
                className={valuePillClass(experience.valueForMoney)}
              />
            </div>
          )}

          {imageCount > 0 ? (
            <Badge variant="secondary" className="gap-1.5 bg-rose-50 text-rose-800 border-rose-200">
              <Camera className="h-3.5 w-3.5" />
              <span>{imageCount} image{imageCount === 1 ? "" : "s"}</span>
            </Badge>
          ) : null}
        </div>
      ) : null}

      {hasNotes ? (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          {experience.notes}
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
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
  );
}

function InlineMetricRow({ label, value, className = "", labelClassName = "text-slate-500", starsValue = null }) {
  return (
    <div className={`flex items-center justify-between gap-4 px-4 py-3 ${className}`}>
      <span className={`text-sm font-medium ${labelClassName}`}>{label}</span>
      <div className="flex items-center gap-3">
        {starsValue ? <div className="flex"><Stars value={starsValue} /></div> : null}
        <span className="text-base font-bold text-slate-900">{value}</span>
      </div>
    </div>
  );
}

function ExperienceMetricCard({ label, value, icon, className, labelClassName = "text-slate-500", children }) {
  return (
    <div className={`min-w-0 rounded-2xl border px-2 py-3 text-center sm:px-3 sm:p-4 ${className}`}>
      <div className={`flex items-center justify-center gap-1 text-[0.62rem] font-semibold leading-tight sm:gap-1.5 sm:text-[0.82rem] sm:uppercase sm:tracking-[0.18em] ${labelClassName}`}>
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-2 text-sm font-bold text-slate-900 sm:mt-3 sm:text-xl">{value}</div>
      {children ? <div className="mt-1 sm:mt-2">{children}</div> : null}
    </div>
  );
}
