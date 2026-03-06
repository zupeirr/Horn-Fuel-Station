import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Settings as SettingsIcon, Save, Edit2, Hexagon, Shield, Bell } from 'lucide-react';

const Settings = () => {
    const [fuelTypes, setFuelTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editPrice, setEditPrice] = useState('');

    useEffect(() => {
        fetchFuelTypes();
    }, []);

    const fetchFuelTypes = async () => {
        try {
            const response = await api.get('/fuel-types');
            setFuelTypes(response.data);
        } catch (error) {
            console.error('Failed to fetch fuel types', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePrice = async (id) => {
        try {
            await api.put(`/fuel-types/${id}`, { unitPrice: parseFloat(editPrice) });
            setEditingId(null);
            fetchFuelTypes();
        } catch (error) {
            alert('Failed to update price');
        }
    };

    return (
        <div className="container">
            <div className="flex-between mb-8">
                <div>
                    <h1 className="text-gradient" style={{ fontSize: '2rem' }}>System Settings</h1>
                    <p className="text-subtle">Configure station parameters and pricing</p>
                </div>
            </div>

            <div className="grid-cols-2 mb-8" style={{ alignItems: 'start' }}>
                <div className="glass-card">
                    <div className="flex-center mb-6" style={{ justifyContent: 'flex-start', gap: '0.75rem' }}>
                        <Hexagon size={24} color="var(--accent-primary)" />
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Fuel Pricing</h2>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {fuelTypes.map(type => (
                            <div key={type.id} className="flex-between p-4" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div>
                                    <div style={{ fontWeight: '600' }}>{type.name}</div>
                                    <div className="text-subtle text-xs">{type.description}</div>
                                </div>
                                <div className="flex-center" style={{ gap: '1rem' }}>
                                    {editingId === type.id ? (
                                        <>
                                            <input 
                                                type="number" 
                                                step="0.01"
                                                value={editPrice}
                                                onChange={(e) => setEditPrice(e.target.value)}
                                                style={{ width: '80px', padding: '0.4rem', background: '#0f172a', border: '1px solid var(--accent-primary)', color: 'white', borderRadius: '4px' }}
                                            />
                                            <button onClick={() => handleUpdatePrice(type.id)} className="text-success"><Save size={18} /></button>
                                        </>
                                    ) : (
                                        <>
                                            <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>${parseFloat(type.unitPrice).toFixed(2)}</div>
                                            <button onClick={() => { setEditingId(type.id); setEditPrice(type.unitPrice); }} className="text-subtle"><Edit2 size={16} /></button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="glass-card">
                    <div className="flex-center mb-6" style={{ justifyContent: 'flex-start', gap: '0.75rem' }}>
                        <Shield size={24} color="var(--accent-secondary)" />
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Security & Roles</h2>
                    </div>
                    <p className="text-subtle mb-4">Manage user permissions and security policies.</p>
                    <button className="btn btn-secondary w-full" disabled>Manage RBAC (Coming Soon)</button>
                </div>
            </div>

            <div className="glass-card">
                <div className="flex-center mb-6" style={{ justifyContent: 'flex-start', gap: '0.75rem' }}>
                    <Bell size={24} color="var(--warning)" />
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Notification Thresholds</h2>
                </div>
                <div className="grid-cols-2">
                    <div className="p-4" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                        <div className="text-subtle text-xs mb-1">Low Fuel Alert (%)</div>
                        <input type="number" defaultValue="15" className="btn btn-secondary" style={{ width: '100%', textAlign: 'left' }} />
                    </div>
                    <div className="p-4" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                        <div className="text-subtle text-xs mb-1">Max Credit Days</div>
                        <input type="number" defaultValue="30" className="btn btn-secondary" style={{ width: '100%', textAlign: 'left' }} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
