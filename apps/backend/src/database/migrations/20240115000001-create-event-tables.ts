import { QueryInterface, DataTypes } from 'sequelize';

/**
 * Migration: Create event tables
 *
 * Creates event_types, event_levels, event_formats, and events tables
 * with nanoid primary keys, foreign keys, and indexes
 */
module.exports = {
    async up(queryInterface: QueryInterface) {
        const transaction = await queryInterface.sequelize.transaction();

        try {
            // 1. Create event_types table
            await queryInterface.createTable(
                'event_types',
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

            await queryInterface.addIndex('event_types', ['name'], {
                name: 'IDX_EVENT_TYPE_NAME',
                unique: true,
                transaction,
            });

            // 2. Create event_levels table
            await queryInterface.createTable(
                'event_levels',
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

            await queryInterface.addIndex('event_levels', ['name'], {
                name: 'IDX_EVENT_LEVEL_NAME',
                unique: true,
                transaction,
            });

            // 3. Create event_formats table
            await queryInterface.createTable(
                'event_formats',
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

            await queryInterface.addIndex('event_formats', ['name'], {
                name: 'IDX_EVENT_FORMAT_NAME',
                unique: true,
                transaction,
            });

            // 4. Create events table (depends on event_types, event_levels, event_formats)
            await queryInterface.createTable(
                'events',
                {
                    id: {
                        type: DataTypes.STRING(21),
                        primaryKey: true,
                        allowNull: false,
                    },
                    name: {
                        type: DataTypes.STRING(255),
                        allowNull: false,
                    },
                    event_type_id: {
                        type: DataTypes.STRING(21),
                        allowNull: false,
                        references: {
                            model: 'event_types',
                            key: 'id',
                        },
                        onUpdate: 'CASCADE',
                        onDelete: 'RESTRICT',
                    },
                    event_level_id: {
                        type: DataTypes.STRING(21),
                        allowNull: false,
                        references: {
                            model: 'event_levels',
                            key: 'id',
                        },
                        onUpdate: 'CASCADE',
                        onDelete: 'RESTRICT',
                    },
                    event_format_id: {
                        type: DataTypes.STRING(21),
                        allowNull: false,
                        references: {
                            model: 'event_formats',
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

            // Add indexes on foreign keys
            await queryInterface.addIndex('events', ['event_type_id'], {
                name: 'IDX_EVENT_TYPE_ID',
                transaction,
            });

            await queryInterface.addIndex('events', ['event_level_id'], {
                name: 'IDX_EVENT_LEVEL_ID',
                transaction,
            });

            await queryInterface.addIndex('events', ['event_format_id'], {
                name: 'IDX_EVENT_FORMAT_ID',
                transaction,
            });

            await transaction.commit();
            console.log('✅ Event tables created successfully');
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    },

    async down(queryInterface: QueryInterface) {
        const transaction = await queryInterface.sequelize.transaction();

        try {
            // Drop tables in reverse order (events first due to foreign keys)
            await queryInterface.dropTable('events', { transaction });
            await queryInterface.dropTable('event_formats', { transaction });
            await queryInterface.dropTable('event_levels', { transaction });
            await queryInterface.dropTable('event_types', { transaction });

            await transaction.commit();
            console.log('✅ Event tables dropped successfully');
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    },
};

