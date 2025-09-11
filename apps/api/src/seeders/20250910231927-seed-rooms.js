'use strict';

module.exports = {
  async up (queryInterface) {
    const now = new Date();
    await queryInterface.bulkInsert('rooms', [
      { name: 'Sala 01', created_at: now, updated_at: now },
      { name: 'Sala 02', created_at: now, updated_at: now },
      { name: 'Sala 03', created_at: now, updated_at: now },
    ]);
  },

  async down (queryInterface) {
    await queryInterface.bulkDelete('rooms', null, {});
  }
};
