"use strict";

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
      },
      password_hash: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM("ADMIN", "CUSTOMER"),
        allowNull: false,
        defaultValue: "CUSTOMER",
      },
      postal_code: { type: DataTypes.STRING, allowNull: true },     // CEP
      street: { type: DataTypes.STRING, allowNull: true },         // Logradouro
      address_number: { type: DataTypes.STRING, allowNull: true },   // Número
      address_line2: { type: DataTypes.STRING, allowNull: true },   // Complemento
      neighborhood: { type: DataTypes.STRING, allowNull: true },   // Bairro
      city: { type: DataTypes.STRING, allowNull: true },           // Localidade
      state: { type: DataTypes.STRING, allowNull: true },          // Estado
      region: { type: DataTypes.STRING, allowNull: true },         // Região
    },
    {
      tableName: "users",
      timestamps: true,
      underscored: true,
    }
  );
  return User;
};
