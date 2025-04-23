import {
  Controller,
  Post,
  Body,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EmailService } from './email.service';
import { Message } from './email.service';

@ApiTags('Email')
@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('welcome')
  @ApiOperation({ summary: 'Send welcome email' })
  @ApiResponse({ status: 200, description: 'Welcome email sent successfully' })
  async sendWelcomeEmail(@Query('email') email: string) {
    return await this.emailService.welcomeEmail(email);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Send forgot password email' })
  @ApiResponse({
    status: 200,
    description: 'Reset password email sent successfully',
  })
  async sendForgotPasswordEmail(
    @Query('email') email: string,
    @Query('resetUrl') resetUrl: string
  ) {
    return await this.emailService.forgetPasswordEmail(resetUrl, email);
  }

  @Post('notify')
  @ApiOperation({ summary: 'Send notification email' })
  @ApiResponse({
    status: 200,
    description: 'Notification email sent successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - missing required fields',
  })
  async sendNotification(@Body() messageData: Message) {
    if (
      !messageData ||
      !messageData.body ||
      !messageData.recipients ||
      !messageData.subject
    ) {
      throw new BadRequestException(
        'Missing required fields: body, recipients, and subject are required'
      );
    }
    return await this.emailService.notify(messageData);
  }
}
