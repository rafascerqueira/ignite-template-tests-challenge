import { inject } from "tsyringe";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { ITransferDTO } from "./ITransferDTO";
import { TransferError } from "./TransferError";

export class TransferBetweenAccountsUseCase {
  constructor(
    @inject("UsersRepository")
    private usersRepository: IUsersRepository,

    @inject("StatementsRepository")
    private statementsRepository: IStatementsRepository
  ) {}

  async execute({
    user_id,
    sender_id,
    type,
    amount,
    description,
  }: ITransferDTO) {
    const favored = await this.usersRepository.findById(user_id);
    const sender = await this.usersRepository.findById(sender_id as string);

    if (!favored) {
      throw new TransferError.FavoredNotFound();
    }

    if (!sender) {
      throw new TransferError.SenderNotFound();
    }

    const senderAccount = await this.statementsRepository.getUserBalance({
      user_id: sender_id as string,
    });
    const funds = senderAccount.balance;

    if (funds < amount) {
      throw new TransferError.InsufficientFunds();
    }

    const transfer = await this.statementsRepository.transfer({
      user_id,
      sender_id,
      type,
      amount,
      description,
    });

    return transfer;
  }
}
