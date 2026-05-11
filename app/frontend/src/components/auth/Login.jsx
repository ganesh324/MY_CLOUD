import React, { useState } from 'react';
import { Cloud, Lock, User, ArrowRight } from 'lucide-react';
import API_URL from '../../config';

export default function Login({ onLoginSuccess }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // FastAPI expects form data for OAuth2
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('token', data.access_token);
                onLoginSuccess();
            } else {
                setError('Invalid username or password');
            }
        } catch (err) {
            setError('Cannot connect to server. Is FastAPI running?');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
            <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden">
                <div className="p-10">
                    {/* Logo Area */}
                    <div className="flex flex-col items-center mb-10">
                        <div className="p-4 bg-blue-600 rounded-3xl shadow-xl shadow-blue-100 mb-4">
                            <Cloud className="text-white" size={32} />
                        </div>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">eeti cloud</h1>
                        <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">Private Storage</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold rounded-2xl text-center animate-shake">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl py-4 pl-12 pr-4 outline-none transition-all font-medium text-slate-700"
                            />
                        </div>

                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl py-4 pl-12 pr-4 outline-none transition-all font-medium text-slate-700"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-slate-900 hover:bg-black text-white rounded-2xl py-4 font-bold flex items-center justify-center gap-2 transition-all group mt-6"
                        >
                            Access Drive <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </form>
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Secure AES-256 Environment</p>
                </div>
            </div>
        </div>
    );
}