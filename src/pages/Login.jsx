import React, { useState } from 'react';
import { Target, ArrowRight, Sparkles } from 'lucide-react';
import './Login.css';

const Login = ({ onLogin }) => {
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        if (!email || !password || (!isLoginMode && !name)) return;

        setIsLoading(true);

        // Simulate API delay
        setTimeout(() => {
            const users = JSON.parse(localStorage.getItem('levelup-users') || '[]');
            const existingUser = users.find(u => u.email === email);

            if (isLoginMode) {
                // Login Logic
                if (!existingUser) {
                    setError('User not found. Please create an account.');
                    setIsLoading(false);
                    return;
                }
                if (existingUser.password !== password) {
                    setError('Invalid credentials.');
                    setIsLoading(false);
                    return;
                }
                onLogin(existingUser);
            } else {
                // Sign Up Logic
                if (existingUser) {
                    setError('User already exists. Please login.');
                    setIsLoading(false);
                    return;
                }
                const newUser = { email, password, name };
                localStorage.setItem('levelup-users', JSON.stringify([...users, newUser]));
                onLogin(newUser);
            }

            setIsLoading(false);
        }, 1000);
    };

    const toggleMode = () => {
        setIsLoginMode(!isLoginMode);
        setError('');
        setEmail('');
        setPassword('');
        setName('');
    };

    return (
        <div className="login-container">
            <div className="login-background">
                <div className="orb orb-1"></div>
                <div className="orb orb-2"></div>
            </div>

            <div className="login-card">
                <div className="login-header">
                    <div className="logo-icon">
                        <Target size={32} strokeWidth={2.5} />
                    </div>
                    <h1>{isLoginMode ? 'Welcome Back' : 'Join Level Up'}</h1>
                    <p>Build habits. Track progress. <span className="text-highlight">Evolve.</span></p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    {!isLoginMode && (
                        <div className="input-group">
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder=" "
                                required
                            />
                            <label htmlFor="name">Full Name</label>
                        </div>
                    )}

                    <div className="input-group">
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder=" "
                            required
                        />
                        <label htmlFor="email">Email Address</label>
                    </div>

                    <div className="input-group">
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder=" "
                            required
                        />
                        <label htmlFor="password">Password</label>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button
                        type="submit"
                        className={`btn login-btn ${isLoading ? 'loading' : ''}`}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <span className="loading-text"><Sparkles size={16} className="spin" /> Processing...</span>
                        ) : (
                            <>
                                {isLoginMode ? 'Login' : 'Create Account'} <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>

                <div className="login-footer">
                    <p>
                        {isLoginMode ? "First time here? " : "Already have an account? "}
                        <button className="link-btn" onClick={toggleMode}>
                            {isLoginMode ? 'Create Account' : 'Login'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
