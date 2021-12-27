import { InMemoryUsersRepository } from "../../modules/users/repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "../../modules/users/useCases/authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "../../modules/users/useCases/createUser/CreateUserUseCase";
import { ShowUserProfileError } from "../../modules/users/useCases/showUserProfile/ShowUserProfileError";
import { ShowUserProfileUseCase } from "../../modules/users/useCases/showUserProfile/ShowUserProfileUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let autheticateUserUseCase: AuthenticateUserUseCase;
let showUserProfileUseCase: ShowUserProfileUseCase;

const userMock = {
  name: "User Name",
  email: "user_email@email.com",
  password: "potatoes",
};

describe("Show user profile Use Case", () => {
  beforeEach(async () => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    autheticateUserUseCase = new AuthenticateUserUseCase(
      inMemoryUsersRepository
    );
    showUserProfileUseCase = new ShowUserProfileUseCase(
      inMemoryUsersRepository
    );

    await createUserUseCase.execute(userMock);
  });

  it("Must be able to return a user profile when authenticated", async () => {
    const { user } = await autheticateUserUseCase.execute({
      email: "user_email@email.com",
      password: "potatoes",
    });

    const user_id = user.id as string;

    const profile = await showUserProfileUseCase.execute(user_id);

    expect(profile).toHaveProperty("id");
  });

  it("Should not be able to return a user profile", async () => {
    expect(async () => {
      const { user } = await autheticateUserUseCase.execute({
        email: "user_email@email.com",
        password: "potatoes",
      });

      // Force id overwrite
      Object.assign(user, {
        id: "a2e5747f-b0ab-4730-84f2-f9bc7d00898a",
      });

      const user_id = user.id as string;

      await showUserProfileUseCase.execute(user_id);
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  });
});
