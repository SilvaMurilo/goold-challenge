'use strict';
const bcrypt = require('bcrypt');

module.exports = {
  async up (queryInterface) {
    const now = new Date();
    const password_hash = await bcrypt.hash('123456', 10);

    await queryInterface.bulkInsert('users', [
      {
        name: 'Silva Murilo',
        email: 'silva@teste.com',
        password_hash: password_hash,
        postal_code: '12345678',
        address_number: '101',
        street: 'Rua Aleatória',
        neighborhood: 'Bairro',
        city: 'São Paulo',
        state: 'São Paulo',
        address_line2: 'Complemento',
        role: 'CUSTOMER',
        created_at: now,
        updated_at: now,
      },
      {
        name: 'Murilo Silva',
        email: 'murilo@teste.com',
        password_hash: password_hash,
        postal_code: '12345678',
        address_number: '101',
        street: 'Rua Aleatória',
        neighborhood: 'Bairro',
        city: 'São Paulo',
        state: 'São Paulo',
        address_line2: 'Complemento',
        role: 'CUSTOMER',
        created_at: now,
        updated_at: now,
      },
    ]);
  },

  async down (queryInterface) {
    await queryInterface.bulkDelete('users', {
      email: ['silva@teste.com', 'murilo@teste.com'],
    });
  }
};
