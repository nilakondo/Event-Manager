import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Event } from './event.entity';
import { User } from './user.entity';

@Entity()
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  message: string;

  @ManyToOne(() => Event, { onDelete: 'CASCADE' })
  event: Event;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  recipient: User;

  @CreateDateColumn()
  createdAt: Date;
}
