import { QueryInterface, DataTypes, Sequelize } from 'sequelize';

/**
 * Migration: Create all database tables
 *
 * Creates tables in order:
 * 1. user_type - User roles
 * 2. organization - Multi-tenant organizations
 * 3. user - User accounts
 * 4. session - Authentication sessions
 * 5. password_reset - Password reset tokens
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  // 1. Create user_type table
  await queryInterface.createTable('user_type', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
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
  });

  await queryInterface.addIndex('user_type', ['code'], {
    name: 'IDX_USER_TYPE_CODE',
    unique: true,
  });

  // 2. Create organization table
  await queryInterface.createTable('organization', {
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
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    website: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    deleted_at: {
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

  await queryInterface.addIndex('organization', ['uuid'], {
    name: 'IDX_ORGANIZATION_UUID',
    unique: true,
  });

  await queryInterface.addIndex('organization', ['deleted_at'], {
    name: 'IDX_ORGANIZATION_DELETED_AT',
  });

  // 3. Create user table
  await queryInterface.createTable('user', {
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
    first_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    gender: {
      type: DataTypes.ENUM('male', 'female', 'other'),
      allowNull: true,
    },
    profile_picture: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    user_type_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'user_type',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
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
    deleted_at: {
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

  await queryInterface.addIndex('user', ['uuid'], {
    name: 'IDX_USER_UUID',
    unique: true,
  });

  // Partial unique index on email where deleted_at is null
  await queryInterface.sequelize.query(`
    CREATE UNIQUE INDEX "IDX_USER_EMAIL" ON "user" (LOWER(email)) WHERE deleted_at IS NULL;
  `);

  await queryInterface.addIndex('user', ['user_type_id'], {
    name: 'IDX_USER_USER_TYPE_ID',
  });

  await queryInterface.addIndex('user', ['organization_id'], {
    name: 'IDX_USER_ORGANIZATION_ID',
  });

  await queryInterface.addIndex('user', ['deleted_at'], {
    name: 'IDX_USER_DELETED_AT',
  });

  // 4. Create session table
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
      type: DataTypes.STRING(45), // IPv6 max length
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

  // 5. Create password_reset table
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
  // Drop tables in reverse order (respecting foreign key constraints)
  await queryInterface.dropTable('password_reset');
  await queryInterface.dropTable('session');
  await queryInterface.dropTable('user');
  await queryInterface.dropTable('organization');
  await queryInterface.dropTable('user_type');
}
