import { QueryInterface, DataTypes } from 'sequelize';

/**
 * Migration: Fix event_skill table columns
 *
 * Removes uuid and updated_at columns that were incorrectly added.
 * The EventSkillEntity is a simple junction table that doesn't extend BaseEntity.
 */
module.exports = {
  async up(queryInterface: QueryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      const tableInfo = await queryInterface.describeTable('event_skill');

      // Remove uuid column if exists (junction table doesn't need it)
      if (tableInfo.uuid) {
        await queryInterface.removeIndex('event_skill', 'IDX_event_skill_UUID', { transaction });
        await queryInterface.removeColumn('event_skill', 'uuid', { transaction });
        console.log('✅ uuid column removed from event_skill table');
      }

      // Remove updated_at column if exists (junction table doesn't need it)
      if (tableInfo.updated_at) {
        await queryInterface.removeColumn('event_skill', 'updated_at', { transaction });
        console.log('✅ updated_at column removed from event_skill table');
      }

      await transaction.commit();
      console.log('✅ event_skill table fixed successfully');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Migration failed:', error);
      throw error;
    }
  },

  async down(queryInterface: QueryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      const tableInfo = await queryInterface.describeTable('event_skill');

      // Add uuid column back if needed
      if (!tableInfo.uuid) {
        await queryInterface.addColumn(
          'event_skill',
          'uuid',
          {
            type: DataTypes.STRING(21),
            allowNull: false,
          },
          { transaction },
        );
        await queryInterface.addIndex('event_skill', ['uuid'], {
          name: 'IDX_event_skill_UUID',
          unique: true,
          transaction,
        });
      }

      // Add updated_at column back if needed
      if (!tableInfo.updated_at) {
        await queryInterface.addColumn(
          'event_skill',
          'updated_at',
          {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
          },
          { transaction },
        );
      }

      await transaction.commit();
      console.log('✅ Migration rolled back successfully');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Rollback failed:', error);
      throw error;
    }
  },
};
