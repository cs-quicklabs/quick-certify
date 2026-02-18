import { QueryInterface, DataTypes } from 'sequelize';
import { BatchStatusEnum } from '../../commons/enums';

module.exports = {
  async up(queryInterface: QueryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // 1. Create credential_issue_batch table
      await queryInterface.createTable(
        'credential_issue_batch',
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
          event_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
              model: 'event',
              key: 'id',
            },
            onDelete: 'CASCADE',
          },
          idempotency_key: {
            type: DataTypes.STRING(64),
            allowNull: false,
          },
          total_count: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
          },
          processed_count: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
          },
          success_count: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
          },
          failed_count: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
          },
          status: {
            type: DataTypes.STRING(20),
            allowNull: false,
            defaultValue: BatchStatusEnum.PENDING,
          },
          error_details: {
            type: DataTypes.JSONB,
            allowNull: true,
          },
          created_by: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
              model: 'user',
              key: 'id',
            },
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

      // Indexes for credential_issue_batch
      await queryInterface.addIndex('credential_issue_batch', ['uuid'], {
        name: 'IDX_CREDENTIAL_ISSUE_BATCH_UUID',
        unique: true,
        transaction,
      });

      await queryInterface.addIndex('credential_issue_batch', ['idempotency_key'], {
        name: 'IDX_CREDENTIAL_ISSUE_BATCH_IDEMPOTENCY_KEY',
        unique: true,
        transaction,
      });

      await queryInterface.addIndex('credential_issue_batch', ['status'], {
        name: 'IDX_CREDENTIAL_ISSUE_BATCH_STATUS',
        transaction,
      });

      await queryInterface.addIndex('credential_issue_batch', ['organization_id'], {
        name: 'IDX_CREDENTIAL_ISSUE_BATCH_ORGANIZATION_ID',
        transaction,
      });

      // 2. Add new columns to credential table
      await queryInterface.addColumn(
        'credential',
        'certificate_pdf_url',
        {
          type: DataTypes.STRING(2048),
          allowNull: true,
        },
        { transaction },
      );

      await queryInterface.addColumn(
        'credential',
        'batch_id',
        {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: 'credential_issue_batch',
            key: 'id',
          },
          onDelete: 'SET NULL',
        },
        { transaction },
      );

      await queryInterface.addIndex('credential', ['batch_id'], {
        name: 'IDX_CREDENTIAL_BATCH_ID',
        transaction,
      });

      await transaction.commit();
      console.log('✅ Batch issuance tables and columns created successfully');
    } catch (error) {
      await transaction.rollback();
      console.error('Migration UP failed, rolling back:', error);
      throw error;
    }
  },

  async down(queryInterface: QueryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeIndex('credential', 'IDX_CREDENTIAL_BATCH_ID', { transaction });
      await queryInterface.removeColumn('credential', 'batch_id', { transaction });
      await queryInterface.removeColumn('credential', 'certificate_pdf_url', { transaction });
      await queryInterface.dropTable('credential_issue_batch', { transaction });

      await transaction.commit();
      console.log('✅ Batch issuance tables and columns dropped successfully');
    } catch (error) {
      await transaction.rollback();
      console.error('Migration DOWN failed, rolling back:', error);
      throw error;
    }
  },
};
