import { QueryInterface, DataTypes } from 'sequelize';

module.exports = {
  async up(queryInterface: QueryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn(
        'user',
        'invitation_token',
        {
          type: DataTypes.STRING(64),
          allowNull: true,
        },
        { transaction },
      );

      await queryInterface.addIndex('user', ['invitation_token'], {
        name: 'IDX_USER_INVITATION_TOKEN',
        unique: true,
        where: { invitation_token: { [Symbol.for('ne')]: null } },
        transaction,
      });

      await queryInterface.addColumn(
        'user',
        'invitation_expires_at',
        {
          type: DataTypes.DATE,
          allowNull: true,
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
      await queryInterface.removeColumn('user', 'invitation_expires_at', {
        transaction,
      });
      await queryInterface.removeColumn('user', 'invitation_token', {
        transaction,
      });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};
