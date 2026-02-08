import { QueryInterface, DataTypes } from 'sequelize';

/**
 * Migration: Add event detail fields and make reference fields nullable
 *
 * Changes:
 * - Add description (TEXT, nullable)
 * - Add learning_link (STRING(500), nullable)
 * - Modify event_type_id to allow null
 * - Modify event_level_id to allow null
 * - Modify event_format_id to allow null
 */
module.exports = {
  async up(queryInterface: QueryInterface) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Check if description column exists
      const descriptionExists = await queryInterface.describeTable('event')
        .then(columns => 'description' in columns)
        .catch(() => false);

      if (!descriptionExists) {
        await queryInterface.addColumn(
          'event',
          'description',
          {
            type: DataTypes.TEXT,
            allowNull: true,
          },
          { transaction },
        );
        console.log('✅ Added description column to event table');
      }

      // Check if learning_link column exists
      const learningLinkExists = await queryInterface.describeTable('event')
        .then(columns => 'learning_link' in columns)
        .catch(() => false);

      if (!learningLinkExists) {
        await queryInterface.addColumn(
          'event',
          'learning_link',
          {
            type: DataTypes.STRING(500),
            allowNull: true,
          },
          { transaction },
        );
        console.log('✅ Added learning_link column to event table');
      }

      // Make event_type_id nullable
      await queryInterface.changeColumn(
        'event',
        'event_type_id',
        {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: 'event_type',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        },
        { transaction },
      );
      console.log('✅ Made event_type_id nullable');

      // Make event_level_id nullable
      await queryInterface.changeColumn(
        'event',
        'event_level_id',
        {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: 'event_level',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        },
        { transaction },
      );
      console.log('✅ Made event_level_id nullable');

      // Make event_format_id nullable
      await queryInterface.changeColumn(
        'event',
        'event_format_id',
        {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: 'event_format',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        },
        { transaction },
      );
      console.log('✅ Made event_format_id nullable');

      await transaction.commit();
      console.log('✅ Migration completed successfully');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Migration failed, rolling back:', error);
      throw error;
    }
  },

  async down(queryInterface: QueryInterface) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Revert event_format_id to NOT NULL
      await queryInterface.changeColumn(
        'event',
        'event_format_id',
        {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'event_format',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        },
        { transaction },
      );

      // Revert event_level_id to NOT NULL
      await queryInterface.changeColumn(
        'event',
        'event_level_id',
        {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'event_level',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        },
        { transaction },
      );

      // Revert event_type_id to NOT NULL
      await queryInterface.changeColumn(
        'event',
        'event_type_id',
        {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'event_type',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        },
        { transaction },
      );

      // Remove learning_link column
      await queryInterface.removeColumn('event', 'learning_link', { transaction });

      // Remove description column
      await queryInterface.removeColumn('event', 'description', { transaction });

      await transaction.commit();
      console.log('✅ Rollback completed successfully');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Rollback failed, rolling back:', error);
      throw error;
    }
  },
};
