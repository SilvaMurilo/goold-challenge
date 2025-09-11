'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    const now = new Date();

    // pega rooms por nome
    const [rooms] = await queryInterface.sequelize.query(
      `SELECT id, name FROM rooms WHERE name IN ('Sala 01','Sala 02','Sala 03');`
    );
    const roomIdByName = Object.fromEntries(rooms.map(r => [r.name, r.id]));

    // pega users por email
    const [users] = await queryInterface.sequelize.query(
      `SELECT id, email, name FROM users WHERE email IN ('silva@teste.com','murilo@teste.com');`
    );
    const userIdByEmail = Object.fromEntries(users.map(u => [u.email, u.id]));

    if (!roomIdByName['Sala 01'] || !roomIdByName['Sala 02']) {
      throw new Error('Rooms não encontradas. Rode primeiro o seed de rooms.');
    }
    if (!userIdByEmail['silva@teste.com'] || !userIdByEmail['murilo@teste.com']) {
      throw new Error('Users CUSTOMER não encontrados. Rode primeiro o seed de customers.');
    }

    // helper para datas (YYYY-MM-DD HH:mm no fuso desejado → Date UTC)
    const toDate = (isoString) => new Date(isoString);

    const rows = [
      // Camila
      {
        user_id: userIdByEmail['silva@teste.com'],
        room_id: roomIdByName['Sala 01'],
        start_at: toDate('2025-09-20T16:00:00Z'),
        end_at:   toDate('2025-09-20T17:00:00Z'),
        status: 'PENDING',
        created_at: now,
        updated_at: now,
      },
      {
        user_id: userIdByEmail['silva@teste.com'],
        room_id: roomIdByName['Sala 02'],
        start_at: toDate('2025-09-21T13:00:00Z'),
        end_at:   toDate('2025-09-21T14:00:00Z'),
        status: 'CONFIRMED',
        created_at: now,
        updated_at: now,
      },

      // João
      {
        user_id: userIdByEmail['murilo@teste.com'],
        room_id: roomIdByName['Sala 01'],
        start_at: toDate('2025-09-22T10:00:00Z'),
        end_at:   toDate('2025-09-22T11:00:00Z'),
        status: 'CANCELLED',
        created_at: now,
        updated_at: now,
      },
      {
        user_id: userIdByEmail['murilo@teste.com'],
        room_id: roomIdByName['Sala 03'] ?? roomIdByName['Sala 02'],
        start_at: toDate('2025-09-23T15:30:00Z'),
        end_at:   toDate('2025-09-23T16:30:00Z'),
        status: 'CONFIRMED',
        created_at: now,
        updated_at: now,
      },
    ];

    await queryInterface.bulkInsert('bookings', rows);
  },

  async down (queryInterface, Sequelize) {
    // apaga bookings desses dois usuários
    const [users] = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE email IN ('silva@teste.com','murilo@teste.com');`
    );
    const ids = users.map(u => u.id);
    if (ids.length) {
      await queryInterface.bulkDelete('bookings', { user_id: { [Sequelize.Op.in]: ids } });
    }
  }
};
