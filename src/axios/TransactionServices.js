import axios from 'axios';

const TRANSACTION_API_URL = "https://y1hojj4tok.execute-api.ap-southeast-1.amazonaws.com/prod/transactions";

class TransactionServices {
    getAllTransactions() {
        return axios.get(TRANSACTION_API_URL);
    }

    getTransactionById(transactionId) {
        return axios.get(TRANSACTION_API_URL + '/' + transactionId);
    }

    createTransaction(transaction) {
        return axios.post(TRANSACTION_API_URL, transaction);
    }

    updateTransaction(transactionId, transaction) {
        return axios.put(TRANSACTION_API_URL + '/' + transactionId, transaction);
    }

    deleteTransaction(transactionId) {
        return axios.delete(TRANSACTION_API_URL + '/' + transactionId);
    }
}

export default new TransactionServices();