import { QueryInterface } from 'sequelize';
import { generateNanoid } from '../../commons/utils/nanoid.util';

/**
 * Seeder: Seed initial roles
 *
 * Creates the default system roles: super_admin, admin, manager, designer
 */
module.exports = {
  async up(queryInterface: QueryInterface) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Check if roles already exist
      const [existingRoles] = await queryInterface.sequelize.query(
        `SELECT role FROM "role" WHERE role IN ('super_admin', 'admin', 'manager', 'designer')`,
        { transaction },
      );

      const existingRoleNames = (existingRoles as { role: string }[]).map((r) => r.role);

      const roles = [
        { uuid: generateNanoid(), role: 'super_admin' },
        { uuid: generateNanoid(), role: 'admin' },
        { uuid: generateNanoid(), role: 'manager' },
        { uuid: generateNanoid(), role: 'designer' },
      ];

      const rolesToInsert = roles.filter((r) => !existingRoleNames.includes(r.role));

      if (rolesToInsert.length > 0) {
        const now = new Date();
        const values = rolesToInsert
          .map((r) => `('${r.uuid}', '${r.role}', '${now.toISOString()}', '${now.toISOString()}')`)
          .join(', ');

        await queryInterface.sequelize.query(
          `INSERT INTO "role" (uuid, role, created_at, updated_at) VALUES ${values}`,
          { transaction },
        );

        console.log(
          `✅ Seeded ${rolesToInsert.length} role(s): ${rolesToInsert
            .map((r) => r.role)
            .join(', ')}`,
        );
      } else {
        console.log('ℹ️  All roles already exist, skipping seed');
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface: QueryInterface) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.sequelize.query(
        `DELETE FROM "role" WHERE role IN ('super_admin', 'admin', 'manager', 'designer')`,
        { transaction },
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};
