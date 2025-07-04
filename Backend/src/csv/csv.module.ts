import { Module } from '@nestjs/common';
import { CsvService } from './csv.service';

@Module({
  providers: [CsvService]
})
export class CsvModule {}
