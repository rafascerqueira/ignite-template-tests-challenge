import { Statement } from "../../modules/statements/entities/Statement";
import { InMemoryStatementsRepository } from "../../modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../../modules/statements/useCases/createStatement/CreateStatementUseCase";
import { ICreateStatementDTO } from "../../modules/statements/useCases/createStatement/ICreateStatementDTO";
import { GetStatementOperationError } from "../../modules/statements/useCases/getStatementOperation/GetStatementOperationError";
import { GetStatementOperationUseCase } from "../../modules/statements/useCases/getStatementOperation/GetStatementOperationUseCase";
import { User } from "../../modules/users/entities/User";
import { InMemoryUsersRepository } from "../../modules/users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../modules/users/useCases/createUser/CreateUserUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let getStatementOperationUseCase: GetStatementOperationUseCase;
let user: User;
let statement: Statement;
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

describe("Get Statement Operation Use Case", () => {
  beforeEach(async () => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );

    user = await createUserUseCase.execute(userMock);

    transaction = {
      user_id: user.id as string,
      type: OperationType.DEPOSIT,
      amount: 1000,
      description: "First deposit",
    };

    statement = await createStatementUseCase.execute(transaction);
  });

  it("should be able to get a statement", async () => {
    const payloadRequisition = {
      user_id: transaction.user_id,
      statement_id: statement.id as string,
    };

    const statementOperation = await getStatementOperationUseCase.execute(
      payloadRequisition
    );

    expect(statementOperation).toHaveProperty("id");
    expect(statementOperation).toBeInstanceOf(Statement);
  });

  it("should not be able to get the statement when user does not exists", async () => {
    expect(async () => {
      const payloadRequisition = {
        user_id: "NaN user",
        statement_id: statement.id as string,
      };

      await getStatementOperationUseCase.execute(payloadRequisition);
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it("should not be able to get the statement when statement does not exists", async () => {
    expect(async () => {
      const payloadRequisition = {
        user_id: transaction.user_id,
        statement_id: "NaN statement",
      };

      await getStatementOperationUseCase.execute(payloadRequisition);
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });
});
