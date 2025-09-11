"use strict";
const bcrypt = require("bcrypt");

module.exports = {
  async up(queryInterface) {
    const password_hash = await bcrypt.hash("admin123", 10);

    await queryInterface.bulkInsert("users", [
      {
        name: "Admin",
        last_name: "Soberano",
        email: "admin@teste.com",
        password_hash,
        role: "ADMIN",
        postal_code: "01001000",
        street: "Praça da Sé",
        address_line2: "Sala 101",
        address_number: "123",
        neighborhood: "Sé",
        city: "São Paulo",
        state: "SP",
        region: "Sudeste",

        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("users", { email: "admin@teste.com" });
  },
};