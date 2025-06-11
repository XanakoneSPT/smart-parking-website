import React, { useState, useEffect, useRef } from 'react';
import './styles/style-report.css';
import Footer from '../components/Footer';
import { API_URL, apiService } from '../services/api';
import TablePagination from '../components/TablePagination';
import html2pdf from 'html2pdf.js';
import * as XLSX from 'xlsx';
import { Chart as ChartJS } from 'chart.js/auto';

function Reports() {
  // Add refs for chart instances
  const revenueChartRef = useRef(null);
  const parkingChartRef = useRef(null);

  // State for various metrics
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalRevenue: 0,
    totalTransactions: 0,
    activeParking: 0
  });

  // State for charts
  const [revenueData, setRevenueData] = useState({
    labels: [],
    data: []
  });

  const [parkingData, setParkingData] = useState({
    labels: [],
    data: []
  });

  // State for date range filter
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  // State for loading and error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to check if a date is within the selected range
  const isDateInRange = (dateStr) => {
    const date = new Date(dateStr);
    const start = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return date >= start && date <= end;
  };

  // Function to fetch metrics
  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch total users
      const usersResponse = await apiService.get('api_users/sinhvien/');
      const totalUsers = usersResponse.data.length;

      // Fetch payment data
      const paymentsResponse = await apiService.get('api_users/lichsunaptien/');
      // Filter payments by date range
      const filteredPayments = paymentsResponse.data.filter(payment => 
        isDateInRange(payment.thoi_gian_nap)
      );
      const totalRevenue = filteredPayments.reduce((sum, payment) => sum + payment.so_tien, 0);
      const totalTransactions = filteredPayments.length;

      // Fetch active parking sessions
      const parkingResponse = await apiService.get('api_users/lichsuravao/');
      // Filter parking sessions by date range
      const filteredParkingSessions = parkingResponse.data.filter(session => 
        isDateInRange(session.thoi_gian_vao)
      );
      const activeParking = filteredParkingSessions.filter(session => !session.thoi_gian_ra).length;

      setMetrics({
        totalUsers,
        totalRevenue,
        totalTransactions,
        activeParking
      });

      // Process data for revenue chart with date filtering
      const revenueByDate = filteredPayments.reduce((acc, payment) => {
        const date = new Date(payment.thoi_gian_nap).toLocaleDateString();
        acc[date] = (acc[date] || 0) + payment.so_tien;
        return acc;
      }, {});

      setRevenueData({
        labels: Object.keys(revenueByDate),
        data: Object.values(revenueByDate)
      });

      // Process data for parking usage chart with date filtering
      const parkingByDate = filteredParkingSessions.reduce((acc, session) => {
        const date = new Date(session.thoi_gian_vao).toLocaleDateString();
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

      setParkingData({
        labels: Object.keys(parkingByDate),
        data: Object.values(parkingByDate)
      });

      setLoading(false);
    } catch (err) {
      console.error('Error fetching metrics:', err);
      setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
      setLoading(false);
    }
  };

  // Initial fetch and periodic refresh
  useEffect(() => {
    fetchMetrics();
  }, [dateRange]);

  // Initialize charts
  useEffect(() => {
    if (!loading && !error) {
      // Destroy existing charts if they exist
      if (revenueChartRef.current) {
        revenueChartRef.current.destroy();
      }
      if (parkingChartRef.current) {
        parkingChartRef.current.destroy();
      }

      // Revenue Chart
      const revenueCtx = document.getElementById('revenueChart');
      if (revenueCtx) {
        revenueChartRef.current = new ChartJS(revenueCtx, {
          type: 'line',
          data: {
            labels: revenueData.labels,
            datasets: [{
              label: 'Doanh Thu Theo Ngày',
              data: revenueData.data,
              borderColor: '#4CAF50',
              tension: 0.1
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false
          }
        });
      }

      // Parking Usage Chart
      const parkingCtx = document.getElementById('parkingChart');
      if (parkingCtx) {
        parkingChartRef.current = new ChartJS(parkingCtx, {
          type: 'bar',
          data: {
            labels: parkingData.labels,
            datasets: [{
              label: 'Lượt Gửi Xe Theo Ngày',
              data: parkingData.data,
              backgroundColor: '#2196F3'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false
          }
        });
      }
    }

    // Cleanup function to destroy charts when component unmounts
    return () => {
      if (revenueChartRef.current) {
        revenueChartRef.current.destroy();
      }
      if (parkingChartRef.current) {
        parkingChartRef.current.destroy();
      }
    };
  }, [loading, error, revenueData, parkingData]);

  // Handle date range change
  const handleDateRangeChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Export functions
  const exportToPDF = async () => {
    const element = document.getElementById('report-content');
    const opt = {
      margin: 1,
      filename: `parking-report-${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    try {
      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error('Error exporting to PDF:', err);
      alert('Không thể xuất file PDF. Vui lòng thử lại.');
    }
  };

  const exportToExcel = async () => {
    try {
      const data = [
        ['Chỉ số', 'Giá trị'],
        ['Tổng người dùng', metrics.totalUsers],
        ['Tổng doanh thu', metrics.totalRevenue],
        ['Tổng giao dịch', metrics.totalTransactions],
        ['Đang gửi xe', metrics.activeParking],
        [],
        ['Doanh Thu Theo Ngày'],
        ['Ngày', 'Số tiền'],
        ...revenueData.labels.map((date, i) => [date, revenueData.data[i]]),
        [],
        ['Lượt Gửi Xe Theo Ngày'],
        ['Ngày', 'Số lượt'],
        ...parkingData.labels.map((date, i) => [date, parkingData.data[i]])
      ];

      const ws = XLSX.utils.aoa_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Report');
      XLSX.writeFile(wb, `parking-report-${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (err) {
      console.error('Error exporting to Excel:', err);
      alert('Không thể xuất file Excel. Vui lòng thử lại.');
    }
  };

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h1>Thống Kê & Báo Cáo</h1>
        <div className="reports-actions">
          <button onClick={exportToPDF} className="btn-export">
            <i className="fas fa-file-pdf"></i> Xuất PDF
          </button>
          <button onClick={exportToExcel} className="btn-export">
            <i className="fas fa-file-excel"></i> Xuất Excel
          </button>
        </div>
      </div>

      <div className="date-filter">
        <div className="filter-group">
          <label>Từ ngày:</label>
          <input
            type="date"
            name="startDate"
            value={dateRange.startDate}
            onChange={handleDateRangeChange}
          />
        </div>
        <div className="filter-group">
          <label>Đến ngày:</label>
          <input
            type="date"
            name="endDate"
            value={dateRange.endDate}
            onChange={handleDateRangeChange}
          />
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <i className="fas fa-circle-notch fa-spin"></i>
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : error ? (
        <div className="error-state">
          <i className="fas fa-exclamation-triangle"></i>
          <p>{error}</p>
        </div>
      ) : (
        <div id="report-content" className="report-content">
          {/* Key Metrics */}
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-icon">
                <i className="fas fa-users"></i>
              </div>
              <div className="metric-info">
                <h3>{metrics.totalUsers}</h3>
                <p>Tổng Người Dùng</p>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon">
                <i className="fas fa-money-bill-wave"></i>
              </div>
              <div className="metric-info">
                <h3>{metrics.totalRevenue.toLocaleString('vi-VN')} đ</h3>
                <p>Tổng Doanh Thu</p>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon">
                <i className="fas fa-exchange-alt"></i>
              </div>
              <div className="metric-info">
                <h3>{metrics.totalTransactions}</h3>
                <p>Tổng Giao Dịch</p>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon">
                <i className="fas fa-car"></i>
              </div>
              <div className="metric-info">
                <h3>{metrics.activeParking}</h3>
                <p>Đang Đỗ Xe</p>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="charts-grid">
            <div className="chart-card">
              <h2>Biểu Đồ Doanh Thu</h2>
              <div className="chart-container">
                <canvas id="revenueChart"></canvas>
              </div>
            </div>
            <div className="chart-card">
              <h2>Biểu Đồ Lượt Gửi Xe</h2>
              <div className="chart-container">
                <canvas id="parkingChart"></canvas>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default Reports;