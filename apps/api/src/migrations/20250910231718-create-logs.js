'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('logs', {
      id: { type: Sequelize.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      user_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'SET NULL',
        onDelete: 'SET NULL',
      },
      action: {
        type: Sequelize.ENUM('CREATE', 'UPDATE', 'DELETE', 'VIEW', 'LOGIN', 'LOGOUT'),
        allowNull: false,
      },
      entity: { type: Sequelize.STRING(50), allowNull: true },
      entity_id: { type: Sequelize.STRING(50), allowNull: true },
      description: { type: Sequelize.TEXT, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('logs', ['user_id']);
    await queryInterface.addIndex('logs', ['action']);
    await queryInterface.addIndex('logs', ['created_at']);
  },

  async down(queryInterface) {
    // 1) Remover a FK user_id -> users.id, qualquer que seja o nome
    try {
      const refs = await queryInterface.getForeignKeyReferencesForTable('logs');
      for (const ref of refs) {
        // alguns dialetos usam columnName, outros usam columnNames
        const cols = ref.columnName ? [ref.columnName] : (ref.columnNames || []);
        if (cols.includes('user_id') && ref.constraintName) {
          try {
            await queryInterface.removeConstraint('logs', ref.constraintName);
          } catch (e) {
            // segue o baile se já tiver sido removida
          }
        }
      }
      // fallback para nomes comuns (caso getForeignKeyReferencesForTable não retorne)
      const candidates = ['logs_user_id_fkey', 'logs_user_id_foreign', 'logs_ibfk_1', 'logs_ibfk_2'];
      for (const name of candidates) {
        try { await queryInterface.removeConstraint('logs', name); } catch (e) {}
      }
    } catch (e) {
      // ignorar se a introspecção não for suportada no dialeto
    }

    // 2) Remover os índices criados manualmente no up
    try { await queryInterface.removeIndex('logs', ['user_id']); } catch (e) {}
    try { await queryInterface.removeIndex('logs', ['action']); } catch (e) {}
    try { await queryInterface.removeIndex('logs', ['created_at']); } catch (e) {}

    // 3) Dropar a tabela
    // Se preferir garantir derrubar dependências no Postgres:
    // await queryInterface.dropTable('logs', { cascade: true });
    await queryInterface.dropTable('logs');

    // 4) Dropar o tipo ENUM no Postgres (não afeta MySQL; está em try/catch)
    await queryInterface.sequelize
      .query('DROP TYPE IF EXISTS "enum_logs_action";')
      .catch(() => {});
  }
};
