'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_reset_tokens', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: 'Primary key identifier',
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Foreign key to users table',
      },
      hash: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Session hash for authentication',
      },
      is_valid: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Whether the token is valid',
      },
      expiry_at: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Session expiration timestamp',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Record creation timestamp',
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Record last update timestamp',
      },
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  },
};
