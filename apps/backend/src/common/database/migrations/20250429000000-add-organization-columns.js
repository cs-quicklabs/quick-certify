'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add linkedInCompanyId column
    await queryInterface.addColumn('organizations', 'linked_in_company_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: 'LinkedIn Company ID for the organization',
    });

    // Add isVerified column
    await queryInterface.addColumn('organizations', 'is_verified', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Indicates whether the organization has been verified',
    });

    // Add description column
    await queryInterface.addColumn('organizations', 'description', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Organization description',
    });

    // Add supportEmail column
    await queryInterface.addColumn('organizations', 'support_email', {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: 'Support email address for the organization',
    });

    // Add slogan column
    await queryInterface.addColumn('organizations', 'slogan', {
      type: Sequelize.STRING(500),
      allowNull: true,
      comment: 'Organization slogan or tagline',
    });

    // Add issuerLogo column
    await queryInterface.addColumn('organizations', 'issuer_logo', {
      type: Sequelize.STRING(2048),
      allowNull: true,
      comment: 'S3 URL for issuer/organization logo image',
    });

    // Add favIcon column
    await queryInterface.addColumn('organizations', 'fav_icon', {
      type: Sequelize.STRING(2048),
      allowNull: true,
      comment: 'S3 URL for organization favicon',
    });

    // Add bannerImage column
    await queryInterface.addColumn('organizations', 'banner_image', {
      type: Sequelize.STRING(2048),
      allowNull: true,
      comment: 'S3 URL for organization banner image',
    });

    // Add isEnabledIssuerPortal column
    await queryInterface.addColumn(
      'organizations',
      'is_enabled_issuer_portal',
      {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment:
          'Indicates whether the issuer portal is enabled for this organization',
      }
    );

    // Add indexes for faster lookups
    await queryInterface.addIndex('organizations', ['linked_in_company_id'], {
      name: 'idx_organizations_linkedin_company_id',
    });

    await queryInterface.addIndex('organizations', ['is_verified'], {
      name: 'idx_organizations_is_verified',
    });

    await queryInterface.addIndex('organizations', ['support_email'], {
      name: 'idx_organizations_support_email',
    });

    await queryInterface.addIndex(
      'organizations',
      ['is_enabled_issuer_portal'],
      {
        name: 'idx_organizations_is_enabled_issuer_portal',
      }
    );
  },

  async down(queryInterface) {
    // Remove indexes first
    await queryInterface.removeIndex(
      'organizations',
      'idx_organizations_linkedin_company_id'
    );
    await queryInterface.removeIndex(
      'organizations',
      'idx_organizations_is_verified'
    );
    await queryInterface.removeIndex(
      'organizations',
      'idx_organizations_support_email'
    );
    await queryInterface.removeIndex(
      'organizations',
      'idx_organizations_is_enabled_issuer_portal'
    );

    // Remove columns
    await queryInterface.removeColumn('organizations', 'linked_in_company_id');
    await queryInterface.removeColumn('organizations', 'is_verified');
    await queryInterface.removeColumn('organizations', 'description');
    await queryInterface.removeColumn('organizations', 'support_email');
    await queryInterface.removeColumn('organizations', 'slogan');
    await queryInterface.removeColumn('organizations', 'issuer_logo');
    await queryInterface.removeColumn('organizations', 'fav_icon');
    await queryInterface.removeColumn('organizations', 'banner_image');
    await queryInterface.removeColumn(
      'organizations',
      'is_enabled_issuer_portal'
    );
  },
};
