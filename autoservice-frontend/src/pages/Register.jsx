import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import './Register.css';

function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fio: '',
        phone: '',
        email: '',
        login: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const validateForm = () => {
        if (!formData.fio.trim()) {
            setError('Введите ФИО');
            return false;
        }
        if (!formData.login.trim()) {
            setError('Введите логин');
            return false;
        }
        if (formData.password.length < 4) {
            setError('Пароль должен быть не менее 4 символов');
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Пароли не совпадают');
            return false;
        }
        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
            setError('Введите корректный email');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        setError('');

        try {
            const response = await api.post('/auth/register', {
                fio: formData.fio,
                phone: formData.phone,
                email: formData.email,
                login: formData.login,
                password: formData.password
            });

            console.log('Регистрация успешна:', response.data);

            // Автоматически входим после регистрации
            const loginResponse = await api.post('/auth/login', {
                login: formData.login,
                password: formData.password
            });

            const user = loginResponse.data;
            localStorage.setItem('user', JSON.stringify({
                id: user.userId,
                fio: user.fio,
                role: user.type
            }));

            navigate('/requests');
        } catch (err) {
            console.error('Ошибка регистрации:', err);
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError('Ошибка при регистрации. Попробуйте позже.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container register-wrapper">
            <div className="register-box">
                <h2>Регистрация</h2>
                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>ФИО *</label>
                        <input
                            type="text"
                            name="fio"
                            value={formData.fio}
                            onChange={handleChange}
                            required
                            placeholder="Иванов Иван Иванович"
                        />
                    </div>

                    <div className="form-group">
                        <label>Телефон</label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="+7 (999) 123-45-67"
                        />
                    </div>

                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="example@mail.com"
                        />
                    </div>

                    <div className="form-group">
                        <label>Логин *</label>
                        <input
                            type="text"
                            name="login"
                            value={formData.login}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Пароль *</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            minLength="4"
                        />
                    </div>

                    <div className="form-group">
                        <label>Подтверждение пароля *</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn-register"
                        disabled={loading}
                    >
                        {loading ? 'Регистрация...' : 'Зарегистрироваться'}
                    </button>
                </form>

                <div className="login-link">
                    <p>Уже есть аккаунт? <Link to="/login">Войти</Link></p>
                </div>
            </div>
        </div>
    );
}

export default Register;