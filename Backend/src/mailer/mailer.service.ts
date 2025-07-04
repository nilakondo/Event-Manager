import { Injectable } from '@nestjs/common';
import { MailerService as NestMailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailerService {
  constructor(private readonly mailerService: NestMailerService) {}

  async sendOtpEmail(to: string, otp: string) {
    return await this.mailerService.sendMail({
      to,
      subject: 'OTP Verification - Event App',
      text: `Your OTP is: ${otp}`,
    });
  }

  async sendTicketEmail(to: string, pdfBuffer: Buffer) {
    return await this.mailerService.sendMail({
      to,
      subject: 'Your Event Ticket',
      text: 'Attached is your ticket for the event.',
      attachments: [
        {
          filename: 'ticket.pdf',
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });
  }

  async sendRemovalEmail(to: string) {
    return await this.mailerService.sendMail({
      to,
      subject: 'Registration Cancelled',
      text: 'You have been removed from the event registration list.',
    });
  }

  async sendEventDeletionEmail(email: string, eventTitle: string) {
    return await this.mailerService.sendMail({
      to: email,
      subject: `Event Canceled: ${eventTitle}`,
      text: `We regret to inform you that the event "${eventTitle}" has been canceled.`,
    });
  }

  async sendGenericEmail(to: string, subject: string, message: string) {
    return await this.mailerService.sendMail({
      to,
      subject,
      text: message,
    });
  }
}
