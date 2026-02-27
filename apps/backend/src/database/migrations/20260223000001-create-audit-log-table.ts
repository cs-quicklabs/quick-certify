import { QueryInterface, DataTypes } from 'sequelize';

module.exports = {
  async up(queryInterface: QueryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable(
        'audit_log',
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
          target_user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
              model: 'user',
              key: 'id',
            },
            onDelete: 'CASCADE',
          },
          actor_id: {
            type: DataTypes.INTEGER,
            allowNull: true, // null = system / cron
            references: {
              model: 'user',
              key: 'id',
            },
            onDelete: 'SET NULL',
          },
          action: {
            type: DataTypes.STRING(100),
            allowNull: false,
          },
          previous_value: {
            type: DataTypes.JSONB,
            allowNull: true,
          },
          new_value: {
            type: DataTypes.JSONB,
            allowNull: true,
          },
          metadata: {
            type: DataTypes.JSONB,
            allowNull: true,
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

      await queryInterface.addIndex('audit_log', ['uuid'], {
        name: 'IDX_AUDIT_LOG_UUID',
        unique: true,
        transaction,
      });

      await queryInterface.addIndex('audit_log', ['target_user_id'], {
        name: 'IDX_AUDIT_LOG_TARGET_USER_ID',
        transaction,
      });

      await queryInterface.addIndex('audit_log', ['actor_id'], {
        name: 'IDX_AUDIT_LOG_ACTOR_ID',
        transaction,
      });

      await queryInterface.addIndex('audit_log', ['action'], {
        name: 'IDX_AUDIT_LOG_ACTION',
        transaction,
      });

      await transaction.commit();
      console.log('✅ Audit log table created successfully');
    } catch (error) {
      await transaction.rollback();
      console.error('Migration UP failed, rolling back:', error);
      throw error;
    }
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.dropTable('audit_log');
    console.log('✅ Audit log table dropped successfully');
  },
};
