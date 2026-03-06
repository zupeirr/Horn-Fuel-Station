import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import { Clock, Play, Square, History } from 'lucide-react';

const Shifts = () => {
    const { user } = useContext(AuthContext);
    const [shifts, setShifts] = useState([]);
    const [activeShift, setActiveShift] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchShifts();
    }, []);

    const fetchShifts = async () => {
        try {
            const response = await api.get('/shifts/history');
            setShifts(response.data);
            const active = response.data.find(s => s.status === 'Ongoing' && s.userId === user.id);
            setActiveShift(active);
        } catch (error) {
            console.error('Failed to fetch shifts', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStartShift = async (type) => {
        try {
            const response = await api.post('/shifts/start', { shiftType: type });
            setActiveShift(response.data);
            fetchShifts();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to start shift');
        }
    };

    const handleEndShift = async () => {
        try {
            await api.post('/shifts/end');
            setActiveShift(null);
            fetchShifts();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to end shift');
        }
    };

    return (
        <div className="container">
            <div className="flex-between mb-8">
                <div>
                    <h1 className="text-gradient" style={{ fontSize: '2rem' }}>Employee Shifts</h1>
                    <p className="text-subtle">Attendance and active shift tracking</p>
                </div>
            </div>

            <div className="grid-cols-3 mb-8">
                <div className="glass-card" style={{ borderLeft: activeShift ? '4px solid var(--success)' : '4px solid var(--text-muted)' }}>
                    <div className="mb-4 text-subtle font-medium">Shift Control</div>
                    {activeShift ? (
                        <div>
                            <div style={{ fontSize: '1.25rem', fontWeight: '700' }} className="mb-2">Shift: {activeShift.shiftType}</div>
                            <div className="text-subtle mb-4">Started: {new Date(activeShift.startTime).toLocaleTimeString()}</div>
                            <button onClick={handleEndShift} className="btn btn-secondary w-full flex-center" style={{ gap: '0.5rem', color: 'var(--error)' }}>
                                <Square size={18} /> End Shift
                            </button>
                        </div>
                    ) : (
                        <div className="grid-cols-3" style={{ gap: '0.5rem' }}>
                            {['Morning', 'Afternoon', 'Night'].map(type => (
                                <button key={type} onClick={() => handleStartShift(type)} className="btn btn-primary" style={{ fontSize: '0.75rem', padding: '0.5rem' }}>
                                    {type}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="glass-card">
                <div className="flex-between mb-6">
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Shift History</h2>
                    <History size={20} className="text-subtle" />
                </div>
                <table className="table">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Type</th>
                            <th>Start</th>
                            <th>End</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {shifts.map(shift => (
                            <tr key={shift.id}>
                                <td className="font-medium">{shift.user?.username}</td>
                                <td>{shift.shiftType}</td>
                                <td>{new Date(shift.startTime).toLocaleString()}</td>
                                <td>{shift.endTime ? new Date(shift.endTime).toLocaleString() : '--'}</td>
                                <td>
                                    <span className={`status-badge ${shift.status === 'Ongoing' ? 'active' : 'inactive'}`}>
                                        {shift.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Shifts;
