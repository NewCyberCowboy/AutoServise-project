import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    if (!user.role) return null;

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/">Автосервис</Link>
            </div>
            <div className="navbar-menu">
                <Link to="/requests" className="nav-link">Заявки</Link>
                {user.role === 'Администратор' && (
                    <>
                        <Link to="/users" className="nav-link">Управление пользователями</Link>
                        <Link to="/reports" className="nav-link">Отчеты</Link>
                        <Link to="/quality" className="nav-link">Контроль качества</Link>
                    </>
                )}
                {user.role === 'Менеджер' && (
                    <>
                        <Link to="/quality" className="nav-link">Контроль качества</Link>
                    </>
                )}
                {user.role === 'Клиент' && (
                    <Link to="/create-request" className="nav-link">Создать заявку</Link>
                )}
            </div>
            <div className="navbar-user">
                <span className="user-name">{user.fio}</span>
                <span className="user-role">({user.role})</span>
                <button onClick={handleLogout} className="btn-logout">Выйти</button>
            </div>
        </nav>
    );
}

export default Navbar;