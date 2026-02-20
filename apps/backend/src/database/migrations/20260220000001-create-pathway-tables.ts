import { QueryInterface, DataTypes } from 'sequelize';

module.exports = {
  async up(queryInterface: QueryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // 1. Create pathway table
      await queryInterface.createTable(
        'pathway',
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
            references: { model: 'organization', key: 'id' },
            onDelete: 'CASCADE',
          },
          name: {
            type: DataTypes.STRING(255),
            allowNull: false,
          },
          description: {
            type: DataTypes.TEXT,
            allowNull: true,
          },
          banner_url: {
            type: DataTypes.STRING(500),
            allowNull: true,
          },
          duration: {
            type: DataTypes.STRING(100),
            allowNull: true,
          },
          status: {
            type: DataTypes.STRING(20),
            allowNull: false,
            defaultValue: 'draft',
          },
          is_active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
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

      await queryInterface.addIndex('pathway', ['uuid'], {
        name: 'IDX_PATHWAY_UUID',
        unique: true,
        transaction,
      });

      await queryInterface.addIndex('pathway', ['organization_id'], {
        name: 'IDX_PATHWAY_ORGANIZATION_ID',
        transaction,
      });

      // 2. Create pathway_event junction table
      await queryInterface.createTable(
        'pathway_event',
        {
          id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
          },
          pathway_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'pathway', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
          },
          event_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'event', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
          },
          order: {
            type: DataTypes.INTEGER,
            allowNull: true,
          },
          created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
          },
        },
        { transaction },
      );

      await queryInterface.addIndex('pathway_event', ['pathway_id', 'event_id'], {
        name: 'IDX_PATHWAY_EVENT_UNIQUE',
        unique: true,
        transaction,
      });

      await queryInterface.addIndex('pathway_event', ['event_id'], {
        name: 'IDX_PATHWAY_EVENT_EVENT_ID',
        transaction,
      });

      // 3. Create pathway_participant junction table
      await queryInterface.createTable(
        'pathway_participant',
        {
          id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
          },
          pathway_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'pathway', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
          },
          recipient_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'recipient', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
          },
          status: {
            type: DataTypes.STRING(20),
            allowNull: false,
            defaultValue: 'invited',
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

      await queryInterface.addIndex('pathway_participant', ['pathway_id', 'recipient_id'], {
        name: 'IDX_PATHWAY_PARTICIPANT_UNIQUE',
        unique: true,
        transaction,
      });

      await queryInterface.addIndex('pathway_participant', ['recipient_id'], {
        name: 'IDX_PATHWAY_PARTICIPANT_RECIPIENT_ID',
        transaction,
      });

      await transaction.commit();
      console.log('✅ Pathway tables created successfully');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Migration failed:', error);
      throw error;
    }
  },

  async down(queryInterface: QueryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.dropTable('pathway_participant', { transaction });
      await queryInterface.dropTable('pathway_event', { transaction });
      await queryInterface.dropTable('pathway', { transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};
