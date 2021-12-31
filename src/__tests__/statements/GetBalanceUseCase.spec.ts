import { Statement } from "../../modules/statements/entities/Statement";
import { InMemoryStatementsRepository } from "../../modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../../modules/statements/useCases/createStatement/CreateStatementUseCase";
import { ICreateStatementDTO } from "../../modules/statements/useCases/createStatement/ICreateStatementDTO";
import { GetBalanceError } from "../../modules/statements/useCases/getBalance/GetBalanceError";
import { GetBalanceUseCase } from "../../modules/statements/useCases/getBalance/GetBalanceUseCase";
import { IGetBalanceDTO } from "../../modules/statements/useCases/getBalance/IGetBalanceDTO";
import { User } from "../../modules/users/entities/User";
import { InMemoryUsersRepository } from "../../modules/users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../modules/users/useCases/createUser/CreateUserUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let getBalanceUseCase: GetBalanceUseCase;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let user: User;
let transaction: ICreateStatementDTO;

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

const userMock = {
  name: "User Mock",
  email: "usermock@email.com",
  password: "potatoes",
};

describe("Get balance Use Case", () => {
  beforeEach(async () => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
    getBalanceUseCase = new GetBalanceUseCase(
      inMemoryStatementsRepository,
      inMemoryUsersRepository
    );

    user = await createUserUseCase.execute(userMock);

    transaction = {
      user_id: user.id as string,
      type: OperationType.DEPOSIT,
      amount: 1000,
      description: "First deposit",
    };

    await createStatementUseCase.execute(transaction);
  });

  it("Should be able to list all transaction by authenticated user", async () => {
    const userBalance: IGetBalanceDTO = {
      user_id: user.id as string,
    };

    const balance = await getBalanceUseCase.execute(userBalance);

    expect(balance).toHaveProperty("statement");
    expect(balance).toHaveProperty("balance");
  });

  it("Should not be able to list transactions when haven't user authenticated", async () => {
    expect(async () => {
      const mistakeBalance: IGetBalanceDTO = {
        user_id: "NaN user",
      };

      await getBalanceUseCase.execute(mistakeBalance);
    }).rejects.toBeInstanceOf(GetBalanceError);
  });
});
