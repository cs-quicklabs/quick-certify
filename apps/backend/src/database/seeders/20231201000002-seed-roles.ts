import { QueryInterface } from 'sequelize';
import { generateNanoid } from '../../commons/utils/nanoid.util';

/**
 * Seeder: Seed roles
 *
 * Seeds:
 * 1. Default roles (super_admin, admin, manager, designer)
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  const now = new Date();

  await queryInterface.bulkInsert('role', [
    {
      id: generateNanoid(),
      role: 'super_admin',
      created_at: now,
      updated_at: now,
    },
    {
      id: generateNanoid(),
      role: 'admin',
      created_at: now,
      updated_at: now,
    },
    {
      id: generateNanoid(),
      role: 'manager',
      created_at: now,
      updated_at: now,
    },
    {
      id: generateNanoid(),
      role: 'designer',
      created_at: now,
      updated_at: now,
    },
  ]);
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.bulkDelete('role', {
    role: ['super_admin', 'admin', 'manager', 'designer'],
  });
}

