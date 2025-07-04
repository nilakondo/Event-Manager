import { MailerModule as BaseMailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { MailerService } from './mailer.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BaseMailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        // ✅ Add logs here to confirm values are loaded
        console.log('MAIL_USER:', config.get<string>('MAIL_USER'));
        console.log('MAIL_PASS:', config.get<string>('MAIL_PASS'));

        return {
          transport: {
            service: 'gmail',
            auth: {
              user: config.get<string>('MAIL_USER'),
              pass: config.get<string>('MAIL_PASS'),
            },
          },
          defaults: {
            from: `"Event App" <${config.get<string>('MAIL_USER')}>`,
          },
        };
      },
    }),
  ],
  providers: [MailerService],
  exports: [MailerService],
})
export class MailerModule {}
