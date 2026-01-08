import { QueryInterface, DataTypes, Sequelize } from 'sequelize';

/**
 * Migration: Update schema to use UUID primary keys and new structure
 *
 * Changes:
 * 1. Create role table with UUID PK
 * 2. Update organization table: UUID PK, add slug, is_active, issuer_verified, remove old fields
 * 3. Update user table: UUID PK, update FKs to UUID, add new fields, remove old fields
 * 4. Update session table: user_id FK to UUID
 * 5. Update password_reset table: user_id FK to UUID
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  // 1. Create role table
  await queryInterface.createTable('role', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
      defaultValue: Sequelize.literal('gen_random_uuid()'),
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
  });

  await queryInterface.addIndex('role', ['role'], {
    name: 'IDX_ROLE_NAME',
    unique: true,
  });

  // 2. Drop old tables if they exist (for fresh start)
  // Note: In production, you'd want to migrate data first
  await queryInterface.dropTable('password_reset').catch(() => {});
  await queryInterface.dropTable('session').catch(() => {});
  await queryInterface.dropTable('user').catch(() => {});
  await queryInterface.dropTable('organization').catch(() => {});
  await queryInterface.dropTable('user_type').catch(() => {});

  // 3. Create organization table with new schema
  await queryInterface.createTable('organization', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
      defaultValue: Sequelize.literal('gen_random_uuid()'),
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(150),
      allowNull: false,
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
  });

  await queryInterface.addIndex('organization', ['name'], {
    name: 'IDX_ORGANIZATION_NAME',
    unique: true,
  });

  await queryInterface.addIndex('organization', ['slug'], {
    name: 'IDX_ORGANIZATION_SLUG',
    unique: true,
  });

  // 4. Create user table with new schema
  await queryInterface.createTable('user', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
      defaultValue: Sequelize.literal('gen_random_uuid()'),
    },
    organization_id: {
      type: DataTypes.UUID,
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
      type: DataTypes.UUID,
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
    email_notifications: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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
  });

  await queryInterface.addIndex('user', ['email'], {
    name: 'IDX_USER_EMAIL',
    unique: true,
  });

  await queryInterface.addIndex('user', ['organization_id'], {
    name: 'IDX_USER_ORGANIZATION_ID',
  });

  await queryInterface.addIndex('user', ['role_id'], {
    name: 'IDX_USER_ROLE_ID',
  });

  // 5. Create session table (updated for UUID user_id)
  await queryInterface.createTable('session', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    hash: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: Sequelize.literal('gen_random_uuid()'),
    },
    user_id: {
      type: DataTypes.UUID,
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
      type: DataTypes.STRING(45),
      allowNull: true,
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    device_type: {
      type: DataTypes.STRING(20),
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
  });

  await queryInterface.addIndex('session', ['hash'], {
    name: 'IDX_SESSION_HASH',
    unique: true,
  });

  await queryInterface.addIndex('session', ['user_id'], {
    name: 'IDX_SESSION_USER_ID',
  });

  await queryInterface.addIndex('session', ['is_active'], {
    name: 'IDX_SESSION_IS_ACTIVE',
  });

  await queryInterface.addIndex('session', ['expires_at'], {
    name: 'IDX_SESSION_EXPIRES_AT',
  });

  await queryInterface.addIndex('session', ['user_id', 'is_active'], {
    name: 'IDX_SESSION_USER_ACTIVE',
  });

  // 6. Create password_reset table (updated for UUID user_id)
  await queryInterface.createTable('password_reset', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    uuid: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: Sequelize.literal('gen_random_uuid()'),
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'user',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    token: {
      type: DataTypes.STRING(255),
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
  });

  await queryInterface.addIndex('password_reset', ['uuid'], {
    name: 'IDX_PASSWORD_RESET_UUID',
    unique: true,
  });

  await queryInterface.addIndex('password_reset', ['token'], {
    name: 'IDX_PASSWORD_RESET_TOKEN',
  });

  await queryInterface.addIndex('password_reset', ['user_id'], {
    name: 'IDX_PASSWORD_RESET_USER_ID',
  });

  await queryInterface.addIndex('password_reset', ['expires_at'], {
    name: 'IDX_PASSWORD_RESET_EXPIRES_AT',
  });

  await queryInterface.addIndex('password_reset', ['token', 'is_used'], {
    name: 'IDX_PASSWORD_RESET_TOKEN_USED',
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('password_reset');
  await queryInterface.dropTable('session');
  await queryInterface.dropTable('user');
  await queryInterface.dropTable('organization');
  await queryInterface.dropTable('role');
}

