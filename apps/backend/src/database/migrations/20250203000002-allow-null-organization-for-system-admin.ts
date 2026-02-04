import { QueryInterface } from 'sequelize';

/**
 * Migration: Allow null organization_id for system_admin users
 *
 * System admins are platform-level users that don't belong to any organization.
 * This migration makes organization_id nullable to support this use case.
 */
module.exports = {
  async up(queryInterface: QueryInterface) {
    await queryInterface.sequelize.query(
      'ALTER TABLE "user" ALTER COLUMN organization_id DROP NOT NULL',
    );
  },

  async down(queryInterface: QueryInterface) {
    // Before making NOT NULL again, ensure no NULL values exist
    await queryInterface.sequelize.query(
      'ALTER TABLE "user" ALTER COLUMN organization_id SET NOT NULL',
    );
  },
};
