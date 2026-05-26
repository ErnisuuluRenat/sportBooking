import { IsString, IsNumber, IsMongoId, Min, Max, MinLength } from 'class-validator';

export class CreateReviewDto {
  @IsMongoId()
  venueId: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @MinLength(10)
  comment: string;
}