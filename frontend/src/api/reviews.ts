import client from './client'
import type { Review } from '../types'

export const reviewsApi = {
  getByVenue: (venueId: string) =>
    client.get<Review[]>(`/reviews/venue/${venueId}`).then(r => r.data),

  create: (data: { venueId: string; rating: number; comment: string }) =>
    client.post<Review>('/reviews', data).then(r => r.data),
}