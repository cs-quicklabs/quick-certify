import { QueryInterface, DataTypes } from 'sequelize';

/**
 * Migration: Add organization_id to event-related tables
 *
 * Makes events, event types, event levels, and event formats multi-tenant by associating them with organizations.
 * - Adds organization_id foreign key column to event, event_type, event_level, and event_format tables
 * - Creates composite unique indexes on (organization_id, name) for each table
 * - Adds indexes for organization_id for query performance
 *
 * Unique Constraints per Table:
 * - event: Each organization can have only ONE event with a given name (IDX_EVENT_ORG_NAME)
 * - event_type: Each organization can have only ONE event type with a given name (IDX_EVENT_TYPE_ORG_NAME)
 * - event_level: Each organization can have only ONE event level with a given name (IDX_EVENT_LEVEL_ORG_NAME)
 * - event_format: Each organization can have only ONE event format with a given name (IDX_EVENT_FORMAT_ORG_NAME)
 */
module.exports = {
  async up(queryInterface: QueryInterface) {
    const transaction = await queryInterface.sequelize.transaction();

    const organizationColumn = {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'organization',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    };

    try {
      // 1. Add organization_id to event table
      await queryInterface.addColumn('event', 'organization_id', organizationColumn, {
        transaction,
      });

      await queryInterface.addIndex('event', ['organization_id'], {
        name: 'IDX_EVENT_ORGANIZATION_ID',
        transaction,
      });

      await queryInterface.addIndex('event', ['organization_id', 'name'], {
        name: 'IDX_EVENT_ORG_NAME',
        unique: true,
        transaction,
      });

      // 2. Add organization_id to event_type table
      await queryInterface.addColumn('event_type', 'organization_id', organizationColumn, {
        transaction,
      });

      await queryInterface.addIndex('event_type', ['organization_id'], {
        name: 'IDX_EVENT_TYPE_ORGANIZATION_ID',
        transaction,
      });

      await queryInterface.removeIndex('event_type', 'IDX_EVENT_TYPE_NAME', { transaction });

      await queryInterface.addIndex('event_type', ['organization_id', 'name'], {
        name: 'IDX_EVENT_TYPE_ORG_NAME',
        unique: true,
        transaction,
      });

      // 3. Add organization_id to event_level table
      await queryInterface.addColumn('event_level', 'organization_id', organizationColumn, {
        transaction,
      });

      await queryInterface.addIndex('event_level', ['organization_id'], {
        name: 'IDX_EVENT_LEVEL_ORGANIZATION_ID',
        transaction,
      });

      await queryInterface.removeIndex('event_level', 'IDX_EVENT_LEVEL_NAME', { transaction });

      await queryInterface.addIndex('event_level', ['organization_id', 'name'], {
        name: 'IDX_EVENT_LEVEL_ORG_NAME',
        unique: true,
        transaction,
      });

      // 4. Add organization_id to event_format table
      await queryInterface.addColumn('event_format', 'organization_id', organizationColumn, {
        transaction,
      });

      await queryInterface.addIndex('event_format', ['organization_id'], {
        name: 'IDX_EVENT_FORMAT_ORGANIZATION_ID',
        transaction,
      });

      await queryInterface.removeIndex('event_format', 'IDX_EVENT_FORMAT_NAME', { transaction });

      await queryInterface.addIndex('event_format', ['organization_id', 'name'], {
        name: 'IDX_EVENT_FORMAT_ORG_NAME',
        unique: true,
        transaction,
      });

      await transaction.commit();
      console.log(
        '✅ Added organization_id to event, event_type, event_level, and event_format tables successfully',
      );
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Migration failed:', error);
      throw error;
    }
  },

  async down(queryInterface: QueryInterface) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Remove from event_format table (reverse order)
      await queryInterface.removeIndex('event_format', 'IDX_EVENT_FORMAT_ORG_NAME', {
        transaction,
      });
      await queryInterface.removeIndex('event_format', 'IDX_EVENT_FORMAT_ORGANIZATION_ID', {
        transaction,
      });

      await queryInterface.addIndex('event_format', ['name'], {
        name: 'IDX_EVENT_FORMAT_NAME',
        unique: true,
        transaction,
      });

      await queryInterface.removeColumn('event_format', 'organization_id', { transaction });

      // Remove from event_level table
      await queryInterface.removeIndex('event_level', 'IDX_EVENT_LEVEL_ORG_NAME', { transaction });
      await queryInterface.removeIndex('event_level', 'IDX_EVENT_LEVEL_ORGANIZATION_ID', {
        transaction,
      });

      await queryInterface.addIndex('event_level', ['name'], {
        name: 'IDX_EVENT_LEVEL_NAME',
        unique: true,
        transaction,
      });

      await queryInterface.removeColumn('event_level', 'organization_id', { transaction });

      // Remove from event_type table
      await queryInterface.removeIndex('event_type', 'IDX_EVENT_TYPE_ORG_NAME', { transaction });
      await queryInterface.removeIndex('event_type', 'IDX_EVENT_TYPE_ORGANIZATION_ID', {
        transaction,
      });

      await queryInterface.addIndex('event_type', ['name'], {
        name: 'IDX_EVENT_TYPE_NAME',
        unique: true,
        transaction,
      });

      await queryInterface.removeColumn('event_type', 'organization_id', { transaction });

      // Remove from event table
      await queryInterface.removeIndex('event', 'IDX_EVENT_ORG_NAME', { transaction });
      await queryInterface.removeIndex('event', 'IDX_EVENT_ORGANIZATION_ID', { transaction });

      await queryInterface.removeColumn('event', 'organization_id', { transaction });

      await transaction.commit();
      console.log(
        '✅ Removed organization_id from event, event_type, event_level, and event_format tables successfully',
      );
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Rollback failed:', error);
      throw error;
    }
  },
};
