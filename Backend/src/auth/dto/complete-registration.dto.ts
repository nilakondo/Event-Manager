import { IsEmail, IsNotEmpty, IsString, Length, MinLength } from "class-validator";

export class CompleteRegistrationDto {
  @IsEmail()
  email: string;
  @IsString()
  @MinLength(1)
  name: string;
  @IsNotEmpty()
  @Length(6, 6)
  otp: string;

  @MinLength(6)
  password: string;
}
