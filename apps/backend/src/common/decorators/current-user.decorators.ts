import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserModel } from '@/models';

type UserRecord = keyof UserModel;

export const CurrentUser = createParamDecorator(
  (data: UserRecord, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    return data ? request.user?.[data] : request.user;
  }
);
