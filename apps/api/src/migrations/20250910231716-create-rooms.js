'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('rooms', {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },

      name:         { type: Sequelize.STRING(120), allowNull: false, unique: true },
      start_hour:   { type: Sequelize.STRING(5),  allowNull: true  }, // "HH:MM"
      end_hour:     { type: Sequelize.STRING(5),  allowNull: true  }, // "HH:MM"
      slot_minutes: { type: Sequelize.INTEGER,    allowNull: true, defaultValue: 30 },

      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });

    await queryInterface.addIndex('rooms', ['name'], { unique: true, name: 'rooms_name_uq' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('rooms');
  },
};
