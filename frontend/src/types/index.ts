export interface User {
  id: string
  name: string
  email: string
  role: 'user' | 'owner' | 'admin'
  avatar?: string
}

export interface Venue {
  _id: string
  name: string
  description: string
  sportType: string
  address: string
  city: string
  pricePerHour: number
  images: string[]
  amenities: string[]
  rating: number
  reviewsCount: number
  isActive: boolean
  owner: { _id: string; name: string; email: string }
  location?: { type: string; coordinates: number[] }
}

export interface Booking {
  _id: string
  venue: Venue
  user: string
  date: string
  startTime: string
  endTime: string
  totalPrice: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  notes?: string
}

export interface Review {
  _id: string
  venue: string
  user: { _id: string; name: string; avatar?: string }
  rating: number
  comment: string
  createdAt: string
}

export interface VenueQuery {
  search?: string
  city?: string
  sportType?: string
  minPrice?: number
  maxPrice?: number
  minRating?: number
  page?: number
  limit?: number
}

export interface PaginatedVenues {
  data: Venue[]
  total: number
  page: number
  totalPages: number
}