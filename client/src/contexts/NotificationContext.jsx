import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const { isAuthenticated } = useContext(AuthContext);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        let ws;
        if (isAuthenticated) {
            // In a real dev environment, use the correct host/port
            const wsUrl = `ws://${window.location.hostname}:3000`;
            ws = new WebSocket(wsUrl);

            ws.onmessage = (event) => {
                const message = JSON.parse(event.data);
                if (message.type === 'LOW_FUEL_ALERT') {
                    addNotification({
                        id: Date.now(),
                        type: 'error',
                        title: 'Low Fuel Alert',
                        message: `Tank ${message.data.tankNumber} (${message.data.fuelType}) is below minimum level!`,
                        data: message.data
                    });
                }
            };

            ws.onerror = (err) => console.error('WebSocket Error:', err);
            ws.onclose = () => console.log('WebSocket Connection Closed');
        }

        return () => {
            if (ws) ws.close();
        };
    }, [isAuthenticated]);

    const addNotification = (notif) => {
        setNotifications(prev => [notif, ...prev].slice(0, 5));
        // Auto remove after 10 seconds
        setTimeout(() => {
            removeNotification(notif.id);
        }, 10000);
    };

    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    return (
        <NotificationContext.Provider value={{ notifications, removeNotification }}>
            {children}
        </NotificationContext.Provider>
    );
};
