import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';

@Controller('events')
export class EventsController {
  constructor(private readonly service: EventsService) {}

  // ✅ Public: Fetch all events with optional filters
  @Get()
  getAll(
    @Query('date') date?: string,
    @Query('venueId') venueIdRaw?: string,
    @Query('location') location?: string,
  ) {
    const venueId =
      venueIdRaw && /^\d+$/.test(venueIdRaw) ? parseInt(venueIdRaw, 10) : undefined;
    return this.service.findAll(date, venueId, location);
  }

  // ✅ Public: Fetch a single event with its ticket types and venue (for registration page)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id); // 👈 Must load relations inside service
  }

  // ✅ Admin: Create event
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  create(@Body() dto: CreateEventDto) {
    return this.service.create(dto);
  }

  // ✅ Admin: Update event
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateEventDto) {
    return this.service.update(id, dto);
  }

  // ✅ Admin: Delete event
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
