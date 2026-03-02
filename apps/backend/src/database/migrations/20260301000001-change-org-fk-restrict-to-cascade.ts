import { QueryInterface } from 'sequelize';

/**
 * Change organization_id FK policy from RESTRICT to CASCADE
 * for user, event_type, event_level, and event_format tables.
 *
 * When an organization is deleted, all its owned records should be deleted too.
 */
module.exports = {
  async up(queryInterface: QueryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      const tables = [
        { table: 'user', column: 'organization_id' },
        { table: 'event_type', column: 'organization_id' },
        { table: 'event_level', column: 'organization_id' },
        { table: 'event_format', column: 'organization_id' },
      ];

      for (const { table, column } of tables) {
        const constraintName = `${table}_${column}_fkey`;

        await queryInterface.removeConstraint(table, constraintName, {
          transaction,
        });

        await queryInterface.addConstraint(table, {
          fields: [column],
          type: 'foreign key',
          name: constraintName,
          references: { table: 'organization', field: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
          transaction,
        });
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
      const tables = [
        { table: 'user', column: 'organization_id' },
        { table: 'event_type', column: 'organization_id' },
        { table: 'event_level', column: 'organization_id' },
        { table: 'event_format', column: 'organization_id' },
      ];

      for (const { table, column } of tables) {
        const constraintName = `${table}_${column}_fkey`;

        await queryInterface.removeConstraint(table, constraintName, {
          transaction,
        });

        await queryInterface.addConstraint(table, {
          fields: [column],
          type: 'foreign key',
          name: constraintName,
          references: { table: 'organization', field: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
          transaction,
        });
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};
