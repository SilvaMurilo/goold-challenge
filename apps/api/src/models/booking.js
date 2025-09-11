'use strict';
module.exports = (sequelize, DataTypes) => {
  const Booking = sequelize.define('Booking', {
    start_at: { type: DataTypes.DATE, allowNull: false },
    end_at:   { type: DataTypes.DATE, allowNull: true },
    status: {
      type: DataTypes.ENUM('PENDING', 'CONFIRMED', 'REJECTED', 'CANCELLED'),
      allowNull: false,
      defaultValue: 'PENDING',
    },
  }, {
    tableName: 'bookings',
    underscored: true,
  });

  Booking.associate = (models) => {
    Booking.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    Booking.belongsTo(models.Room, { foreignKey: 'room_id', as: 'room' });
  };

  return Booking;
};
