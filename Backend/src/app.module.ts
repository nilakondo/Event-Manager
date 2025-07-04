import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { EventsModule } from './events/events.module';
import { TicketTypesModule } from './ticket-types/ticket-types.module';
import { AttendeesModule } from './attendees/attendees.module';
import { PdfModule } from './pdf/pdf.module';
import { CsvModule } from './csv/csv.module';
import { NotificationsModule } from './notifications/notifications.module';
import { MailerModule } from 'src/mailer/mailer.module';
import { VenuesModule } from './venues/venues.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // 👈 add this
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'root',
      database: 'eventdb',
      autoLoadEntities: true,
      synchronize: true, // Use only for development!
    }),
    AuthModule,
    UsersModule,
    EventsModule,
    TicketTypesModule,
    AttendeesModule,
    MailerModule,
    PdfModule,
    CsvModule,
    NotificationsModule,
    VenuesModule// Import other modules here
  ],
})
export class AppModule {}