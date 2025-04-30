import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';

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

  @Delete('logout')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'User Logout' })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const cookies = req.headers?.cookie;

    const cookieArray = cookies.split('; ');
    let refresh_token = '';
    for (const cookie of cookieArray) {
      const [name, value] = cookie.split('=');
      if (name === 'refresh_token') {
        refresh_token = value;
        break;
      }
    }

    await this.authService.logout(refresh_token);
    Helpers.clearCookies(res);
    return new ApiResponse(HttpStatus.OK, 'Successfully logged out');
  }
}
