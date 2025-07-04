import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateEventDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  date: string;

  @IsString()
  time: string;

  @IsNotEmpty()
  venueId: number;

  @IsOptional()
  @IsString()
  bannerUrl?: string; // 👈 added
}
