import {
  IsString,
  IsNumber,
  IsEnum,
  IsArray,
  IsOptional,
  Min,
} from 'class-validator';

export class CreateVenueDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsEnum([
    'football',
    'basketball',
    'tennis',
    'volleyball',
    'swimming',
    'gym',
    'other',
  ])
  sportType: string;

  @IsString()
  address: string;

  @IsString()
  city: string;

  @IsNumber()
  @Min(0)
  pricePerHour: number;

  @IsArray()
  @IsOptional()
  amenities?: string[];

  @IsArray()
  @IsOptional()
  coordinates?: number[];

  @IsArray()
  @IsOptional()
  images?: string[];
}
