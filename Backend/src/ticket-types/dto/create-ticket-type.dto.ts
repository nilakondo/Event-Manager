import { IsNumber, IsString } from 'class-validator';

export class CreateTicketTypeDto {
  @IsString()
  name: string;

  @IsNumber()
  price: number;

  @IsNumber()
  quantity: number;

  @IsNumber()
  eventId: number;
}
