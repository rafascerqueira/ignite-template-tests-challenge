import { app } from "../../app";
import request from "supertest";

import createConnection from "../../database";
import { Connection } from "typeorm";

let connection: Connection;

describe("Create User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to create a new user", async () => {
    const response = await request(app).post("/api/v1/users").send({
      name: "User Mock",
      email: "usermock@email.com",
      password: "potatoes",
    });

    expect(response.status).toBe(201);
  });

  it("Should not be able to create user if email already exists in database", async () => {
    const response = await request(app).post("/api/v1/users").send({
      name: "Another user",
      email: "usermock@email.com",
      password: "pinaples",
    });

    expect(response.status).toBe(400);
  });
});
