import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Event } from './event.entity';
import { TicketType } from './ticket-type.entity';

@Entity()
export class Attendee {
  @PrimaryGeneratedColumn()
  id: number;



  @ManyToOne(() => TicketType)
  ticketType: TicketType;

  @Column()
  name: string;

  @Column()
  email: string;

  @CreateDateColumn()
  createdAt: Date;
  @ManyToOne(() => User, user => user.attendances)
user: User;

@ManyToOne(() => Event, event => event.attendees)
event: Event;

}
