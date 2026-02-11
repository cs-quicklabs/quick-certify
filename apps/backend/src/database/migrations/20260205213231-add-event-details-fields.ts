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
    const existingColumns = await queryInterface.describeTable('event').catch(() => ({}));

    const descriptionExists = 'description' in existingColumns;
    const learningLinkExists = 'learning_link' in existingColumns;

    const transaction = await queryInterface.sequelize.transaction();

    try {
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
      // Before reverting to NOT NULL, backfill NULL values with a valid default
      // to prevent constraint violations if rows with NULL references exist
      const fkColumns = [
        { column: 'event_format_id', table: 'event_format' },
        { column: 'event_level_id', table: 'event_level' },
        { column: 'event_type_id', table: 'event_type' },
      ];

      for (const { column, table } of fkColumns) {
        const [nullCount] = (await queryInterface.sequelize.query(
          `SELECT COUNT(*) as count FROM event WHERE ${column} IS NULL`,
          { transaction },
        )) as unknown as [Array<{ count: string }>];

        if (Number.parseInt(nullCount[0].count) > 0) {
          const [defaultRow] = (await queryInterface.sequelize.query(
            `SELECT id FROM ${table} WHERE is_active = true LIMIT 1`,
            { transaction },
          )) as unknown as [Array<{ id: number }>];

          if (!defaultRow.length) {
            throw new Error(
              `Cannot revert ${column} to NOT NULL: rows with NULL exist and no active ${table} record found as default`,
            );
          }

          await queryInterface.sequelize.query(
            `UPDATE event SET ${column} = ${defaultRow[0].id} WHERE ${column} IS NULL`,
            { transaction },
          );
          console.log(
            `✅ Backfilled ${nullCount[0].count} NULL ${column} rows with default id ${defaultRow[0].id}`,
          );
        }

        await queryInterface.changeColumn(
          'event',
          column,
          {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
              model: table,
              key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
          },
          { transaction },
        );
      }

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
