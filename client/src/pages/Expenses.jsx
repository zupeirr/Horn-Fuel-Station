import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Receipt, Plus, DollarSign } from 'lucide-react';

const Expenses = () => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchExpenses();
    }, []);

    const fetchExpenses = async () => {
        try {
            const response = await api.get('/expenses');
            setExpenses(response.data);
        } catch (error) {
            console.error('Failed to fetch expenses', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <div className="flex-between mb-8">
                <div>
                    <h1 className="text-gradient" style={{ fontSize: '2rem' }}>Expense Tracker</h1>
                    <p className="text-subtle">Monitor business operational costs</p>
                </div>
                <button className="btn btn-primary flex-center" style={{ gap: '0.5rem' }}>
                    <Plus size={18} /> Record Expense
                </button>
            </div>

            <div className="glass-card">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Category</th>
                            <th>Amount</th>
                            <th>Description</th>
                            <th>Recorded By</th>
                        </tr>
                    </thead>
                    <tbody>
                        {expenses.map(expense => (
                            <tr key={expense.id}>
                                <td>{new Date(expense.expenseDate).toLocaleDateString()}</td>
                                <td><span className="status-badge active" style={{ background: 'rgba(255,255,255,0.05)' }}>{expense.category}</span></td>
                                <td className="font-medium" style={{ color: 'var(--error)' }}>-${parseFloat(expense.amount).toFixed(2)}</td>
                                <td className="text-subtle">{expense.description}</td>
                                <td>{expense.user?.username}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {expenses.length === 0 && !loading && (
                    <div className="text-subtle" style={{ textAlign: 'center', padding: '3rem' }}>
                        No expenses recorded yet.
                    </div>
                )}
            </div>
        </div>
    );
};

export default Expenses;
