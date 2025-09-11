'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'bookings',
      {
        id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },

        user_id: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: false,
          references: { model: 'users', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },

        room_id: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: false,
          references: { model: 'rooms', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        },

        start_at: { type: Sequelize.DATE, allowNull: false },
        end_at:   { type: Sequelize.DATE, allowNull: true },

        status: {
          type: Sequelize.ENUM('PENDING', 'CONFIRMED', 'REJECTED', 'CANCELLED'),
          allowNull: false,
          defaultValue: 'PENDING',
        },

        created_at: { type: Sequelize.DATE, allowNull: false },
        updated_at: { type: Sequelize.DATE, allowNull: false },
      },
      {
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci'
      }
    );

    await queryInterface.addIndex('bookings', ['room_id', 'start_at'], {
      name: 'idx_bookings_room_start',
    });
    await queryInterface.addIndex('bookings', ['user_id', 'start_at'], {
      name: 'idx_bookings_user_start',
    });
    await queryInterface.addIndex('bookings', ['status'], {
      name: 'idx_bookings_status',
    });
  },

  async down(queryInterface /*, Sequelize */) {
    // Remova índices nomeados antes
    // await queryInterface.removeConstraint('bookings', 'uniq_bookings_room_start').catch(() => {});
    // await queryInterface.sequelize.query('ALTER TABLE bookings DROP CHECK chk_bookings_end_after_start').catch(() => {});

    await queryInterface.removeIndex('bookings', 'idx_bookings_room_start').catch(() => {});
    await queryInterface.removeIndex('bookings', 'idx_bookings_user_start').catch(() => {});
    await queryInterface.removeIndex('bookings', 'idx_bookings_status').catch(() => {});

    await queryInterface.dropTable('bookings');
  }
};
