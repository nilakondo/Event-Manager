import { IsEmail, IsEnum } from 'class-validator';
import { UserRole } from '../../entities/user.entity';

export class UpdateRoleDto {
  @IsEmail()
  email: string;

  @IsEnum(UserRole)
  role: UserRole;
}
