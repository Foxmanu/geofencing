import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MapContainer, TileLayer, Circle, useMapEvents, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Save, LogOut, Trash2, Edit } from 'lucide-react';
import '../index.css';

// FCM Imports
import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from '../firebase';

// Fix for default marker icon in leaflet
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow
});
L.Marker.prototype.options.icon = DefaultIcon;

// Component to handle map clicks for setting geofence center
function LocationMarker({ position, setPosition }) {
    useMapEvents({
        click(e) {
            setPosition(e.latlng);
        },
    });

    return position === null ? null : (
        <Marker position={position}></Marker>
    );
}

export default function AdminDashboard() {
    const navigate = useNavigate();
    // Default position: center of a generic map
    const [position, setPosition] = useState({ lat: 51.505, lng: -0.09 });
    const [radius, setRadius] = useState(500); // meters
    const [zoneName, setZoneName] = useState('');
    const [zones, setZones] = useState([]);
    const [editingZoneId, setEditingZoneId] = useState(null);

    useEffect(() => {
        fetchZones();

        // FCM Token Setup
        const setupFirebaseMessaging = async () => {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);

                try {
                    const permission = await Notification.requestPermission();
                    if (permission === 'granted') {
                        // NOTE: You must generate a VAPID key in Firebase Console -> Project Settings -> Cloud Messaging -> Web configuration
                        // and replace 'YOUR_VAPID_KEY_HERE' with it
                        const currentToken = await getToken(messaging, {
                            vapidKey: 'BM_2ffW3uYP_Zj5DNeLJEMpOAbJ7wyzd1npQrQSctusxyFLfLw9VMNYvhQKTlL8i-q3Are--ubR84qTxoUfDTl8'
                        });
                        console.log(currentToken, "asss")
                        if (currentToken) {
                            console.log('Got FCM token, sending to backend...');
                            await axios.post(`https://0168-2406-https://549b-2406-7400-10a-1b0b-6b1a-3649-9501-1c57.ngrok-free.app7400-10a-1b0b-6b1a-3649-9501-1c57.ngrok-free.app/api/auth/fcm-token/${user._id}`, {
                                fcmToken: currentToken
                            });
                        } else {
                            console.log('No registration token available. Request permission to generate one.');
                        }

                        // Listen for foreground messages directly here:
                        onMessage(messaging, (payload) => {
                            console.log('Message received in foreground: ', payload);
                            // You could create a toast notification here
                            alert(`GEOFENCE ALERT: ${payload.notification?.title} - ${payload.notification?.body}`);
                        });

                    } else {
                        console.log('Notification permission denied.');
                    }
                } catch (error) {
                    console.error('Error setting up Firebase messaging:', error);
                }
            }
        };

        setupFirebaseMessaging();
    }, []);

    const fetchZones = async () => {
        try {
            const response = await axios.get('https://0168-2406-https://549b-2406-7400-10a-1b0b-6b1a-3649-9501-1c57.ngrok-free.app7400-10a-1b0b-6b1a-3649-9501-1c57.ngrok-free.app/api/zones');
            setZones(response.data);
        } catch (error) {
            console.error('Error fetching zones:', error);
        }
    };

    const handleSaveGeofence = async () => {
        if (!zoneName.trim()) {
            alert("Please enter a zone name.");
            return;
        }

        const geofenceData = {
            name: zoneName,
            lat: position.lat,
            lng: position.lng,
            radius: radius
        };

        try {
            const url = editingZoneId
                ? `https://0168-2406-https://549b-2406-7400-10a-1b0b-6b1a-3649-9501-1c57.ngrok-free.app7400-10a-1b0b-6b1a-3649-9501-1c57.ngrok-free.app/api/zones/${editingZoneId}`
                : 'https://0168-2406-https://549b-2406-7400-10a-1b0b-6b1a-3649-9501-1c57.ngrok-free.app7400-10a-1b0b-6b1a-3649-9501-1c57.ngrok-free.app/api/zones';

            if (editingZoneId) {
                await axios.put(url, geofenceData);
            } else {
                await axios.post(url, geofenceData);
            }

            alert(`Geofence "${zoneName}" ${editingZoneId ? 'updated' : 'saved'} successfully!`);
            setZoneName('');
            setEditingZoneId(null);
            fetchZones(); // Refresh the list
        } catch (error) {
            console.error('Error saving geofence:', error);
            const msg = error.response?.data?.message || 'Server error saving geofence';
            alert(msg);
        }
    };

    const handleEditZone = (zone) => {
        setZoneName(zone.name);
        setPosition({ lat: zone.lat, lng: zone.lng });
        setRadius(zone.radius);
        setEditingZoneId(zone._id);
    };

    const handleDeleteZone = async (id) => {
        if (!window.confirm("Are you sure you want to delete this zone?")) return;

        try {
            await axios.delete(`https://0168-2406-https://549b-2406-7400-10a-1b0b-6b1a-3649-9501-1c57.ngrok-free.app7400-10a-1b0b-6b1a-3649-9501-1c57.ngrok-free.app/api/zones/${id}`);
            alert('Zone deleted successfully!');
            fetchZones();
        } catch (error) {
            console.error('Error deleting zone:', error);
            alert('Server error deleting zone');
        }
    };

    return (
        <div className="layout-container">
            {/* Sidebar */}
            <aside className="sidebar" style={{ overflowY: 'auto' }}>
                <div className="sidebar-header">
                    <MapPin size={32} className="text-indigo-400" />
                    <h2>Admin Portal</h2>
                </div>

                <div className="sidebar-content">
                    <div className="info-card">
                        <h3>{editingZoneId ? 'Edit Geofence' : 'New Geofence'}</h3>
                        <p className="text-sm text-slate-400 mb-4">Click anywhere on the map to set the center point, then adjust the radius below.</p>

                        <div className="form-group" style={{ marginBottom: "1rem" }}>
                            <label>Zone Name</label>
                            <input
                                type="text"
                                value={zoneName}
                                onChange={(e) => setZoneName(e.target.value)}
                                className="form-input bg-slate-800 text-white"
                                placeholder="Enter zone name..."
                            />
                        </div>

                        <div className="form-group">
                            <label>Latitude</label>
                            <input type="number" readOnly value={position.lat.toFixed(6)} className="form-input bg-slate-800 text-white" />
                        </div>

                        <div className="form-group">
                            <label>Longitude</label>
                            <input type="number" readOnly value={position.lng.toFixed(6)} className="form-input bg-slate-800 text-white" />
                        </div>

                        <div className="form-group mt-4">
                            <label>Radius (meters): <strong>{radius}m</strong></label>
                            <input
                                type="range"
                                min="100" max="5000" step="100"
                                value={radius}
                                onChange={(e) => setRadius(parseInt(e.target.value))}
                                className="slider"
                            />
                        </div>

                        <button onClick={handleSaveGeofence} className="btn-save mt-6">
                            <Save size={18} /> {editingZoneId ? 'Update Config' : 'Save Config'}
                        </button>

                        {editingZoneId && (
                            <button onClick={() => { setEditingZoneId(null); setZoneName(''); }} className="btn-save mt-2" style={{ backgroundColor: '#64748b' }}>
                                Cancel Edit
                            </button>
                        )}
                    </div>

                    {/* Zone List */}
                    <div className="info-card mt-6">
                        <h3>Saved Zones</h3>
                        {zones.length === 0 ? (
                            <p className="text-sm text-slate-400 mt-2">No zones saved yet.</p>
                        ) : (
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, marginTop: '1rem' }}>
                                {zones.map(zone => (
                                    <li key={zone._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: '#1e293b', marginBottom: '0.5rem', borderRadius: '0.375rem' }}>
                                        <div>
                                            <strong style={{ display: 'block', color: 'white' }}>{zone.name}</strong>
                                            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{zone.lat.toFixed(4)}, {zone.lng.toFixed(4)} | {zone.radius}m</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button onClick={() => handleEditZone(zone)} style={{ background: 'transparent', border: 'none', color: '#eab308', cursor: 'pointer' }}>
                                                <Edit size={16} />
                                            </button>
                                            <button onClick={() => handleDeleteZone(zone._id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                <div className="sidebar-footer">
                    <button onClick={() => navigate('/login')} className="btn-logout">
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </aside>

            {/* Main Map Content */}
            <main className="main-content-map">
                <MapContainer center={[51.505, -0.09]} zoom={13} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    <LocationMarker position={position} setPosition={setPosition} />

                    {position && (
                        <Circle
                            center={position}
                            radius={radius}
                            pathOptions={{ color: '#4f46e5', fillColor: '#4f46e5', fillOpacity: 0.2 }}
                        />
                    )}

                    {zones.map(zone => (
                        <Circle
                            key={zone._id}
                            center={[zone.lat, zone.lng]}
                            radius={zone.radius}
                            pathOptions={{ color: zone._id === editingZoneId ? '#eab308' : '#22c55e', fillColor: zone._id === editingZoneId ? '#eab308' : '#22c55e', fillOpacity: 0.2 }}
                        />
                    ))}
                </MapContainer>
            </main>
        </div>
    );
}
