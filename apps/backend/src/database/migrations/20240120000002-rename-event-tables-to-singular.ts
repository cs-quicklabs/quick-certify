import { QueryInterface } from 'sequelize';

/**
 * Migration: Rename event tables from plural to singular
 *
 * Renames:
 * - event_types → event_type
 * - event_levels → event_level
 * - event_formats → event_format
 * - events → event
 *
 * Also updates foreign key references and indexes to match the new table names.
 */
module.exports = {
  async up(queryInterface: QueryInterface) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Rename tables in order (dependencies first, then dependent tables)
      // 1. Rename event_types to event_type
      await queryInterface.renameTable('event_types', 'event_type', { transaction });

      // 2. Rename event_levels to event_level
      await queryInterface.renameTable('event_levels', 'event_level', { transaction });

      // 3. Rename event_formats to event_format
      await queryInterface.renameTable('event_formats', 'event_format', { transaction });

      // 4. Rename events to event (must be last as it has foreign keys)
      await queryInterface.renameTable('events', 'event', { transaction });

      // 5. Update foreign key constraints in event table
      // Use raw SQL to drop existing constraints (handles auto-generated names)
      // This is more reliable across different PostgreSQL versions
      await queryInterface.sequelize.query(
        `ALTER TABLE "event" 
         DROP CONSTRAINT IF EXISTS "events_event_type_id_fkey",
         DROP CONSTRAINT IF EXISTS "events_event_level_id_fkey",
         DROP CONSTRAINT IF EXISTS "events_event_format_id_fkey",
         DROP CONSTRAINT IF EXISTS "event_event_type_id_fkey",
         DROP CONSTRAINT IF EXISTS "event_event_level_id_fkey",
         DROP CONSTRAINT IF EXISTS "event_event_format_id_fkey"`,
        { transaction },
      );

      // Add new foreign keys with updated references
      await queryInterface.addConstraint('event', {
        fields: ['event_type_id'],
        type: 'foreign key',
        name: 'event_event_type_id_fkey',
        references: {
          table: 'event_type',
          field: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        transaction,
      });

      await queryInterface.addConstraint('event', {
        fields: ['event_level_id'],
        type: 'foreign key',
        name: 'event_event_level_id_fkey',
        references: {
          table: 'event_level',
          field: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        transaction,
      });

      await queryInterface.addConstraint('event', {
        fields: ['event_format_id'],
        type: 'foreign key',
        name: 'event_event_format_id_fkey',
        references: {
          table: 'event_format',
          field: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        transaction,
      });

      await transaction.commit();
      console.log('✅ Event tables renamed to singular successfully');
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface: QueryInterface) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Reverse the process: rename back to plural
      // 1. Rename event back to events (must be first as it has foreign keys)
      await queryInterface.renameTable('event', 'events', { transaction });

      // 2. Update foreign key constraints back to plural table names
      // Drop existing constraints
      await queryInterface.sequelize.query(
        `ALTER TABLE "events" 
         DROP CONSTRAINT IF EXISTS "event_event_type_id_fkey",
         DROP CONSTRAINT IF EXISTS "event_event_level_id_fkey",
         DROP CONSTRAINT IF EXISTS "event_event_format_id_fkey"`,
        { transaction },
      );

      await queryInterface.addConstraint('events', {
        fields: ['event_type_id'],
        type: 'foreign key',
        name: 'events_event_type_id_fkey',
        references: {
          table: 'event_types',
          field: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        transaction,
      });

      await queryInterface.addConstraint('events', {
        fields: ['event_level_id'],
        type: 'foreign key',
        name: 'events_event_level_id_fkey',
        references: {
          table: 'event_levels',
          field: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        transaction,
      });

      await queryInterface.addConstraint('events', {
        fields: ['event_format_id'],
        type: 'foreign key',
        name: 'events_event_format_id_fkey',
        references: {
          table: 'event_formats',
          field: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        transaction,
      });

      // 3. Rename event_format back to event_formats
      await queryInterface.renameTable('event_format', 'event_formats', { transaction });

      // 4. Rename event_level back to event_levels
      await queryInterface.renameTable('event_level', 'event_levels', { transaction });

      // 5. Rename event_type back to event_types
      await queryInterface.renameTable('event_type', 'event_types', { transaction });

      await transaction.commit();
      console.log('✅ Event tables renamed back to plural successfully');
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};
