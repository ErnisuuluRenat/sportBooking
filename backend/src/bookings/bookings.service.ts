import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Booking, BookingDocument } from './booking.schema';
import { Venue, VenueDocument } from '../venues/venue.schema';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    @InjectModel(Venue.name) private venueModel: Model<VenueDocument>,
  ) {}

  async create(
    dto: CreateBookingDto,
    userId: string,
  ): Promise<BookingDocument> {
    const venue = await this.venueModel.findById(dto.venueId);
    if (!venue) throw new NotFoundException('Venue not found');

    const conflict = await this.bookingModel.findOne({
      venue: dto.venueId,
      date: new Date(dto.date),
      status: { $in: ['active'] },
      $or: [
        { startTime: { $lt: dto.endTime }, endTime: { $gt: dto.startTime } },
      ],
    });

    if (conflict)
      throw new BadRequestException('This time slot is already booked');

    const hours = this.calcHours(dto.startTime, dto.endTime);
    const totalPrice = hours * venue.pricePerHour;

    return this.bookingModel.create({
      venue: dto.venueId,
      user: userId,
      date: new Date(dto.date),
      startTime: dto.startTime,
      endTime: dto.endTime,
      totalPrice,
      notes: dto.notes,
    });
  }

  async findMyBookings(userId: string): Promise<BookingDocument[]> {
    return this.bookingModel
      .find({ user: userId })
      .populate('venue', 'name address city pricePerHour')
      .sort({ date: -1 });
  }

  async findVenueBookings(venueId: string, date?: string) {
    const filter: any = {
      venue: venueId,
      status: { $in: ['pending', 'confirmed'] },
    };
    if (date) filter.date = new Date(date);
    return this.bookingModel
      .find(filter)
      .select('date startTime endTime status');
  }

  async cancel(id: string, userId: string): Promise<BookingDocument> {
    const booking = await this.bookingModel.findById(id);
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.user.toString() !== userId)
      throw new BadRequestException('Not your booking');
    if (booking.status === 'cancelled')
      throw new BadRequestException('Already cancelled');
    return this.bookingModel.findByIdAndUpdate(
      id,
      { status: 'cancelled' },
      { new: true },
    ) as Promise<BookingDocument>;
  }

  private calcHours(start: string, end: string): number {
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    return (eh * 60 + em - (sh * 60 + sm)) / 60;
  }
}
