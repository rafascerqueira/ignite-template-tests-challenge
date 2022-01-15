import { app } from "../../app";
import request from "supertest";
import createConnection from "../../database";
import { Connection } from "typeorm";

let connection: Connection;

describe("Create Statement Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to create a new statement when deposit a value", async () => {
    // Create user and get token
    await request(app).post("/api/v1/users").send({
      name: "User Name",
      email: "user_mock@email.com",
      password: "butter",
    });

    const responseToken = await request(app)
      .post("/api/v1/sessions")
      .send({ email: "user_mock@email.com", password: "butter" });

    const { token } = responseToken.body;

    // create new statement for deposit operation
    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .send({ amount: 1000, description: "isert a coin" })
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
    const token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiMjVjYWM1ZmEtMzU5Ny00MGVkLWE0M2QtYjFlMjc0MGUxMjA1IiwibmFtZSI6IlVzZXIgTmFtZSIsImVtYWlsIjoidXNlcl9tb2NrQGVtYWlsLmNvbSIsInBhc3N3b3JkIjoiJDJhJDA4JE1uMTk2Z2FSaE1RSHNqVzBpazI4Y093NFV0WkZESVhvU2FPSmk1LzFwSzNGdWRpLjhwdkIyIiwiY3JlYXRlZF9hdCI6IjIwMjItMDEtMTVUMjI6MzU6MDEuMDQ2WiIsInVwZGF0ZWRfYXQiOiIyMDIyLTAxLTE1VDIyOjM1OjAxLjA0NloifSwiaWF0IjoxNjQyMjc1MzAxLCJleHAiOjE2NDIzNjE3MDEsInN1YiI6IjI1Y2FjNWZhLTM1OTctNDBlZC1hNDNkLWIxZTI3NDBlMTIwNSJ9.ADZlvAkUD4XDc7WLTCo_Lh-bLcQpLOhwWr8xwB2OEGg";

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
