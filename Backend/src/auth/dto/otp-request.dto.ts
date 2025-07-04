import { IsEmail, IsNotEmpty,  Matches } from 'class-validator';

export class OtpRequestDto {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @Matches(/^[a-zA-Z0-9._%+-]+@gmail\.com$/, {
    message: 'Only Gmail addresses are allowed',
  })
  email: string;
}

