import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Review, ReviewDocument } from './review.schema';
import { Venue, VenueDocument } from '../venues/venue.schema';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
    @InjectModel(Venue.name) private venueModel: Model<VenueDocument>,
  ) {}

  async create(dto: CreateReviewDto, userId: string): Promise<ReviewDocument> {
    const venue = await this.venueModel.findById(dto.venueId);
    if (!venue) throw new NotFoundException('Venue not found');

    const exists = await this.reviewModel.findOne({ venue: dto.venueId, user: userId });
    if (exists) throw new ConflictException('You already reviewed this venue');

    const review = await this.reviewModel.create({
      venue: dto.venueId,
      user: userId,
      rating: dto.rating,
      comment: dto.comment,
    });

    await this.recalcRating(dto.venueId);
    return review;
  }

  async findByVenue(venueId: string): Promise<ReviewDocument[]> {
    return this.reviewModel
      .find({ venue: venueId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });
  }

  private async recalcRating(venueId: string): Promise<void> {
    const result = await this.reviewModel.aggregate([
      { $match: { venue: { $eq: venueId } } },
      { $group: { _id: '$venue', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);

    if (result.length > 0) {
      const { avgRating, count } = result[0];
      await this.venueModel.findByIdAndUpdate(venueId, {
        rating: Math.round(avgRating * 10) / 10,
        reviewsCount: count,
      });
    }
  }
}