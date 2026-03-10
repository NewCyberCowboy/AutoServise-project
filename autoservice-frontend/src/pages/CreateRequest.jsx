import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './CreateRequest.css';

function CreateRequest() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        carType: '',
        carModel: '',
        problemDescription: '',
        plannedCompletionDate: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        if (!userData.id) {
            navigate('/login');
            return;
        }
        setUser(userData);
    }, [navigate]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (!user || !user.id) {
                setError('Не удалось определить пользователя. Пожалуйста, войдите снова.');
                setLoading(false);
                return;
            }

            const plannedDate = new Date(formData.plannedCompletionDate);
            plannedDate.setHours(12, 0, 0, 0);

            const requestData = {
                carType: formData.carType,
                carModel: formData.carModel,
                problemDescription: formData.problemDescription,
                plannedCompletionDate: plannedDate.toISOString(),
                clientId: user.id,
                requestStatus: "Новая",
                repairParts: "",
                requestId: 0,
                startDate: new Date().toISOString(),
                completionDate: null,
                masterId: null,
                isDelayed: false
            };

            console.log('Отправляемые данные:', requestData);

            const response = await api.post('/request', requestData);

            console.log('Ответ от сервера:', response.data);

            // Проверяем, где находится ID заявки в ответе
            let requestId = null;

            if (response.data && response.data.requestId) {
                requestId = response.data.requestId;
            } else if (response.data && response.data.value && response.data.value.requestId) {
                requestId = response.data.value.requestId;
            } else if (response.data && response.data.id) {
                requestId = response.data.id;
            }

            console.log('ID созданной заявки:', requestId);

            if (requestId) {
                // Перенаправляем на страницу созданной заявки
                navigate(`/request/${requestId}`);
            } else {
                // Если ID не найден, перенаправляем на список заявок
                console.warn('ID заявки не найден в ответе, перенаправляем на список');
                navigate('/requests');
            }

        } catch (err) {
            console.error('Ошибка при создании заявки:', err);

            if (err.response) {
                console.error('Детали ошибки:', err.response.data);

                if (err.response.data.errors) {
                    const errorMessages = [];
                    Object.keys(err.response.data.errors).forEach(key => {
                        errorMessages.push(`${key}: ${err.response.data.errors[key].join(', ')}`);
                    });
                    setError(`Ошибка валидации: ${errorMessages.join('; ')}`);
                } else if (err.response.data.message) {
                    setError(err.response.data.message);
                } else if (err.response.data.title) {
                    setError(err.response.data.title);
                } else {
                    setError('Проверьте правильность заполнения формы');
                }
            } else if (err.request) {
                setError('Сервер не отвечает. Проверьте подключение к бэкенду.');
            } else {
                setError('Ошибка при отправке запроса');
            }
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return <div className="loading">Проверка авторизации...</div>;
    }

    return (
        <div className="page-container">
            <h1>Создание новой заявки</h1>

            {error && (
                <div className="error-message">
                    <strong>Ошибка:</strong> {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="create-request-form">
                <div className="form-group">
                    <label htmlFor="carType">Тип автомобиля:</label>
                    <select
                        id="carType"
                        name="carType"
                        value={formData.carType}
                        onChange={handleChange}
                        required
                        disabled={loading}
                    >
                        <option value="">Выберите тип</option>
                        <option value="Легковая">Легковая</option>
                        <option value="Грузовая">Грузовая</option>
                        <option value="Мотоцикл">Мотоцикл</option>
                        <option value="Автобус">Автобус</option>
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="carModel">Модель автомобиля:</label>
                    <input
                        id="carModel"
                        type="text"
                        name="carModel"
                        value={formData.carModel}
                        onChange={handleChange}
                        required
                        disabled={loading}
                        placeholder="Например: Toyota Camry"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="problemDescription">Описание проблемы:</label>
                    <textarea
                        id="problemDescription"
                        name="problemDescription"
                        value={formData.problemDescription}
                        onChange={handleChange}
                        required
                        disabled={loading}
                        rows="5"
                        placeholder="Опишите проблему подробно..."
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="plannedCompletionDate">Плановая дата завершения:</label>
                    <input
                        id="plannedCompletionDate"
                        type="date"
                        name="plannedCompletionDate"
                        value={formData.plannedCompletionDate}
                        onChange={handleChange}
                        required
                        disabled={loading}
                        min={new Date().toISOString().split('T')[0]}
                    />
                </div>

                <div className="form-actions">
                    <button
                        type="submit"
                        className="btn-submit"
                        disabled={loading}
                    >
                        {loading ? 'Создание...' : 'Создать заявку'}
                    </button>
                    <button
                        type="button"
                        className="btn-cancel"
                        onClick={() => navigate('/requests')}
                        disabled={loading}
                    >
                        Отмена
                    </button>
                </div>
            </form>
        </div>
    );
}

export default CreateRequest;