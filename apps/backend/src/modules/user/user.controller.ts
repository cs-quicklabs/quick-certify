import { Controller, Post, Body, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { UserService } from './user.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ApiResponse as ApiResponseDto } from '@/common/dto';

@ApiTags('Users')
@Controller({
  path: 'users',
  version: '1',
})
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User successfully registered',
    type: ApiResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'User with this email already exists',
    type: ApiResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request - validation error',
    type: ApiResponseDto,
  })
  async register(@Body() registerUserDto: RegisterUserDto) {
    const user = await this.userService.register(registerUserDto);

    return new ApiResponseDto(
      HttpStatus.CREATED,
      'User successfully registered'
    );
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Password reset email sent if user exists',
    type: ApiResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request - validation error',
    type: ApiResponseDto,
  })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    await this.userService.forgotPassword(forgotPasswordDto.email);

    return new ApiResponseDto(
      HttpStatus.OK,
      'If an account exists with this email, a password reset link has been sent'
    );
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password using token' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Password successfully reset',
    type: ApiResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid or expired token',
    type: ApiResponseDto,
  })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    await this.userService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.newPassword
    );

    return new ApiResponseDto(
      HttpStatus.OK,
      'Password has been successfully reset'
    );
  }
}
