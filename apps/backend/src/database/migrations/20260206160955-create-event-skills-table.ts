import { QueryInterface, DataTypes } from 'sequelize';

/**
 * Migration: Create event_skill junction table
 *
 * Many-to-many relationship between events and skills.
 * Simple junction table with just id, event_id, skill_id, created_at.
 */
module.exports = {
  async up(queryInterface: QueryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Check if table already exists
      const tables = await queryInterface.showAllTables();
      if (tables.includes('event_skill')) {
        console.log('⚠️ event_skill table already exists, skipping');
        await transaction.commit();
        return;
      }

      await queryInterface.createTable(
        'event_skill',
        {
          id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
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
          skill_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
              model: 'skill',
              key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
          },
          created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
          },
        },
        { transaction },
      );

      // Add unique index to prevent duplicate associations
      await queryInterface.addIndex(
        'event_skill',
        ['event_id', 'skill_id'],
        {
          name: 'IDX_EVENT_SKILLS_UNIQUE',
          unique: true,
          transaction,
        },
      );

      // Add index for skill lookups
      await queryInterface.addIndex('event_skill', ['skill_id'], {
        name: 'IDX_EVENT_SKILLS_SKILL_ID',
        transaction,
      });

      await transaction.commit();
      console.log('✅ event_skill table created successfully');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Migration failed:', error);
      throw error;
    }
  },

  async down(queryInterface: QueryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.dropTable('event_skill', { transaction });
      await transaction.commit();
      console.log('✅ event_skill table dropped successfully');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Rollback failed:', error);
      throw error;
    }
  },
};
