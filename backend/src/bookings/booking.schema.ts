import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BookingDocument = Booking & Document;

@Schema({ timestamps: true })
export class Booking {
  @Prop({ type: Types.ObjectId, ref: 'Venue', required: true })
  venue: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  startTime: string;

  @Prop({ required: true })
  endTime: string;

  @Prop({ required: true, min: 0 })
  totalPrice: number;

  @Prop({ enum: ['active', 'cancelled', 'completed'], default: 'active' })
  status: string;

  @Prop()
  notes?: string;
  @Prop({ enum: ['casual', 'amateur', 'competitive'], default: 'casual' })
  level: string;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
