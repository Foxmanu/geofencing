import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, User, Lock, MapPin } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch('https://0168-2406-https://549b-2406-7400-10a-1b0b-6b1a-3649-9501-1c57.ngrok-free.app7400-10a-1b0b-6b1a-3649-9501-1c57.ngrok-free.app/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('role', data.role);
                localStorage.setItem('user', JSON.stringify(data.user));
                if (data.role === 'admin') {
                    navigate('/admin');
                } else if (data.role === 'sales') {
                    navigate('/sales');
                } else {
                    navigate('/');
                }
            } else {
                setError(data.message || 'Invalid credentials! Check your email/password.');
            }
        } catch (err) {
            setError('Server error. Please try again later.');
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <div className="text-center mb-8" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <MapPin size={48} className="text-indigo-600 mb-2" />
                    <h1 className="text-2xl font-bold m-0" style={{ color: '#1e293b' }}>System Portal</h1>
                    <p className="mt-1" style={{ color: '#64748b', fontSize: '0.875rem' }}>Secure Sign In</p>
                </div>

                {error && <div className="error-msg">{error}</div>}

                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label className="form-label">
                            <User size={16} /> Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="form-input"
                            placeholder="e.g. user@example.com"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            <Lock size={16} /> Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="form-input"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button type="submit" className="btn-primary">
                        Sign In <ShieldCheck size={18} />
                    </button>
                </form>

                <div className="helper-text">
                    Please use your registered email and password.
                </div>
            </div>
        </div>
    );
}
