import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Venue } from '../entities/venue.entity';
import { Repository } from 'typeorm';
import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/update-venue.dto';
import { Event } from '../entities/event.entity';

@Injectable()
export class VenuesService {
  constructor(
    @InjectRepository(Venue)
    private venueRepo: Repository<Venue>,
    @InjectRepository(Event)
    private eventRepo: Repository<Event>,
  ) {}

  async create(dto: CreateVenueDto) {
    const exists = await this.venueRepo.findOne({
      where: { name: dto.name, location: dto.location },
    });

    if (exists) {
      throw new ConflictException('Venue with this name and location already exists');
    }

    const venue = this.venueRepo.create(dto);
    return this.venueRepo.save(venue);
  }

  findAll() {
    return this.venueRepo.find();
  }

  async findAvailable(date: string) {
    const allVenues = await this.venueRepo.find({ relations: ['events'] });
    const available = allVenues.filter(venue =>
      !venue.events.some(event => event.date === date),
    );
    return available;
  }

  async update(id: number, dto: UpdateVenueDto) {
    const venue = await this.venueRepo.findOne({ where: { id } });
    if (!venue) throw new NotFoundException('Venue not found');

    Object.assign(venue, dto);
    return this.venueRepo.save(venue);
  }

  async remove(id: number) {
    const venue = await this.venueRepo.findOne({ where: { id } });
    if (!venue) throw new NotFoundException('Venue not found');

    return this.venueRepo.remove(venue);
  }
}
