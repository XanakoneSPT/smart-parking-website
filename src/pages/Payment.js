import React, { useState, useEffect } from 'react';
import Footer from '../components/Footer';
import './styles/style-payment.css';
import { API_URL, apiService } from '../services/api';
import TablePagination from '../components/TablePagination';

function Payment() {
  // State for top-up history
  const [allTopUpHistory, setAllTopUpHistory] = useState([]); // Store all unfiltered data
  const [topUpHistory, setTopUpHistory] = useState([]);
  const [loadingTopUp, setLoadingTopUp] = useState(true);
  const [errorTopUp, setErrorTopUp] = useState(null);

  // State for recent transactions
  const [allRecentTransactions, setAllRecentTransactions] = useState([]); // Store all unfiltered data
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [errorTransactions, setErrorTransactions] = useState(null);

  // Pagination states
  const [currentPageTopUp, setCurrentPageTopUp] = useState(1);
  const [rowsPerPageTopUp, setRowsPerPageTopUp] = useState(10);
  const [currentPageTransactions, setCurrentPageTransactions] = useState(1);
  const [rowsPerPageTransactions, setRowsPerPageTransactions] = useState(10);

  // State for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');

  // State for receipt modal
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  
  // State for invoice generation modal
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoiceDetails, setInvoiceDetails] = useState({
    MSSV: '',
    licenseNumber: '',
    email: '',
    amount: '',
    parkingSpot: ''
  });

  // Handle reset filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setSortOrder('newest');
  };

  // Apply filters to data
  const applyFilters = (data) => {
    let filteredData = [...data];

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filteredData = filteredData.filter(item => {
        const matchesMaSV = item.sinh_vien?.ma_sv?.toString().includes(searchLower);
        const matchesHoTen = item.sinh_vien?.ho_ten?.toLowerCase().includes(searchLower);
        return matchesMaSV || matchesHoTen;
      });
    }

    // Apply date range filter
    if (startDate) {
      const startDateTime = new Date(startDate);
      startDateTime.setHours(0, 0, 0, 0);
      filteredData = filteredData.filter(item => {
        const itemDate = new Date(item.thoi_gian_nap || item.thoi_gian);
        return itemDate >= startDateTime;
      });
    }

    if (endDate) {
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);
      filteredData = filteredData.filter(item => {
        const itemDate = new Date(item.thoi_gian_nap || item.thoi_gian);
        return itemDate <= endDateTime;
      });
    }

    // Apply sorting
    filteredData.sort((a, b) => {
      const dateA = new Date(a.thoi_gian_nap || a.thoi_gian);
      const dateB = new Date(b.thoi_gian_nap || b.thoi_gian);
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return filteredData;
  };

  // Update filtered data whenever filters change
  useEffect(() => {
    if (allTopUpHistory.length > 0) {
      const filteredTopUp = applyFilters(allTopUpHistory);
      setTopUpHistory(filteredTopUp);
      setCurrentPageTopUp(1); // Reset to first page when filters change
    }
    
    if (allRecentTransactions.length > 0) {
      const filteredTransactions = applyFilters(allRecentTransactions);
      setRecentTransactions(filteredTransactions);
      setCurrentPageTransactions(1); // Reset to first page when filters change
    }
  }, [searchTerm, startDate, endDate, sortOrder]);

  // Fetch top-up history from API
  const fetchTopUpHistory = async () => {
    setLoadingTopUp(true);
    setErrorTopUp(null);
    
    try {
      const response = await apiService.get('api_users/lichsunaptien/');
      console.log('=== Top-up History Data Structure ===');
      console.log('Total records:', response.data.length);
      console.log('Full data:', JSON.stringify(response.data, null, 2));
      
      let records = [];
      
      if (Array.isArray(response.data)) {
        records = response.data;
      } else if (response.data.records) {
        records = response.data.records;
      } else {
        records = response.data;
      }

      setAllTopUpHistory(records);
      console.log('=== Sample Top-up Record ===');
      if (records.length > 0) {
        console.log('Record structure:', JSON.stringify(records[0], null, 2));
        console.log('sinh_vien data:', records[0].sinh_vien);
      }
      setTopUpHistory(records);
      setLoadingTopUp(false);
    } catch (err) {
      console.error('Error fetching top-up history:', err);
      setErrorTopUp(err.message || 'An error occurred while loading top-up history');
      setLoadingTopUp(false);
    }
  };

  // Fetch recent transactions from API
  const fetchRecentTransactions = async () => {
    setLoadingTransactions(true);
    setErrorTransactions(null);
    
    try {
      const response = await apiService.get('api_users/lichsuthanhtoan/');
      console.log('=== Recent Transactions Data Structure ===');
      console.log('Total transactions:', response.data.length);
      console.log('Full data:', JSON.stringify(response.data, null, 2));
      
      let transactions = [];
      
      if (Array.isArray(response.data)) {
        transactions = response.data;
      } else if (response.data.records) {
        transactions = response.data.records;
      } else {
        transactions = response.data;
      }

      setAllRecentTransactions(transactions);
      console.log('=== Sample Transaction Record ===');
      if (transactions.length > 0) {
        console.log('Transaction structure:', JSON.stringify(transactions[0], null, 2));
        console.log('sinh_vien data:', transactions[0].sinh_vien);
      }
      setRecentTransactions(transactions);
      setLoadingTransactions(false);
    } catch (err) {
      console.error('Error fetching recent transactions:', err);
      setErrorTransactions(err.message || 'An error occurred while loading recent transactions');
      setLoadingTransactions(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchTopUpHistory();
    fetchRecentTransactions();
  }, []);

  // Calculate current page data
  const indexOfLastTopUp = currentPageTopUp * rowsPerPageTopUp;
  const indexOfFirstTopUp = indexOfLastTopUp - rowsPerPageTopUp;
  const currentTopUps = topUpHistory.slice(indexOfFirstTopUp, indexOfLastTopUp);

  const indexOfLastTransaction = currentPageTransactions * rowsPerPageTransactions;
  const indexOfFirstTransaction = indexOfLastTransaction - rowsPerPageTransactions;
  const currentTransactions = recentTransactions.slice(indexOfFirstTransaction, indexOfLastTransaction);

  // Handle page changes
  const handlePageChangeTopUp = (pageNumber) => {
    setCurrentPageTopUp(pageNumber);
  };

  const handlePageChangeTransactions = (pageNumber) => {
    setCurrentPageTransactions(pageNumber);
  };

  // Handle rows per page changes
  const handleRowsPerPageChangeTopUp = (newRowsPerPage) => {
    setRowsPerPageTopUp(newRowsPerPage);
    setCurrentPageTopUp(1);
  };

  const handleRowsPerPageChangeTransactions = (newRowsPerPage) => {
    setRowsPerPageTransactions(newRowsPerPage);
    setCurrentPageTransactions(1);
  };

  return (
    <div className="content">
      <div className="top-bar">
        <h1>Thanh toán</h1>
      </div>

      <p className="page-description">Quản lý giao dịch và thanh toán trong hệ thống</p>

      {/* Payment Statistics */}
      <div className="dashboard-overview">
        <div className="card stat-card">
          <div className="stat-info">
            <h3>{topUpHistory.reduce((sum, payment) => sum + payment.so_tien, 0).toLocaleString('vi-VN')} đ</h3>
            <p>Tổng doanh thu</p>
          </div>
          <div className="icon primary-bg">
            <i className="fas fa-money-bill-wave"></i>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-info">
            <h3>{topUpHistory.length}</h3>
            <p>Giao dịch</p>
          </div>
          <div className="icon success-bg">
            <i className="fas fa-receipt"></i>
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="card filter-card">
        <div className="filter-header">
          <h2>Bộ lọc</h2>
        </div>
        
        <div className="filter-controls">
          <div className="filter-row">
            <div className="filter-group search">
              <label>Tìm kiếm:</label>
              <input
                type="text"
                placeholder="Mã SV hoặc biển số xe"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  // Filtering will happen automatically through useEffect
                }}
                className="filter-input"
              />
            </div>

            <div className="filter-group">
              <label>Từ ngày:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="filter-input"
                placeholder="dd/mm/yyyy"
              />
            </div>

            <div className="filter-group">
              <label>Đến ngày:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="filter-input"
                placeholder="dd/mm/yyyy"
              />
            </div>

            <div className="filter-group">
              <label>Sắp xếp:</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="filter-select"
              >
                <option value="newest">Mới nhất đến cũ nhất</option>
                <option value="oldest">Cũ nhất đến mới nhất</option>
              </select>
            </div>

            <div className="filter-group reset-button">
              <label>&nbsp;</label>
              <button
                onClick={handleResetFilters}
                className="btn-secondary"
              >
                Đặt lại
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Payment History */}
      <div className="card">
        <h2>Lịch sử nạp tiền</h2>
        <div className="payment-history">
          {loadingTopUp ? (
            <div className="loading">
              <i className="fas fa-circle-notch fa-spin"></i>
              <p>Đang tải dữ liệu thanh toán...</p>
            </div>
          ) : errorTopUp ? (
            <div className="error-message">
              <p>{errorTopUp}</p>
            </div>
          ) : topUpHistory.length === 0 ? (
            <div className="no-data">
              <i className="fas fa-search"></i>
              <p>Không tìm thấy giao dịch nào phù hợp với bộ lọc</p>
            </div>
          ) : (
            <>
              <table>
                <thead>
                  <tr>
                    <th>Mã nạp tiền</th>
                    <th>MSSV</th>
                    <th>Họ tên</th>
                    <th>Phương thức</th>
                    <th>Thời gian</th>
                    <th>Số tiền</th>
                    <th>Mã giao dịch</th>
                    <th>Ghi chú</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {currentTopUps.map(payment => (
                    <tr key={payment.ma_nap_tien}>
                      <td>{payment.ma_nap_tien}</td>
                      <td>{payment.sinh_vien?.ma_sv}</td>
                      <td>{payment.sinh_vien?.ho_ten}</td>
                      <td>{payment.phuong_thuc}</td>
                      <td>{new Date(payment.thoi_gian_nap).toLocaleString('vi-VN')}</td>
                      <td>{payment.so_tien?.toLocaleString('vi-VN')} đ</td>
                      <td>{payment.ma_giao_dich || '-'}</td>
                      <td>{payment.ghi_chu || '-'}</td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            onClick={() => {
                              setSelectedPayment(payment);
                              setIsReceiptModalOpen(true);
                            }}
                            title="Xem hóa đơn"
                            className="btn-primary action-btn"
                          >
                            <i className="fas fa-file-invoice"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <TablePagination
                currentPage={currentPageTopUp}
                totalRecords={topUpHistory.length}
                recordsPerPage={rowsPerPageTopUp}
                onPageChange={handlePageChangeTopUp}
                onRecordsPerPageChange={handleRowsPerPageChangeTopUp}
              />
            </>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card recent-transactions-card">
        <h2>Giao dịch gần đây nhất</h2>
        <div className="recent-transactions">
          {loadingTransactions ? (
            <div className="loading">
              <i className="fas fa-circle-notch fa-spin"></i>
              <p>Đang tải dữ liệu giao dịch...</p>
            </div>
          ) : errorTransactions ? (
            <div className="error-message">
              <p>{errorTransactions}</p>
            </div>
          ) : recentTransactions.length === 0 ? (
            <div className="no-data">
              <p>Chưa có giao dịch nào</p>
            </div>
          ) : (
            <>
              <table>
                <thead>
                  <tr>
                    <th>Mã thanh toán</th>
                    <th>MSSV</th>
                    <th>Họ tên</th>
                    <th>Thời gian</th>
                    <th>Số tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {currentTransactions.map(transaction => (
                    <tr key={transaction.ma_thanh_toan}>
                      <td>{transaction.ma_thanh_toan}</td>
                      <td>{transaction.sinh_vien?.ma_sv}</td>
                      <td>{transaction.sinh_vien?.ho_ten}</td>
                      <td>{new Date(transaction.thoi_gian).toLocaleString('vi-VN')}</td>
                      <td>{transaction.so_tien?.toLocaleString('vi-VN')} đ</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <TablePagination
                currentPage={currentPageTransactions}
                totalRecords={recentTransactions.length}
                recordsPerPage={rowsPerPageTransactions}
                onPageChange={handlePageChangeTransactions}
                onRecordsPerPageChange={handleRowsPerPageChangeTransactions}
              />
            </>
          )}
        </div>
      </div>

      {/* Receipt Modal */}
      {isReceiptModalOpen && selectedPayment && (
        <div className="modal-overlay">
          <div className="modal receipt-modal">
            <div className="modal-header">
              <h2>Hóa đơn thanh toán</h2>
              <button 
                onClick={() => setIsReceiptModalOpen(false)}
                className="close-btn"
              >
                &times;
              </button>
            </div>
            
            <div className="receipt-header">
              <h3>Smart Parking System</h3>
              <p>Trường Đại Học Bách Khoa</p>
            </div>
            
            <div className="receipt-details">
              <div className="receipt-row">
                <strong>Mã giao dịch:</strong>
                <span>{selectedPayment.ma_nap_tien}</span>
              </div>
              <div className="receipt-row">
                <strong>Ngày giờ:</strong>
                <span>{new Date(selectedPayment.thoi_gian_nap).toLocaleString('vi-VN')}</span>
              </div>
            </div>
            
            <div className="receipt-customer-info">
              <div className="receipt-row">
                <span>MSSV:</span>
                <span>{selectedPayment.sinh_vien?.ma_sv}</span>
              </div>
              <div className="receipt-row">
                <span>Họ tên:</span>
                <span>{selectedPayment.sinh_vien?.ho_ten}</span>
              </div>
              <div className="receipt-row">
                <span>Phương thức:</span>
                <span>{selectedPayment.phuong_thuc}</span>
              </div>
              <div className="receipt-row">
                <span>Số tiền:</span>
                <span>{selectedPayment.so_tien?.toLocaleString('vi-VN')} đ</span>
              </div>
              {selectedPayment.ma_giao_dich && (
                <div className="receipt-row">
                  <span>Mã giao dịch:</span>
                  <span>{selectedPayment.ma_giao_dich}</span>
                </div>
              )}
              {selectedPayment.ghi_chu && (
                <div className="receipt-row">
                  <span>Ghi chú:</span>
                  <span>{selectedPayment.ghi_chu}</span>
                </div>
              )}
            </div>
            
            <div className="receipt-total">
              <strong>Tổng cộng: </strong>
              <span className="total-amount">
                {selectedPayment.so_tien?.toLocaleString('vi-VN')} đ
              </span>
            </div>
            
            <div className="modal-footer">
              <button 
                onClick={() => setIsReceiptModalOpen(false)}
                className="btn-primary"
              >
                Đóng
              </button>
              <button 
                onClick={() => {
                  window.print();
                }}
                className="btn-secondary"
              >
                <i className="fas fa-print"></i> In hóa đơn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {isInvoiceModalOpen && (
        <div className="modal-overlay">
          <div className="modal invoice-modal">
            <div className="modal-header">
              <h2>Tạo hóa đơn mới</h2>
              <button 
                onClick={() => setIsInvoiceModalOpen(false)}
                className="close-btn"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              // Handle form submission
              setIsInvoiceModalOpen(false);
            }}>
              <div className="form-group">
                <label htmlFor="MSSV">MSSV:</label>
                <input 
                  type="text" 
                  id="MSSV" 
                  name="MSSV"
                  value={invoiceDetails.MSSV}
                  onChange={(e) => setInvoiceDetails({
                    ...invoiceDetails,
                    MSSV: e.target.value
                  })}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="amount">Số tiền (VND):</label>
                <input 
                  type="number" 
                  id="amount" 
                  name="amount"
                  value={invoiceDetails.amount}
                  onChange={(e) => setInvoiceDetails({
                    ...invoiceDetails,
                    amount: e.target.value
                  })}
                  min="1000"
                  step="1000"
                  required
                />
              </div>
              
              <div className="modal-footer">
                <button 
                  type="button"
                  onClick={() => setIsInvoiceModalOpen(false)}
                  className="btn-secondary"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  className="btn-primary"
                >
                  Tạo hóa đơn
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default Payment;