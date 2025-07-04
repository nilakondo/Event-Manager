import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Otp } from '../entities/otp.entity'; // ✅ Add this import
import { JwtStrategy } from './jwt.strategy';
import { MailerModule } from '../mailer/mailer.module'; // ✅ Add this too if not already
import { UsersModule } from '../users/users.module'; // ✅ Import this

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Otp]), // ✅ Add Otp entity
    PassportModule,
    JwtModule.register({
      secret: 'your_jwt_secret', // Use env vars in prod
      signOptions: { expiresIn: '1d' },
    }),
    MailerModule,
    UsersModule // ✅ So MailerService works
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
