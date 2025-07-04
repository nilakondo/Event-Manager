import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from 'src/entities/notification.entity';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { Event } from 'src/entities/event.entity';
import { User } from 'src/entities/user.entity';
import { MailerModule } from '../mailer/mailer.module'; // ✅ import the module, not the service directly

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, Event, User]),
    MailerModule, // ✅ This allows MailerService to be injected
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
