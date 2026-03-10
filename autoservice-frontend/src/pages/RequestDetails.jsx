import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { getFullUrl } from '../services/api';
import './RequestDetails.css';

function RequestDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [request, setRequest] = useState(null);
    const [comments, setComments] = useState([]);
    const [masters, setMasters] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [qrError, setQrError] = useState(false);
    const [qrLoading, setQrLoading] = useState(false);
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [showQrModal, setShowQrModal] = useState(false);
    useEffect(() => {
        if (id && id !== 'undefined') {
            loadData();
        } else {
            setLoading(false);
            setError('Неверный ID заявки');
        }
    }, [id]);

    const loadData = async () => {
        try {
            setLoading(true);

            const requestRes = await api.get(`/request/${id}`);
            setRequest(requestRes.data);

            try {
                const commentsRes = await api.get(`/request/${id}/comments`);
                setComments(commentsRes.data);
            } catch (error) {
                console.error('Ошибка загрузки комментариев:', error);
                setComments([]);
            }

            if (user.role === 'Администратор' || user.role === 'Автомеханик' || user.role === 'Менеджер') {
                try {
                    const mastersRes = await api.get('/quality/masters');
                    setMasters(mastersRes.data);
                } catch (error) {
                    console.error('Ошибка загрузки мастеров:', error);
                    setMasters([]);
                }
            }

            setLoading(false);
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
            setLoading(false);
        }
    };

    const handleStatusChange = async (newStatus) => {
        try {
            await api.put(`/request/${id}/status`, JSON.stringify(newStatus), {
                headers: { 'Content-Type': 'application/json' }
            });
            loadData();
        } catch (error) {
            console.error('Ошибка обновления статуса:', error);
            alert('Не удалось обновить статус');
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
            alert('Не удалось добавить комментарий');
        }
    };

    const handleAssignMaster = async (masterId) => {
        if (!masterId) return;

        try {
            await api.put(`/quality/assign/${id}`, masterId, {
                headers: { 'Content-Type': 'application/json' }
            });
            loadData();
            alert('Механик успешно назначен');
        } catch (error) {
            console.error('Ошибка назначения мастера:', error);
            alert('Не удалось назначить механика');
        }
    };

    const handleExtendDeadline = async () => {
        const days = prompt('На сколько дней продлить?', '3');
        if (days && !isNaN(days) && parseInt(days) > 0) {
            try {
                await api.put(`/quality/extend/${id}`, parseInt(days), {
                    headers: { 'Content-Type': 'application/json' }
                });
                loadData();
                alert(`Срок выполнения продлен на ${days} дней`);
            } catch (error) {
                console.error('Ошибка продления срока:', error);
                alert('Не удалось продлить срок');
            }
        }
    };

    const handleUnassignMaster = async () => {
        if (!window.confirm('Снять механика с заявки?')) return;

        try {
            await api.put(`/quality/unassign/${id}`);
            loadData();
            alert('Механик снят с заявки');
        } catch (error) {
            console.error('Ошибка снятия механика:', error);
            alert('Не удалось снять механика');
        }
    };

    const handleSetDeadline = async () => {
        const newDate = prompt('Введите новую плановую дату (YYYY-MM-DD)', request.plannedCompletionDate?.split('T')[0] || '');
        if (!newDate) return;

        const parsed = new Date(newDate);
        if (isNaN(parsed.getTime())) {
            alert('Неверный формат даты');
            return;
        }

        try {
            await api.put(`/quality/deadline/${id}`, parsed.toISOString(), {
                headers: { 'Content-Type': 'application/json' }
            });
            loadData();
            alert(`Плановая дата изменена на ${newDate}`);
        } catch (error) {
            console.error('Ошибка изменения плановой даты:', error);
            alert('Не удалось изменить плановую дату');
        }
    };

    const handleDownloadQr = async () => {
        try {
            setQrLoading(true);
            const response = await fetch(getFullUrl(`/api/request/${id}/qrcode`));
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `request_${id}_qrcode.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            setQrLoading(false);
        } catch (error) {
            console.error('Ошибка при скачивании QR-кода:', error);
            alert('Не удалось скачать QR-код');
            setQrLoading(false);
        }
    };

    const handlePrintQr = () => {
        const printWindow = window.open(getFullUrl(`/api/request/${id}/qrcode`));
        if (printWindow) {
            printWindow.onload = () => {
                printWindow.print();
            };
        }
    };

    if (loading) return <div className="loading">Загрузка...</div>;
    if (!request) return <div className="error">Заявка не найдена</div>;

    return (
        <div className="page-container request-details-container">
            <button className="btn-back" onClick={() => navigate('/requests')}>
                ← Назад к списку
            </button>

            <div className="request-details">
                <div className="details-header">
                    <h1>Заявка #{request.requestId}</h1>
                    <div className="qr-code-container">
                        {!qrError ? (
                            <div className="qr-code-wrapper">
                                <img
                                    src={getFullUrl(`/api/request/${id}/qrcode`)}
                                    alt="QR код заявки"
                                    onError={() => setQrError(true)}
                                    onClick={() => setShowQrModal(true)}
                                    className="qr-code-image"
                                />
                                <div className="qr-code-actions">
                                    <button
                                        onClick={handleDownloadQr}
                                        className="qr-action-btn"
                                        disabled={qrLoading}
                                        title="Скачать QR-код"
                                    >
                                        💾
                                    </button>
                                    <button
                                        onClick={handlePrintQr}
                                        className="qr-action-btn"
                                        title="Печать QR-кода"
                                    >
                                        🖨️
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="qr-placeholder">
                                <span>QR код</span>
                                <small>недоступен</small>
                            </div>
                        )}
                    </div>
                </div>
                {showQrModal && (
                    <div className="qr-modal" onClick={() => setShowQrModal(false)}>
                        <div className="qr-modal-content" onClick={e => e.stopPropagation()}>
                            <img
                                src={getFullUrl(`/api/request/${id}/qrcode`)}
                                alt="QR код заявки (увеличено)"
                                className="qr-modal-image"
                            />
                            <button
                                className="qr-modal-close"
                                onClick={() => setShowQrModal(false)}
                            >
                                ×
                            </button>
                            <div className="qr-modal-actions">
                                <button onClick={handleDownloadQr} className="qr-modal-btn">
                                    Скачать
                                </button>
                                <button onClick={handlePrintQr} className="qr-modal-btn">
                                    Печать
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                <div className="details-grid">
                    <div className="info-section">
                        <h3>Информация о заявке</h3>
                        <div className="info-row">
                            <span className="label">Статус:</span>
                            <span className={`value status-${request.requestStatus?.toLowerCase() || 'unknown'}`}>
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
                            <span className="value">{new Date(request.startDate).toLocaleString('ru-RU')}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Плановая дата:</span>
                            <span className="value">{new Date(request.plannedCompletionDate).toLocaleDateString('ru-RU')}</span>
                        </div>
                        {request.completionDate && (
                            <div className="info-row">
                                <span className="label">Дата завершения:</span>
                                <span className="value">{new Date(request.completionDate).toLocaleDateString('ru-RU')}</span>
                            </div>
                        )}
                        {request.repairParts && (
                            <div className="info-row">
                                <span className="label">Запчасти:</span>
                                <span className="value">{request.repairParts}</span>
                            </div>
                        )}
                        {request.client && (
                            <div className="info-row">
                                <span className="label">Клиент:</span>
                                <span className="value">{request.client.fio}</span>
                            </div>
                        )}
                        {request.master && (
                            <div className="info-row">
                                <span className="label">Механик:</span>
                                <span className="value">{request.master.fio}</span>
                            </div>
                        )}
                    </div>

                    {(user.role === 'Администратор' || user.role === 'Автомеханик' || user.role === 'Менеджер') && (
                        <div className="actions-section">
                            <h3>Действия</h3>

                            {request.requestStatus !== 'Завершена' && (
                                <>
                                    {(request.requestStatus === 'Новая' && (user.role === 'Администратор' || user.role === 'Менеджер')) && (
                                        <div className="assign-master">
                                            <label>Назначить/сменить мастера:</label>
                                            <select
                                                onChange={(e) => handleAssignMaster(parseInt(e.target.value))}
                                                defaultValue=""
                                            >
                                                <option value="" disabled>Выберите мастера</option>
                                                {masters.map(master => (
                                                    <option key={master.userId} value={master.userId}>
                                                        {master.fio} (активных заявок: {master.activeRequests || 0})
                                                    </option>
                                                ))}
                                            </select>
                                            <button className="btn-unassign" onClick={handleUnassignMaster}>
                                                Снять механика
                                            </button>
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
                                            {request.requestStatus === 'Готова к выдачи' && (
                                                <button onClick={() => handleStatusChange('Завершена')}>
                                                    Выдать клиенту
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {(user.role === 'Администратор' || user.role === 'Менеджер') && (
                                        <>
                                            <button className="btn-extend" onClick={handleExtendDeadline}>
                                                Продлить срок выполнения
                                            </button>
                                            <button className="btn-set-deadline" onClick={handleSetDeadline}>
                                                Установить дату
                                            </button>
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>

                <div className="comments-section">
                    <h3>Комментарии</h3>
                    <div className="comments-list">
                        {comments.length === 0 ? (
                            <p className="no-comments">Нет комментариев</p>
                        ) : (
                            comments.map(comment => (
                                <div key={comment.commentId} className="comment">
                                    <div className="comment-header">
                                        <span className="comment-author">
                                            {comment.masterName || `Мастер #${comment.masterId}`}
                                        </span>
                                        <span className="comment-date">
                                            {new Date(comment.createdAt).toLocaleString('ru-RU')}
                                        </span>
                                    </div>
                                    <div className="comment-text">{comment.message}</div>
                                </div>
                            ))
                        )}
                    </div>

                    {(user.role === 'Автомеханик' || user.role === 'Администратор' || user.role === 'Менеджер') && (
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