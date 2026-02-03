import { QueryInterface } from 'sequelize';
import { generateNanoid } from '../../commons/utils/nanoid.util';

/**
 * Migration: Add system_admin role
 *
 * Adds the system_admin role for global system administration
 * with cross-organization access and hard delete capabilities.
 */
module.exports = {
  async up(queryInterface: QueryInterface) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Check if system_admin role already exists
      const [existingRoles] = await queryInterface.sequelize.query(
        `SELECT role FROM "role" WHERE role = 'system_admin'`,
        { transaction },
      );

      if ((existingRoles as { role: string }[]).length === 0) {
        const now = new Date().toISOString();
        await queryInterface.sequelize.query(
          `INSERT INTO "role" (uuid, role, created_at, updated_at) VALUES ('${generateNanoid()}', 'system_admin', '${now}', '${now}')`,
          { transaction },
        );
        console.log('✅ Added system_admin role');
      } else {
        console.log('ℹ️  system_admin role already exists, skipping');
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
        `DELETE FROM "role" WHERE role = 'system_admin'`,
        { transaction },
      );
      console.log('✅ Removed system_admin role');

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};
