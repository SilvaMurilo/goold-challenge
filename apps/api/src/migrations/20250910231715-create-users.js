"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("users", {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      name: { type: Sequelize.STRING, allowNull: false },
      email: { type: Sequelize.STRING, allowNull: false, unique: true },
      password_hash: { type: Sequelize.STRING, allowNull: false },
      role: {
        type: Sequelize.ENUM("ADMIN", "CUSTOMER"),
        allowNull: false,
        defaultValue: "CUSTOMER",
      },
      postal_code: { type: Sequelize.STRING, allowNull: false },
      address_number: { type: Sequelize.STRING, allowNull: false, },
      street: { type: Sequelize.STRING, allowNull: false },
      neighborhood: { type: Sequelize.STRING, allowNull: false },
      city: { type: Sequelize.STRING, allowNull: false },
      state: { type: Sequelize.STRING, allowNull: false },
      address_line2: { type: Sequelize.STRING, allowNull: true },
      region: { type: Sequelize.STRING, allowNull: true },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable("users");
  },
};
