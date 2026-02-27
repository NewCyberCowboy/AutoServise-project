import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './QualityDashboard.css';

function QualityDashboard() {
    const [masters, setMasters] = useState([]);
    const [delayedRequests, setDelayedRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        if (user.role !== 'Администратор') {
            navigate('/requests');
            return;
        }
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [mastersRes, delayedRes] = await Promise.all([
                api.get('/quality/masters'),
                api.get('/report/delayed')
            ]);

            setMasters(mastersRes.data);
            setDelayedRequests(delayedRes.data);
            setLoading(false);
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
            setLoading(false);
        }
    };

    const handleExtendDeadline = async (requestId) => {
        const days = prompt('На сколько дней продлить?', '3');
        if (days && !isNaN(days)) {
            try {
                await api.put(`/quality/extend/${requestId}`, parseInt(days), {
                    headers: { 'Content-Type': 'application/json' }
                });
                loadData();
            } catch (error) {
                console.error('Ошибка продления срока:', error);
            }
        }
    };

    const handleReassignMaster = async (requestId) => {
        const masterId = prompt('Введите ID нового мастера:');
        if (masterId && !isNaN(masterId)) {
            try {
                await api.put(`/quality/assign/${requestId}`, parseInt(masterId), {
                    headers: { 'Content-Type': 'application/json' }
                });
                loadData();
            } catch (error) {
                console.error('Ошибка назначения мастера:', error);
            }
        }
    };

    if (loading) return <div className="loading">Загрузка...</div>;

    return (
        <div className="quality-container">
            <h1>Контроль качества</h1>

            <div className="quality-grid">
                <div className="masters-section">
                    <h2>Загрузка механиков</h2>
                    <div className="masters-list">
                        {masters.map(master => (
                            <div key={master.userId} className="master-card">
                                <div className="master-info">
                                    <h3>{master.fio}</h3>
                                    <p>ID: {master.userId}</p>
                                </div>
                                <div className="master-load">
                                    <div className="load-bar">
                                        <div
                                            className="load-fill"
                                            style={{
                                                width: `${Math.min(master.activeRequests * 20, 100)}%`,
                                                backgroundColor: master.activeRequests > 3 ? '#dc3545' : '#28a745'
                                            }}
                                        ></div>
                                    </div>
                                    <span className="load-count">
                                        Активных заявок: {master.activeRequests}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="delayed-section">
                    <h2>Просроченные заявки</h2>
                    {delayedRequests.length === 0 ? (
                        <p className="no-data">Нет просроченных заявок</p>
                    ) : (
                        <div className="delayed-list">
                            {delayedRequests.map(request => (
                                <div key={request.requestId} className="delayed-card">
                                    <div className="delayed-header">
                                        <span className="request-id">Заявка #{request.requestId}</span>
                                        <span className="delayed-badge">
                                            Просрочка: {request.daysDelayed} дн.
                                        </span>
                                    </div>
                                    <div className="delayed-body">
                                        <p><strong>Автомобиль:</strong> {request.carModel}</p>
                                        <p><strong>Проблема:</strong> {request.problemDescription}</p>
                                        <p><strong>Плановая дата:</strong> {new Date(request.plannedCompletionDate).toLocaleDateString()}</p>
                                    </div>
                                    <div className="delayed-actions">
                                        <button
                                            className="btn-extend"
                                            onClick={() => handleExtendDeadline(request.requestId)}
                                        >
                                            Продлить срок
                                        </button>
                                        <button
                                            className="btn-reassign"
                                            onClick={() => handleReassignMaster(request.requestId)}
                                        >
                                            Переназначить
                                        </button>
                                        <button
                                            className="btn-view"
                                            onClick={() => navigate(`/request/${request.requestId}`)}
                                        >
                                            Детали
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default QualityDashboard;