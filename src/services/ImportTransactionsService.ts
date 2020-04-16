import { join } from 'path';
import { createReadStream } from 'fs';
import csvParse from 'csv-parse';

import Transaction from '../models/Transaction';

import CreateTransactionService from './CreateTransactionService';

import uploadConfig from '../config/upload';

interface RequestDTO {
  csvFilename: string;
}

interface TransactionCsvRow {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  static async execute({ csvFilename }: RequestDTO): Promise<Transaction[]> {
    const csvFilePath = join(uploadConfig.directory, csvFilename);

    const transactions: Transaction[] = [];
    const transactionsCsvRows: TransactionCsvRow[] = [];

    const parser = csvParse({ from_line: 2, trim: true });
    const parseCSV = createReadStream(csvFilePath).pipe(parser);

    parseCSV.on('data', async row => {
      const [title, type, value, category] = row;

      transactionsCsvRows.push({ title, type, value, category });
    });

    await new Promise(resolve => parseCSV.on('end', resolve));

    // eslint-disable-next-line no-restricted-syntax
    for (const transactionCsvRow of transactionsCsvRows) {
      const { title, type, value, category } = transactionCsvRow;

      // eslint-disable-next-line no-await-in-loop
      const transaction = await CreateTransactionService.execute({
        title,
        type,
        value,
        category,
      });

      transactions.push(transaction);
    }

    return transactions;
  }
}

export default ImportTransactionsService;
