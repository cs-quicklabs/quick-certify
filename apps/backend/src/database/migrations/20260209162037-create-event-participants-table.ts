import { QueryInterface, DataTypes } from 'sequelize';

/**
 * Migration: Create event_participant table
 *
 * Stores participants for events with name and email.
 * Each participant belongs to a specific event.
 */
module.exports = {
  async up(queryInterface: QueryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Check if table already exists
      const tables = await queryInterface.showAllTables();
      if (tables.includes('event_participant')) {
        console.log('⚠️ event_participant table already exists, skipping');
        await transaction.commit();
        return;
      }

      await queryInterface.createTable(
        'event_participant',
        {
          id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
          },
          uuid: {
            type: DataTypes.STRING(21),
            allowNull: false,
            unique: true,
          },
          event_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
              model: 'event',
              key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
          },
          name: {
            type: DataTypes.STRING(255),
            allowNull: false,
          },
          email: {
            type: DataTypes.STRING(255),
            allowNull: false,
          },
          created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
          },
        },
        { transaction },
      );

      // Add unique index for uuid lookups
      await queryInterface.addIndex('event_participant', ['uuid'], {
        name: 'IDX_EVENT_PARTICIPANT_UUID',
        unique: true,
        transaction,
      });

      // Add index for event lookups
      await queryInterface.addIndex('event_participant', ['event_id'], {
        name: 'IDX_EVENT_PARTICIPANT_EVENT_ID',
        transaction,
      });

      // Add unique index to prevent duplicate emails per event
      await queryInterface.addIndex('event_participant', ['event_id', 'email'], {
        name: 'IDX_EVENT_PARTICIPANT_UNIQUE_EMAIL',
        unique: true,
        transaction,
      });

      await transaction.commit();
      console.log('✅ event_participant table created successfully');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Migration failed:', error);
      throw error;
    }
  },

  async down(queryInterface: QueryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.dropTable('event_participant', { transaction });
      await transaction.commit();
      console.log('✅ event_participant table dropped successfully');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Rollback failed:', error);
      throw error;
    }
  },
};
