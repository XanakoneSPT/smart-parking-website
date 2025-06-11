import React, { useState, useEffect, useMemo } from 'react';
import './styles/style-user.css';
import Footer from '../components/Footer';
import { apiService, API_URL } from '../services/api';
import TablePagination from '../components/TablePagination';
import html2pdf from 'html2pdf.js';
import * as XLSX from 'xlsx';

function UserManagement() {
  // State
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    id: '', // ma_sv
    password: 'cntt123', // mat_khau default
    name: '', // ho_ten
    id_rfid: '', // id_rfid
    total_money: 100000, // so_tien_hien_co
  });
  // Add pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    recordsPerPage: 10,
    totalRecords: 0
  });
  // Add sort order state
  const [sortOrder, setSortOrder] = useState('newest'); // Default: newest to oldest

  // Log API URL for debugging
  useEffect(() => {
    console.log('API URL:', API_URL);
  }, []);

  // Fetch users function
  const fetchUsers = async () => {
    setError(null);
    setLoading(true);
    
    try {
      console.log('Fetching users from:', `${API_URL}api_users/sinhvien/`);
      const response = await apiService.get('api_users/sinhvien/');
      console.log('Users data received:', response.data);
      
      // Store all users for filtering
      setUsers(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users data. Please try again later.');
      setLoading(false);
    }
  };

  // Initial fetch and fetch when pagination changes
  useEffect(() => {
    fetchUsers();
  }, [pagination.currentPage, pagination.recordsPerPage]);

  // Calculate filtered users with pagination
  const filteredUsers = useMemo(() => {
    let filtered = users.filter(user => {
      // Convert all values to strings before using toLowerCase
      const maSv = String(user.ma_sv || '').toLowerCase();
      const hoTen = String(user.ho_ten || '').toLowerCase();
      const idRfid = String(user.id_rfid || '').toLowerCase();
      const query = searchQuery.toLowerCase();
      
      // Apply search filter
      return maSv.includes(query) || 
             hoTen.includes(query) || 
             idRfid.includes(query);
    });
    
    // Apply sorting
    if (sortOrder === 'newest') {
      // Sort by most recently added (assuming higher ID means more recent)
      filtered = [...filtered].sort((a, b) => 
        String(b.ma_sv || '').localeCompare(String(a.ma_sv || ''))
      );
    } else if (sortOrder === 'oldest') {
      // Sort by oldest first
      filtered = [...filtered].sort((a, b) => 
        String(a.ma_sv || '').localeCompare(String(b.ma_sv || ''))
      );
    }
    
    // Update total records count
    setPagination(prev => ({
      ...prev,
      totalRecords: filtered.length
    }));
    
    // Apply pagination
    const startIndex = (pagination.currentPage - 1) * pagination.recordsPerPage;
    return filtered.slice(startIndex, startIndex + pagination.recordsPerPage);
  }, [users, searchQuery, pagination.currentPage, pagination.recordsPerPage, sortOrder]);

  // Handle page change
  const handlePageChange = (page) => {
    setPagination(prev => ({
      ...prev,
      currentPage: page
    }));
  };

  // Handle records per page change
  const handleRecordsPerPageChange = (recordsPerPage) => {
    setPagination(prev => ({
      ...prev,
      recordsPerPage,
      currentPage: 1 // Reset to first page when changing records per page
    }));
  };

  // Event Handlers
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleAddUserClick = () => {
    setSelectedUser(null);
    setNewUser({
      id: '',
      password: 'cntt123',
      name: '',
      id_rfid: '',
      total_money: 100000,
    });
    setIsModalOpen(true);
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setNewUser({
      id: user.ma_sv,
      password: 'cntt123',
      name: user.ho_ten,
      id_rfid: user.id_rfid,
      total_money: user.so_tien_hien_co,
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (userId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      setError(null);
      
      try {
        await apiService.delete(`api_users/sinhvien/${userId}/`);
      } catch (err) {
        console.error('Error deleting user:', err);
        setError('Failed to delete user. Please try again.');
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Convert total_money to number if it's a number input
    if (name === 'total_money' && !isNaN(value)) {
      setNewUser({
        ...newUser,
        [name]: parseInt(value)
      });
    } else {
      setNewUser({
        ...newUser,
        [name]: value
      });
    }
  };

  // Direct API call function - bypass complex logic
  const addUserDirectly = async () => {
    try {
      const apiData = {
        ma_sv: newUser.id,
        mat_khau: newUser.password,
        ho_ten: newUser.name,
        id_rfid: newUser.id_rfid,
        so_tien_hien_co: newUser.total_money,
      };
      
      console.log('Sending direct API request to create user:', apiData);
      
      const response = await apiService.post('api_users/sinhvien/', apiData);
      
      console.log('User created successfully:', response.data);
      return true;
    } catch (err) {
      console.error('Direct API call error:', err);
      let errorMessage = 'Failed to create user: ';
      
      if (err.response) {
        console.log('Error response:', err.response);
        errorMessage += JSON.stringify(err.response.data || {});
      } else {
        errorMessage += err.message;
      }
      
      setError(errorMessage);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError(null);
    
    console.log('Form submission initiated with data:', newUser);
    
    // Validate form data
    if (!newUser.id) {
      setError('MSSV (Student ID) is required');
      return;
    }
    
    if (!newUser.name) {
      setError('Name is required');
      return;
    }
    
    if (!newUser.id_rfid) {
      setError('RFID ID is required');
      return;
    }
    
    try {
      if (selectedUser) {
        // Update existing user
        const apiData = {
          ma_sv: newUser.id,
          ho_ten: newUser.name,
          id_rfid: newUser.id_rfid,
          so_tien_hien_co: newUser.total_money
        };
        
        console.log('Updating user with data:', apiData);
        const response = await apiService.put(`api_users/sinhvien/${selectedUser.ma_sv}/`, apiData);
        console.log('Update response:', response.data);
      } else {
        // Try the direct API call approach
        return await addUserDirectly();
      }
      
      // Refresh user list and close modal
      fetchUsers();
      setIsModalOpen(false);
      return true;
    } catch (err) {
      console.error('Error saving user:', err);
      
      let errorMessage = 'Failed to save user. ';
      
      if (err.response) {
        console.log('Error response:', err.response);
        errorMessage += 'Server response: ' + JSON.stringify(err.response.data || {});
      } else if (err.request) {
        errorMessage += 'No response received from server. Check network connection.';
      } else {
        errorMessage += err.message;
      }
      
      setError(errorMessage);
      return false;
    }
  };

  // Helper Functions
  const formatMoney = (value) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Add handler for sort order change
  const handleSortOrderChange = (e) => {
    setSortOrder(e.target.value);
    // Reset to first page when changing sort order
    setPagination(prev => ({
      ...prev,
      currentPage: 1
    }));
  };

  // Export functions
  const handleExportPDF = async () => {
    try {
      const element = document.getElementById('users-table-container');
      const opt = {
        margin: 1,
        filename: `users-list-${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' }
      };

      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error('Error exporting to PDF:', err);
      setError('Không thể xuất file PDF. Vui lòng thử lại.');
    }
  };

  const handleExportExcel = () => {
    try {
      // Prepare data for export
      const data = [
        ['MSSV', 'Họ và tên', 'ID RFID', 'Số tiền hiện có'], // Headers
        ...users.map(user => [
          user.ma_sv,
          user.ho_ten,
          user.id_rfid,
          user.so_tien_hien_co
        ])
      ];

      const ws = XLSX.utils.aoa_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Users');
      XLSX.writeFile(wb, `users-list-${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (err) {
      console.error('Error exporting to Excel:', err);
      setError('Không thể xuất file Excel. Vui lòng thử lại.');
    }
  };

  return (
    <div className="content">
      {/* Error message */}
      {error && <div className="error-message">{error}</div>}
      
      {/* Top Bar - removing search bar and user profile */}
      <div className="top-bar">
        <h1>Quản lý người dùng</h1>
      </div>

      <p>Quản lý người dùng và phân quyền trong hệ thống</p>
      
      {/* User Statistics */}
      <div className="dashboard-overview">
        <div className="card stat-card">
          <div className="stat-info">
            <h3>{users.length}</h3>
            <p>Tổng người dùng</p>
          </div>
          <div className="icon icon-primary">
            <i className="fas fa-users"></i>
          </div>
        </div>
      </div>

      {/* Users Management */}
      <div className="card">
        <div className="card-header">
          <div className="header-left">
            <h2>Danh sách người dùng</h2>
            <div className="export-buttons">
              <button 
                className="btn-export"
                onClick={handleExportExcel}
                disabled={loading || users.length === 0}
              >
                <i className="fas fa-file-excel"></i> Xuất Excel
              </button>
              <button 
                className="btn-export"
                onClick={handleExportPDF}
                disabled={loading || users.length === 0}
              >
                <i className="fas fa-file-pdf"></i> Xuất PDF
              </button>
            </div>
          </div>
          <button 
            className="btn-primary" 
            onClick={handleAddUserClick}
          >
            <i className="fas fa-plus"></i>
            Thêm người dùng
          </button>
        </div>

        {/* Search and Filters */}
        <div className="filters-container">
          <div className="filter-group search">
            <label>Tìm kiếm:</label>
            <input
              type="text"
              placeholder="MSSV, tên, hoặc ID RFID"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label>Sắp xếp:</label>
            <select
              value={sortOrder}
              onChange={handleSortOrderChange}
              className="filter-select"
            >
              <option value="newest">Mới nhất đến cũ nhất</option>
              <option value="oldest">Cũ nhất đến mới nhất</option>
            </select>
          </div>
        </div>
        
        <div className="table-responsive" id="users-table-container">
          <table>
            <thead>
              <tr>
                <th>MSSV</th>
                <th>Tên</th>
                <th>ID RFID</th>
                <th>Số tiền hiện có</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="loading">Đang tải dữ liệu...</td>
                </tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map(user => (
                  <tr key={user.ma_sv}>
                    <td>{user.ma_sv}</td>
                    <td>{user.ho_ten}</td>
                    <td>{user.id_rfid}</td>
                    <td>{formatMoney(user.so_tien_hien_co)}</td>
                    <td>
                      <div>
                        <button onClick={() => handleEditClick(user)}>
                          <i className="fas fa-edit"></i>
                        </button>
                        <button onClick={() => handleDeleteClick(user.ma_sv)}>
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="no-data">Không tìm thấy người dùng</td>
                </tr>
              )}
            </tbody>
          </table>
          
          {/* Add pagination component */}
          {pagination.totalRecords > 0 && (
            <TablePagination
              totalRecords={pagination.totalRecords}
              currentPage={pagination.currentPage}
              recordsPerPage={pagination.recordsPerPage}
              onPageChange={handlePageChange}
              onRecordsPerPageChange={handleRecordsPerPageChange}
            />
          )}
        </div>
      </div>
      
      {/* User Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{selectedUser ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}</h2>
              <button 
                className="modal-close"
                onClick={() => setIsModalOpen(false)}
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              {/* Student ID field */}
              <div className="form-group">
                <label>MSSV (Student ID) *</label>
                <input 
                  type="text" 
                  name="id" 
                  value={newUser.id} 
                  onChange={handleInputChange}
                  required
                />
              </div>
            
              <div className="form-group">
                <label>Tên người dùng *</label>
                <input 
                  type="text" 
                  name="name" 
                  value={newUser.name} 
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>ID RFID *</label>
                <input 
                  type="text" 
                  name="id_rfid" 
                  value={newUser.id_rfid} 
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="amount">Số tiền hiện có</label>
                <input 
                  type="number" 
                  name="total_money"
                  value={newUser.total_money}
                  onChange={handleInputChange}
                  min="0"
                  step="1000"
                />
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-cancel"
                  onClick={() => setIsModalOpen(false)}
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="btn-submit"
                >
                  {selectedUser ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default UserManagement;