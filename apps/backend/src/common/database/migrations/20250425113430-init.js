'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create users table
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: 'Primary key identifier',
      },
      uuid: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        comment: 'Unique identifier for external references',
      },
      first_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'User first name',
      },
      last_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'User last name',
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'User email address (unique)',
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Hashed user password',
      },
      in_active_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Date when user was deactivated',
      },
      profile_image_url: {
        type: Sequelize.STRING(2048),
        allowNull: true,
        comment: 'URL to user profile image',
      },
      email_alerts_opt_in: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        comment: 'User consent for receiving email alerts',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Record creation timestamp',
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Record last update timestamp',
      },
    });

    // Create indexes for users table
    await queryInterface.addIndex('users', ['email'], {
      unique: true,
      name: 'idx_users_email',
    });
    await queryInterface.addIndex('users', ['uuid'], {
      unique: true,
      name: 'idx_users_uuid',
    });

    // Create session table
    await queryInterface.createTable('session', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: 'Primary key identifier',
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
        comment: 'Foreign key to users table',
      },
      hash: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Session hash for authentication',
      },
      expires: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Session expiration timestamp',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Record creation timestamp',
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Record last update timestamp',
      },
    });

    // Create roles table
    await queryInterface.createTable('roles', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: 'Primary key identifier',
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Human-readable role name',
      },
      code: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
        comment: 'Machine-readable role identifier',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Record creation timestamp',
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Record last update timestamp',
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Soft delete timestamp',
      },
    });

    // Create indexes for roles table
    await queryInterface.addIndex('roles', ['code'], {
      unique: true,
      name: 'idx_roles_code',
    });

    // Create permissions table
    await queryInterface.createTable('permissions', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: 'Primary key identifier',
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Human-readable permission name',
      },
      code: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
        comment: 'Machine-readable permission identifier',
      },
      description: {
        type: Sequelize.STRING(500),
        allowNull: true,
        comment: 'Detailed description of what this permission allows',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Record creation timestamp',
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Record last update timestamp',
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Soft delete timestamp',
      },
    });

    // Create indexes for permissions table
    await queryInterface.addIndex('permissions', ['code'], {
      unique: true,
      name: 'idx_permissions_code',
    });

    // Create role_permissions table (junction table for many-to-many)
    await queryInterface.createTable('role_permissions', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: 'Primary key identifier',
      },
      role_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'roles',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        comment: 'Foreign key to roles table',
      },
      permission_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'permissions',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        comment: 'Foreign key to permissions table',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Record creation timestamp',
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Record last update timestamp',
      },
    });

    // Create indexes for role_permissions table
    await queryInterface.addIndex(
      'role_permissions',
      ['role_id', 'permission_id'],
      {
        unique: true,
        name: 'idx_role_permissions_composite',
      }
    );
    await queryInterface.addIndex('role_permissions', ['role_id'], {
      name: 'idx_role_permissions_role_id',
    });
    await queryInterface.addIndex('role_permissions', ['permission_id'], {
      name: 'idx_role_permissions_permission_id',
    });

    // Create organizations table
    await queryInterface.createTable('organizations', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: 'Primary key identifier',
      },
      name: {
        type: Sequelize.STRING(200),
        allowNull: false,
        comment: 'Organization name',
      },
      slug: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
        comment: 'URL-friendly unique identifier',
      },
      linked_in_url: {
        type: Sequelize.STRING(1024),
        allowNull: true,
        comment: 'LinkedIn profile URL',
      },
      facebook_url: {
        type: Sequelize.STRING(1024),
        allowNull: true,
        comment: 'Facebook page URL',
      },
      twitter_url: {
        type: Sequelize.STRING(1024),
        allowNull: true,
        comment: 'Twitter/X profile URL',
      },
      website_url: {
        type: Sequelize.STRING(1024),
        allowNull: true,
        comment: 'Organization website URL',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Record creation timestamp',
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Record last update timestamp',
      },
    });

    // Create indexes for organizations table
    await queryInterface.addIndex('organizations', ['slug'], {
      unique: true,
      name: 'idx_organizations_slug',
    });

    // Create organization_users table (junction table for organizations and users with roles)
    await queryInterface.createTable('organization_users', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: 'Primary key identifier',
      },
      organization_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'organizations',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        comment: 'Foreign key to organizations table',
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        comment: 'Foreign key to users table',
      },
      role_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'roles',
          key: 'id',
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
        comment:
          'Foreign key to roles table defining user permissions in this organization',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Record creation timestamp',
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Record last update timestamp',
      },
    });

    // Create indexes for organization_users table
    await queryInterface.addIndex(
      'organization_users',
      ['organization_id', 'user_id'],
      {
        unique: true,
        name: 'idx_org_user_composite',
      }
    );
    await queryInterface.addIndex('organization_users', ['user_id'], {
      name: 'idx_org_user_user_id',
    });
    await queryInterface.addIndex('organization_users', ['organization_id'], {
      name: 'idx_org_user_org_id',
    });
    await queryInterface.addIndex('organization_users', ['role_id'], {
      name: 'idx_org_user_role_id',
    });
  },

  async down(queryInterface, Sequelize) {
    // Drop tables in reverse order to handle foreign key constraints
    await queryInterface.dropTable('organization_users');
    await queryInterface.dropTable('organizations');
    await queryInterface.dropTable('role_permissions');
    await queryInterface.dropTable('permissions');
    await queryInterface.dropTable('roles');
    await queryInterface.dropTable('session');
    await queryInterface.dropTable('users');
  },
};
