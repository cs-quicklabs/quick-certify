import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiResponse as ApiResponseDto } from '@/common/dto';

@ApiTags('Health Check')
// using the global prefix from main file (api) and putting versioning here as v1 /api/v1/health-check
@Controller({
  path: 'health-check',
  version: '1',
})
export class HealthCheckController {
  /** API endpoint to server health.
   * @returns a response body containing status.
   */
  @Get()
  @ApiOperation({ summary: 'Checks if the server is running or not.' })
  @HttpCode(HttpStatus.OK)
  async healthCheck(): Promise<ApiResponseDto> {
    return new ApiResponseDto(200, 'Health check passed');
  }
}
