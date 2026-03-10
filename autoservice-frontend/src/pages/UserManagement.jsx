import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './UserManagement.css';

function UserManagement() {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [updating, setUpdating] = useState(null);
    const navigate = useNavigate();
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        if (currentUser.role !== 'Администратор') {
            navigate('/requests');
            return;
        }
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [usersRes, rolesRes] = await Promise.all([
                api.get('/auth/users'),
                api.get('/auth/roles')
            ]);
            setUsers(usersRes.data);
            setRoles(rolesRes.data);
        } catch (err) {
            console.error('Ошибка загрузки:', err);
            setError('Не удалось загрузить данные');
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            setUpdating(userId);
            await api.put(`/auth/users/${userId}/role`, { role: newRole });
            await loadData(); // Перезагружаем данные
        } catch (err) {
            console.error('Ошибка обновления роли:', err);
            alert('Не удалось обновить роль');
        } finally {
            setUpdating(null);
        }
    };

    const handleToggleStatus = async (userId) => {
        try {
            setUpdating(userId);
            await api.put(`/auth/users/${userId}/toggle-status`);
            await loadData();
        } catch (err) {
            console.error('Ошибка изменения статуса:', err);
            alert('Не удалось изменить статус');
        } finally {
            setUpdating(null);
        }
    };

    const getRoleBadgeClass = (role) => {
        switch (role) {
            case 'Администратор': return 'role-badge admin';
            case 'Менеджер': return 'role-badge manager';
            case 'Автомеханик': return 'role-badge mechanic';
            default: return 'role-badge client';
        }
    };

    if (loading) return <div className="loading">Загрузка...</div>;

    return (
        <div className="page-container">
            <h1 className="page-title">Управление пользователями</h1>

            {error && <div className="error-message">{error}</div>}

            <div className="users-table-container">
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>ФИО</th>
                            <th>Логин</th>
                            <th>Email</th>
                            <th>Телефон</th>
                            <th>Текущая роль</th>
                            <th>Статус</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.userId} className={!user.isActive ? 'inactive' : ''}>
                                <td>{user.userId}</td>
                                <td>{user.fio}</td>
                                <td>{user.login}</td>
                                <td>{user.email || '-'}</td>
                                <td>{user.phone || '-'}</td>
                                <td>
                                    <span className={getRoleBadgeClass(user.type)}>
                                        {user.type}
                                    </span>
                                </td>
                                <td>
                                    <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                                        {user.isActive ? 'Активен' : 'Заблокирован'}
                                    </span>
                                </td>
                                <td className="actions">
                                    {user.userId !== currentUser.id && (
                                        <>
                                            <select
                                                value={user.type}
                                                onChange={(e) => handleRoleChange(user.userId, e.target.value)}
                                                disabled={updating === user.userId}
                                                className="role-select"
                                            >
                                                {roles.map(role => (
                                                    <option key={role.value} value={role.value}>
                                                        {role.label}
                                                    </option>
                                                ))}
                                            </select>

                                            <button
                                                onClick={() => handleToggleStatus(user.userId)}
                                                disabled={updating === user.userId}
                                                className={`status-btn ${user.isActive ? 'deactivate' : 'activate'}`}
                                            >
                                                {user.isActive ? 'Заблокировать' : 'Активировать'}
                                            </button>
                                        </>
                                    )}
                                    {user.userId === currentUser.id && (
                                        <span className="current-user">Это вы</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="roles-info">
                <h3>Информация о ролях:</h3>
                <div className="roles-grid">
                    <div className="role-info-card">
                        <h4>Администратор</h4>
                        <p>Полный доступ к системе, управление пользователями, назначение ролей</p>
                    </div>
                    <div className="role-info-card">
                        <h4>Менеджер</h4>
                        <p>Управление заказами, назначение механиков, контроль качества, продление сроков</p>
                    </div>
                    <div className="role-info-card">
                        <h4>Автомеханик</h4>
                        <p>Работа с назначенными заявками, изменение статуса, добавление комментариев</p>
                    </div>
                    <div className="role-info-card">
                        <h4>Клиент</h4>
                        <p>Создание заявок, просмотр своих заявок, добавление отзывов</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UserManagement;