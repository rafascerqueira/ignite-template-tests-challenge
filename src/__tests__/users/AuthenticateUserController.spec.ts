import { app } from "../../app";
import request from "supertest";

import createConnection from "../../database";
import { Connection } from "typeorm";

let connection: Connection;

describe("Auhteticate User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to authenticate a valid user", async () => {
    await request(app).post("/api/v1/users").send({
      name: "User Test",
      email: "usertest@email.com",
      password: "potatoes",
    });

    const response = await request(app).post("/api/v1/sessions").send({
      email: "usertest@email.com",
      password: "potatoes",
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
  });

  it("Should not be able to authenticate a user with no valid email or password", async () => {
    const response1 = await request(app).post("/api/v1/sessions").send({
      email: "usermistake@email.com",
      password: "potatoes",
    });

    const response2 = await request(app).post("/api/v1/sessions").send({
      email: "usertest@email.com",
      password: "tomatoes",
    });

    expect(response1.status).toBe(401);
    expect(response2.status).toBe(401);
  });
});
