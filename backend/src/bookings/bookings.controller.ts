import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';

@Controller('bookings')
@UseGuards(AuthGuard('jwt'))
export class BookingsController {
  constructor(private bookingsService: BookingsService) {}

  @Post()
  create(@Body() dto: CreateBookingDto, @Request() req: any) {
    return this.bookingsService.create(dto, req.user.userId);
  }

  @Get('my')
  findMy(@Request() req: any) {
    return this.bookingsService.findMyBookings(req.user.userId);
  }

  @Get('venue/:venueId')
  findVenueBookings(@Param('venueId') venueId: string, @Query('date') date?: string) {
    return this.bookingsService.findVenueBookings(venueId, date);
  }

  @Patch(':id/cancel')
  cancel(@Param('id') id: string, @Request() req: any) {
    return this.bookingsService.cancel(id, req.user.userId);
  }
}