import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const [activeItem, setActiveItem] = useState('Trang chủ');
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  // Function to set active menu item
  const handleClick = (item) => {
    setActiveItem(item);
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    // Sidebar Navigation
    <div className="sidebar">
      <div className="sidebar-header">
        <h2><i className="fas fa-parking"></i> <span>Smart Parking</span></h2>
      </div>
      
      <div className="menu">
        <Link
          to="/parking-management"
          className={`menu-item ${activeItem === 'Quản lý bãi đỗ' ? 'active' : ''}`}
          onClick={() => handleClick('Quản lý bãi đỗ')}
        >
          <i className="fas fa-map-marked-alt"></i>
          <span>Quản lý bãi đỗ</span>
        </Link>
        <Link
          to="/history"
          className={`menu-item ${activeItem === 'Lich sử' ? 'active' : ''}`}
          onClick={() => handleClick('Lich sử')}
        >
          <i className="fas fa-history"></i>
          <span>Lịch sử ra vào</span>
        </Link>
        <Link
          to="/user-management"
          className={`menu-item ${activeItem === 'Quản lý người dùng' ? 'active' : ''}`}
          onClick={() => handleClick('Quản lý người dùng')}
        >
          <i className="fas fa-users"></i>
          <span>Quản lý người dùng</span>
        </Link>
        <Link
          to="/payment"
          className={`menu-item ${activeItem === 'Thanh toán' ? 'active' : ''}`}
          onClick={() => handleClick('Thanh toán')}
        >
          <i className="fas fa-receipt"></i>
          <span>Quản lý thanh toán</span>
        </Link>
        <Link
          to="/reports"
          className={`menu-item ${activeItem === 'Báo cáo' ? 'active' : ''}`}
          onClick={() => handleClick('Báo cáo')}
        >
          <i className="fas fa-chart-line"></i>
          <span>Báo cáo</span>
        </Link>
        
        {/* Logout button */}
        <div 
          className="menu-item logout"
          onClick={handleLogout}
        >
          <i className="fas fa-sign-out-alt"></i>
          <span>Đăng xuất</span>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
