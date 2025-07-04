import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VenuesService } from './venues.service';
import { VenuesController } from './venues.controller';
import { Venue } from '../entities/venue.entity';
import { Event } from '../entities/event.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Venue, Event])],
  controllers: [VenuesController],
  providers: [VenuesService],
  exports: [VenuesService],

})
export class VenuesModule {}
