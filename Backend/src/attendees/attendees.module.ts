import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attendee } from '../entities/attendee.entity';
import { TicketType } from '../entities/ticket-type.entity';
import { Event } from '../entities/event.entity';
import { AttendeesService } from './attendees.service';
import { AttendeesController } from './attendees.controller';
import { PdfService } from 'src/pdf/pdf.service';
import { MailerService } from 'src/mailer/mailer.service';
import { CsvService } from '../csv/csv.service';
import { User } from '../entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Attendee,User, Event, TicketType])],
  controllers: [AttendeesController],
  providers: [AttendeesService, PdfService, MailerService, CsvService],
})
export class AttendeesModule {}
