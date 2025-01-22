import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { User } from './models/user.model';


@Injectable()
export class UserService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<any> {
    const existingUser = await this.userModel.findOne({
      where: { email: createUserDto.email },
    });

    console.log("Huihuihui", existingUser)

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = await this.userModel.create({
      ...createUserDto,
      password: hashedPassword,
    });

    const { password, ...result } = user.get({ plain: true });
    return result as User;
  }
}