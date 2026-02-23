// ─── In your UserModule ───────────────────────────────────────────────────────
//
// user.module.ts
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserEntity } from '../entities/user.entity';
import { AuditModule } from '../audit'; // import the module
import { UserService } from './user.service';
import { UserController } from './user.controller';

@Module({
  imports: [
    SequelizeModule.forFeature([UserEntity]),
    AuditModule, // <-- add this
  ],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}

// ─── In your UserService ──────────────────────────────────────────────────────
//
// user.service.ts (only the archive method shown — add to your existing service)
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { UserEntity } from '../entities/user.entity';
import { AuditLogService, AuditAction, AuditContext } from '../audit';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(UserEntity)
    private readonly userRepo: typeof UserEntity,
    private readonly auditLog: AuditLogService, // inject
  ) {}

  async archiveUser(targetUserId: number, context: AuditContext): Promise<UserEntity> {
    const user = await this.userRepo.findByPk(targetUserId);
    if (!user) throw new NotFoundException('User not found');

    const previousStatus = user.status;

    await user.update({
      status: 'archived',
      deleted_at: new Date(),
    });

    // Fire-and-forget — won't break archiving if audit fails
    await this.auditLog.log({
      action: AuditAction.USER_ARCHIVED,
      target_user_id: user.id,
      context,
      previous_value: { status: previousStatus },
      new_value: { status: 'archived' },
    });

    return user;
  }
}

// ─── In your UserController ───────────────────────────────────────────────────
//
// user.controller.ts (only the archive endpoint shown)
import { Controller, Param, Patch, Req } from '@nestjs/common';
import { Request } from 'express';
import { buildAuditContext } from '../audit';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Patch(':id/archive')
  archive(@Param('id') id: string, @Req() req: Request) {
    const context = buildAuditContext(req); // build once, pass down
    return this.userService.archiveUser(+id, context);
  }
}
