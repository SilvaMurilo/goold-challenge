"use strict";
const bcrypt = require("bcrypt");

module.exports = {
  async up(queryInterface) {
    const passwordHash = await bcrypt.hash("admin123", 10);

    await queryInterface.bulkInsert("users", [
      {
        name: "Admin",
        email: "admin@teste.com",
        passwordHash,
        role: "ADMIN",
        postalCode: "01001000",
        street: "Praça da Sé",
        addressLine2: "Sala 101",
        neighborhood: "Sé",
        city: "São Paulo",
        state: "SP",
        region: "Sudeste",

        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("users", { email: "admin@teste.com" });
  },
};