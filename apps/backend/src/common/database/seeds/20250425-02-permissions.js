'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if any permissions already exist
    const [{ count }] = await queryInterface.sequelize.query(
      'SELECT COUNT(*) as count FROM permissions;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (count > 0) {
      console.log('Permissions already exist, skipping seed');
      return;
    }

    await queryInterface.bulkInsert(
      'permissions',
      [
        {
          name: 'View Organization Details',
          code: 'view_organization_details',
          description: 'Permission to view organization details',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: 'Edit Organization Details',
          code: 'edit_organization_details',
          description: 'Permission to edit and update organization details',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('permissions', null, {});
  },
};
