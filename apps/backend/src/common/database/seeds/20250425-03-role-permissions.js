'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if any role-permissions already exist
    const [{ count }] = await queryInterface.sequelize.query(
      'SELECT COUNT(*) as count FROM role_permissions;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (count > 0) {
      console.log('Role permissions already exist, skipping seed');
      return;
    }

    // Get the Super Admin role ID
    const [superAdminRole] = await queryInterface.sequelize.query(
      "SELECT id FROM roles WHERE code = 'super_admin' LIMIT 1;",
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (!superAdminRole) {
      console.log('Super Admin role not found, skipping seed');
      return;
    }

    // Get the permission IDs
    const permissions = await queryInterface.sequelize.query(
      "SELECT id, code FROM permissions WHERE code IN ('view_organization_details', 'edit_organization_details');",
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (permissions.length === 0) {
      console.log('Required permissions not found, skipping seed');
      return;
    }

    // Create the role-permission associations
    const rolePermissions = permissions.map((permission) => ({
      role_id: superAdminRole.id,
      permission_id: permission.id,
      created_at: new Date(),
      updated_at: new Date(),
    }));

    await queryInterface.bulkInsert('role_permissions', rolePermissions, {});
  },

  async down(queryInterface, Sequelize) {
    // Get Super Admin role ID
    const [superAdminRole] = await queryInterface.sequelize.query(
      "SELECT id FROM roles WHERE code = 'super_admin' LIMIT 1;",
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (superAdminRole) {
      // Delete role-permissions for Super Admin role
      await queryInterface.bulkDelete(
        'role_permissions',
        {
          role_id: superAdminRole.id,
        },
        {}
      );
    }
  },
};
