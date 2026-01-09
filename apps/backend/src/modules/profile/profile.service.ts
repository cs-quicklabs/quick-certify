import { Injectable, NotFoundException } from '@nestjs/common';
import { UserEntity } from '@src/entities';
import { UpdateProfileDto } from './dto';
import { UserService } from '../user';

@Injectable()
export class ProfileService {
  constructor(private readonly userService: UserService) {}

  async updateProfile(userId: number, dto: UpdateProfileDto): Promise<UserEntity> {
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.userService.update(userId, dto);
  }
}
