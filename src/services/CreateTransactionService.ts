import { getRepository, getCustomRepository } from 'typeorm';

import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';
import AppError from '../errors/AppError';

interface RequestDTO {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public static async execute({
    title,
    value,
    type,
    category,
  }: RequestDTO): Promise<Transaction> {
    const categoriesRepository = getRepository(Category);
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    /**
     * 1ª Regra de negócio -> Verificar se a categoria já está cadastrada no banco de dados
     */

    const findCategory = await categoriesRepository.findOne({
      where: { title: category },
    });

    let categoryId;

    if (findCategory) {
      categoryId = findCategory.id;
    } else {
      const newCategory = categoriesRepository.create({
        title: category,
      });

      await categoriesRepository.save(newCategory);

      categoryId = newCategory.id;
    }

    /**
     * 2ª Regra de negócio -> validar se o valor de saída é maior do que o valor total de saldo
     */

    const { total } = await transactionsRepository.getBalance();

    if (type && type === 'outcome' && value > total) {
      throw new AppError("You don't have enough balance for this transaction.");
    }

    /**
     * Tudo certo, podemos cadastrar uma nova transação
     */

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category_id: categoryId,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
