import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { OrganizationService } from '../organization.service';

@Injectable()
export class PublicPortalGuard implements CanActivate {
  constructor(private readonly orgService: OrganizationService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    const slug = req.params.slug;

    const org = await this.orgService.findBySlug(slug);
    if (!org || !org.portal_enabled) {
      throw new ForbiddenException('Public API access disabled');
    }

    // attach resolved org
    req.organization = org;

    return true;
  }
}
