import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { createObjectCsvWriter } from 'csv-writer';

@Injectable()
export class CsvService {
  async generateAttendeeCsv(attendees: any[], eventId: number): Promise<string> {
    const exportsDir = path.join(__dirname, '../../exports');

    // 🔧 Create exports folder if it doesn't exist
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir);
    }

    const filePath = path.join(exportsDir, `event-${eventId}-attendees.csv`);

    const csvWriter = createObjectCsvWriter({
      path: filePath,
      header: [
        { id: 'name', title: 'Name' },
        { id: 'email', title: 'Email' },
        { id: 'ticketType', title: 'Ticket Type' },
        { id: 'registeredAt', title: 'Registered At' },
      ],
    });

    await csvWriter.writeRecords(attendees);

    return filePath;
  }
}

