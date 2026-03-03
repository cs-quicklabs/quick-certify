import { QueryInterface } from 'sequelize';

/**
 * Add composite indexes for common multi-tenant query patterns:
 * - credential(organization_id, event_id) — list credentials by event per org
 * - credential(organization_id, recipient_id) — list credentials by recipient per org
 * - user(organization_id, status) — list users filtered by status per org
 * - event(organization_id, is_active) — list active events per org
 */
module.exports = {
  async up(queryInterface: QueryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addIndex('credential', ['organization_id', 'event_id'], {
        name: 'IDX_CREDENTIAL_ORG_EVENT',
        transaction,
      });

      await queryInterface.addIndex('credential', ['organization_id', 'recipient_id'], {
        name: 'IDX_CREDENTIAL_ORG_RECIPIENT',
        transaction,
      });

      await queryInterface.addIndex('user', ['organization_id', 'status'], {
        name: 'IDX_USER_ORG_STATUS',
        transaction,
      });

      await queryInterface.addIndex('event', ['organization_id', 'is_active'], {
        name: 'IDX_EVENT_ORG_ACTIVE',
        transaction,
      });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface: QueryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeIndex('credential', 'IDX_CREDENTIAL_ORG_EVENT', { transaction });
      await queryInterface.removeIndex('credential', 'IDX_CREDENTIAL_ORG_RECIPIENT', {
        transaction,
      });
      await queryInterface.removeIndex('user', 'IDX_USER_ORG_STATUS', { transaction });
      await queryInterface.removeIndex('event', 'IDX_EVENT_ORG_ACTIVE', { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};
