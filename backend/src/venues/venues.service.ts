import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Venue, VenueDocument } from './venue.schema';
import { CreateVenueDto } from './dto/create-venue.dto';
import { QueryVenueDto } from './dto/query-venue.dto';

@Injectable()
export class VenuesService {
  constructor(
    @InjectModel(Venue.name) private venueModel: Model<VenueDocument>,
  ) {}

  async create(dto: CreateVenueDto, ownerId: string): Promise<VenueDocument> {
    const { coordinates, ...rest } = dto as any;

    const venueData: any = {
      ...rest,
      owner: ownerId,
      images: dto.images ?? [],
    };

    if (coordinates && Array.isArray(coordinates) && coordinates.length === 2) {
      venueData.location = { type: 'Point', coordinates };
    }

    return this.venueModel.create(venueData);
  }

  async findAll(query: QueryVenueDto) {
    const filter: any = { isActive: true };

    if (query.search) filter.$text = { $search: query.search };
    if (query.city) filter.city = { $regex: query.city, $options: 'i' };
    if (query.sportType) filter.sportType = query.sportType;
    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      filter.pricePerHour = {};
      if (query.minPrice !== undefined)
        filter.pricePerHour.$gte = query.minPrice;
      if (query.maxPrice !== undefined)
        filter.pricePerHour.$lte = query.maxPrice;
    }
    if (query.minRating !== undefined)
      filter.rating = { $gte: query.minRating };

    const page = query.page ?? 1;
    const limit = query.limit ?? 12;
    const skip = (page - 1) * limit;

    const [venues, total] = await Promise.all([
      this.venueModel
        .find(filter)
        .skip(skip)
        .limit(limit)
        .populate('owner', 'name email'),
      this.venueModel.countDocuments(filter),
    ]);

    return { data: venues, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string): Promise<VenueDocument> {
    const venue = await this.venueModel
      .findById(id)
      .populate('owner', 'name email');
    if (!venue) throw new NotFoundException('Venue not found');
    return venue;
  }

  async update(
    id: string,
    dto: Partial<CreateVenueDto>,
    userId: string,
  ): Promise<VenueDocument> {
    const venue = await this.venueModel.findById(id);
    if (!venue) throw new NotFoundException('Venue not found');

    const ownerId = venue.owner?.toString();
    if (ownerId !== userId) throw new ForbiddenException('Not your venue');

    const { coordinates, ...rest } = dto as any;
    const updateData: any = { ...rest };

    if (coordinates && Array.isArray(coordinates) && coordinates.length === 2) {
      updateData.location = { type: 'Point', coordinates };
    }

    return this.venueModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true },
    ) as Promise<VenueDocument>;
  }

  async delete(id: string, userId: string): Promise<void> {
    const venue = await this.venueModel.findById(id);
    if (!venue) throw new NotFoundException('Venue not found');

    const ownerId = venue.owner?.toString();
    if (ownerId !== userId) throw new ForbiddenException('Not your venue');

    await this.venueModel.findByIdAndDelete(id);
  }

  async updateRating(
    venueId: string,
    avgRating: number,
    count: number,
  ): Promise<void> {
    await this.venueModel.findByIdAndUpdate(venueId, {
      rating: Math.round(avgRating * 10) / 10,
      reviewsCount: count,
    });
  }
}
