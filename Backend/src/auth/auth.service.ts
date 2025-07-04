import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { OtpRequestDto } from './dto/otp-request.dto';
import { OtpVerifyDto } from './dto/otp-verify.dto';
import { ForgotPasswordDto } from './dto/forget-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { MailerService } from 'src/mailer/mailer.service';
import { Otp } from '../entities/otp.entity';
import { CompleteRegistrationDto } from './dto/complete-registration.dto';
import { randomInt } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Otp)
    private otpRepo: Repository<Otp>,
    private mailerService: MailerService,
  ) {}

  // User login
  async login(dto: LoginDto) {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, role: user.role };
    return { access_token: this.jwtService.sign(payload) };
  }

  // Send OTP for registration or password reset
  async sendOtp(dto: OtpRequestDto) {
    const otp = randomInt(100000, 999999).toString();
    await this.mailerService.sendOtpEmail(dto.email, otp);

    await this.otpRepo.save({ email: dto.email, name: dto.name, otp });
    return { message: 'OTP sent to Gmail. Please verify.' };
  }

  // Verify OTP during registration or password reset
  async verifyOtp(dto: OtpVerifyDto) {
    const otpRecord = await this.otpRepo.findOne({
      where: { email: dto.email },
      order: { createdAt: 'DESC' },
    });

    if (!otpRecord || otpRecord.otp !== dto.otp) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    const existingUser = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existingUser) throw new ConflictException('User already exists');

    return { message: 'OTP verified successfully, now complete your registration' };
  }

  // Forgot password, send OTP
  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user) throw new NotFoundException('Email not found');

    const otp = (Math.floor(100000 + Math.random() * 900000)).toString();
    await this.mailerService.sendOtpEmail(dto.email, otp);

    await this.otpRepo.save({ email: dto.email, otp });
    return { message: 'OTP sent to Gmail.' };
  }

  // Reset password after OTP verification
  async resetPassword(dto: ResetPasswordDto) {
    const otpRecord = await this.otpRepo.findOne({
      where: { email: dto.email },
      order: { createdAt: 'DESC' },
    });

    if (!otpRecord || otpRecord.otp !== dto.otp) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user) throw new NotFoundException('User not found');

    user.password = await bcrypt.hash(dto.newPassword, 10);
    await this.userRepo.save(user);

    return { message: 'Password successfully reset.' };
  }

  // Complete registration after OTP verification and name/password setup
async completeRegistration(dto: CompleteRegistrationDto) {
  const otpRecord = await this.otpRepo.findOne({
    where: { email: dto.email },
    order: { createdAt: 'DESC' },
  });

  if (!otpRecord || otpRecord.otp !== dto.otp) {
    throw new UnauthorizedException('Invalid or expired OTP');
  }

  const existingUser = await this.userRepo.findOne({ where: { email: dto.email } });
  if (existingUser) throw new ConflictException('User already exists');

  const userCount = await this.userRepo.count();
  const role = userCount === 0 ? UserRole.ADMIN : UserRole.USER;

  const hashedPassword = await bcrypt.hash(dto.password, 10);

  const user = this.userRepo.create({
    name: dto.name, // Ensure the frontend 'name' is passed here
    email: dto.email,
    password: hashedPassword,
    role,
  });

  await this.userRepo.save(user);
  return { message: `User registered as ${role}` };
}

}
