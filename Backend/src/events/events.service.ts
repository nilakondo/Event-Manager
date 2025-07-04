import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Event } from '../entities/event.entity';
import { Repository } from 'typeorm';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Venue } from '../entities/venue.entity';
import { MailerService } from 'src/mailer/mailer.service';
import { Attendee } from 'src/entities/attendee.entity';

@Injectable()
export class EventsService {
  repo: any;
  constructor(
    @InjectRepository(Event)
    private eventRepo: Repository<Event>,
    @InjectRepository(Venue)
    private venueRepo: Repository<Venue>,
    @InjectRepository(Attendee)
    private attendeeRepo: Repository<Attendee>,
    private mailerService: MailerService,
  ) {}

  async create(dto: CreateEventDto) {
    const venue = await this.venueRepo.findOne({ where: { id: dto.venueId } });
    if (!venue) throw new NotFoundException('Venue not found');

    const existingEvent = await this.eventRepo.findOne({
      where: {
        venue: { id: dto.venueId },
        date: dto.date,
      },
    });

    if (existingEvent) {
      throw new ConflictException(
        'This venue is already booked on the selected date.',
      );
    }

    const event = this.eventRepo.create({ ...dto, venue });
    return this.eventRepo.save(event);
  }

  async findAll(date?: string, venueId?: number, location?: string) {
    const query = this.eventRepo
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.venue', 'venue')
      .leftJoinAndSelect('event.ticketTypes', 'ticketTypes')
      .leftJoinAndSelect('event.attendees', 'attendees')
      .leftJoinAndSelect('attendees.ticketType', 'attendeeTicket');

    if (date) {
      query.andWhere('event.date = :date', { date });
    }

    if (venueId) {
      query.andWhere('venue.id = :venueId', { venueId });
    }

    if (location) {
      query.andWhere('LOWER(venue.location) LIKE :location', {
        location: `%${location.toLowerCase()}%`,
      });
    }

    const events = await query.getMany();

    return events.map((event) => {
      const { attendees, ...rest } = event;

      const totalTickets = (event.ticketTypes || []).reduce(
        (sum, type) => sum + type.quantity,
        0,
      );

      const registeredCount = (attendees || []).length;
      const remainingTickets = Math.max(totalTickets - registeredCount, 0);

      const visibleTicketTypes = (event.ticketTypes || [])
        .map((ticketType) => {
          const registeredForThisType = (attendees || []).filter(
            (attendee) => attendee.ticketType?.id === ticketType.id,
          ).length;

          const ticketRemaining = Math.max(
            ticketType.quantity - registeredForThisType,
            0,
          );

          return {
            ...ticketType,
            registeredCount: registeredForThisType,
            remainingTickets: ticketRemaining,
          };
        })
        .filter((ticketType) => ticketType.remainingTickets > 0); // Hide sold-out ticket types

      return {
        ...rest,
        registeredCount,
        remainingTickets,
        ticketTypes: visibleTicketTypes,
      };
    });
  }

  async update(id: number, dto: UpdateEventDto) {
    const event = await this.eventRepo.findOne({ where: { id } });
    if (!event) throw new NotFoundException('Event not found');

    Object.assign(event, dto);
    return this.eventRepo.save(event);
  }

  async remove(id: number) {
    const event = await this.eventRepo.findOne({
      where: { id },
      relations: ['attendees', 'attendees.user'],
    });

    if (!event) throw new NotFoundException('Event not found');

    const attendeeEmails = event.attendees.map(
      (attendee) => attendee.user.email,
    );

    await this.eventRepo.remove(event);

    for (const email of attendeeEmails) {
      await this.mailerService.sendEventDeletionEmail(email, event.title);
    }

    return { message: 'Event deleted and attendees notified.' };
  }

async findOne(id: number) {
  const event = await this.eventRepo.findOne({
    where: { id },
    relations: ['venue', 'ticketTypes'],
  });

  if (!event) throw new NotFoundException('Event not found');

  return event;
}

  
}
