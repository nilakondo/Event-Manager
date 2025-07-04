import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendee } from '../entities/attendee.entity';
import { Event } from '../entities/event.entity';
import { TicketType } from '../entities/ticket-type.entity';
import { User } from '../entities/user.entity';
// For PDF generation & mailing
import { PdfService } from 'src/pdf/pdf.service';
import { MailerService } from 'src/mailer/mailer.service';
import { CsvService } from 'src/csv/csv.service'; // add import

@Injectable()
export class AttendeesService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(Attendee)
    private attendeeRepo: Repository<Attendee>,
    @InjectRepository(Event)
    private eventRepo: Repository<Event>,
    @InjectRepository(TicketType)
    private ticketRepo: Repository<TicketType>,
    private pdfService: PdfService,
    private mailerService: MailerService,
    private csvService: CsvService, // inject service
  ) {}

async register(userId: number, eventId: number, ticketTypeId: number) {
  const user = await this.userRepo.findOne({ where: { id: userId } });
  if (!user) throw new NotFoundException('User not found');

  const event = await this.eventRepo.findOne({ where: { id: eventId }, relations: ['venue'] });
  const ticket = await this.ticketRepo.findOne({ where: { id: ticketTypeId } });

  if (!event || !ticket) throw new NotFoundException('Event or Ticket not found');

  // ✅ Prevent duplicate registration
  const alreadyRegistered = await this.attendeeRepo.findOne({
    where: {
      user: { id: userId },
      event: { id: eventId },
    },
  });

  if (alreadyRegistered) {
    throw new ForbiddenException('You have already registered for this event.');
  }

  if (ticket.quantity <= 0) {
    throw new ForbiddenException('No seats available for this ticket type');
  }

  const attendee = this.attendeeRepo.create({
    user,
    event,
    ticketType: ticket,
    email: user.email,
    name: user.name,
  });

  const savedAttendee = await this.attendeeRepo.save(attendee);

  const fullAttendee = await this.attendeeRepo.findOne({
    where: { id: savedAttendee.id },
    relations: ['user', 'event', 'event.venue', 'ticketType'],
  });

  if (!fullAttendee) {
    throw new NotFoundException('Attendee details not found');
  }

  ticket.quantity -= 1;
  await this.ticketRepo.save(ticket);

  const pdfBuffer = await this.pdfService.generateTicketPdf(fullAttendee);
  await this.mailerService.sendTicketEmail(user.email, pdfBuffer);

  return { message: 'Registration successful, ticket emailed.' };
}


  async findAll() {
    return this.attendeeRepo.find({ relations: ['event', 'ticketType', 'user'] });
  }

async remove(id: number) {
  const attendee = await this.attendeeRepo.findOne({
    where: { id },
    relations: ['ticketType', 'user'], // ✅ added 'user' relation
  });

  if (!attendee) {
    throw new NotFoundException('Attendee not found');
  }

  // Return ticket and notify user
  attendee.ticketType.quantity += 1;
  await this.ticketRepo.save(attendee.ticketType);

  await this.mailerService.sendRemovalEmail(attendee.user.email); // ✅ now safe
  return this.attendeeRepo.remove(attendee);
}


  async exportCsv(eventId: number) {
    const attendees = await this.attendeeRepo.find({
      where: { event: { id: eventId } },
      relations: ['ticketType'],
    });

    const data = attendees.map((att) => ({
      name: att.name,
      email: att.email,
      ticketType: att.ticketType?.name,
      registeredAt: att.createdAt.toISOString(),
    }));

    const filePath = await this.csvService.generateAttendeeCsv(data, eventId);
    return { message: 'CSV generated', path: filePath };
  }

  async findByUserId(userId: number) {
    return this.attendeeRepo.find({
      where: { user: { id: userId } },
      relations: ['event', 'ticketType', 'event.venue'],
      order: { createdAt: 'DESC' },
    });
  }
async getTicketPdfBuffer(attendeeId: number, userId: number): Promise<Buffer> {
  const attendee = await this.attendeeRepo.findOne({
    where: {
      id: attendeeId,
      user: { id: userId }, // ensure ownership
    },
    relations: ['event', 'event.venue', 'ticketType', 'user'],
  });

  if (!attendee) {
    throw new NotFoundException('Ticket not found or access denied');
  }

  return this.pdfService.generateTicketPdf(attendee);
}
async findByEvent(eventId: number) {
  return this.attendeeRepo.find({
    where: { event: { id: eventId } },
    relations: ['user', 'ticketType'],
    order: { createdAt: 'DESC' },
  });
}


}
