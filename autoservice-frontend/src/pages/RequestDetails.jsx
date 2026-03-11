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
    const [additionalMechanicId, setAdditionalMechanicId] = useState('');
    const [selectedAdditionalMechanicId, setSelectedAdditionalMechanicId] = useState('');
    const [deadlineNotification, setDeadlineNotification] = useState('');
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
                setDeadlineNotification(`Срок выполнения продлен на ${days} дней`);
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

    const handleAddAdditionalMechanic = async (mechanicId) => {
        if (!mechanicId) return;

        try {
            await api.post(`/request/${id}/additional-mechanic`, mechanicId, {
                headers: { 'Content-Type': 'application/json' }
            });
            loadData();
            alert('Дополнительный механик добавлен');
        } catch (error) {
            console.error('Ошибка добавления дополнительного механика:', error);
            alert('Не удалось добавить дополнительного механика');
        }
    };

    const handleRequestExtension = async () => {
        const days = prompt('На сколько дней продлить заявку?', '3');
        if (!days || isNaN(days) || Number(days) <= 0) return;

        try {
            await api.post(`/request/${id}/extension-request`, Number(days), {
                headers: { 'Content-Type': 'application/json' }
            });
            loadData();
            alert('Запрос на продление отправлен клиенту');
        } catch (error) {
            console.error('Ошибка запроса на продление:', error);
            alert('Не удалось отправить запрос на продление');
        }
    };

    const handleApproveExtension = async () => {
        try {
            await api.put(`/request/${id}/extension-approve`);
            loadData();
            alert('Запрос на продление одобрен');
        } catch (error) {
            console.error('Ошибка одобрения продления:', error);
            alert('Не удалось одобрить продление');
        }
    };

    const handleDeclineExtension = async () => {
        try {
            await api.put(`/request/${id}/extension-decline`);
            loadData();
            alert('Запрос на продление отклонен');
        } catch (error) {
            console.error('Ошибка отклонения продления:', error);
            alert('Не удалось отклонить продление');
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
            setDeadlineNotification(`Плановая дата изменена на ${newDate}`);
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

    const handleOpenFeedback = () => {
        const feedbackUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSdhZcExx6LSIXxk0ub55mSu-WIh23WYdGG9HY5EZhLDo7P8eA/viewform';
        window.open(feedbackUrl, '_blank');
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

                    {(user.role === 'Клиент' && request.requestStatus === 'Завершена') && (
                        <div className="qr-feedback-note">
                            <p>
                                Оцените нашу работу! Отсканируйте QR-код и перейдите на форму обратной связи.
                            </p>
                        </div>
                    )}

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
                        {request.extensionStatus && request.extensionStatus.toLowerCase() !== 'none' && (
                            <div className="info-row">
                                <span className="label">Статус продления:</span>
                                <span className="value">{request.extensionStatus} {request.extensionRequestedDays ? `(${request.extensionRequestedDays} дней)` : ''}</span>
                            </div>
                        )}
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
                                    {(user.role === 'Администратор' || user.role === 'Менеджер') && request.requestStatus !== 'Завершена' && (
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

                                            <div className="additional-mechanic">
                                                <label>Добавить доп. механика:</label>
                                                <select
                                                    value={selectedAdditionalMechanicId}
                                                    onChange={(e) => setSelectedAdditionalMechanicId(e.target.value)}
                                                >
                                                    <option value="">Выберите механика</option>
                                                    {masters
                                                        .filter(m => m.userId !== request.masterId)
                                                        .map(master => (
                                                            <option key={master.userId} value={master.userId}>
                                                                {master.fio}
                                                            </option>
                                                        ))}
                                                </select>
                                                <button
                                                    className="btn-add-mechanic"
                                                    onClick={async () => {
                                                        const idToAdd = Number(selectedAdditionalMechanicId);
                                                        if (Number.isInteger(idToAdd) && idToAdd > 0) {
                                                            await handleAddAdditionalMechanic(idToAdd);
                                                            setSelectedAdditionalMechanicId('');
                                                        } else {
                                                            alert('Выберите корректного механика из списка');
                                                        }
                                                    }}
                                                >
                                                    Добавить механика
                                                </button>
                                            </div>

                                            {request.additionalMechanicIds && request.additionalMechanicIds.trim() !== '' && (
                                                <div className="additional-mechanic-list">
                                                    <strong>Доп. механики в заявке:</strong>
                                                    <ul>
                                                        {request.additionalMechanicIds.split(',').filter(x => x).map((id) => {
                                                            const master = masters.find(m => m.userId === Number(id));
                                                            return <li key={id}>{master ? master.fio : `Механик #${id}`}</li>;
                                                        })}
                                                    </ul>
                                                </div>
                                            )}
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

                                    {(user.role === 'Администратор' || user.role === 'Менеджер') && (
                                        <>
                                            <button className="btn-extend" onClick={handleExtendDeadline}>
                                                Продлить срок выполнения
                                            </button>
                                            <button className="btn-set-deadline" onClick={handleSetDeadline}>
                                                Установить дату
                                            </button>
                                            {request.requestStatus !== 'Завершена' && (
                                                <button className="btn-request-extension" onClick={handleRequestExtension}>
                                                    Отправить запрос на продление клиенту
                                                </button>
                                            )}
                                        </>
                                    )}

                                    {request.requestStatus === 'Завершена' && (
                                        <button className="btn-feedback" onClick={handleOpenFeedback}>
                                            Перейти к форме обратной связи
                                        </button>
                                    )}
                                </>
                            )}

                            {deadlineNotification && (
                                <div className="deadline-notification">
                                    <p>{deadlineNotification}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {(user.role === 'Клиент' && (request.extensionRequested === true || (request.extensionStatus && request.extensionStatus.toLowerCase() === 'pending'))) && (
                    <div className="extension-approval-client">
                        <p>Клиент, просим вас оценить необходимость продления на {request.extensionRequestedDays} дней.</p>
                        <button onClick={handleApproveExtension}>Согласовать</button>
                        <button onClick={handleDeclineExtension}>Отклонить</button>
                    </div>
                )}

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