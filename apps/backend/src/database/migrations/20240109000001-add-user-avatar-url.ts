import { QueryInterface, DataTypes } from 'sequelize';

/**
 * Migration: Add avatar_url field to user table
 *
 * Adds avatar_url column to store user profile picture URL
 */
module.exports = {
    async up(queryInterface: QueryInterface) {
        const transaction = await queryInterface.sequelize.transaction();

        try {
            await queryInterface.addColumn(
                'user',
                'avatar_url',
                {
                    type: DataTypes.STRING(500),
                    allowNull: true,
                },
                { transaction },
            );

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    },

    async down(queryInterface: QueryInterface) {
        const transaction = await queryInterface.sequelize.transaction();

        try {
            await queryInterface.removeColumn('user', 'avatar_url', { transaction });

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    },
};

