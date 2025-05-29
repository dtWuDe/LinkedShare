import React, { useState } from 'react';
import './Login.css';
import assets from '../../assets/assets';
import { loginUser, registerUser } from '../../../business/services';

const Login = ({ onLoginSuccess }) => {
    const [mode, setMode] = useState('Sign up');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [publicKeyFile, setPublicKeyFile] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (mode === 'Sign up') {
            if (!publicKeyFile) {
                alert('Please select a public key file.');
                return;
            }
            const formData = new FormData();
            formData.append('username', username);
            formData.append('email', email);
            formData.append('password', password);
            formData.append('publicKey', publicKeyFile);

            await registerUser(formData);
        } else {
            const res = await loginUser(email, password);
            if (res.message === 'Login successful') {
                onLoginSuccess(res.user);
            }
        }
    };

    return (
        <div className="login">
            <img src={assets.logo} alt="Logo" className="logo" />
            <form onSubmit={handleSubmit} className="login-form">
                <h2>{mode}</h2>
                {mode === 'Sign up' && (
                    <>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                        <input
                            type="file"
                            className="form-input"
                            accept=".pem,.pub"
                            onChange={(e) => setPublicKeyFile(e.target.files[0])}
                        />
                    </>
                )}
                <input
                    type="email"
                    className="form-input"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    className="form-input"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">
                    {mode === 'Sign up' ? 'Create account' : 'Login now'}
                </button>
                <div className="login-forgot">
                    {mode === 'Sign up' ? (
                        <p className="login-toggle">
                            Already have an account?{' '}
                            <span onClick={() => setMode('Login')}>Login here</span>
                        </p>
                    ) : (
                        <p className="login-toggle">
                            Create an account?{' '}
                            <span onClick={() => setMode('Sign up')}>Click here</span>
                        </p>
                    )}
                </div>
            </form>
        </div>
    );
};

export default Login;
