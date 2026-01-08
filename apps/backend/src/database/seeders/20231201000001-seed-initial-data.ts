import { QueryInterface } from 'sequelize';
import { generateNanoid } from '../../commons/utils/nanoid.util';

/**
 * Seeder: Initial data
 *
 * Seeds:
 * 1. Default organization
 *
 * Note: Roles are seeded separately in 20231201000002-seed-roles.ts
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  const now = new Date();

  // Seed default organization
  await queryInterface.bulkInsert('organization', [
    {
      id: generateNanoid(),
      name: 'Default Organization',
      slug: 'default-organization',
      is_active: true,
      issuer_verified: false,
      created_at: now,
      updated_at: now,
    },
  ]);
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  // Remove seeded data
  await queryInterface.bulkDelete('organization', {
    slug: 'default-organization',
  });
}
