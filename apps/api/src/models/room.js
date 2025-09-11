'use strict';
module.exports = (sequelize, DataTypes) => {
  const Room = sequelize.define('Room', {
    name: { type: DataTypes.STRING(120), allowNull: false, unique: true },
  }, {
    tableName: 'rooms',
    underscored: true,
  });

  Room.associate = (models) => {
    Room.hasMany(models.Booking, { foreignKey: 'room_id', as: 'bookings' });
  };

  return Room;
};
