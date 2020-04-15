import { getRepository } from 'typeorm';

import Transaction from '../models/Transaction';

import AppError from '../errors/AppError';

interface RequestDTO {
  transactionId: string;
}

class DeleteTransactionService {
  public static async execute({ transactionId }: RequestDTO): Promise<void> {
    const transactionsRepository = getRepository(Transaction);

    /**
     * 1ª Regra de negócio -> Verificar se essa transação realmente existe
     */

    const transaction = await transactionsRepository.findOne(transactionId);

    if (!transaction) {
      throw new AppError('This transaction not exists');
    }

    await transactionsRepository.delete(transactionId);
  }
}

export default DeleteTransactionService;
