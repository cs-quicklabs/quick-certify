import { QueryInterface, DataTypes } from 'sequelize';

module.exports = {
  async up(queryInterface: QueryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable(
        'design',
        {
          id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true,
          },
          uuid: {
            type: DataTypes.STRING(21),
            allowNull: false,
            unique: true,
          },
          name: { type: DataTypes.STRING(100), allowNull: false },
          type: { type: DataTypes.STRING(15), allowNull: false },
          url: { type: DataTypes.STRING(500), allowNull: false },
          layout: { type: DataTypes.JSONB, allowNull: true },
          created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
          },
          updated_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
          },
        },
        { transaction },
      );

      await queryInterface.addIndex('design', ['name'], {
        name: 'IDX_DESIGN_NAME',
        transaction,
      });

      await queryInterface.addIndex('design', ['uuid'], {
        name: 'IDX_DESIGN_UUID',
        unique: true,
        transaction,
      });

      await transaction.commit();
      console.log('✅ Design table created successfully');
    } catch (error) {
      await transaction.rollback();
      console.error('Migration UP failed, rolling back:', error);
      throw error;
    }
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.dropTable('design');
    console.log('✅ Design table dropped successfully');
  },
};
