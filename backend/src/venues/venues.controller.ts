import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { VenuesService } from './venues.service';
import { CreateVenueDto } from './dto/create-venue.dto';
import { QueryVenueDto } from './dto/query-venue.dto';

@Controller('venues')
export class VenuesController {
  constructor(private venuesService: VenuesService) {}

  @Get()
  findAll(@Query() query: QueryVenueDto) {
    return this.venuesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.venuesService.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(@Body() dto: CreateVenueDto, @Request() req: any) {
    return this.venuesService.create(dto, req.user.userId);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  update(
    @Param('id') id: string,
    @Body() dto: CreateVenueDto,
    @Request() req: any,
  ) {
    console.log('PUT venues called, user:', req.user);
    return this.venuesService.update(id, dto, req.user.userId);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  delete(@Param('id') id: string, @Request() req: any) {
    return this.venuesService.delete(id, req.user.userId);
  }
}
