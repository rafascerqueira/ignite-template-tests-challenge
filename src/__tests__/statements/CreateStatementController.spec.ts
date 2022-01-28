import { app } from "../../app";
import request from "supertest";
import createConnection from "../../database";
import { Connection } from "typeorm";

let connection: Connection;

describe("Create Statement Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    await request(app).post("/api/v1/users").send({
      name: "User Name",
      email: "user_mock@email.com",
      password: "butter",
    });
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to create a new statement when deposit a value", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "user_mock@email.com",
      password: "butter",
    });

    const { token } = responseToken.body;

    // create new statement for deposit operation
    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 1000,
        description: "insert a coin",
      })
      .set({ Authorization: `Bearer ${token}` });

    expect(response.status).toBe(201);
  });

  it("Should be able to create a new statement when withdraw a value", async () => {
    const responseToken = await request(app)
      .post("/api/v1/sessions")
      .send({ email: "user_mock@email.com", password: "butter" });

    const { token } = responseToken.body;

    // create new statement for deposit operation
    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({ amount: 250, description: "get my money!" })
      .set({ Authorization: `Bearer ${token}` });

    expect(response.status).toBe(201);
  });

  it("Should not be able to deposit a value to inexistent user", async () => {
    const token = "pi1h23io4h1io23h4o1i234h";

    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .send({ amount: 2000, description: "don't put your money in trash" })
      .set({ Authorization: `Bearer ${token}` });

    expect(response.status).toBe(404);
  });

  it("Should not be able to withdraw more than have in account fund", async () => {
    const responseToken = await request(app)
      .post("/api/v1/sessions")
      .send({ email: "user_mock@email.com", password: "butter" });

    const { token } = responseToken.body;

    // create new statement for deposit operation
    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({ amount: 2500, description: "get my money!" })
      .set({ Authorization: `Bearer ${token}` });

    expect(response.status).toBe(400);
  });
});
