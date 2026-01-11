import React, { useState } from 'react';
import { Target, ArrowRight, Sparkles } from 'lucide-react';
import { supabase } from '../supabase';
import './Login.css';

const Login = ({ onLogin }) => {
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!email || !password || (!isLoginMode && !name)) return;

        setIsLoading(true);

        try {
            if (isLoginMode) {
                // Login Logic
                const { data, error: authError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (authError) throw authError;

                // Fetch full profile
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', data.user.id)
                    .single();

                if (profileError) {
                    // Fallback if profile doesn't exist yet but auth does
                    onLogin({ ...data.user, name: name || email.split('@')[0], email });
                } else {
                    onLogin(profile);
                }

            } else {
                // Sign Up Logic
                const { data, error: authError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            name: name,
                        }
                    }
                });

                if (authError) throw authError;

                if (data.user) {
                    // Profile is created automatically by database trigger
                    // We can log the user in directly with the data we have
                    const newUser = {
                        id: data.user.id,
                        email,
                        name,
                        // We use current time for immediate UI feedback, 
                        // though DB will generate its own timestamp
                        created_at: new Date().toISOString()
                    };

                    onLogin(newUser);
                }
            }
        } catch (err) {
            console.error(err);
            setError(err.message === 'Invalid login credentials'
                ? 'Invalid email or password.'
                : err.message);
        } finally {
            setIsLoading(false);
        }
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
                            <span className="loading-text"><Sparkles size={16} className="spin" /> Connecting...</span>
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
                        <button className="link-btn" onClick={toggleMode} type="button">
                            {isLoginMode ? 'Create Account' : 'Login'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
