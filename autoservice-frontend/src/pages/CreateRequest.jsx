import React, { useState } from 'react';
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

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const response = await api.post('/request', {
                ...formData,
                clientId: user.id
            });

            navigate(`/request/${response.data.requestId}`);
        } catch (err) {
            setError('Ошибка при создании заявки');
        }
    };

    return (
        <div className="create-request-container">
            <h1>Создание новой заявки</h1>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="create-request-form">
                <div className="form-group">
                    <label>Тип автомобиля:</label>
                    <select
                        name="carType"
                        value={formData.carType}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Выберите тип</option>
                        <option value="Легковая">Легковая</option>
                        <option value="Грузовая">Грузовая</option>
                        <option value="Мотоцикл">Мотоцикл</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Модель автомобиля:</label>
                    <input
                        type="text"
                        name="carModel"
                        value={formData.carModel}
                        onChange={handleChange}
                        required
                        placeholder="Например: Toyota Camry"
                    />
                </div>

                <div className="form-group">
                    <label>Описание проблемы:</label>
                    <textarea
                        name="problemDescription"
                        value={formData.problemDescription}
                        onChange={handleChange}
                        required
                        rows="5"
                        placeholder="Опишите проблему подробно..."
                    />
                </div>

                <div className="form-group">
                    <label>Плановая дата завершения:</label>
                    <input
                        type="date"
                        name="plannedCompletionDate"
                        value={formData.plannedCompletionDate}
                        onChange={handleChange}
                        required
                        min={new Date().toISOString().split('T')[0]}
                    />
                </div>

                <div className="form-actions">
                    <button type="submit" className="btn-submit">Создать заявку</button>
                    <button type="button" className="btn-cancel" onClick={() => navigate('/requests')}>
                        Отмена
                    </button>
                </div>
            </form>
        </div>
    );
}

export default CreateRequest;