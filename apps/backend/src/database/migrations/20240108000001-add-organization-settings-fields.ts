import { QueryInterface, DataTypes } from 'sequelize';

/**
 * Migration: Add organization settings fields
 *
 * Adds fields for:
 * - General Information (description, support_email, slogan, linkedin_company_id, website)
 * - Social Links (linkedin_url, facebook_url, twitter_url)
 * - Branding (logo_url, favicon_url)
 * - Issuer Portal (banner_url, portal_enabled)
 */
module.exports = {
  async up(queryInterface: QueryInterface) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // General Information fields
      await queryInterface.addColumn(
        'organization',
        'description',
        {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        { transaction },
      );

      await queryInterface.addColumn(
        'organization',
        'support_email',
        {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        { transaction },
      );

      await queryInterface.addColumn(
        'organization',
        'slogan',
        {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        { transaction },
      );

      await queryInterface.addColumn(
        'organization',
        'linkedin_company_id',
        {
          type: DataTypes.STRING(100),
          allowNull: true,
        },
        { transaction },
      );

      await queryInterface.addColumn(
        'organization',
        'website',
        {
          type: DataTypes.STRING(500),
          allowNull: true,
        },
        { transaction },
      );

      // Social Links fields
      await queryInterface.addColumn(
        'organization',
        'linkedin_url',
        {
          type: DataTypes.STRING(500),
          allowNull: true,
        },
        { transaction },
      );

      await queryInterface.addColumn(
        'organization',
        'facebook_url',
        {
          type: DataTypes.STRING(500),
          allowNull: true,
        },
        { transaction },
      );

      await queryInterface.addColumn(
        'organization',
        'twitter_url',
        {
          type: DataTypes.STRING(500),
          allowNull: true,
        },
        { transaction },
      );

      // Branding fields
      await queryInterface.addColumn(
        'organization',
        'logo_url',
        {
          type: DataTypes.STRING(500),
          allowNull: true,
        },
        { transaction },
      );

      await queryInterface.addColumn(
        'organization',
        'favicon_url',
        {
          type: DataTypes.STRING(500),
          allowNull: true,
        },
        { transaction },
      );

      // Issuer Portal fields
      await queryInterface.addColumn(
        'organization',
        'banner_url',
        {
          type: DataTypes.STRING(500),
          allowNull: true,
        },
        { transaction },
      );

      await queryInterface.addColumn(
        'organization',
        'portal_enabled',
        {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true,
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
      await queryInterface.removeColumn('organization', 'description', { transaction });
      await queryInterface.removeColumn('organization', 'support_email', { transaction });
      await queryInterface.removeColumn('organization', 'slogan', { transaction });
      await queryInterface.removeColumn('organization', 'linkedin_company_id', { transaction });
      await queryInterface.removeColumn('organization', 'website', { transaction });
      await queryInterface.removeColumn('organization', 'linkedin_url', { transaction });
      await queryInterface.removeColumn('organization', 'facebook_url', { transaction });
      await queryInterface.removeColumn('organization', 'twitter_url', { transaction });
      await queryInterface.removeColumn('organization', 'logo_url', { transaction });
      await queryInterface.removeColumn('organization', 'favicon_url', { transaction });
      await queryInterface.removeColumn('organization', 'banner_url', { transaction });
      await queryInterface.removeColumn('organization', 'portal_enabled', { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};

