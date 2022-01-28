import { Request, Response } from "express";
import { container } from "tsyringe";
import { TransferBetweenAccountsUseCase } from "./TransferBetweenAccountsUseCase";

enum OperationType {
  TRANSFER = "transfer",
}

export class TransferBetweenAccountsController {
  constructor() {}

  async execute(request: Request, response: Response) {
    const { id: user_id } = request.user;
    const { id: sender_id } = request.params;
    const { amount, description } = request.body;

    const splittedPath = request.originalUrl.split("/");
    const type = splittedPath[splittedPath.length - 1] as OperationType;

    const createTransfer = container.resolve(TransferBetweenAccountsUseCase);

    const statement = await createTransfer.execute({
      user_id,
      sender_id,
      type,
      amount,
      description,
    });

    return response.status(201).send(statement);
  }
}
