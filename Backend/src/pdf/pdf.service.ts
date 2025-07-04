import { Injectable } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import * as QRCode from 'qrcode';
import { Attendee } from 'src/entities/attendee.entity';

@Injectable()
export class PdfService {
  async generateTicketPdf(attendee: Attendee): Promise<Buffer> {
    const doc = new PDFDocument({
      size: 'A6',
      margin: 30,
    });

    const buffers: Buffer[] = [];
    doc.on('data', buffers.push.bind(buffers));

    return new Promise(async (resolve) => {
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });

      // Generate QR Code (can encode email+event or a ticketId URL)
      const qrData = `Ticket for ${attendee.user.email} | ${attendee.event.title}`;
      const qrImage = await QRCode.toDataURL(qrData);

      // ✅ Border & Header
      doc.rect(10, 10, doc.page.width - 20, doc.page.height - 20).stroke('#333');

      doc.fillColor('#ffffff')
        .rect(10, 10, doc.page.width - 20, 40)
        .fill('#2E86C1');

      doc.fillColor('#ffffff')
        .fontSize(18)
        .font('Helvetica-Bold')
        .text('🎫 Event Ticket', 20, 20, { align: 'left' });

      doc.moveDown(2);
      doc.fillColor('#000').fontSize(12).font('Helvetica');

      // ✅ Ticket Details
      doc.text(`👤 Name: ${attendee.user.name}`);
      doc.text(`📧 Email: ${attendee.user.email}`);
      doc.moveDown(0.5);
      doc.text(`📍 Event: ${attendee.event.title}`);
      doc.text(`🏟️ Venue: ${attendee.event.venue.name}`);
      doc.text(`📅 Date: ${attendee.event.date}`);
      doc.text(`⏰ Time: ${attendee.event.time}`);
      doc.moveDown(0.5);
      doc.text(`🎟️ Ticket Type: ${attendee.ticketType.name}`);

      // ✅ Insert QR Code
      const imgSize = 80;
      const imgX = (doc.page.width - imgSize) / 2;
      doc.image(qrImage, imgX, doc.y + 10, { width: imgSize });

      // ✅ Footer
      doc
        .moveDown(6)
        .fontSize(10)
        .fillColor('#888')
        .text('Please bring this ticket to the event.', {
          align: 'center',
        });

      doc.end();
    });
  }
}
