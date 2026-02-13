import { CredentialStatusEnum } from '../../commons/enums';
import { QueryInterface, DataTypes } from 'sequelize';

module.exports = {
  async up(queryInterface: QueryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable(
        'credential',
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
          recipient_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
              model: 'recipient',
              key: 'id',
            },
            onDelete: 'CASCADE',
          },
          event_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
              model: 'event',
              key: 'id',
            },
            onDelete: 'CASCADE',
          },
          issued_date: {
            type: DataTypes.DATEONLY,
            allowNull: true,
          },
          expiration_date: {
            type: DataTypes.DATEONLY,
            allowNull: true,
          },
          certificate_url: {
            type: DataTypes.STRING(2048),
            allowNull: true,
          },
          status: {
            type: DataTypes.STRING(20),
            allowNull: false,
            defaultValue: CredentialStatusEnum.DRAFT,
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

      await queryInterface.addIndex('credential', ['uuid'], {
        name: 'IDX_CREDENTIAL_UUID',
        unique: true,
        transaction,
      });

      await queryInterface.addIndex('credential', ['organization_id'], {
        name: 'IDX_CREDENTIAL_ORGANIZATION_ID',
        transaction,
      });

      await queryInterface.addIndex('credential', ['recipient_id'], {
        name: 'IDX_CREDENTIAL_RECIPIENT_ID',
        transaction,
      });

      await queryInterface.addIndex('credential', ['event_id'], {
        name: 'IDX_CREDENTIAL_EVENT_ID',
        transaction,
      });

      await transaction.commit();
      console.log('✅ Credential table created successfully');
    } catch (error) {
      await transaction.rollback();
      console.error('Migration UP failed, rolling back:', error);
      throw error;
    }
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.dropTable('credential');
    console.log('✅ Credential table dropped successfully');
  },
};
