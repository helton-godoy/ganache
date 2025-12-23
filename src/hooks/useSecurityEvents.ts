import { useCallback, useEffect, useRef, useState } from 'react';
import { SecurityEvent, SecurityState } from '../types/security';

const API_BASE = '/api/v1/security';
const WS_URL = `ws://${window.location.host}/api/v1/security/events/ws`;

export const useSecurityEvents = () => {
    const [state, setState] = useState<SecurityState>({
        events: [],
        metrics: {
            events_per_minute: 0,
            total_events_24h: 0,
            active_users: [],
            suspicious_ips: [],
            critical_alerts: 0,
            failed_logins_1h: 0,
        },
        alerts: [],
        isConnected: false,
    });

    const FETCH_LIMIT = 50;

    const wsRef = useRef<WebSocket | null>(null);

    const fetchData = useCallback(async () => {
        try {
            const [eventsRes, metricsRes, alertsRes] = await Promise.all([
                fetch(`${API_BASE}/events?limit=${FETCH_LIMIT}`),
                fetch(`${API_BASE}/metrics`),
                fetch(`${API_BASE}/alerts`),
            ]);

            const events = await eventsRes.json();
            const metrics = await metricsRes.json();
            const alerts = await alertsRes.json();

            setState(prev => ({
                ...prev,
                events,
                metrics,
                alerts,
            }));
        } catch (error) {
            console.error('Failed to fetch security data:', error);
        }
    }, []);

    const connectWS = useCallback(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) return;

        const ws = new WebSocket(WS_URL);
        wsRef.current = ws;

        ws.onopen = () => {
            console.log('Security WebSocket connected');
            setState(prev => ({ ...prev, isConnected: true }));
        };

        ws.onmessage = (event) => {
            try {
                const newEvent: SecurityEvent = JSON.parse(event.data);
                setState(prev => ({
                    ...prev,
                    events: [newEvent, ...prev.events].slice(0, 100)
                }));
                // Silently refresh metrics on new event
                fetchData();
            } catch (e) {
                console.error('Failed to parse WS message:', e);
            }
        };

        ws.onclose = () => {
            console.log('Security WebSocket disconnected');
            setState(prev => ({ ...prev, isConnected: false }));
            // Attempt to reconnect after 5 seconds
            setTimeout(connectWS, 5000);
        };

        ws.onerror = (error) => {
            console.error('Security WebSocket error:', error);
            ws.close();
        };
    }, [fetchData]);

    useEffect(() => {
        fetchData();
        connectWS();

        // Regular metrics polling every 10 seconds as fallback
        const interval = setInterval(fetchData, 10000);

        return () => {
            clearInterval(interval);
            wsRef.current?.close();
        };
    }, [fetchData, connectWS]);

    const acknowledgeAlert = useCallback(async (alertId: string) => {
        try {
            await fetch(`${API_BASE}/alerts/${alertId}/acknowledge`, {
                method: 'POST',
            });
            // Update local state to remove acknowledged alert
            setState(prev => ({
                ...prev,
                alerts: prev.alerts.filter(a => a.id !== alertId)
            }));
        } catch (error) {
            console.error('Failed to acknowledge alert:', error);
        }
    }, []);

    return {
        ...state,
        acknowledgeAlert,
    };
};
