import client from "./client";
import type { VenueQuery, PaginatedVenues, Venue } from "../types";

export const venuesApi = {
  getAll: (params: VenueQuery) =>
    client.get<PaginatedVenues>("/venues", { params }).then((r) => r.data),

  getOne: (id: string) =>
    client.get<Venue>(`/venues/${id}`).then((r) => r.data),

  create: (data: FormData) =>
    client
      .post<Venue>("/venues", data, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data),

  update: (
    id: string,
    data: {
      name?: string;
      description?: string;
      sportType?: string;
      address?: string;
      city?: string;
      pricePerHour?: number;
      amenities?: string[];
      images?: string[];
      coordinates?: [number, number];
    },
  ) => client.put<Venue>(`/venues/${id}`, data).then((r) => r.data),

  createJson: (data: {
    name: string;
    description: string;
    sportType: string;
    address: string;
    city: string;
    pricePerHour: number;
    amenities: string[];
    images: string[];
    coordinates?: [number, number];
  }) => client.post<Venue>("/venues", data).then((r) => r.data),
  delete: (id: string) => client.delete(`/venues/${id}`).then((r) => r.data),
};
