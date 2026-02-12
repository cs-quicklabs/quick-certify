import { QueryInterface, DataTypes } from 'sequelize';

/**
 * Migration: Add design_id column to event table
 * This must run after the design table is created
 */
module.exports = {
  async up(queryInterface: QueryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Check if design_id column already exists
      const columns = await queryInterface.describeTable('event');
      if ('design_id' in columns) {
        console.log('⚠️ design_id column already exists, skipping');
        await transaction.commit();
        return;
      }

      // Add design_id column
      await queryInterface.addColumn(
        'event',
        'design_id',
        {
          type: DataTypes.INTEGER,
          allowNull: true, // Make it optional
          references: {
            model: 'design',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL', // Set to null if design is deleted
        },
        { transaction },
      );
      console.log('✅ Added design_id column to event table');

      // Add index for design_id
      await queryInterface.addIndex('event', ['design_id'], {
        name: 'IDX_DESIGN_ID',
        transaction,
      });
      console.log('✅ Added IDX_DESIGN_ID index');

      await transaction.commit();
      console.log('✅ Migration completed successfully');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Migration failed:', error);
      throw error;
    }
  },

  async down(queryInterface: QueryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Remove index
      await queryInterface.removeIndex('event', 'IDX_DESIGN_ID', { transaction });

      // Remove column
      await queryInterface.removeColumn('event', 'design_id', { transaction });

      await transaction.commit();
      console.log('✅ Rollback completed successfully');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Rollback failed:', error);
      throw error;
    }
  },
};
