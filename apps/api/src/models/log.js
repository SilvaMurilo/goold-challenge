'use strict';
module.exports = (sequelize, DataTypes) => {
  const Log = sequelize.define('Log', {
    action: {
      type: DataTypes.ENUM('CREATE', 'UPDATE', 'DELETE', 'VIEW', 'LOGIN', 'LOGOUT'),
      allowNull: false,
    },
    entity: { type: DataTypes.STRING(50), allowNull: true },
    entity_id: { type: DataTypes.STRING(50), allowNull: true },
    description: { type: DataTypes.TEXT, allowNull: true },
  }, {
    tableName: 'logs',
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  Log.associate = (models) => {
    Log.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
  };

  return Log;
};
