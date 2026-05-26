import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type VenueDocument = Venue & Document;

@Schema({ timestamps: true })
export class Venue {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({
    required: true,
    enum: [
      'football',
      'basketball',
      'tennis',
      'volleyball',
      'swimming',
      'gym',
      'other',
    ],
  })
  sportType: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true, min: 0 })
  pricePerHour: number;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ type: [String], default: [] })
  amenities: string[];

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  owner: Types.ObjectId;

  @Prop({ default: 0, min: 0, max: 5 })
  rating: number;

  @Prop({ default: 0 })
  reviewsCount: number;

  @Prop({ default: true })
  isActive: boolean;
}

export const VenueSchema = SchemaFactory.createForClass(Venue);

VenueSchema.add({
  location: {
    type: { type: String, enum: ['Point'] },
    coordinates: { type: [Number] },
  },
} as any);

VenueSchema.index({ location: '2dsphere' }, { sparse: true });
VenueSchema.index({ name: 'text', description: 'text', city: 'text' });
