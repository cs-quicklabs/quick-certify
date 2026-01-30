import { QueryInterface, DataTypes } from 'sequelize';

/**
 * Migration: Create all tables with id/uuid structure
 *
 * Creates all database tables with:
 * - id: INTEGER, auto-increment, primary key (for foreign keys and relations)
 * - uuid: STRING(21), unique index (for external API operations)
 * - All foreign keys use INTEGER (id) for relations
 */
module.exports = {
  async up(queryInterface: QueryInterface) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // 1. Create role table (no dependencies)
      await queryInterface.createTable(
        'role',
        {
          id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
          },
          uuid: {
            type: DataTypes.STRING(21),
            allowNull: false,
            unique: true,
          },
          role: {
            type: DataTypes.STRING(100),
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

      await queryInterface.addIndex('role', ['role'], {
        name: 'IDX_ROLE_NAME',
        unique: true,
        transaction,
      });

      await queryInterface.addIndex('role', ['uuid'], {
        name: 'IDX_ROLE_UUID',
        unique: true,
        transaction,
      });

      // 2. Create organization table (no dependencies)
      await queryInterface.createTable(
        'organization',
        {
          id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
          },
          uuid: {
            type: DataTypes.STRING(21),
            allowNull: false,
            unique: true,
          },
          name: {
            type: DataTypes.STRING(150),
            allowNull: false,
          },
          slug: {
            type: DataTypes.STRING(150),
            allowNull: false,
          },
          description: {
            type: DataTypes.TEXT,
            allowNull: true,
          },
          support_email: {
            type: DataTypes.STRING(255),
            allowNull: true,
          },
          slogan: {
            type: DataTypes.STRING(255),
            allowNull: true,
          },
          linkedin_company_id: {
            type: DataTypes.STRING(100),
            allowNull: true,
          },
          website: {
            type: DataTypes.STRING(500),
            allowNull: false,
          },
          linkedin_url: {
            type: DataTypes.STRING(500),
            allowNull: true,
          },
          facebook_url: {
            type: DataTypes.STRING(500),
            allowNull: true,
          },
          twitter_url: {
            type: DataTypes.STRING(500),
            allowNull: true,
          },
          logo_url: {
            type: DataTypes.STRING(500),
            allowNull: true,
          },
          favicon_url: {
            type: DataTypes.STRING(500),
            allowNull: true,
          },
          banner_url: {
            type: DataTypes.STRING(500),
            allowNull: true,
          },
          portal_enabled: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
          },
          is_active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
          },
          issuer_verified: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
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

      await queryInterface.addIndex('organization', ['name'], {
        name: 'IDX_ORGANIZATION_NAME',
        unique: true,
        transaction,
      });

      await queryInterface.addIndex('organization', ['slug'], {
        name: 'IDX_ORGANIZATION_SLUG',
        unique: true,
        transaction,
      });

      await queryInterface.addIndex('organization', ['website'], {
        name: 'IDX_ORGANIZATION_WEBSITE',
        unique: true,
        transaction,
      });

      await queryInterface.addIndex('organization', ['uuid'], {
        name: 'IDX_ORGANIZATION_UUID',
        unique: true,
        transaction,
      });

      // 3. Create user table (depends on organization and role)
      await queryInterface.createTable(
        'user',
        {
          id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
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
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
          },
          first_name: {
            type: DataTypes.STRING(100),
            allowNull: false,
          },
          last_name: {
            type: DataTypes.STRING(100),
            allowNull: true,
          },
          email: {
            type: DataTypes.STRING(255),
            allowNull: false,
          },
          password_hash: {
            type: DataTypes.TEXT,
            allowNull: true,
          },
          auth_provider: {
            type: DataTypes.STRING(50),
            allowNull: false,
            defaultValue: 'email',
          },
          google_id: {
            type: DataTypes.STRING(255),
            allowNull: true,
          },
          role_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
              model: 'role',
              key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
          },
          status: {
            type: DataTypes.STRING(20),
            allowNull: false,
            defaultValue: 'active',
          },
          avatar_url: {
            type: DataTypes.STRING(500),
            allowNull: true,
          },
          is_email_notifications_enabled: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
          },
          deleted_at: {
            type: DataTypes.DATE,
            allowNull: true,
          },
          last_login_at: {
            type: DataTypes.DATE,
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

      await queryInterface.addIndex('user', ['email'], {
        name: 'IDX_USER_EMAIL',
        unique: true,
        transaction,
      });

      await queryInterface.addIndex('user', ['uuid'], {
        name: 'IDX_USER_UUID',
        unique: true,
        transaction,
      });

      await queryInterface.addIndex('user', ['organization_id'], {
        name: 'IDX_USER_ORGANIZATION_ID',
        transaction,
      });

      // 4. Create session table (depends on user)
      await queryInterface.createTable(
        'session',
        {
          id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
          },
          uuid: {
            type: DataTypes.STRING(21),
            allowNull: false,
            unique: true,
          },
          hash: {
            type: DataTypes.STRING(21),
            allowNull: false,
            unique: true,
          },
          user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
              model: 'user',
              key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
          },
          expires_at: {
            type: DataTypes.DATE,
            allowNull: false,
          },
          ip_address: {
            type: DataTypes.STRING,
            allowNull: true,
          },
          user_agent: {
            type: DataTypes.TEXT,
            allowNull: true,
          },
          device_type: {
            type: DataTypes.STRING,
            allowNull: true,
          },
          is_active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
          },
          last_activity_at: {
            type: DataTypes.DATE,
            allowNull: true,
          },
          revoked_at: {
            type: DataTypes.DATE,
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

      await queryInterface.addIndex('session', ['hash'], {
        name: 'IDX_SESSION_HASH',
        unique: true,
        transaction,
      });

      await queryInterface.addIndex('session', ['user_id'], {
        name: 'IDX_SESSION_USER_ID',
        transaction,
      });

      await queryInterface.addIndex('session', ['uuid'], {
        name: 'IDX_SESSION_UUID',
        unique: true,
        transaction,
      });

      // 5. Create password_reset table (depends on user)
      await queryInterface.createTable(
        'password_reset',
        {
          id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
          },
          uuid: {
            type: DataTypes.STRING(21),
            allowNull: false,
            unique: true,
          },
          token_uuid: {
            type: DataTypes.STRING(21),
            allowNull: false,
            unique: true,
          },
          user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
              model: 'user',
              key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
          },
          token: {
            type: DataTypes.STRING,
            allowNull: false,
          },
          expires_at: {
            type: DataTypes.DATE,
            allowNull: false,
          },
          is_used: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
          },
          used_at: {
            type: DataTypes.DATE,
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

      await queryInterface.addIndex('password_reset', ['token_uuid'], {
        name: 'IDX_PASSWORD_RESET_TOKEN_UUID',
        unique: true,
        transaction,
      });

      await queryInterface.addIndex('password_reset', ['token'], {
        name: 'IDX_PASSWORD_RESET_TOKEN',
        transaction,
      });

      await queryInterface.addIndex('password_reset', ['uuid'], {
        name: 'IDX_PASSWORD_RESET_UUID',
        unique: true,
        transaction,
      });

      // 6. Create skill table (depends on organization)
      await queryInterface.createTable(
        'skill',
        {
          id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
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
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
          },
          name: {
            type: DataTypes.STRING(150),
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

      await queryInterface.addIndex('skill', ['organization_id', 'name'], {
        name: 'IDX_SKILL_ORG_NAME',
        unique: true,
        transaction,
      });

      await queryInterface.addIndex('skill', ['uuid'], {
        name: 'IDX_SKILL_UUID',
        unique: true,
        transaction,
      });

      // 7. Create event_type table (no dependencies)
      await queryInterface.createTable(
        'event_type',
        {
          id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
          },
          uuid: {
            type: DataTypes.STRING(21),
            allowNull: false,
            unique: true,
          },
          name: {
            type: DataTypes.STRING(150),
            allowNull: false,
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

      await queryInterface.addIndex('event_type', ['name'], {
        name: 'IDX_EVENT_TYPE_NAME',
        unique: true,
        transaction,
      });

      await queryInterface.addIndex('event_type', ['uuid'], {
        name: 'IDX_EVENT_TYPE_UUID',
        unique: true,
        transaction,
      });

      // 8. Create event_level table (no dependencies)
      await queryInterface.createTable(
        'event_level',
        {
          id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
          },
          uuid: {
            type: DataTypes.STRING(21),
            allowNull: false,
            unique: true,
          },
          name: {
            type: DataTypes.STRING(150),
            allowNull: false,
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

      await queryInterface.addIndex('event_level', ['name'], {
        name: 'IDX_EVENT_LEVEL_NAME',
        unique: true,
        transaction,
      });

      await queryInterface.addIndex('event_level', ['uuid'], {
        name: 'IDX_EVENT_LEVEL_UUID',
        unique: true,
        transaction,
      });

      // 9. Create event_format table (no dependencies)
      await queryInterface.createTable(
        'event_format',
        {
          id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
          },
          uuid: {
            type: DataTypes.STRING(21),
            allowNull: false,
            unique: true,
          },
          name: {
            type: DataTypes.STRING(150),
            allowNull: false,
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

      await queryInterface.addIndex('event_format', ['name'], {
        name: 'IDX_EVENT_FORMAT_NAME',
        unique: true,
        transaction,
      });

      await queryInterface.addIndex('event_format', ['uuid'], {
        name: 'IDX_EVENT_FORMAT_UUID',
        unique: true,
        transaction,
      });

      // 10. Create event table (depends on event_type, event_level, event_format)
      await queryInterface.createTable(
        'event',
        {
          id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
          },
          uuid: {
            type: DataTypes.STRING(21),
            allowNull: false,
            unique: true,
          },
          name: {
            type: DataTypes.STRING(255),
            allowNull: false,
          },
          event_type_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
              model: 'event_type',
              key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
          },
          event_level_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
              model: 'event_level',
              key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
          },
          event_format_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
              model: 'event_format',
              key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
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

      // 11. Create design table
      await queryInterface.createTable(
        'designs',
        {
          id: {
            type: DataTypes.STRING(21),
            primaryKey: true,
            allowNull: false,
          },
          name: {
            type: DataTypes.STRING(100),
            allowNull: false,
          },
          type: {
            type: DataTypes.STRING(15),
            allowNull: false,
          },
          url: {
            type: DataTypes.STRING(500),
            allowNull: false,
          },
          layout: {
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

      await queryInterface.addIndex('event', ['event_type_id'], {
        name: 'IDX_EVENT_TYPE_ID',
        transaction,
      });

      await queryInterface.addIndex('event', ['event_level_id'], {
        name: 'IDX_EVENT_LEVEL_ID',
        transaction,
      });

      await queryInterface.addIndex('event', ['event_format_id'], {
        name: 'IDX_EVENT_FORMAT_ID',
        transaction,
      });

      await queryInterface.addIndex('event', ['uuid'], {
        name: 'IDX_EVENT_UUID',
        unique: true,
        transaction,
      });

      await transaction.commit();
      console.log('✅ All tables created successfully');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Migration failed:', error);
      throw error;
    }
  },

  async down(queryInterface: QueryInterface) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Drop tables in reverse order of dependencies
      await queryInterface.dropTable('event', { transaction });
      await queryInterface.dropTable('event_format', { transaction });
      await queryInterface.dropTable('event_level', { transaction });
      await queryInterface.dropTable('event_type', { transaction });
      await queryInterface.dropTable('skill', { transaction });
      await queryInterface.dropTable('password_reset', { transaction });
      await queryInterface.dropTable('session', { transaction });
      await queryInterface.dropTable('user', { transaction });
      await queryInterface.dropTable('organization', { transaction });
      await queryInterface.dropTable('role', { transaction });

      await transaction.commit();
      console.log('✅ All tables dropped successfully');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Rollback failed:', error);
      throw error;
    }
  },
};
