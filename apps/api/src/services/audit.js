'use strict';

const { Log } = require('../models');

/**
 * Cria um log, sem derrubar a requisição se falhar.
 * @param {Object} p
 * @param {'CREATE'|'UPDATE'|'DELETE'|'VIEW'|'LOGIN'|'LOGOUT'} p.action
 * @param {number|null} [p.userId]   // quem gerou
 * @param {string|null} [p.entity]   // módulo/entidade (ex: 'auth','profile','booking')
 * @param {string|null} [p.entityId] // id lógico (ex: 'bk_2001' ou userId alvo)
 * @param {string|null} [p.description]
 * @param {import('sequelize').Transaction} [tx]
 */
async function logAction({ action, userId = null, entity = null, entityId = null, description = null }, tx) {
  try {
    const result = await Log.create({
      action,
      user_id: userId ?? null,
      entity: entity ?? null,
      entity_id: entityId ?? null,
      description: description ?? null,
    }, { transaction: tx });
    console.log(result)
  } catch (err) {
    // não impedir o fluxo de negócio por falha de logging
    console.warn('[audit] falha ao gravar log:', err?.message);
  }
}

module.exports = { logAction };
