// src/auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service'; // adjust path if needed
import { User } from '../entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'your_jwt_secret', // Replace with process.env.JWT_SECRET in real apps
    });
  }

async validate(payload: any): Promise<Partial<User> & { sub: number }> {
  console.log('🔑 JwtStrategy → Decoded Payload:', payload); // Log the decoded JWT payload

  const user = await this.usersService.findById(payload.sub);
  if (!user) {
    throw new UnauthorizedException('User not found');
  }

  return {
    sub: user.id, // Ensure the correct user ID is returned
    email: user.email,
    name: user.name,  // Add name if needed for other use cases
    role: user.role,
  };
}

}
