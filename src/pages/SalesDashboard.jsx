import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SalesDashboard() {
    const navigate = useNavigate();
    const [location, setLocation] = useState({ latitude: null, longitude: null });
    const [errorMsg, setErrorMsg] = useState('');
    const [status, setStatus] = useState('Initializing...');
    const watchIdRef = useRef(null);
    const lastPositionRef = useRef({ latitude: null, longitude: null, userId: null });

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;

        if (!user) {
            navigate('/login');
            return;
        }

        if (!navigator.geolocation) {
            setErrorMsg('Geolocation is not supported by your browser');
            return;
        }

        setStatus('Requesting permission...');

        const successCallback = async (position) => {
            const { latitude, longitude } = position.coords;
            console.log("New Position received:", latitude, longitude);

            setLocation({ latitude, longitude });
            setStatus('Tracking: Location received');
            setErrorMsg('');

            lastPositionRef.current = { latitude, longitude, userId: user?._id || null };

            try {
                const response = await fetch(`/api/auth/location/${user._id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ latitude, longitude })
                });

                if (!response.ok) {
                    console.error('Server update failed');
                }
            } catch (error) {
                console.error('Error updating location on server:', error);
            }
        };

        const errorCallback = (error) => {
            console.error('Geolocation error:', error);
            let msg = 'Unable to retrieve location';
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    msg = "User denied the request for Geolocation.";
                    break;
                case error.POSITION_UNAVAILABLE:
                    msg = "Location information is unavailable.";
                    break;
                case error.TIMEOUT:
                    msg = "Location request timed out.";
                    break;
                default:
                    msg = "An unknown error occurred.";
                    break;
            }
            setErrorMsg(msg);
            setStatus('Error');
        };

        const options = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        };

        // Get initial position immediately
        navigator.geolocation.getCurrentPosition(successCallback, errorCallback, options);

        // Start watching for changes
        watchIdRef.current = navigator.geolocation.watchPosition(successCallback, errorCallback, options);

        return () => {
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current);
            }
        };
    }, [navigate]);

    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/firebase-messaging-sw.js')
                .then(async (registration) => {
                    console.log('Service Worker registered for background tracking:', registration);

                    if ('periodicSync' in registration) {
                        try {
                            await registration.periodicSync.register('location-sync', { minInterval: 15 * 60 * 1000 });
                            console.log('Periodic sync registered');
                        } catch (err) {
                            console.warn('Periodic sync failed to register:', err);
                        }
                    }
                }).catch((err) => {
                    console.warn('Service Worker registration failed:', err);
                });
        }

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden' && lastPositionRef.current.userId) {
                navigator.serviceWorker.ready.then((registration) => {
                    registration.active?.postMessage({
                        type: 'BACKGROUND_LOCATION',
                        payload: lastPositionRef.current
                    });
                });
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('message', (event) => {
                if (event.data?.type === 'REQUEST_LOCATION_UPDATE' && lastPositionRef.current.userId) {
                    const { latitude, longitude, userId } = lastPositionRef.current;
                    fetch(`/api/auth/location/${userId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ latitude, longitude })
                    }).catch(err => console.error('Failed to send background location on request:', err));
                }
            });
        }

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    const handleLogout = async () => {
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;

        if (user?._id) {
            try {
                await fetch('/api/auth/logout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: user._id })
                });
            } catch (err) {
                console.error('Logout request failed', err);
            }
        }

        localStorage.removeItem('user');
        localStorage.removeItem('role');
        navigate('/login');
    };

    return (
        <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
            <h1 style={{ color: '#1e293b' }}>Sales Dashboard</h1>
            <p style={{ color: '#64748b' }}>Welcome to the Sales tracking portal.</p>

            <div style={{
                margin: '2rem auto',
                padding: '1.5rem',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                maxWidth: '400px',
                backgroundColor: '#f8fafc',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
            }}>
                <h3 style={{ marginTop: 0, color: '#334155' }}>Location Status</h3>

                <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Status: {status}</p>

                {errorMsg ? (
                    <div style={{
                        color: '#b91c1c',
                        backgroundColor: '#fee2e2',
                        padding: '0.75rem',
                        borderRadius: '6px',
                        fontSize: '0.9rem'
                    }}>
                        <strong>Error:</strong> {errorMsg}
                    </div>
                ) : location.latitude ? (
                    <div style={{
                        backgroundColor: '#f0fdf4',
                        padding: '1rem',
                        borderRadius: '6px',
                        border: '1px solid #dcfce7'
                    }}>
                        <p style={{ color: '#15803d', fontWeight: '600', margin: '0 0 0.5rem 0' }}>
                            ✅ Live Tracking Active
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: '1.1rem' }}>
                            <div>
                                <span style={{ color: '#64748b', fontSize: '0.8rem', display: 'block' }}>LATITUDE</span>
                                <strong>{location.latitude.toFixed(6)}</strong>
                            </div>
                            <div>
                                <span style={{ color: '#64748b', fontSize: '0.8rem', display: 'block' }}>LONGITUDE</span>
                                <strong>{location.longitude.toFixed(6)}</strong>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div style={{ color: '#1e293b' }}>
                        <div className="spinner" style={{
                            border: '3px solid #f3f3f3',
                            borderTop: '3px solid #4f46e5',
                            borderRadius: '50%',
                            width: '20px',
                            height: '20px',
                            animation: 'spin 1s linear infinite',
                            display: 'inline-block',
                            marginRight: '10px',
                            verticalAlign: 'middle'
                        }}></div>
                        <span>Acquiring GPS Signal...</span>
                        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                    </div>
                )}
            </div>

            <button
                onClick={handleLogout}
                style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#dc2626'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#ef4444'}
            >
                Logout
            </button>
        </div>
    );
}
