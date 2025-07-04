import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { Event } from 'src/entities/event.entity';
import { Venue } from 'src/entities/venue.entity';
import { Attendee } from 'src/entities/attendee.entity'; // ✅ likely the missing one
import { MailerModule } from 'src/mailer/mailer.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Event, Venue, Attendee]), // ✅ Add all 3 if used
    MailerModule,
  ],
  controllers: [EventsController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
