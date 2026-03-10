import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Requests.css';

function Requests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        try {
            const response = await api.get('/request');
            setRequests(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Ошибка загрузки заявок:', error);
            setLoading(false);
        }
    };

    const getFilteredRequests = () => {
        switch (filter) {
            case 'new':
                return requests.filter(r => r.requestStatus === 'Новая');
            case 'inProgress':
                return requests.filter(r => r.requestStatus === 'В работе');
            case 'completed':
                return requests.filter(r => r.requestStatus === 'Завершена');
            default:
                return requests;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Новая': return 'status-new';
            case 'В работе': return 'status-progress';
            case 'Завершена': return 'status-completed';
            default: return '';
        }
    };

    if (loading) return <div className="loading">Загрузка...</div>;

    return (
        <div className="page-container requests-container">
            <div className="requests-header">
                <h1>Заявки на ремонт</h1>
                {user.role === 'Клиент' && (
                    <button
                        className="btn-create"
                        onClick={() => navigate('/create-request')}
                    >
                        + Новая заявка
                    </button>
                )}
            </div>

            <div className="filters">
                <button
                    className={filter === 'all' ? 'active' : ''}
                    onClick={() => setFilter('all')}
                >
                    Все
                </button>
                <button
                    className={filter === 'new' ? 'active' : ''}
                    onClick={() => setFilter('new')}
                >
                    Новые
                </button>
                <button
                    className={filter === 'inProgress' ? 'active' : ''}
                    onClick={() => setFilter('inProgress')}
                >
                    В работе
                </button>
                <button
                    className={filter === 'completed' ? 'active' : ''}
                    onClick={() => setFilter('completed')}
                >
                    Завершенные
                </button>
            </div>

            <div className="requests-list">
                {getFilteredRequests().map(request => (
                    <div
                        key={request.requestId}
                        className={`request-card ${request.isDelayed ? 'delayed' : ''}`}
                        onClick={() => navigate(`/request/${request.requestId}`)}
                    >
                        <div className="request-header">
                            <span className="request-id">Заявка #{request.requestId}</span>
                            <span className={`request-status ${getStatusColor(request.requestStatus)}`}>
                                {request.requestStatus}
                            </span>
                        </div>
                        <div className="request-body">
                            <div className="car-info">
                                <strong>{request.carModel}</strong> ({request.carType})
                            </div>
                            <div className="problem">
                                {request.problemDescription}
                            </div>
                            <div className="dates">
                                <div>Создана: {new Date(request.startDate).toLocaleDateString()}</div>
                                <div>План: {new Date(request.plannedCompletionDate).toLocaleDateString()}</div>
                            </div>
                        </div>
                        {request.isDelayed && (
                            <div className="delay-badge">Просрочено!</div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Requests;