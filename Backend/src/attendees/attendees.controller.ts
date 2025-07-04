import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseGuards,
  Req,
  ParseIntPipe,
  ForbiddenException,
} from '@nestjs/common';
import { AttendeesService } from './attendees.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';
import { Response } from 'express';
import { Res } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Controller('attendees')
export class AttendeesController {
  service: any;
  constructor(private readonly attendeeService: AttendeesService) {}

  // ✅ User: Register for event with ticket type
  @Post(':eventId/register/:ticketTypeId')
  @UseGuards(JwtAuthGuard)
  register(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Param('ticketTypeId', ParseIntPipe) ticketTypeId: number,
    @Req() req,
  ) {
    return this.attendeeService.register(req.user.sub, eventId, ticketTypeId);
  }

// ✅ Admin: View attendees of a specific event
@Get('event/:eventId')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
findByEvent(@Param('eventId', ParseIntPipe) eventId: number) {
  return this.attendeeService.findByEvent(eventId);
}


  // ✅ Admin: Remove attendee
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.attendeeService.remove(id);
  }

@Get(':eventId/export')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
async exportCsv(
  @Param('eventId', ParseIntPipe) eventId: number,
  @Res() res: Response,
) {
  const { path: filePath } = await this.attendeeService.exportCsv(eventId);

  // Stream file to client
  res.download(filePath, (err) => {
    if (err) {
      console.error('Error sending file:', err);
      res.status(500).send('Failed to send file');
    }
  });
}

@Get(':eventId/download')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
async downloadCsv(
  @Param('eventId', ParseIntPipe) eventId: number,
  @Res() res: Response
) {
  // Generate CSV first before download
  const { path: filePath } = await this.attendeeService.exportCsv(eventId);

  // Check if the file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: 'File not found' });
  }

  // Set headers for downloading the file
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="event-${eventId}-attendees.csv"`);

  // Stream the file to the client
  return res.sendFile(filePath);
}

@Get(':id/ticket')
@UseGuards(JwtAuthGuard)
async downloadTicketPdf(
  @Param('id', ParseIntPipe) id: number,
  @Res() res: Response,
  @Req() req,
) {
  const buffer = await this.attendeeService.getTicketPdfBuffer(id, req.user.sub);

  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="ticket-${id}.pdf"`,
  });

  return res.send(buffer);
}

// ✅ User: View their registered events
@Get('user/:userId')
@UseGuards(JwtAuthGuard)
findByUser(@Param('userId', ParseIntPipe) userId: number, @Req() req) {
  console.log('Token user ID:', req.user.sub);
console.log('Requested user ID:', userId);

if (+req.user.sub !== +userId) {
    throw new ForbiddenException('You are not allowed to view other users\' data');
  }

  return this.attendeeService.findByUserId(userId);
}


}
 