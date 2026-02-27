import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import './RequestDetails.css';

function RequestDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [request, setRequest] = useState(null);
    const [comments, setComments] = useState([]);
    const [masters, setMasters] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            const [requestRes, commentsRes, mastersRes] = await Promise.all([
                api.get(`/request/${id}`),
                api.get(`/request/${id}/comments`),
                api.get('/quality/masters')
            ]);

            setRequest(requestRes.data);
            setComments(commentsRes.data);
            setMasters(mastersRes.data);
            setLoading(false);
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
            setLoading(false);
        }
    };

    const handleStatusChange = async (newStatus) => {
        try {
            await api.put(`/request/${id}/status`, newStatus, {
                headers: { 'Content-Type': 'application/json' }
            });
            loadData();
        } catch (error) {
            console.error('Ошибка обновления статуса:', error);
        }
    };

    const handleAddComment = async () => {
        if (!newComment.trim()) return;

        try {
            await api.post(`/request/${id}/comment`, {
                message: newComment,
                masterId: user.id
            });
            setNewComment('');
            loadData();
        } catch (error) {
            console.error('Ошибка добавления комментария:', error);
        }
    };

    const handleAssignMaster = async (masterId) => {
        try {
            await api.put(`/quality/assign/${id}`, masterId, {
                headers: { 'Content-Type': 'application/json' }
            });
            loadData();
        } catch (error) {
            console.error('Ошибка назначения мастера:', error);
        }
    };

    const handleExtendDeadline = async () => {
        const days = prompt('На сколько дней продлить?', '3');
        if (days && !isNaN(days)) {
            try {
                await api.put(`/quality/extend/${id}`, parseInt(days), {
                    headers: { 'Content-Type': 'application/json' }
                });
                loadData();
            } catch (error) {
                console.error('Ошибка продления срока:', error);
            }
        }
    };

    if (loading) return <div className="loading">Загрузка...</div>;
    if (!request) return <div className="error">Заявка не найдена</div>;

    return (
        <div className="request-details-container">
            <button className="btn-back" onClick={() => navigate('/requests')}>
                ← Назад к списку
            </button>

            <div className="request-details">
                <div className="details-header">
                    <h1>Заявка #{request.requestId}</h1>
                    <div className="qr-code">
                        <img
                            src={`https://localhost:5001/api/request/${id}/qrcode`}
                            alt="QR код заявки"
                        />
                    </div>
                </div>

                <div className="details-grid">
                    <div className="info-section">
                        <h3>Информация о заявке</h3>
                        <div className="info-row">
                            <span className="label">Статус:</span>
                            <span className={`value status-${request.requestStatus.toLowerCase()}`}>
                                {request.requestStatus}
                            </span>
                        </div>
                        <div className="info-row">
                            <span className="label">Автомобиль:</span>
                            <span className="value">{request.carModel} ({request.carType})</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Проблема:</span>
                            <span className="value">{request.problemDescription}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Дата создания:</span>
                            <span className="value">{new Date(request.startDate).toLocaleString()}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Плановая дата:</span>
                            <span className="value">{new Date(request.plannedCompletionDate).toLocaleDateString()}</span>
                        </div>
                        {request.completionDate && (
                            <div className="info-row">
                                <span className="label">Дата завершения:</span>
                                <span className="value">{new Date(request.completionDate).toLocaleDateString()}</span>
                            </div>
                        )}
                        {request.repairParts && (
                            <div className="info-row">
                                <span className="label">Запчасти:</span>
                                <span className="value">{request.repairParts}</span>
                            </div>
                        )}
                    </div>

                    {(user.role === 'Администратор' || user.role === 'Автомеханик') && (
                        <div className="actions-section">
                            <h3>Действия</h3>

                            {request.requestStatus !== 'Завершена' && (
                                <>
                                    {request.requestStatus === 'Новая' && user.role === 'Администратор' && (
                                        <div className="assign-master">
                                            <label>Назначить мастера:</label>
                                            <select onChange={(e) => handleAssignMaster(parseInt(e.target.value))}>
                                                <option value="">Выберите мастера</option>
                                                {masters.map(master => (
                                                    <option key={master.userId} value={master.userId}>
                                                        {master.fio} (активных заявок: {master.activeRequests})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    <div className="status-actions">
                                        <label>Изменить статус:</label>
                                        <div className="status-buttons">
                                            {request.requestStatus === 'Новая' && (
                                                <button onClick={() => handleStatusChange('В работе')}>
                                                    Начать работу
                                                </button>
                                            )}
                                            {request.requestStatus === 'В работе' && (
                                                <button onClick={() => handleStatusChange('Готова к выдаче')}>
                                                    Завершить ремонт
                                                </button>
                                            )}
                                            {request.requestStatus === 'Готова к выдаче' && (
                                                <button onClick={() => handleStatusChange('Завершена')}>
                                                    Выдать клиенту
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {user.role === 'Администратор' && (
                                        <button className="btn-extend" onClick={handleExtendDeadline}>
                                            Продлить срок выполнения
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>

                <div className="comments-section">
                    <h3>Комментарии</h3>
                    <div className="comments-list">
                        {comments.map(comment => (
                            <div key={comment.commentId} className="comment">
                                <div className="comment-header">
                                    <span className="comment-author">Мастер #{comment.masterId}</span>
                                    <span className="comment-date">
                                        {new Date(comment.createdAt || new Date()).toLocaleString()}
                                    </span>
                                </div>
                                <div className="comment-text">{comment.message}</div>
                            </div>
                        ))}
                    </div>

                    {(user.role === 'Автомеханик' || user.role === 'Администратор') && (
                        <div className="add-comment">
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Добавить комментарий..."
                                rows="3"
                            />
                            <button onClick={handleAddComment}>Отправить</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default RequestDetails;