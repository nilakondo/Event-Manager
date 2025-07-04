import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../entities/notification.entity';
import { Event } from '../entities/event.entity';
import { User } from '../entities/user.entity';
import { MailerService } from '../mailer/mailer.service';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,
    @InjectRepository(Event)
    private eventRepo: Repository<Event>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private mailerService: MailerService,
  ) {}

  async sendNotificationToAttendees(eventId: number, message: string) {
    const event = await this.eventRepo.findOne({ where: { id: eventId }, relations: ['attendees'] });
    if (!event) throw new NotFoundException('Event not found');

    const attendees = await this.userRepo
      .createQueryBuilder('user')
      .innerJoin('user.attendances', 'attendee', 'attendee.eventId = :eventId', { eventId })
      .getMany();

    for (const user of attendees) {
      const notification = this.notificationRepo.create({
        message,
        event,
        recipient: user,
      });
      await this.notificationRepo.save(notification);

      await this.mailerService.sendGenericEmail(user.email, 'Event Notification', message);
    }

    return { message: 'Notification sent to all attendees.' };
  }

  async getUserNotifications(userId: number) {
    return this.notificationRepo.find({
      where: { recipient: { id: userId } },
      relations: ['event'],
      order: { createdAt: 'DESC' },
    });
  }

async getSingleNotification(id: number, userId: number) {
  console.log('🔍 Service → Looking for notification ID:', id, 'for user ID:', userId);

  const notification = await this.notificationRepo.findOne({
    where: {
      id,
      recipient: { id: userId }, // Make sure the notification belongs to the correct user
    },
    relations: ['event'],
  });

  if (!notification) {
    console.log('❌ Notification not found or not owned by this user');
    throw new NotFoundException('Notification not found or access denied');
  }

  console.log('✅ Notification found:', notification);
  return notification;
}




}
