import { app } from "../../app";
import request from "supertest";
import createConnection from "../../database";
import { Connection } from "typeorm";

let connection: Connection;

describe("Get Balance Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to get the user balance", async () => {
    await request(app).post("/api/v1/users").send({
      name: "User Balance",
      email: "userbalance@email.com",
      password: "strawberry",
    });

    const responseToken = await request(app)
      .post("/api/v1/sessions")
      .send({ email: "userbalance@email.com", password: "strawberry" });

    const { token } = responseToken.body;

    const response = await request(app)
      .get("/api/v1/statements/balance")
      .set({ Authorization: `Bearer ${token}` });

    expect(response.status).toBe(200);
  });

  it("Should not be able to get the user balance if user not found", async () => {
    const token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiMjVjYWM1ZmEtMzU5Ny00MGVkLWE0M2QtYjFlMjc0MGUxMjA1IiwibmFtZSI6IlVzZXIgTmFtZSIsImVtYWlsIjoidXNlcl9tb2NrQGVtYWlsLmNvbSIsInBhc3N3b3JkIjoiJDJhJDA4JE1uMTk2Z2FSaE1RSHNqVzBpazI4Y093NFV0WkZESVhvU2FPSmk1LzFwSzNGdWRpLjhwdkIyIiwiY3JlYXRlZF9hdCI6IjIwMjItMDEtMTVUMjI6MzU6MDEuMDQ2WiIsInVwZGF0ZWRfYXQiOiIyMDIyLTAxLTE1VDIyOjM1OjAxLjA0NloifSwiaWF0IjoxNjQyMjc1MzAxLCJleHAiOjE2NDIzNjE3MDEsInN1YiI6IjI1Y2FjNWZhLTM1OTctNDBlZC1hNDNkLWIxZTI3NDBlMTIwNSJ9.ADZlvAkUD4XDc7WLTCo_Lh-bLcQpLOhwWr8xwB2OEGg";

    const response = await request(app)
      .get("/api/v1/statements/balance")
      .set({ Authorization: `Bearer ${token}` });

    expect(response.status).toBe(404);
  });
});
