import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Users, Plus, IdentificationCard } from 'lucide-react';

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const response = await api.get('/customers');
            setCustomers(response.data);
        } catch (error) {
            console.error('Failed to fetch customers', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <div className="flex-between mb-8">
                <div>
                    <h1 className="text-gradient" style={{ fontSize: '2rem' }}>Customer Management</h1>
                    <p className="text-subtle">Manage regular clients and vehicle registration</p>
                </div>
                <button className="btn btn-primary flex-center" style={{ gap: '0.5rem' }}>
                    <Plus size={18} /> Add Customer
                </button>
            </div>

            <div className="glass-card">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Vehicle Reg</th>
                            <th>Credit Limit</th>
                            <th>Current Balance</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {customers.map(customer => (
                            <tr key={customer.id}>
                                <td className="font-medium">{customer.name}</td>
                                <td>{customer.vehicleReg || 'N/A'}</td>
                                <td>${parseFloat(customer.creditLimit).toFixed(2)}</td>
                                <td style={{ color: parseFloat(customer.balance) > 0 ? 'var(--error)' : 'inherit' }}>
                                    ${parseFloat(customer.balance).toFixed(2)}
                                </td>
                                <td>
                                    <span className={`status-badge ${customer.isActive ? 'active' : 'inactive'}`}>
                                        {customer.isActive ? 'Active' : 'Blacklisted'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {customers.length === 0 && !loading && (
                    <div className="text-subtle" style={{ textAlign: 'center', padding: '3rem' }}>
                        No customers found. Start by adding a regular client.
                    </div>
                )}
            </div>
        </div>
    );
};

export default Customers;
