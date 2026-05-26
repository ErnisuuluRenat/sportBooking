import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { venuesApi } from "../api/venues";
import { bookingsApi } from "../api/bookings";
import { reviewsApi } from "../api/reviews";
import { useAuthStore } from "../store/authStore";
import { Button } from "../components/ui/Button";
import { PaymentModal } from "../components/PaymentModal";
import type { Review } from "../types";
import { VenueMap } from "../components/VenueMap";

const SLOTS = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
  "22:00",
];

const SPORT_LABELS: Record<string, string> = {
  football: "Футбол",
  tennis: "Теннис",
  basketball: "Баскетбол",
  volleyball: "Волейбол",
  swimming: "Плавание",
  gym: "Тренажёр",
  other: "Другое",
};

const BG_COLORS: Record<string, string> = {
  football: "from-[#0d1f0d] to-[#071007]",
  tennis: "from-[#1a1205] to-[#0d0902]",
  basketball: "from-[#1a0d0a] to-[#0d0705]",
  volleyball: "from-[#0d0d1a] to-[#07070d]",
  swimming: "from-[#0d1520] to-[#070d14]",
  gym: "from-[#1a1205] to-[#100c03]",
  other: "from-[#141414] to-[#0a0a0a]",
};

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

export const VenuePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const queryClient = useQueryClient();

  const [imgIdx, setImgIdx] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [level, setLevel] = useState<"casual" | "amateur" | "competitive">(
    "casual",
  );

  const { data: venue, isLoading } = useQuery({
    queryKey: ["venue", id],
    queryFn: () => venuesApi.getOne(id!),
    enabled: !!id,
  });

  const { data: bookings } = useQuery({
    queryKey: ["venue-bookings", id, formatDate(selectedDate)],
    queryFn: () => bookingsApi.getVenueBookings(id!, formatDate(selectedDate)),
    enabled: !!id,
  });

  const { data: reviews } = useQuery({
    queryKey: ["reviews", id],
    queryFn: () => reviewsApi.getByVenue(id!),
    enabled: !!id,
  });

  const bookMutation = useMutation({
    mutationFn: () =>
      bookingsApi.create({
        venueId: id!,
        date: formatDate(selectedDate),
        startTime: selectedSlot!,
        endTime: `${String(Number(selectedSlot!.split(":")[0]) + 1).padStart(2, "0")}:00`,
        level,
      }),
    onSuccess: () => {
      setBookingSuccess(true);
      setSelectedSlot(null);
      queryClient.invalidateQueries({ queryKey: ["venue-bookings", id] });
      setTimeout(() => setBookingSuccess(false), 4000);
    },
  });

  const reviewMutation = useMutation({
    mutationFn: () => reviewsApi.create({ venueId: id!, ...reviewForm }),
    onSuccess: () => {
      setShowReviewForm(false);
      setReviewForm({ rating: 5, comment: "" });
      queryClient.invalidateQueries({ queryKey: ["reviews", id] });
      queryClient.invalidateQueries({ queryKey: ["venue", id] });
    },
  });

  const takenSlots = new Set(bookings?.map((b) => b.startTime) ?? []);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const firstDay = getFirstDayOfMonth(calYear, calMonth);
  const MONTH_NAMES = [
    "Январь",
    "Февраль",
    "Март",
    "Апрель",
    "Май",
    "Июнь",
    "Июль",
    "Август",
    "Сентябрь",
    "Октябрь",
    "Ноябрь",
    "Декабрь",
  ];

  const prevMonth = () => {
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear((y) => y - 1);
    } else setCalMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear((y) => y + 1);
    } else setCalMonth((m) => m + 1);
  };

  if (isLoading)
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-border-subtle border-t-orange rounded-full animate-spin" />
      </div>
    );

  if (!venue)
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center text-text-muted">
        Объект не найден
      </div>
    );

  const images = venue.images?.length > 0 ? venue.images : null;
  const bgGrad = BG_COLORS[venue.sportType] ?? BG_COLORS.other;

  // Проверка прав на редактирование
  const ownerId =
    typeof venue.owner === "object" ? (venue.owner as any)._id : venue.owner;
  const canEdit =
    isAuthenticated && (user?.role === "admin" || ownerId === user?.id);

    // Посмотри данные объекта
fetch('http://localhost:3000/api/venues/6a159f1e5114119a1eddf7cc')
  .then(r => r.json())
  .then(d => console.log('location:', d.location))

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Навигация */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                d="M19 12H5M12 5l-7 7 7 7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Назад
          </button>

          {canEdit && (
            <button
              onClick={() => navigate(`/venues/${id}/edit`)}
              className="flex items-center gap-2 text-sm text-text-primary bg-bg-secondary border border-border-subtle px-4 py-2 rounded-btn hover:border-orange hover:text-orange transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                  strokeLinecap="round"
                />
                <path
                  d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
                  strokeLinecap="round"
                />
              </svg>
              Редактировать
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left column */}
          <div className="lg:col-span-3 space-y-6">
            {/* Gallery */}
            <div className="relative rounded-card overflow-hidden bg-bg-secondary">
              {images ? (
                <>
                  <img
                    src={images[imgIdx]}
                    alt={venue.name}
                    className="w-full h-72 object-cover"
                  />
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={() =>
                          setImgIdx(
                            (i) => (i - 1 + images.length) % images.length,
                          )
                        }
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/60 border border-border-subtle rounded-full flex items-center justify-center hover:border-orange transition-colors"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          viewBox="0 0 24 24"
                        >
                          <path d="M15 18l-6-6 6-6" strokeLinecap="round" />
                        </svg>
                      </button>
                      <button
                        onClick={() =>
                          setImgIdx((i) => (i + 1) % images.length)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/60 border border-border-subtle rounded-full flex items-center justify-center hover:border-orange transition-colors"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          viewBox="0 0 24 24"
                        >
                          <path d="M9 18l6-6-6-6" strokeLinecap="round" />
                        </svg>
                      </button>
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {images.map((_: string, i: number) => (
                          <button
                            key={i}
                            onClick={() => setImgIdx(i)}
                            className={`h-1.5 rounded-full transition-all ${i === imgIdx ? "w-5 bg-orange" : "w-1.5 bg-white/30"}`}
                          />
                        ))}
                      </div>
                      <div className="absolute top-3 right-3 bg-black/60 border border-border-subtle rounded-lg px-2.5 py-1 text-xs text-text-secondary">
                        {imgIdx + 1} / {images.length}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div
                  className={`h-72 bg-gradient-to-br ${bgGrad} flex items-center justify-center`}
                >
                  <span className="text-6xl opacity-15">🏟️</span>
                </div>
              )}
            </div>

            {/* Info */}
            <div>
              <div className="flex items-start justify-between gap-4 mb-3">
                <h1 className="text-2xl font-extrabold tracking-tight">
                  {venue.name}
                </h1>
                <span className="bg-orange/10 text-orange border border-orange/30 text-xs font-semibold px-3 py-1.5 rounded flex-shrink-0">
                  {SPORT_LABELS[venue.sportType] ?? venue.sportType}
                </span>
              </div>

              <div className="flex flex-wrap gap-4 text-xs text-text-muted mb-4">
                <span className="flex items-center gap-1.5">
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                  </svg>
                  {venue.address}, {venue.city}
                </span>
                {venue.reviewsCount > 0 && (
                  <span className="flex items-center gap-1.5">
                    <span className="text-orange">★</span>
                    {venue.rating} · {venue.reviewsCount} отзывов
                  </span>
                )}
              </div>

              <p className="text-sm text-text-muted leading-relaxed mb-5">
                {venue.description}
              </p>

              {venue.amenities?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-5">
                  {venue.amenities.map((a: string) => (
                    <span
                      key={a}
                      className="bg-bg-secondary border border-border-subtle text-xs text-text-muted px-3 py-1.5 rounded-lg"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              )}

              {venue.location?.coordinates?.length === 2 && (
                <div className="mt-4">
                  <h2 className="text-base font-bold tracking-tight mb-3">
                    На карте
                  </h2>
                  <VenueMap
                    coordinates={venue.location.coordinates as [number, number]}
                    name={venue.name}
                    address={venue.address}
                  />
                </div>
              )}
            </div>

            {/* Reviews */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold tracking-tight">
                  Отзывы {reviews?.length ? `(${reviews.length})` : ""}
                </h2>
                {isAuthenticated && (
                  <button
                    onClick={() => setShowReviewForm((p) => !p)}
                    className="text-xs text-orange hover:opacity-80 transition-opacity"
                  >
                    + Оставить отзыв
                  </button>
                )}
              </div>

              {showReviewForm && (
                <div className="bg-bg-secondary border border-border-subtle rounded-card p-4 mb-4">
                  <div className="flex gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map((r) => (
                      <button
                        key={r}
                        onClick={() =>
                          setReviewForm((p) => ({ ...p, rating: r }))
                        }
                        className={`text-xl transition-colors ${reviewForm.rating >= r ? "text-orange" : "text-border-hover"}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  <textarea
                    className="w-full bg-bg-primary border border-border-subtle rounded-btn px-3 py-2.5 text-sm text-text-primary placeholder-text-ghost outline-none focus:border-orange transition-colors resize-none mb-3"
                    rows={3}
                    placeholder="Поделитесь впечатлениями (минимум 10 символов)..."
                    value={reviewForm.comment}
                    onChange={(e) =>
                      setReviewForm((p) => ({ ...p, comment: e.target.value }))
                    }
                  />
                  <Button
                    size="sm"
                    loading={reviewMutation.isPending}
                    onClick={() => reviewMutation.mutate()}
                  >
                    Отправить отзыв
                  </Button>
                </div>
              )}

              {reviews?.length === 0 && (
                <p className="text-sm text-text-muted py-4">
                  Отзывов пока нет. Будь первым!
                </p>
              )}

              <div className="space-y-3">
                {reviews?.map((r: Review) => (
                  <div
                    key={r._id}
                    className="bg-bg-secondary border border-border-subtle rounded-card p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-bg-card border border-border-subtle flex items-center justify-center text-xs font-semibold text-orange">
                          {r.user?.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-semibold">
                            {r.user?.name}
                          </div>
                          <div className="text-xs text-text-muted">
                            {new Date(r.createdAt).toLocaleDateString("ru-RU")}
                          </div>
                        </div>
                      </div>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <span
                            key={s}
                            className={`text-sm ${r.rating >= s ? "text-orange" : "text-border-hover"}`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-text-muted leading-relaxed">
                      {r.comment}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column — Booking */}
          <div className="lg:col-span-2">
            <div className="bg-bg-secondary border border-border-subtle rounded-card p-5 sticky top-24">
              <div className="flex items-baseline gap-2 mb-5">
                <span className="text-2xl font-extrabold text-orange">
                  {venue.pricePerHour.toLocaleString()}
                </span>
                <span className="text-sm text-text-muted">сом / час</span>
              </div>

              {/* Calendar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold">
                    {MONTH_NAMES[calMonth]} {calYear}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={prevMonth}
                      className="w-7 h-7 bg-bg-card border border-border-subtle rounded-lg flex items-center justify-center text-text-muted hover:border-orange hover:text-orange transition-colors"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path d="M15 18l-6-6 6-6" strokeLinecap="round" />
                      </svg>
                    </button>
                    <button
                      onClick={nextMonth}
                      className="w-7 h-7 bg-bg-card border border-border-subtle rounded-lg flex items-center justify-center text-text-muted hover:border-orange hover:text-orange transition-colors"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path d="M9 18l6-6-6-6" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-0.5 mb-1">
                  {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((d) => (
                    <div
                      key={d}
                      className="text-center text-xs text-text-ghost py-1"
                    >
                      {d}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-0.5">
                  {Array.from({ length: firstDay }).map((_, i) => (
                    <div key={`e-${i}`} />
                  ))}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const date = new Date(calYear, calMonth, day);
                    date.setHours(0, 0, 0, 0);
                    const isPast = date < today;
                    const isSelected =
                      formatDate(date) === formatDate(selectedDate);
                    const isToday = formatDate(date) === formatDate(today);
                    return (
                      <button
                        key={day}
                        disabled={isPast}
                        onClick={() => {
                          setSelectedDate(date);
                          setSelectedSlot(null);
                        }}
                        className={`h-8 w-full rounded-lg text-xs font-medium transition-all
                          ${isPast ? "text-text-ghost cursor-not-allowed" : ""}
                          ${isSelected ? "bg-orange text-white font-bold" : ""}
                          ${!isPast && !isSelected && isToday ? "border border-orange/40 text-orange" : ""}
                          ${!isPast && !isSelected && !isToday ? "text-text-secondary hover:bg-bg-card hover:text-text-primary" : ""}
                        `}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Slots */}
              <div className="mb-5">
                <div className="text-xs text-text-muted uppercase tracking-wider mb-2">
                  Слоты ·{" "}
                  {selectedDate.toLocaleDateString("ru-RU", {
                    day: "numeric",
                    month: "long",
                  })}
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {SLOTS.map((slot) => {
                    const taken = takenSlots.has(slot);
                    const isSelected = selectedSlot === slot;
                    return (
                      <button
                        key={slot}
                        disabled={taken}
                        onClick={() =>
                          setSelectedSlot(isSelected ? null : slot)
                        }
                        className={`py-2 rounded-lg text-xs font-medium transition-all border
                          ${taken ? "bg-bg-primary border-border-subtle text-text-ghost cursor-not-allowed" : ""}
                          ${isSelected ? "bg-orange/15 border-orange text-orange" : ""}
                          ${!taken && !isSelected ? "bg-bg-primary border-border-subtle text-text-secondary hover:border-orange hover:text-orange" : ""}
                        `}
                      >
                        {taken ? (
                          <span className="text-text-ghost">—</span>
                        ) : (
                          slot
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Summary */}
              {selectedSlot && (
                <div className="bg-bg-primary border border-border-subtle rounded-xl p-3 mb-4 text-xs space-y-1.5">
                  <div className="flex justify-between text-text-muted">
                    <span>Дата</span>
                    <span className="text-text-primary">
                      {selectedDate.toLocaleDateString("ru-RU")}
                    </span>
                  </div>
                  <div className="flex justify-between text-text-muted">
                    <span>Время</span>
                    <span className="text-text-primary">
                      {selectedSlot} —{" "}
                      {String(Number(selectedSlot.split(":")[0]) + 1).padStart(
                        2,
                        "0",
                      )}
                      :00
                    </span>
                  </div>
                  <div className="flex justify-between text-text-muted pt-1.5 border-t border-border-subtle">
                    <span>Итого</span>
                    <span className="text-orange font-bold">
                      {venue.pricePerHour.toLocaleString()} сом
                    </span>
                  </div>
                </div>
              )}

              {bookingSuccess && (
                <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-xs rounded-xl px-3 py-2.5 mb-3">
                  Бронь успешно создана!
                </div>
              )}

              {/* Level */}
              <div className="mb-4">
                <div className="text-xs text-text-muted uppercase tracking-wider mb-2">
                  Уровень игры
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { value: "casual", label: "Casual" },
                    { value: "amateur", label: "Amateur" },
                    { value: "competitive", label: "Pro" },
                  ].map((l) => (
                    <button
                      key={l.value}
                      onClick={() => setLevel(l.value as any)}
                      className={`py-2 rounded-lg text-xs font-medium border transition-all ${
                        level === l.value
                          ? "bg-orange/15 border-orange text-orange"
                          : "bg-bg-primary border-border-subtle text-text-muted hover:border-orange hover:text-orange"
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              {isAuthenticated ? (
                <>
                  <Button
                    size="lg"
                    disabled={!selectedSlot}
                    onClick={() => selectedSlot && setShowPayment(true)}
                  >
                    {selectedSlot ? "Забронировать" : "Выберите слот"}
                  </Button>
                  <PaymentModal
                    isOpen={showPayment}
                    onClose={() => setShowPayment(false)}
                    onSuccess={() => {
                      setShowPayment(false);
                      bookMutation.mutate();
                    }}
                    amount={venue.pricePerHour}
                    venueName={venue.name}
                    date={selectedDate.toLocaleDateString("ru-RU")}
                    time={
                      selectedSlot
                        ? `${selectedSlot} — ${String(Number(selectedSlot.split(":")[0]) + 1).padStart(2, "0")}:00`
                        : ""
                    }
                  />
                </>
              ) : (
                <Button size="lg" onClick={() => navigate("/login")}>
                  Войти для бронирования
                </Button>
              )}

              <p className="text-xs text-text-ghost text-center mt-3">
                Бесплатная отмена за 24 часа
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
