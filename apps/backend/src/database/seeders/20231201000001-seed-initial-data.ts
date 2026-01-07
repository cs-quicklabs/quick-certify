import { QueryInterface } from 'sequelize';

/**
 * Seeder: Initial data
 *
 * Seeds:
 * 1. Default user types (SUPER_ADMIN, ADMIN, USER)
 * 2. Default organization
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  const now = new Date();

  // 1. Seed user types
  await queryInterface.bulkInsert('user_type', [
    {
      name: 'Super Administrator',
      code: 'SUPER_ADMIN',
      description: 'Full system access across all organizations',
      is_active: true,
      created_at: now,
      updated_at: now,
    },
    {
      name: 'Administrator',
      code: 'ADMIN',
      description: 'Organization administrator with full access to organization resources',
      is_active: true,
      created_at: now,
      updated_at: now,
    },
    {
      name: 'Standard User',
      code: 'USER',
      description: 'Standard user with basic access',
      is_active: true,
      created_at: now,
      updated_at: now,
    },
  ]);

  // 2. Seed default organization
  await queryInterface.bulkInsert('organization', [
    {
      uuid: '00000000-0000-0000-0000-000000000001',
      name: 'Default Organization',
      description: 'Initial organization for the platform',
      created_at: now,
      updated_at: now,
    },
  ]);
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  // Remove seeded data
  await queryInterface.bulkDelete('organization', {
    uuid: '00000000-0000-0000-0000-000000000001',
  });

  await queryInterface.bulkDelete('user_type', {
    code: ['SUPER_ADMIN', 'ADMIN', 'USER'],
  });
}
