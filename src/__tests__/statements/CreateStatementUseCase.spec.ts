import { Statement } from "../../modules/statements/entities/Statement";
import { InMemoryStatementsRepository } from "../../modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "../../modules/statements/useCases/createStatement/CreateStatementError";
import { CreateStatementUseCase } from "../../modules/statements/useCases/createStatement/CreateStatementUseCase";
import { ICreateStatementDTO } from "../../modules/statements/useCases/createStatement/ICreateStatementDTO";
import { User } from "../../modules/users/entities/User";
import { InMemoryUsersRepository } from "../../modules/users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../modules/users/useCases/createUser/CreateUserUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let user: User;

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

const userMock = {
  name: "User Mock",
  email: "usermock@email.com",
  password: "potatoes",
};

describe("Create Statements Use Case", () => {
  beforeAll(async () => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
    user = await createUserUseCase.execute(userMock);
  });

  it("Should be able to create a new statement after depositing", async () => {
    const transaction: ICreateStatementDTO = {
      user_id: user.id as string,
      type: OperationType.DEPOSIT,
      amount: 1000,
      description: "First deposit",
    };
    const statement = await createStatementUseCase.execute(transaction);

    expect(statement).toBeInstanceOf(Statement);
    expect(statement).toHaveProperty("id");
    expect(statement.amount).toBeGreaterThan(0);
    expect(statement.type).toMatch("deposit");
  });

  it("Should be able to create a new statement after withdraw", async () => {
    const transaction: ICreateStatementDTO = {
      user_id: user.id as string,
      type: OperationType.WITHDRAW,
      amount: 500,
      description: "First withdraw",
    };
    const statement = await createStatementUseCase.execute(transaction);

    expect(statement).toBeInstanceOf(Statement);
    expect(statement).toHaveProperty("id");
    expect(statement.amount).toBeGreaterThan(0);
    expect(statement.type).toMatch("withdraw");
  });

  it("Should not be able to create a statement when trying to withdraw more than existing amount", async () => {
    expect(async () => {
      const transaction: ICreateStatementDTO = {
        user_id: user.id as string,
        type: OperationType.WITHDRAW,
        amount: 501,
        description: "First withdraw",
      };

      await createStatementUseCase.execute(transaction);
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });

  it("Should not be able to create a statement when a inexistent user", async () => {
    expect(async () => {
      const transaction: ICreateStatementDTO = {
        user_id: "tHisIsaINvaLiDuUiD",
        type: OperationType.DEPOSIT,
        amount: 1000,
        description: "First blood",
      };

      await createStatementUseCase.execute(transaction);
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });
});
