import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication, globalPrefix: string) {
  const config = new DocumentBuilder()
    .setTitle('Boilerplate API')
    .setDescription(
      `
## API Documentation for Boilerplate Nest-Next Application

### Authentication
This API uses JWT Bearer token authentication. Include the token in the Authorization header:
\`Authorization: Bearer <your_access_token>\`

### Multi-Tenant Architecture
This is a multi-tenant application. Users belong to organizations and can only access resources within their organization.

### User Roles
- **SUPER_ADMIN**: Full access to all organizations and resources
- **ADMIN**: Full access to their organization's resources
- **USER**: Standard user access

### Token Management
- Access tokens expire after 15 minutes
- Refresh tokens expire after 7 days
- Use the refresh token endpoint to get new access tokens
- Sessions are stored in the database and can be revoked
    `,
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Authentication', 'User authentication and session management')
    .addTag('Users', 'User management operations')
    .addTag('Organizations', 'Organization management (multi-tenant)')
    .addTag('User Types', 'User type/role management')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup(`${globalPrefix}/docs`, app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
    customSiteTitle: 'Boilerplate API Docs',
  });
}
