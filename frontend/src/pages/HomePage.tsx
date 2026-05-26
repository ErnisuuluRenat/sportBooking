import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { venuesApi } from "../api/venues";
import type { VenueQuery, Venue } from "../types";
import { VenuesMap } from "../components/VenuesMap";
import { bookingsApi } from "../api/bookings";
import { useAuthStore } from "../store/authStore";

const SPORT_TYPES = [
  { value: "", label: "Все" },
  { value: "football", label: "Футбол" },
  { value: "tennis", label: "Теннис" },
  { value: "basketball", label: "Баскетбол" },
  { value: "volleyball", label: "Волейбол" },
  { value: "swimming", label: "Плавание" },
  { value: "gym", label: "Тренажёр" },
];

const SPORT_ICONS: Record<string, string> = {
  football: "⚽",
  tennis: "🎾",
  basketball: "🏀",
  volleyball: "🏐",
  swimming: "🏊",
  gym: "🏋️",
  other: "🏟️",
};

export const HomePage = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState<VenueQuery>({ page: 1, limit: 12 });
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");

  const { data, isLoading } = useQuery({
    queryKey: ["venues", query],
    queryFn: () => venuesApi.getAll(query),
  });

  const { isAuthenticated } = useAuthStore();
  const { data: myBookings } = useQuery({
    queryKey: ["my-bookings-home"],
    queryFn: bookingsApi.getMy,
    enabled: isAuthenticated,
  });

  const upcomingBookings =
    myBookings
      ?.filter((b) => {
        const bookingDate = new Date(b.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return bookingDate >= today && b.status !== "cancelled";
      })
      .slice(0, 3) ?? [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery((p) => ({ ...p, search, page: 1 }));
  };

  const handleSportType = (type: string) => {
    setQuery((p) => ({ ...p, sportType: type || undefined, page: 1 }));
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Hero */}
      <div className="max-w-6xl mx-auto px-6 pt-16 pb-12">
        <div className="inline-flex items-center gap-2 bg-bg-card border border-border-subtle rounded px-3 py-1.5 mb-7">
          <span className="w-5 h-px bg-orange" />
          <span className="text-xs text-text-muted uppercase tracking-widest">
            Платформа №1 в Бишкеке
          </span>
        </div>

        <h1 className="text-5xl font-extrabold tracking-tight leading-tight mb-5 text-text-primary">
          Найди место
          <br />
          для <span className="text-orange">игры</span>
        </h1>
        <p className="text-text-muted text-base leading-relaxed max-w-md mb-10">
          Бронируй спортивные объекты мгновенно — без звонков и ожидания.
        </p>

        {/* Search bar */}
        <form
          onSubmit={handleSearch}
          className="flex items-center bg-bg-secondary border border-border-subtle rounded-xl px-4 py-2.5 gap-2 max-w-xl mb-3 focus-within:border-orange transition-colors"
        >
          <svg
            className="w-4 h-4 text-text-muted flex-shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
          </svg>
          <input
            className="flex-1 bg-transparent outline-none text-sm text-text-primary placeholder-text-ghost min-w-0"
            placeholder="Футбол, теннис, бассейн..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setFiltersOpen((p) => !p)}
            className="hidden sm:flex items-center gap-1.5 text-xs text-text-muted border border-border-subtle rounded-lg px-3 py-2 hover:border-orange hover:text-orange transition-colors flex-shrink-0"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path d="M4 6h16M7 12h10M10 18h4" strokeLinecap="round" />
            </svg>
            Фильтры
          </button>
          <button
            type="submit"
            className="bg-orange text-white text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity flex-shrink-0"
          >
            Найти
          </button>
        </form>

        {/* Фильтры отдельно на мобилке */}
        <button
          type="button"
          onClick={() => setFiltersOpen((p) => !p)}
          className="sm:hidden flex items-center gap-1.5 text-xs text-text-muted border border-border-subtle rounded-lg px-3 py-2 hover:border-orange hover:text-orange transition-colors mb-3"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path d="M4 6h16M7 12h10M10 18h4" strokeLinecap="round" />
          </svg>
          Фильтры
        </button>

        {/* Filters panel */}
        {filtersOpen && (
          <div className="bg-bg-secondary border border-border-subtle rounded-xl p-5 max-w-xl mb-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs text-text-muted uppercase tracking-wider block mb-2">
                  Город
                </label>
                <input
                  className="w-full bg-bg-primary border border-border-subtle rounded-btn px-3 py-2 text-sm text-text-primary outline-none focus:border-orange transition-colors"
                  placeholder="Бишкек..."
                  onChange={(e) =>
                    setQuery((p) => ({
                      ...p,
                      city: e.target.value || undefined,
                    }))
                  }
                />
              </div>
              <div>
                <label className="text-xs text-text-muted uppercase tracking-wider block mb-2">
                  Макс. цена (сом/ч)
                </label>
                <input
                  type="number"
                  className="w-full bg-bg-primary border border-border-subtle rounded-btn px-3 py-2 text-sm text-text-primary outline-none focus:border-orange transition-colors"
                  placeholder="5000"
                  onChange={(e) =>
                    setQuery((p) => ({
                      ...p,
                      maxPrice: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    }))
                  }
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-text-muted uppercase tracking-wider block mb-2">
                Мин. рейтинг
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setQuery((p) => ({ ...p, minRating: r }))}
                    className={`text-lg transition-colors ${(query.minRating ?? 0) >= r ? "text-orange" : "text-border-hover"}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Quick tags */}
        <div className="flex gap-2 flex-wrap">
          {SPORT_TYPES.map((s) => (
            <button
              key={s.value}
              onClick={() => handleSportType(s.value)}
              className={`text-xs px-4 py-2 rounded-full border transition-all ${
                query.sportType === s.value || (!query.sportType && !s.value)
                  ? "bg-orange/10 border-orange text-orange"
                  : "bg-bg-secondary border-border-subtle text-text-muted hover:border-orange hover:text-orange"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {isAuthenticated && upcomingBookings.length > 0 && (
        <div className="max-w-6xl mx-auto px-6 mb-8">
          <h2 className="text-base font-bold tracking-tight mb-3">
            Ближайшие игры
          </h2>
          <div className="flex flex-col gap-2">
            {upcomingBookings.map((b) => {
              const date = new Date(b.date);
              const isToday = date.toDateString() === new Date().toDateString();
              const isTomorrow =
                date.toDateString() ===
                new Date(Date.now() + 86400000).toDateString();
              const dateLabel = isToday
                ? "Сегодня"
                : isTomorrow
                  ? "Завтра"
                  : date.toLocaleDateString("ru-RU", {
                      day: "numeric",
                      month: "long",
                      timeZone: "Asia/Bishkek",
                    });

              return (
                <div
                  key={b._id}
                  onClick={() => navigate(`/venues/${b.venue._id}`)}
                  className="bg-bg-secondary border border-border-subtle rounded-card px-5 py-4 flex items-center justify-between gap-4 cursor-pointer hover:border-orange transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-orange/10 border border-orange/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-5 h-5 text-orange"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <circle cx="12" cy="12" r="9" />
                        <path d="M12 6v6l4 2" strokeLinecap="round" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-semibold group-hover:text-orange transition-colors text-text-primary">
                        {b.venue.name}
                      </div>
                      <div className="text-xs text-text-muted mt-0.5">
                        {b.startTime} — {b.endTime}
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div
                      className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${isToday ? "bg-orange text-white" : "bg-bg-card text-text-muted border border-border-subtle"}`}
                    >
                      {dateLabel}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="max-w-6xl mx-auto px-6 mb-12">
        <div className="grid grid-cols-3 divide-x divide-border-subtle border border-border-subtle rounded-xl overflow-hidden max-w-sm">
          {[
            { n: "48", l: "Объектов" },
            { n: "1.2k", l: "Броней" },
            { n: "4.8", l: "Рейтинг" },
          ].map((s) => (
            <div key={s.l} className="bg-bg-secondary py-4 text-center">
              <div className="text-xl font-bold text-orange">{s.n}</div>
              <div className="text-xs text-text-ghost uppercase tracking-wider mt-1">
                {s.l}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Venues grid */}
      <div className="max-w-6xl mx-auto px-6 pb-20">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold tracking-tight">Объекты</h2>
            {data && (
              <p className="text-xs text-text-muted mt-1">
                {data.total} найдено
              </p>
            )}
          </div>
          <div className="flex items-center gap-1 bg-bg-secondary border border-border-subtle rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${viewMode === "grid" ? "bg-orange text-white" : "text-text-muted hover:text-text-primary"}`}
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
              Список
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${viewMode === "map" ? "bg-orange text-white" : "text-text-muted hover:text-text-primary"}`}
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  d="M9 20l-5.447-2.724A1 1 0 0 1 3 16.382V5.618a1 1 0 0 1 1.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0 0 21 18.382V7.618a1 1 0 0 0-.553-.894L15 4m0 13V4M9 7l6-3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Карта
            </button>
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">Объекты</h2>
            {data && (
              <p className="text-xs text-text-muted mt-1">
                {data.total} найдено
              </p>
            )}
          </div>
        </div>

        {viewMode === "map" ? (
          <VenuesMap venues={data?.data ?? []} />
        ) : isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-bg-secondary border border-border-subtle rounded-card h-64 animate-pulse"
              />
            ))}
          </div>
        ) : data?.data.length === 0 ? (
          <div className="text-center py-20 text-text-muted">
            <p className="text-4xl mb-4">🏟️</p>
            <p className="text-sm">
              Объекты не найдены. Попробуй другой запрос.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data?.data.map((venue: Venue) => (
              <VenueCard
                key={venue._id}
                venue={venue}
                onClick={() => navigate(`/venues/${venue._id}`)}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-10 flex-wrap">
            <button
              onClick={() =>
                setQuery((p) => ({
                  ...p,
                  page: Math.max(1, (p.page ?? 1) - 1),
                }))
              }
              disabled={query.page === 1}
              className="px-4 h-9 rounded-btn text-sm border border-border-subtle text-text-muted hover:border-orange hover:text-orange transition-all disabled:opacity-30"
            >
              ← Назад
            </button>

            {Array.from({ length: data.totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setQuery((p) => ({ ...p, page: i + 1 }))}
                className={`w-9 h-9 rounded-btn text-sm border transition-all ${
                  query.page === i + 1
                    ? "bg-orange border-orange text-white"
                    : "border-border-subtle text-text-muted hover:border-orange hover:text-orange"
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() =>
                setQuery((p) => ({
                  ...p,
                  page: Math.min(data.totalPages, (p.page ?? 1) + 1),
                }))
              }
              disabled={query.page === data.totalPages}
              className="px-4 h-9 rounded-btn text-sm border border-border-subtle text-text-muted hover:border-orange hover:text-orange transition-all disabled:opacity-30"
            >
              Вперёд →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const VenueCard = ({
  venue,
  onClick,
}: {
  venue: Venue;
  onClick: () => void;
}) => {
  const sportIcon = SPORT_ICONS[venue.sportType] ?? "🏟️";
  const bgColors: Record<string, string> = {
    football: "from-[#0d1f0d] to-[#071007]",
    tennis: "from-[#1a1205] to-[#0d0902]",
    basketball: "from-[#1a0d0a] to-[#0d0705]",
    volleyball: "from-[#0d0d1a] to-[#07070d]",
    swimming: "from-[#0d1520] to-[#070d14]",
    gym: "from-[#1a1205] to-[#100c03]",
    other: "from-[#141414] to-[#0a0a0a]",
  };

  return (
    <div
      onClick={onClick}
      className="bg-bg-secondary border border-border-subtle rounded-card overflow-hidden cursor-pointer hover:border-border-hover hover:-translate-y-0.5 transition-all duration-200 group"
    >
      {/* Image / placeholder */}
      <div
        className={`h-40 bg-gradient-to-br ${bgColors[venue.sportType] ?? bgColors.other} flex items-center justify-center relative`}
      >
        {venue.images?.[0] ? (
          <img
            src={venue.images[0]}
            alt={venue.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-5xl opacity-20">{sportIcon}</span>
        )}
        <div className="absolute top-3 left-3 bg-orange text-white text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded">
          {venue.sportType === "football"
            ? "Футбол"
            : venue.sportType === "tennis"
              ? "Теннис"
              : venue.sportType === "basketball"
                ? "Баскетбол"
                : venue.sportType === "volleyball"
                  ? "Волейбол"
                  : venue.sportType === "swimming"
                    ? "Плавание"
                    : venue.sportType === "gym"
                      ? "Тренажёр"
                      : "Другое"}
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-sm font-semibold tracking-tight mb-1 group-hover:text-orange transition-colors">
          {venue.name}
        </h3>
        <div className="flex items-center gap-1 text-xs text-text-muted mb-3">
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
          </svg>
          {venue.city}
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-border-subtle">
          <div>
            <span className="text-base font-bold text-orange">
              {venue.pricePerHour.toLocaleString()}
            </span>
            <span className="text-xs text-text-muted ml-1">сом/ч</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-text-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-orange" />
            {venue.rating > 0
              ? `${venue.rating} · ${venue.reviewsCount} отз.`
              : "Нет отзывов"}
          </div>
        </div>
      </div>
    </div>
  );
};
