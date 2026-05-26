import { IsString, IsDateString, IsMongoId, IsOptional } from 'class-validator';

export class CreateBookingDto {
  @IsMongoId()
  venueId: string;

  @IsDateString()
  date: string;

  @IsString()
  startTime: string;

  @IsString()
  endTime: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  level?: string;
}
