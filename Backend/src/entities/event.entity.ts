import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Venue } from './venue.entity';
import { TicketType } from './ticket-type.entity';
import { Attendee } from './attendee.entity';

@Entity()
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column()
  date: string; // 'YYYY-MM-DD'

  @Column()
  time: string; // 'HH:mm'

  @ManyToOne(() => Venue, venue => venue.events, { eager: true })
  venue: Venue;

  @OneToMany(() => TicketType, ticket => ticket.event)
  ticketTypes: TicketType[];
    
@Column({ nullable: true })
bannerUrl?: string;

@OneToMany(() => Attendee, attendee => attendee.event)
attendees: Attendee[];


}
