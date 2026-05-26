import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VenuesController } from './venues.controller';
import { VenuesService } from './venues.service';
import { Venue, VenueSchema } from './venue.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Venue.name, schema: VenueSchema }])],
  controllers: [VenuesController],
  providers: [VenuesService],
  exports: [VenuesService],
})
export class VenuesModule {}