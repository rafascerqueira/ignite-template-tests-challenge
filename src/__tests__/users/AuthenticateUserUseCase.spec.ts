import { InMemoryUsersRepository } from "../../modules/users/repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "../../modules/users/useCases/authenticateUser/AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "../../modules/users/useCases/authenticateUser/IncorrectEmailOrPasswordError";
import { CreateUserUseCase } from "../../modules/users/useCases/createUser/CreateUserUseCase";

let autheticateUserUseCase: AuthenticateUserUseCase;
let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;

const userMock = {
  name: "User Name",
  email: "user_email@email.com",
  password: "potatoes",
};

describe("Autheticate user Use Case", () => {
  beforeEach(async () => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    autheticateUserUseCase = new AuthenticateUserUseCase(
      inMemoryUsersRepository
    );

    await createUserUseCase.execute(userMock);
  });

  it("Must be able to start a new session using correctly credentials", async () => {
    const response = await autheticateUserUseCase.execute({
      email: "user_email@email.com",
      password: "potatoes",
    });

    expect(response.user).toHaveProperty("id");
  });

  it("Should not be able to start a new session with the wrong username or password", async () => {
    expect(async () => {
      await autheticateUserUseCase.execute({
        email: "user_deny@email.com",
        password: "potatoes",
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);

    expect(async () => {
      await autheticateUserUseCase.execute({
        email: "user_email@email.com",
        password: "tomatoes",
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });
});
