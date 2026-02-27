import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Login.css';

function Login() {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/auth/login', { login, password });
            const user = response.data;

            // Сохраняем пользователя в localStorage
            localStorage.setItem('user', JSON.stringify({
                id: user.userId,
                fio: user.fio,
                role: user.type
            }));

            // Перенаправляем в зависимости от роли
            if (user.type === 'Администратор') {
                navigate('/reports');
            } else if (user.type === 'Автомеханик') {
                navigate('/requests');
            } else {
                navigate('/requests');
            }
        } catch (err) {
            setError('Неверный логин или пароль');
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h2>Автосервис - Вход в систему</h2>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Логин:</label>
                        <input
                            type="text"
                            value={login}
                            onChange={(e) => setLogin(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Пароль:</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn-login">Войти</button>
                </form>
                <div className="demo-accounts">
                    <p>Тестовые аккаунты:</p>
                    <p>Админ: admin/admin</p>
                    <p>Механик: master/master</p>
                    <p>Клиент: client/client</p>
                </div>
            </div>
        </div>
    );
}

export default Login;