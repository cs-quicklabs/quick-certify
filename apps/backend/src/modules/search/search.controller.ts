import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { SearchQueryDto } from './dtos';
import { SuccessResponse } from '@src/commons/dtos';
import { CurrentUser } from '@src/modules/auth/decorators';
import type { CurrentUser as CurrentUserType } from '@src/modules/auth/interfaces';

@ApiTags('Search')
@ApiBearerAuth()
@Controller({ path: 'search', version: '1' })
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Global search across events, pathways, designs, and team members' })
  @ApiQuery({ name: 'q', required: true, description: 'Search query' })
  @ApiQuery({ name: 'limit', required: false, description: 'Results per category (max 10)' })
  @ApiResponse({ status: 200, description: 'Search results retrieved' })
  async search(@CurrentUser() user: CurrentUserType, @Query() dto: SearchQueryDto) {
    const results = await this.searchService.search(dto.q, user, dto.limit);
    return new SuccessResponse('Search results retrieved', results);
  }
}
