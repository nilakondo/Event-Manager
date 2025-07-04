import { IsEmail, IsNumber, IsString } from 'class-validator';

export class CreateAttendeeDto {
  @IsNumber()
  eventId: number;

  @IsNumber()
  ticketTypeId: number;

  @IsString()
  name: string;

  @IsEmail()
  email: string;
}
