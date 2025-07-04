import { Column, Entity, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Event } from './event.entity';

@Entity()
@Unique(['name', 'location']) // this enforces uniqueness at DB level

export class Venue {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  location: string;

  @OneToMany(() => Event, event => event.venue)
  events: Event[];
}
