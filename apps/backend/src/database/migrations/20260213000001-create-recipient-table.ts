import { QueryInterface, DataTypes } from 'sequelize';

module.exports = {
  async up(queryInterface: QueryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable(
        'recipient',
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
          organization_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
              model: 'organization',
              key: 'id',
            },
            onDelete: 'CASCADE',
          },
          name: {
            type: DataTypes.STRING(200),
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
          updated_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
          },
        },
        { transaction },
      );

      await queryInterface.addIndex('recipient', ['uuid'], {
        name: 'IDX_RECIPIENT_UUID',
        unique: true,
        transaction,
      });

      await queryInterface.addIndex('recipient', ['organization_id'], {
        name: 'IDX_RECIPIENT_ORGANIZATION_ID',
        transaction,
      });

      await queryInterface.addIndex('recipient', ['email'], {
        name: 'IDX_RECIPIENT_EMAIL',
        transaction,
      });

      // Unique constraint: one email per organization
      await queryInterface.addIndex('recipient', ['organization_id', 'email'], {
        name: 'UQ_RECIPIENT_ORG_EMAIL',
        unique: true,
        transaction,
      });

      await transaction.commit();
      console.log('✅ Recipient table created successfully');
    } catch (error) {
      await transaction.rollback();
      console.error('Migration UP failed, rolling back:', error);
      throw error;
    }
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.dropTable('recipient');
    console.log('✅ Recipient table dropped successfully');
  },
};
