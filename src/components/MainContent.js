import React from 'react';
import { useState, useEffect, useRef } from 'react';

import Footer from './Footer';

function MainContent() {
  // State for parking spots
  const [parkingSpots, setParkingSpots] = useState([
    { id: 'A1', status: 'available' },
    { id: 'A2', status: 'occupied' },
    { id: 'A3', status: 'occupied' },
    { id: 'A4', status: 'available' },
    { id: 'B1', status: 'occupied' },
    { id: 'B2', status: 'available' },
    { id: 'B3', status: 'occupied' },
    { id: 'B4', status: 'available' },
    { id: 'C1', status: 'available' },
    { id: 'C2', status: 'available' },
    { id: 'C3', status: 'occupied' },
    { id: 'C4', status: 'available' }
  ]);

  // Refs for the chart canvases
  const occupancyChartRef = useRef(null);
  const revenueChartRef = useRef(null);
  
  // Chart instances
  const occupancyChartInstance = useRef(null);
  const revenueChartInstance = useRef(null);

  // Function to handle spot click
  const handleSpotClick = (spotId) => {
    const updatedSpots = parkingSpots.map(spot => {
      if (spot.id === spotId) {
        // Toggle between 'available' and 'occupied'
        const newStatus = spot.status === 'available' ? 'occupied' : 'available';
        return { ...spot, status: newStatus };
      }
      return spot;
    });
    setParkingSpots(updatedSpots);
  };

  // Initialize charts
  useEffect(() => {
    // Load Chart.js from CDN
    const loadChartJs = () => {
      return new Promise((resolve) => {
        if (window.Chart) {
          resolve(window.Chart);
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js';
        script.integrity = 'sha512-ElRFoEQdI5Ht6kZvyzXhYG9NqjtkmlkfYk0wr6wHxU9JEHakS7UJZNeml5ALk+8IKlU6jDgMabC3vkumRokgJA==';
        script.crossOrigin = 'anonymous';
        script.referrerPolicy = 'no-referrer';
        
        script.onload = () => {
          resolve(window.Chart);
        };
        
        document.body.appendChild(script);
      });
    };

    const initCharts = async () => {
      const Chart = await loadChartJs();
      
      // Sample data for the occupancy chart
      const occupancyData = {
        labels: ['12AM', '2AM', '4AM', '6AM', '8AM', '10AM', '12PM', '2PM', '4PM', '6PM', '8PM', '10PM'],
        datasets: [{
          label: 'Tỷ lệ lấp đầy (%)',
          data: [30, 25, 20, 35, 65, 80, 75, 85, 80, 75, 70, 60],
          fill: true,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          tension: 0.4
        }]
      };

      // Sample data for the revenue chart
      const revenueData = {
        labels: ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'],
        datasets: [{
          label: 'Doanh thu ($)',
          data: [2100, 2400, 2200, 2800, 3100, 3500, 2900],
          backgroundColor: 'rgba(255, 159, 64, 0.2)',
          borderColor: 'rgba(255, 159, 64, 1)',
          borderWidth: 1
        }]
      };

      // Create the occupancy chart
      if (occupancyChartRef.current) {
        // Destroy existing chart if it exists
        if (occupancyChartInstance.current) {
          occupancyChartInstance.current.destroy();
        }
        
        const ctx = occupancyChartRef.current.getContext('2d');
        occupancyChartInstance.current = new Chart(ctx, {
          type: 'line',
          data: occupancyData,
          options: {
            responsive: true,
            scales: {
              y: {
                beginAtZero: true,
                max: 100,
                title: {
                  display: true,
                  text: 'Tỷ lệ lấp đầy (%)'
                }
              },
              x: {
                title: {
                  display: true,
                  text: 'Thời gian'
                }
              }
            }
          }
        });
      }

      // Create the revenue chart
      if (revenueChartRef.current) {
        // Destroy existing chart if it exists
        if (revenueChartInstance.current) {
          revenueChartInstance.current.destroy();
        }
        
        const ctx = revenueChartRef.current.getContext('2d');
        revenueChartInstance.current = new Chart(ctx, {
          type: 'bar',
          data: revenueData,
          options: {
            responsive: true,
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'Doanh thu ($)'
                }
              },
              x: {
                title: {
                  display: true,
                  text: 'Ngày trong tuần'
                }
              }
            }
          }
        });
      }
    };

    initCharts();

    // Cleanup function to destroy charts when component unmounts
    return () => {
      if (occupancyChartInstance.current) {
        occupancyChartInstance.current.destroy();
      }
      if (revenueChartInstance.current) {
        revenueChartInstance.current.destroy();
      }
    };
  }, []); // Empty dependency array means this effect runs once on mount

  return (
    <>
      {/* Main Content */}
      <div className="content">
        {/* Top Bar */}
        <div className="top-bar">
          <div className="search-bar">
            <i className="fas fa-search"></i>
            <input type="text" placeholder="Tìm kiếm..." />
          </div>
          <div className="user-profile">
            <i className="fas fa-bell"></i>
            <img src="/api/placeholder/40/40" alt="Admin" />
            <span>Admin User</span>
          </div>
        </div>

        <h1>Tổng quan bảng điều khiển</h1>
        <p style={{ marginBottom: '20px', color: 'var(--gray)' }}>Giám sát và quản lý hệ thống bãi đỗ xe thông minh</p>
        
        {/* Dashboard Statistics */}
        <div className="dashboard-overview">
          <div className="card stat-card">
            <div className="stat-info">
              <h3>76%</h3>
              <p>Tỷ lệ lấp đầy</p>
              <div className="trend up">
                <i className="fas fa-arrow-up"></i> 4.5%
              </div>
            </div>
            <div className="icon" style={{ backgroundColor: 'var(--primary)' }}>
              <i className="fas fa-car"></i>
            </div>
          </div>
          <div className="card stat-card">
            <div className="stat-info">
              <h3>42</h3>
              <p>Vị trí trống</p>
              <div className="trend down">
                <i className="fas fa-arrow-down"></i> 12.3%
              </div>
            </div>
            <div className="icon" style={{ backgroundColor: 'var(--success)' }}>
              <i className="fas fa-check-circle"></i>
            </div>
          </div>
          <div className="card stat-card">
            <div className="stat-info">
              <h3>134</h3>
              <p>Vị trí đã chiếm</p>
              <div className="trend up">
                <i className="fas fa-arrow-up"></i> 8.7%
              </div>
            </div>
            <div className="icon" style={{ backgroundColor: 'var(--danger)' }}>
              <i className="fas fa-times-circle"></i>
            </div>
          </div>
          <div className="card stat-card">
            <div className="stat-info">
              <h3>575,000 đ</h3>
              <p>Doanh thu hôm nay</p>
              <div className="trend up">
                <i className="fas fa-arrow-up"></i> 15.2%
              </div>
            </div>
            <div className="icon" style={{ backgroundColor: 'var(--warning)' }}>
              <i className="fas fa-dollar-sign"></i>
            </div>
          </div>
        </div>

        {/* Live Parking Map */}
        <div className="card">
          <h2 style={{ marginBottom: '15px' }}>Bản đồ bãi đỗ xe trực tiếp</h2>
          <div className="parking-map">
            <div className="parking-structure">
              {/* Dynamic parking spots */}
              {parkingSpots.map(spot => (
                <div 
                  key={spot.id}
                  className={`parking-spot ${spot.status}`}
                  onClick={() => handleSpotClick(spot.id)}
                >
                  {spot.id}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity and Available Spots */}
        <div className="tables-container">
          <div className="card">
            <h2 style={{ marginBottom: '15px' }}>Hoạt động gần đây</h2>
            <table>
              <thead>
                <tr>
                  <th>Thời gian</th>
                  <th>Phương tiện</th>
                  <th>Vị trí</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>12:45</td>
                  <td>BMW X5 (XYZ-789)</td>
                  <td>B4</td>
                  <td>Đỗ xe</td>
                </tr>
                <tr>
                  <td>12:32</td>
                  <td>Honda Civic (DEF-456)</td>
                  <td>A1</td>
                  <td>Đỗ xe</td>
                </tr>
                <tr>
                  <td>12:15</td>
                  <td>Ford Focus (GHI-123)</td>
                  <td>C3</td>
                  <td>Đỗ xe</td>
                </tr>
                <tr>
                  <td>11:50</td>
                  <td>Tesla Model 3 (JKL-789)</td>
                  <td>A4</td>
                  <td>Đỗ xe</td>
                </tr>
                <tr>
                  <td>11:45</td>
                  <td>Nissan Altima (MNO-456)</td>
                  <td>B2</td>
                  <td>Rời đi</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="card">
            <h2 style={{ marginBottom: '15px' }}>Vị trí trống theo khu vực</h2>
            <table>
              <thead>
                <tr>
                  <th>Khu vực</th>
                  <th>Tổng</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Khu A</td>
                  <td>50</td>
                  <td><span className="status available">24%</span></td>
                </tr>
                <tr>
                  <td>Khu B</td>
                  <td>40</td>
                  <td><span className="status available">20%</span></td>
                </tr>
                <tr>
                  <td>Khu C</td>
                  <td>35</td>
                  <td><span className="status occupied">5.7%</span></td>
                </tr>
                <tr>
                  <td>Khu D</td>
                  <td>30</td>
                  <td><span className="status available">50%</span></td>
                </tr>
                <tr>
                  <td>Khu E</td>
                  <td>25</td>
                  <td><span className="status available">20%</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Charts */}
        <div className="chart-container">
          <div className="card chart">
            <h2 style={{ marginBottom: '15px' }}>Xu hướng lấp đầy (24h)</h2>
            <canvas ref={occupancyChartRef} width="350" height="250"></canvas>
          </div>
          <div className="card chart">
            <h2 style={{ marginBottom: '15px' }}>Doanh thu (Theo tuần)</h2>
            <canvas ref={revenueChartRef} width="350" height="250"></canvas>
          </div>
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </>
  );
}

export default MainContent;