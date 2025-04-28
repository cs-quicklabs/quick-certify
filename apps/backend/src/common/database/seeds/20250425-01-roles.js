'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if any roles already exist
    const [{ count }] = await queryInterface.sequelize.query(
      'SELECT COUNT(*) as count FROM roles;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (count > 0) {
      console.log('Roles already exist, skipping seed');
      return;
    }

    await queryInterface.bulkInsert(
      'roles',
      [
        {
          name: 'Super Admin',
          code: 'super_admin',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: 'Admin',
          code: 'admin',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: 'Manager',
          code: 'manager',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: 'Designer',
          code: 'designer',
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
