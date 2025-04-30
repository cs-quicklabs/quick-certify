import { forwardRef, Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { OrganizationModule } from '../organization/organization.module';
import { RoleModule } from '@/modules/role/role.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [forwardRef(() => OrganizationModule), RoleModule, EmailModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
