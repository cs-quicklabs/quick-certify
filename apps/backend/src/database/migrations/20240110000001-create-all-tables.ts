import { QueryInterface, DataTypes } from 'sequelize';

/**
 * Migration: Create all tables
 *
 * Creates all database tables in the correct order to respect foreign key dependencies
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
                },
                { transaction },
            );

            await queryInterface.addIndex('role', ['role'], {
                name: 'IDX_ROLE_NAME',
                unique: true,
                transaction,
            });

            // 2. Create organization table (no dependencies)
            await queryInterface.createTable(
                'organization',
                {
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
                        allowNull: true,
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

            // 3. Create skill table (depends on organization)
            await queryInterface.createTable(
                'skill',
                {
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

            // 4. Create user table (depends on organization and role)
            await queryInterface.createTable(
                'user',
                {
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

            // 5. Create session table (depends on user)
            await queryInterface.createTable(
                'session',
                {
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

            // 6. Create password_reset table (depends on user)
            await queryInterface.createTable(
                'password_reset',
                {
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

            await queryInterface.addIndex('password_reset', ['uuid'], {
                name: 'IDX_PASSWORD_RESET_UUID',
                unique: true,
                transaction,
            });

            await queryInterface.addIndex('password_reset', ['token'], {
                name: 'IDX_PASSWORD_RESET_TOKEN',
                transaction,
            });

            await transaction.commit();
            console.log('✅ All tables created successfully');
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    },

    async down(queryInterface: QueryInterface) {
        const transaction = await queryInterface.sequelize.transaction();

        try {
            // Drop tables in reverse order (respecting foreign key dependencies)
            await queryInterface.dropTable('password_reset', { transaction });
            await queryInterface.dropTable('session', { transaction });
            await queryInterface.dropTable('user', { transaction });
            await queryInterface.dropTable('skill', { transaction });
            await queryInterface.dropTable('organization', { transaction });
            await queryInterface.dropTable('role', { transaction });

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    },
};

