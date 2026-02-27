import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Reports.css';

function Reports() {
    const [stats, setStats] = useState(null);
    const [averageTime, setAverageTime] = useState(null);
    const [delayedRequests, setDelayedRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        if (user.role !== 'Администратор') {
            navigate('/requests');
            return;
        }
        loadReports();
    }, []);

    const loadReports = async () => {
        try {
            const [statsRes, averageRes, delayedRes] = await Promise.all([
                api.get('/report/count'),
                api.get('/report/average'),
                api.get('/report/delayed')
            ]);

            setStats(statsRes.data);
            setAverageTime(averageRes.data.averageTime);
            setDelayedRequests(delayedRes.data);
            setLoading(false);
        } catch (error) {
            console.error('Ошибка загрузки отчетов:', error);
            setLoading(false);
        }
    };

    if (loading) return <div className="loading">Загрузка...</div>;

    return (
        <div className="reports-container">
            <h1>Отчеты и статистика</h1>

            <div className="stats-grid">
                <div className="stat-card">
                    <h3>Всего заявок</h3>
                    <div className="stat-value">{stats?.total || 0}</div>
                </div>
                <div className="stat-card">
                    <h3>В работе</h3>
                    <div className="stat-value">{stats?.inProgress || 0}</div>
                </div>
                <div className="stat-card">
                    <h3>Завершено</h3>
                    <div className="stat-value">{stats?.completed || 0}</div>
                </div>
                <div className="stat-card">
                    <h3>Среднее время</h3>
                    <div className="stat-value">{averageTime || 0} дней</div>
                </div>
            </div>

            <div className="delayed-section">
                <h2>Просроченные заявки</h2>
                {delayedRequests.length === 0 ? (
                    <p className="no-data">Нет просроченных заявок</p>
                ) : (
                    <table className="delayed-table">
                        <thead>
                            <tr>
                                <th>№ заявки</th>
                                <th>Автомобиль</th>
                                <th>Проблема</th>
                                <th>Плановая дата</th>
                                <th>Просрочено (дней)</th>
                                <th>Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            {delayedRequests.map(request => (
                                <tr key={request.requestId}>
                                    <td>#{request.requestId}</td>
                                    <td>{request.carModel}</td>
                                    <td>{request.problemDescription}</td>
                                    <td>{new Date(request.plannedCompletionDate).toLocaleDateString()}</td>
                                    <td className="delayed-days">{request.daysDelayed}</td>
                                    <td>
                                        <button
                                            className="btn-view"
                                            onClick={() => navigate(`/request/${request.requestId}`)}
                                        >
                                            Просмотр
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default Reports;