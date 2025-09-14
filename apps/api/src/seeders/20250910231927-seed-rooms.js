// seeders/XXXXXXXXXXXX-seed-rooms.js
'use strict';

module.exports = {
  async up (queryInterface) {
    const now = new Date();
    const rows = [
      { name: 'Sala 01', start_hour: '08:00', end_hour: '18:00', slot_minutes: 30, created_at: now, updated_at: now },
      { name: 'Sala 02', start_hour: '08:00', end_hour: '18:00', slot_minutes: 30, created_at: now, updated_at: now },
      { name: 'Sala 03', start_hour: '08:00', end_hour: '18:00', slot_minutes: 30, created_at: now, updated_at: now },
    ];

    // Insere; se você estiver em MySQL/MariaDB e quiser idempotência,
    // pode usar { updateOnDuplicate: ['start_hour','end_hour','slot_minutes','updated_at'] }
    await queryInterface.bulkInsert('rooms', rows);
  },

  async down (queryInterface, Sequelize) {
    const { Op } = Sequelize;
    await queryInterface.bulkDelete('rooms', {
      name: { [Op.in]: ['Sala 01','Sala 02','Sala 03'] }
    });
  }
};
