import React, { useState, useEffect } from 'react';
import './styles/style-history.css';
import Footer from '../components/Footer';
import { API_URL, apiService } from '../services/api';
import TablePagination from '../components/TablePagination';

function HistoryPage() {
  // State for history records
  const [historyRecords, setHistoryRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for filters
  const [filters, setFilters] = useState({
    search: '',
    dateRange: {
      from: '',
      to: ''
    },
    status: '',
    sortOrder: 'newest' // Default sort order: newest to oldest
  });

  // State for pagination
  const [pagination, setPagination] = useState({
    currentPage: 1,
    recordsPerPage: 5,
    totalRecords: 0,
    totalPages: 0
  });

  // Fetch history records from API
  const fetchHistoryRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get all records first
      const response = await apiService.get('api_users/lichsuravao/');
      
      // Process the response data
      let records = Array.isArray(response.data) ? response.data : response.data.records || [];
      
      // Apply search filter if exists
      if (filters.search?.trim()) {
        const searchTerm = filters.search.trim();
        records = records.filter(record => {
          if (/^\d+$/.test(searchTerm)) {
            return record.sinh_vien?.ma_sv?.toString() === searchTerm;
          } else {
            return record.bien_so_xe && 
                   record.bien_so_xe.toLowerCase() === searchTerm.toLowerCase() &&
                   record.bien_so_xe !== "Chưa xác định";
          }
        });
      }
      
      // Apply other filters if needed
      if (filters.status) {
        records = records.filter(record => record.trang_thai === filters.status);
      }

      if (filters.dateRange.from || filters.dateRange.to) {
        records = records.filter(record => {
          const recordDate = new Date(record.thoi_gian_vao);
          let isValid = true;

          if (filters.dateRange.from) {
            const fromDate = new Date(filters.dateRange.from);
            isValid = isValid && recordDate >= fromDate;
          }

          if (filters.dateRange.to) {
            const toDate = new Date(filters.dateRange.to);
            toDate.setHours(23, 59, 59, 999);
            isValid = isValid && recordDate <= toDate;
          }

          return isValid;
        });
      }
      
      // Apply sorting
      if (filters.sortOrder === 'newest') {
        records.sort((a, b) => new Date(b.thoi_gian_vao) - new Date(a.thoi_gian_vao));
      } else if (filters.sortOrder === 'oldest') {
        records.sort((a, b) => new Date(a.thoi_gian_vao) - new Date(b.thoi_gian_vao));
      }

      // Calculate total pages and records
      const totalRecords = records.length;
      const totalPages = Math.ceil(totalRecords / pagination.recordsPerPage);
      
      // Calculate start and end indices for current page
      const startIndex = (pagination.currentPage - 1) * pagination.recordsPerPage;
      const endIndex = startIndex + pagination.recordsPerPage;
      
      // Get records for current page
      const paginatedRecords = records.slice(startIndex, endIndex);
      
      // Update state with the paginated data
      setHistoryRecords(paginatedRecords);
      setPagination(prev => ({
        ...prev,
        totalRecords,
        totalPages
      }));
      
      setLoading(false);
    } catch (err) {
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
      setLoading(false);
    }
  };

  // Initial fetch and fetch when filters or pagination change
  useEffect(() => {
    fetchHistoryRecords();
  }, [filters, pagination.currentPage, pagination.recordsPerPage]);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if (name === 'from' || name === 'to') {
      setFilters(prev => ({
        ...prev,
        dateRange: {
          ...prev.dateRange,
          [name]: value
        }
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        [name]: value
      }));
    }
    // Reset to first page when filters change
    setPagination(prev => ({
      ...prev,
      currentPage: 1
    }));
  };

  // Handle reset filters
  const handleResetFilters = () => {
    setFilters({
      search: '',
      dateRange: {
        from: '',
        to: ''
      },
      status: '',
      sortOrder: 'newest'
    });
    // Reset to first page when filters reset
    setPagination(prev => ({
      ...prev,
      currentPage: 1
    }));
  };

  // Handle page change
  const handlePageChange = (page) => {
    setPagination({
      ...pagination,
      currentPage: page
    });
  };

  // Handle records per page change
  const handleRecordsPerPageChange = (newRecordsPerPage) => {
    setPagination(prev => ({
      ...prev,
      currentPage: 1,
      recordsPerPage: parseInt(newRecordsPerPage)
    }));
  };

  // Export data functions
  const handleExportExcel = async () => {
    try {
      // Create params with all current filters for the export
      const params = {};
      
      if (filters.search) {
        params.search = filters.search;
      }
      
      if (filters.status) {
        params.status = filters.status;
      }
      
      if (filters.dateRange.from) {
        params.fromDate = filters.dateRange.from;
      }
      
      if (filters.dateRange.to) {
        params.toDate = filters.dateRange.to;
      }
      
      // Call export API with filters
      const response = await apiService.get('api/history/export/excel', { 
        params,
        responseType: 'blob' 
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `parking-history-${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error exporting to Excel:', err);
      alert('Failed to export data. Please try again later.');
    }
  };

  const handleExportPDF = async () => {
    try {
      // Create params with all current filters for the export
      const params = {};
      
      if (filters.search) {
        params.search = filters.search;
      }
      
      if (filters.status) {
        params.status = filters.status;
      }
      
      if (filters.dateRange.from) {
        params.fromDate = filters.dateRange.from;
      }
      
      if (filters.dateRange.to) {
        params.toDate = filters.dateRange.to;
      }
      
      // Call export API with filters
      const response = await apiService.get('api/history/export/pdf', { 
        params,
        responseType: 'blob' 
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `parking-history-${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error exporting to PDF:', err);
      alert('Failed to export data. Please try again later.');
    }
  };

  // Function to view full-size image
  const handleViewImage = (imageUrl) => {
    // You could implement a modal here to show the full-size image
    // For now, we'll use a placeholder alert
    window.alert('Viewing full-size image: ' + imageUrl);
  };

  return (
    <div className="content">
      {/* Top Bar - removing search bar and user profile */}
      <div className="top-bar">
        <h1>Lịch sử ra vào</h1>
      </div>

      <p className="section-description">Xem lịch sử các phương tiện ra vào bãi đỗ xe</p>

      {/* Filters */}
      <div className="card">
        <h2 style={{ marginBottom: '15px' }}>Bộ lọc</h2>
        <div className="filters-container">
          <div className="filter-group">
            <label>Tìm kiếm:</label>
            <input 
              type="text" 
              name="search" 
              placeholder="Mã SV hoặc biển số xe" 
              value={filters.search} 
              onChange={handleFilterChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  fetchHistoryRecords();
                }
              }}
            />
          </div>
          <div className="filter-group">
            <label>Trạng thái:</label>
            <select name="status" value={filters.status} onChange={handleFilterChange}>
              <option value="">Tất cả</option>
              <option value="Đang đỗ">Đang đỗ</option>
              <option value="Đã ra">Đã ra</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Từ ngày:</label>
            <input 
              type="date" 
              name="from" 
              value={filters.dateRange.from} 
              onChange={handleFilterChange}
              max={filters.dateRange.to || undefined}
            />
          </div>
          <div className="filter-group">
            <label>Đến ngày:</label>
            <input 
              type="date" 
              name="to" 
              value={filters.dateRange.to} 
              onChange={handleFilterChange}
              min={filters.dateRange.from || undefined}
            />
          </div>
          <div className="filter-group">
            <label>Sắp xếp:</label>
            <select name="sortOrder" value={filters.sortOrder} onChange={handleFilterChange}>
              <option value="newest">Mới nhất đến cũ nhất</option>
              <option value="oldest">Cũ nhất đến mới nhất</option>
            </select>
          </div>
          <button className="btn-reset" onClick={handleResetFilters}>
            <i className="fas fa-redo"></i> Đặt lại
          </button>
        </div>
      </div>

      {/* History Table */}
      <div className="card">
        <h2 style={{ marginBottom: '15px' }}>Lịch sử ra vào</h2>
        
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : error ? (
          <div className="error-message">
            <i className="fas fa-exclamation-triangle"></i>
            <p>{error}</p>
            <button onClick={fetchHistoryRecords}>Thử lại</button>
          </div>
        ) : (
          <>
            <table className="history-table">
              <thead>
                <tr>
                  <th>Mã lịch sử</th>
                  <th>Mã sinh viên</th>
                  <th>Biển số xe</th>
                  <th>Thời gian vào</th>
                  <th>Thời gian ra</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {historyRecords.length > 0 ? (
                  historyRecords.map(record => (
                    <tr key={record.ma_lich_su}>
                      <td>{record.ma_lich_su}</td>
                      <td>{record.sinh_vien.ma_sv}</td>
                      <td>{record.bien_so_xe}</td>
                      <td>{record.thoi_gian_vao}</td>
                      <td>{record.thoi_gian_ra || "—"}</td>
                      <td>
                        <span className={`status-badge ${record.trang_thai}`}>
                          {record.trang_thai}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="no-records">Không tìm thấy bản ghi nào</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {pagination.totalRecords > 0 && (
              <TablePagination
                totalRecords={pagination.totalRecords}
                currentPage={pagination.currentPage}
                recordsPerPage={pagination.recordsPerPage}
                onPageChange={handlePageChange}
                onRecordsPerPageChange={handleRecordsPerPageChange}
              />
            )}
          </>
        )}
      </div>

      {/* Export Buttons */}
      <div className="export-buttons">
        <button className="btn-export" onClick={handleExportExcel} disabled={loading || historyRecords.length === 0}>
          <i className="fas fa-file-excel"></i> Xuất Excel
        </button>
        <button className="btn-export" onClick={handleExportPDF} disabled={loading || historyRecords.length === 0}>
          <i className="fas fa-file-pdf"></i> Xuất PDF
        </button>
      </div>

      <Footer />
    </div>
  );
}

export default HistoryPage;