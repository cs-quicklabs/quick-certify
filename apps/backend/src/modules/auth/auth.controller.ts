import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

import { LoginDto } from './dto';
import Helpers from '@/utils/helper';
import { ApiResponse } from '@/common/dto';
import {
  JWT_ACCESS_TOKEN_COOKIE_NAME,
  JWT_REFRESH_TOKEN_COOKIE_NAME,
} from './strategies';
import { UserModel } from '@/models';
import { JwtAuthGuard } from './guards';
import { CurrentUser } from '@/common/decorators';

@ApiTags('Authentication')
@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'User Login' })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const { accessToken, refreshToken } = await this.authService.login(
      loginDto
    );
    Helpers.setCookies(res, JWT_ACCESS_TOKEN_COOKIE_NAME, accessToken);
    Helpers.setCookies(res, JWT_REFRESH_TOKEN_COOKIE_NAME, refreshToken);

    return new ApiResponse(HttpStatus.OK, 'Login successful', {
      accessToken,
      refreshToken,
    });
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get User Profile' })
  getProfile(@CurrentUser() user: UserModel) {
    return new ApiResponse(HttpStatus.OK, 'User profile retrieved', user);
  }
}
