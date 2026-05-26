import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { bookingsApi } from "../api/bookings";
import { useAuthStore } from "../store/authStore";
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

export const MyBookingsPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: bookings, isLoading } = useQuery({
    queryKey: ["my-bookings"],
    queryFn: bookingsApi.getMy,
    enabled: isAuthenticated,
  });

  const cancelMutation = useMutation({
    mutationFn: bookingsApi.cancel,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["my-bookings"] }),
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <p className="text-text-muted text-sm">
          Войдите чтобы видеть свои брони
        </p>
        <Button onClick={() => navigate("/login")}>Войти</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-extrabold tracking-tight mb-8">
          Мои бронирования
        </h1>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="bg-bg-secondary border border-border-subtle rounded-card h-28 animate-pulse"
              />
            ))}
          </div>
        ) : bookings?.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">📅</p>
            <p className="text-text-muted text-sm mb-6">
              У вас пока нет броней
            </p>
            <Button onClick={() => navigate("/")}>Найти объект</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings?.map((b: Booking) => {
              const status = getStatus(b);
              return (
                <div
                  key={b._id}
                  className="bg-bg-secondary border border-border-subtle rounded-card p-5 flex items-center justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3
                        className="text-sm font-semibold hover:text-orange cursor-pointer transition-colors truncate"
                        onClick={() => navigate(`/venues/${b.venue._id}`)}
                      >
                        {b.venue.name}
                      </h3>
                      <span
                        className={`text-xs px-2 py-0.5 rounded border flex-shrink-0 ${STATUS_COLORS[status]}`}
                      >
                        {STATUS_LABELS[status]}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-xs text-text-muted">
                      <span className="flex items-center gap-1">
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          viewBox="0 0 24 24"
                        >
                          <rect x="3" y="4" width="18" height="18" rx="2" />
                          <path
                            d="M16 2v4M8 2v4M3 10h18"
                            strokeLinecap="round"
                          />
                        </svg>
                        {new Date(b.date).toLocaleDateString("ru-RU", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          timeZone: "Asia/Bishkek",
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          viewBox="0 0 24 24"
                        >
                          <circle cx="12" cy="12" r="9" />
                          <path d="M12 6v6l4 2" strokeLinecap="round" />
                        </svg>
                        {b.startTime} — {b.endTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"
                            strokeLinecap="round"
                          />
                        </svg>
                        {b.totalPrice.toLocaleString()} сом
                      </span>
                    </div>
                  </div>

                  {status === "active" && (
                    <Button
                      variant="danger"
                      size="sm"
                      loading={cancelMutation.isPending}
                      onClick={() => cancelMutation.mutate(b._id)}
                    >
                      Отменить
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
