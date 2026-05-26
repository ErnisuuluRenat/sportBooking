import client from "./client";
import type { Booking } from "../types";

export const bookingsApi = {
  create: (data: {
    venueId: string;
    date: string;
    startTime: string;
    endTime: string;
    notes?: string;
    level?: string;
  }) => client.post<Booking>("/bookings", data).then((r) => r.data),

  getMy: () => client.get<Booking[]>("/bookings/my").then((r) => r.data),

  getVenueBookings: (venueId: string, date?: string) =>
    client
      .get<Booking[]>(`/bookings/venue/${venueId}`, { params: { date } })
      .then((r) => r.data),

  cancel: (id: string) =>
    client.patch<Booking>(`/bookings/${id}/cancel`).then((r) => r.data),
};
