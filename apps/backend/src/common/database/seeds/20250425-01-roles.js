'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if any roles already exist
    const existingRoles = await queryInterface.sequelize.query(
      'SELECT COUNT(*) as count FROM roles;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (existingRoles.length) {
      console.log('Roles already exist, skipping seed');
      return;
    }

    await queryInterface.bulkInsert(
      'roles',
      [
        {
          name: 'Super Admin',
          code: 'SUPER_ADMIN',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: 'Admin',
          code: 'ADMIN',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: 'Organization Admin',
          code: 'ORG_ADMIN',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: 'User',
          code: 'USER',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('roles', null, {});
  },
};
