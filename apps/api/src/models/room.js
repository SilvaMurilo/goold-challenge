'use strict';

module.exports = (sequelize, DataTypes) => {
  const Room = sequelize.define('Room', {
    name: {
      type: DataTypes.STRING(120),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [1, 120],
      },
    },
    start_hour: {
      type: DataTypes.STRING(5),
      allowNull: true,
      set(v) {
        if (v == null) return this.setDataValue('start_hour', null);
        const s = String(v).slice(0, 5); // “HH:MM”
        this.setDataValue('start_hour', s);
      },
      validate: {
        isValid(v) {
          if (v == null) return;
          if (!/^\d{2}:\d{2}$/.test(v)) throw new Error('start_hour inválido (use HH:MM)');
        },
      },
    },
    end_hour: {
      type: DataTypes.STRING(5),
      allowNull: true,
      set(v) {
        if (v == null) return this.setDataValue('end_hour', null);
        const s = String(v).slice(0, 5);
        this.setDataValue('end_hour', s);
      },
      validate: {
        isValid(v) {
          if (v == null) return;
          if (!/^\d{2}:\d{2}$/.test(v)) throw new Error('end_hour inválido (use HH:MM)');
        },
      },
    },
    slot_minutes: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 30,
      validate: {
        min: 5,
        max: 240,
      },
    },
  }, {
    tableName: 'rooms',
    underscored: true,   // created_at / updated_at
    timestamps: true,
    defaultScope: {
      order: [['name', 'ASC']],
      attributes: { exclude: [] },
    },
  });

  Room.associate = (models) => {
    Room.hasMany(models.Booking, { foreignKey: 'room_id', as: 'bookings' });
  };

  return Room;
};
