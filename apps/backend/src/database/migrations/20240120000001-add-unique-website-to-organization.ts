import { QueryInterface, DataTypes } from 'sequelize';

/**
 * Migration: Make organization website unique and non-nullable
 *
 * Makes the website field required (NOT NULL) and unique across all organizations.
 */
module.exports = {
  async up(queryInterface: QueryInterface) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // First, check for any NULL or empty website values
      const [nullValues] = await queryInterface.sequelize.query(
        `SELECT id, name FROM organization WHERE website IS NULL OR website = ''`,
        { transaction },
      );

      if (Array.isArray(nullValues) && nullValues.length > 0) {
        console.warn('⚠️  Warning: Found organizations with NULL or empty website values:');
        console.warn(nullValues);
        throw new Error(
          'Cannot make website NOT NULL: some organizations have NULL or empty website values. Please update them first.',
        );
      }

      // Check for any duplicate website values
      const [duplicates] = await queryInterface.sequelize.query(
        `SELECT website, COUNT(*) as count
         FROM organization
         GROUP BY website
         HAVING COUNT(*) > 1`,
        { transaction },
      );

      if (Array.isArray(duplicates) && duplicates.length > 0) {
        console.warn(
          '⚠️  Warning: Found duplicate website values. Please resolve these before running migration:',
        );
        console.warn(duplicates);
        throw new Error('Cannot add unique constraint: duplicate website values exist');
      }

      // Change column to NOT NULL
      await queryInterface.changeColumn(
        'organization',
        'website',
        {
          type: DataTypes.STRING(500),
          allowNull: false,
        },
        { transaction },
      );

      // Add unique index on website column
      await queryInterface.addIndex('organization', ['website'], {
        name: 'IDX_ORGANIZATION_WEBSITE',
        unique: true,
        transaction,
      });

      await transaction.commit();
      console.log('✅ Made organization.website NOT NULL and added unique index');
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface: QueryInterface) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Remove unique index
      await queryInterface.removeIndex('organization', 'IDX_ORGANIZATION_WEBSITE', { transaction });

      // Change column back to nullable
      await queryInterface.changeColumn(
        'organization',
        'website',
        {
          type: DataTypes.STRING(500),
          allowNull: true,
        },
        { transaction },
      );

      await transaction.commit();
      console.log('✅ Reverted organization.website to nullable and removed unique index');
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};
