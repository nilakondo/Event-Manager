import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async findAll() {
    return this.userRepo.find({ select: ['id', 'name', 'email', 'role'] });
  }

async updateRole(dto: UpdateRoleDto) {
  try {
    const user = await this.userRepo.findOneOrFail({ where: { email: dto.email } });
    user.role = dto.role;
    return this.userRepo.save(user);
  } catch (error) {
    throw new NotFoundException('User not found');
  }
}

async deleteUser(email: string) {
  try {
    const user = await this.userRepo.findOneOrFail({ where: { email } });
    return this.userRepo.remove(user);
  } catch (error) {
    throw new NotFoundException('User not found');
  }
}

async findById(id: number) {
  return this.userRepo.findOne({ where: { id } });
}

}
