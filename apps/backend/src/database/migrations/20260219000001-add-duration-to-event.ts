import { QueryInterface, DataTypes } from 'sequelize';

module.exports = {
  async up(queryInterface: QueryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn(
        'event',
        'duration_type',
        {
          type: DataTypes.STRING(10),
          allowNull: true,
          defaultValue: null,
        },
        { transaction },
      );

      await queryInterface.addColumn(
        'event',
        'duration_value',
        {
          type: DataTypes.INTEGER,
          allowNull: true,
          defaultValue: null,
        },
        { transaction },
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface: QueryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeColumn('event', 'duration_type', { transaction });
      await queryInterface.removeColumn('event', 'duration_value', { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};
