import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { bookingsApi } from "../api/bookings";
import { Button } from "../components/ui/Button";
import type { Booking } from "../types";

const getStatus = (booking: Booking) => {
  if (booking.status === "cancelled") return "cancelled";
  const bookingDate = new Date(booking.date);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return bookingDate < now ? "completed" : "active";
};

const STATUS_LABELS: Record<string, string> = {
  active: "Ожидается",
  cancelled: "Отменено",
  completed: "Завершено",
};

const STATUS_COLORS: Record<string, string> = {
  active: "text-orange bg-orange/10 border-orange/20",
  cancelled: "text-red-400 bg-red-400/10 border-red-400/20",
  completed: "text-text-muted bg-bg-card border-border-subtle",
};

export const ProfilePage = () => {
  const { user, logout, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const { data: bookings } = useQuery({
    queryKey: ["my-bookings"],
    queryFn: bookingsApi.getMy,
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    navigate("/login");
    return null;
  }

  const active = bookings?.filter((b) => getStatus(b) === "active") ?? [];
  const past =
    bookings?.filter(
      (b) => getStatus(b) === "completed" || getStatus(b) === "cancelled",
    ) ?? [];

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Profile header */}
        <div className="bg-bg-secondary border border-border-subtle rounded-card p-6 mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-orange/10 border border-orange/20 flex items-center justify-center text-xl font-extrabold text-orange">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">{user?.name}</h1>
              <p className="text-sm text-text-muted">{user?.email}</p>
              <span className="text-xs text-orange bg-orange/10 border border-orange/20 px-2 py-0.5 rounded mt-1 inline-block">
                {user?.role === "owner"
                  ? "Владелец"
                  : user?.role === "admin"
                    ? "Администратор"
                    : "Пользователь"}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              logout();
              navigate("/");
            }}
          >
            Выйти
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { n: bookings?.length ?? 0, l: "Всего броней" },
            { n: active.length, l: "Активных" },
            { n: past.length, l: "Завершённых" },
          ].map((s) => (
            <div
              key={s.l}
              className="bg-bg-secondary border border-border-subtle rounded-card p-4 text-center"
            >
              <div className="text-xl font-extrabold text-orange">{s.n}</div>
              <div className="text-xs text-text-muted mt-1">{s.l}</div>
            </div>
          ))}
        </div>

        {/* Active bookings */}
        {active.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-text-muted mb-3">
              Активные брони
            </h2>
            <div className="space-y-3">
              {active.map((b: Booking) => {
                const status = getStatus(b);
                return (
                  <div
                    key={b._id}
                    className="bg-bg-secondary border border-border-subtle rounded-card p-4 flex items-center justify-between gap-3 cursor-pointer hover:border-border-hover transition-colors"
                    onClick={() => navigate(`/venues/${b.venue._id}`)}
                  >
                    <div>
                      <div className="text-sm font-semibold mb-1">
                        {b.venue.name}
                      </div>
                      <div className="text-xs text-text-muted">
                        {new Date(b.date).toLocaleDateString("ru-RU", {
                          timeZone: "Asia/Bishkek",
                        })}{" "}
                        · {b.startTime} — {b.endTime}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-orange">
                        {b.totalPrice.toLocaleString()} сом
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded border ${STATUS_COLORS[status]}`}
                      >
                        {STATUS_LABELS[status]}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Past bookings */}
        {past.length > 0 && (
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-text-muted mb-3">
              История
            </h2>
            <div className="space-y-2">
              {past.map((b: Booking) => {
                const status = getStatus(b);
                return (
                  <div
                    key={b._id}
                    className="bg-bg-secondary border border-border-subtle rounded-card p-4 flex items-center justify-between gap-3 opacity-60"
                  >
                    <div>
                      <div className="text-sm font-semibold mb-1">
                        {b.venue.name}
                      </div>
                      <div className="text-xs text-text-muted">
                        {new Date(b.date).toLocaleDateString("ru-RU", {
                          timeZone: "Asia/Bishkek",
                        })}{" "}
                        · {b.startTime} — {b.endTime}
                      </div>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded border ${STATUS_COLORS[status]}`}
                    >
                      {STATUS_LABELS[status]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {bookings?.length === 0 && (
          <div className="text-center py-16">
            <p className="text-text-muted text-sm mb-4">
              У вас пока нет броней
            </p>
            <Button onClick={() => navigate("/")}>Найти объект</Button>
          </div>
        )}
      </div>
    </div>
  );
};
