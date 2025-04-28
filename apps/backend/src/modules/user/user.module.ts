import { forwardRef, Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { OrganizationModule } from '../organization/organization.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [forwardRef(() => OrganizationModule), EmailModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
