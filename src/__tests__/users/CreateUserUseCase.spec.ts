import { User } from "../../modules/users/entities/User";
import { InMemoryUsersRepository } from "../../modules/users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "../../modules/users/useCases/createUser/CreateUserError";
import { CreateUserUseCase } from "../../modules/users/useCases/createUser/CreateUserUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Create user", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("should be able to create a new user", async () => {
    const user = await createUserUseCase.execute({
      name: "User Name",
      email: "user_email@email.com",
      password: "potatoes",
    });

    expect(user).toBeInstanceOf(User);
    expect(user).toHaveProperty("id");
  });

  it("Should not be able to create a new user", async () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: "User Name",
        email: "user_email@email.com",
        password: "samepotatoes",
      });

      await createUserUseCase.execute({
        name: "User Name",
        email: "user_email@email.com",
        password: "samepotatoes",
      });
    }).rejects.toBeInstanceOf(CreateUserError);
  });
});
