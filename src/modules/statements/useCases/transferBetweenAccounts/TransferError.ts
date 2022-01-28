import { AppError } from "../../../../shared/errors/AppError";

export namespace TransferError {
  export class FavoredNotFound extends AppError {
    constructor() {
      super("Favored not found!", 404);
    }
  }

  export class SenderNotFound extends AppError {
    constructor() {
      super("Sender not found!", 404);
    }
  }

  export class InsufficientFunds extends AppError {
    constructor() {
      super("Insufficient funds!", 400);
    }
  }
}
