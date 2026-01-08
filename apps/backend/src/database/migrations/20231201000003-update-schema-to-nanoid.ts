import { QueryInterface, DataTypes } from 'sequelize';

/**
 * Migration: Update schema to use nanoid instead of UUID
 *
 * Changes:
 * 1. Update role table: id from UUID to VARCHAR(21)
 * 2. Update organization table: id from UUID to VARCHAR(21)
 * 3. Update user table: id from UUID to VARCHAR(21), FKs to VARCHAR(21)
 * 4. Update session table: hash and user_id from UUID to VARCHAR(21)
 * 5. Update password_reset table: uuid and user_id from UUID to VARCHAR(21)
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  // Drop old tables if they exist (for fresh start)
  await queryInterface.dropTable('password_reset').catch(() => {});
  await queryInterface.dropTable('session').catch(() => {});
  await queryInterface.dropTable('user').catch(() => {});
  await queryInterface.dropTable('organization').catch(() => {});
  await queryInterface.dropTable('role').catch(() => {});

  // 1. Create role table with nanoid
  await queryInterface.createTable('role', {
    id: {
      type: DataTypes.STRING(21),
      primaryKey: true,
      allowNull: false,
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

  // 2. Create organization table with nanoid
  await queryInterface.createTable('organization', {
    id: {
      type: DataTypes.STRING(21),
      primaryKey: true,
      allowNull: false,
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

  // 3. Create user table with nanoid
  await queryInterface.createTable('user', {
    id: {
      type: DataTypes.STRING(21),
      primaryKey: true,
      allowNull: false,
    },
    organization_id: {
      type: DataTypes.STRING(21),
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
      type: DataTypes.STRING(21),
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

  // 4. Create session table with nanoid
  await queryInterface.createTable('session', {
    id: {
      type: DataTypes.STRING(21),
      primaryKey: true,
      allowNull: false,
    },
    hash: {
      type: DataTypes.STRING(21),
      allowNull: false,
    },
    user_id: {
      type: DataTypes.STRING(21),
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

  // 5. Create password_reset table with nanoid
  await queryInterface.createTable('password_reset', {
    id: {
      type: DataTypes.STRING(21),
      primaryKey: true,
      allowNull: false,
    },
    uuid: {
      type: DataTypes.STRING(21),
      allowNull: false,
    },
    user_id: {
      type: DataTypes.STRING(21),
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

