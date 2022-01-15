import { app } from "../../app";
import request from "supertest";

import createConnection from "../../database";
import { Connection } from "typeorm";

let connection: Connection;

describe("Show user profile Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able get all requested user data", async () => {
    await request(app).post("/api/v1/users").send({
      name: "User Test",
      email: "user_test@email.com",
      password: "potatoes",
    });

    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "user_test@email.com",
      password: "potatoes",
    });

    const { token } = responseToken.body;

    const response = await request(app)
      .get("/api/v1/profile")
      .set({ Authorization: `Bearer ${token}` });

    expect(response.status).toBe(200);
  });
});
