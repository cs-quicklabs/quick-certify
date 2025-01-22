import { Controller, Post, Body, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './models/user.model';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ 
    status: 201, 
    description: 'User successfully registered',
    type: User 
  })
  @ApiResponse({ 
    status: 409, 
    description: 'User with this email already exists' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - validation error' 
  })
  async register(@Body() createUserDto: CreateUserDto) {
    return await this.userService.register(createUserDto);
  }
}