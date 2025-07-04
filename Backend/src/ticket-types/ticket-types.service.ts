import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TicketType } from '../entities/ticket-type.entity';
import { Repository } from 'typeorm';
import { CreateTicketTypeDto } from './dto/create-ticket-type.dto';
import { UpdateTicketTypeDto } from './dto/update-ticket-type.dto';
import { Event } from '../entities/event.entity';

@Injectable()
export class TicketTypesService {
  constructor(
    @InjectRepository(TicketType)
    private ticketRepo: Repository<TicketType>,
    @InjectRepository(Event)
    private eventRepo: Repository<Event>,
  ) {}

  async create(dto: CreateTicketTypeDto) {
    const event = await this.eventRepo.findOne({ where: { id: dto.eventId } });
    if (!event) throw new NotFoundException('Event not found');

    const ticket = this.ticketRepo.create({ ...dto, event });
    return this.ticketRepo.save(ticket);
  }

  findAll() {
    return this.ticketRepo.find({ relations: ['event'] });
  }

  findByEvent(eventId: number) {
    return this.ticketRepo.find({
      where: { event: { id: eventId } },
    });
  }

  async update(id: number, dto: UpdateTicketTypeDto) {
    const ticket = await this.ticketRepo.findOne({ where: { id } });
    if (!ticket) throw new NotFoundException('Ticket type not found');

    Object.assign(ticket, dto);
    return this.ticketRepo.save(ticket);
  }

  async remove(id: number) {
    const ticket = await this.ticketRepo.findOne({ where: { id } });
    if (!ticket) throw new NotFoundException('Ticket type not found');

    return this.ticketRepo.remove(ticket);
  }
}
