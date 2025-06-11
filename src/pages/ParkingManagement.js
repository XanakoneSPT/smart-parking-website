import React, { useState, useEffect } from 'react';
import './styles/style-parking.css';
import Footer from '../components/Footer';
import { apiService } from '../services/api';
import { API_URL } from '../services/api';

function ParkingManagement() {
  // STATE MANAGEMENT
  // -----------------
  
  // Parking spots state
  const [parkingSpots, setParkingSpots] = useState([]);
  
  // License plate records state
  const [plateRecords, setPlateRecords] = useState([]);
  
    // Alerts state
  const [alerts, setAlerts] = useState([]);
  
  // Parking rules state
  const [parkingRules, setParkingRules] = useState([]);
  
  // Form states
  const [manualEntry, setManualEntry] = useState({
    plateNumber: '',
    vehicleType: 'car',
    spotId: ''
  });

  
  // Simulate camera feed refresh
  useEffect(() => {
    const timer = setInterval(() => {
      // Visual indicator that the camera feed is "live"
      const cameraFeed = document.getElementById('camera-feed');
      if (cameraFeed) {
        cameraFeed.classList.add('refreshing');
        setTimeout(() => {
          cameraFeed.classList.remove('refreshing');
        }, 300);
      }
    }, 5000);
    
    return () => clearInterval(timer);
  }, []);
  
  // EVENT HANDLERS
  // ---------------
  
  // Handle form input changes
  const handleEntryChange = (e) => {
    const { name, value } = e.target;
    setManualEntry(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle form submission
  const handleEntrySubmit = async (e) => {
    e.preventDefault();
    
    try {
      await apiService.post('parking/entry/', manualEntry);
      
      // Refetch the data to get the updated state
      const parkingResponse = await apiService.get('parking/');
      setParkingSpots(parkingResponse.data);
      
      const recordsResponse = await apiService.get('plate-records/');
      setPlateRecords(recordsResponse.data);
      
      // Reset form
      setManualEntry({
        plateNumber: '',
        vehicleType: 'car',
        spotId: ''
      });
    } catch (error) {
      console.error('Error submitting entry:', error);
    }
  };
  
  // Handle parking spot status change
  const handleSpotClick = async (spotId) => {
    try {
      await apiService.put(`parking/${spotId}/toggle/`);
      
      // Refetch parking spots
      const response = await apiService.get('parking/');
      setParkingSpots(response.data);
    } catch (error) {
      console.error('Error toggling spot status:', error);
    }
  };
  
    // Handle adding a new parking rule
  const handleAddRule = () => {
    const newRule = {
      id: parkingRules.length + 1,
      zone: '',
      maximumHours: 2,
      hourlyRate: 1,
      status: 'inactive'
    };
    setParkingRules([...parkingRules, newRule]);
  };
  
  // Handle toggling rule status
  const toggleRuleStatus = (id) => {
    const updatedRules = parkingRules.map(rule => {
      if (rule.id === id) {
        return {
          ...rule,
          status: rule.status === 'active' ? 'inactive' : 'active'
        };
      }
      return rule;
    });
    setParkingRules(updatedRules);
  };

  // RENDER
  // -------
  return (
    <div className="content">
      {/* Top Bar - removing search bar and user profile */}
      <div className="top-bar">
        <h1>Quản lý bãi đỗ xe</h1>
      </div>

      <p style={{ marginBottom: '20px', color: 'var(--gray)' }}>Giám sát và quản lý hệ thống bãi đỗ xe thông minh</p>
      
      {/* Camera and Parking Map Section */}
      <div className="camera-parking-container">
        {/* Camera Feeds */}
        <div className="card camera-section">
          <div className="camera-controls">
            <h2>Camera trực tiếp</h2>
          </div>
          
          <div id="camera-feed" className="camera-feed">
            {/* Occupancy Camera */}
            <div className="camera-feed-content occupancy-camera">
              <div className="occupancy-detection-container">
                <div className="camera-overlay">
                  {/* Overlay spots code */}
                </div>
                <img src={`${API_URL}video_feed`} alt="Occupancy Camera Feed" />
                {/* <div className="occupancy-detection-status">
                  <span className="detection-indicator">Theo dõi bãi đỗ...</span>
                </div> */}
              </div>
              <div className="camera-info">
                <span className="camera-label">Camera phát hiện chỗ trống</span>
                <span className="camera-status">Trực tiếp</span>
              </div>
            </div>
            
            {/* Only show separator in mobile view (CSS handles this) */}
            <div className="camera-separator">
              <span>Camera Streams</span>
            </div>
            
            {/* License Plate Camera */}
            <div className="camera-feed-content plate-camera">
              <div className="plate-detection-container">
                <img src={`${API_URL}video_feed_2`} alt="License Plate Camera Feed" />
                {/* <div className="plate-detection-status">
                  <span className="detection-indicator">Đang nhận diện...</span>
                </div> */}
              </div>
              <div className="camera-info">
                <span className="camera-label">Camera nhận diện biển số</span>
                <span className="camera-status">Trực tiếp</span>
              </div>
            </div>
          </div> 
        </div>
      </div>

      {/* License Plate Recognition and Manual Entry Section */}
      <div className="tables-container">

        {/* Manual Entry Form */}
        {/* <div className="card">
          <h2>Nhập thủ công</h2>
          <form className="manual-entry-form" onSubmit={handleEntrySubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="plateNumber">Biển số xe:</label>
                <input 
                  type="text" 
                  id="plateNumber" 
                  name="plateNumber" 
                  placeholder="Ví dụ: 29A-12345"
                  value={manualEntry.plateNumber}
                  onChange={handleEntryChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="vehicleType">Loại xe:</label>
                <select 
                  id="vehicleType" 
                  name="vehicleType"
                  value={manualEntry.vehicleType}
                  onChange={handleEntryChange}
                >
                  <option value="car">Xe ô tô</option>
                  <option value="motorcycle">Xe máy</option>
                  <option value="bikecycle">Xe đạp</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="spotId">Vị trí đỗ:</label>
                <select 
                  id="spotId" 
                  name="spotId"
                  value={manualEntry.spotId}
                  onChange={handleEntryChange}
                  required
                >
                  <option value="">-- Chọn vị trí --</option>
                  {parkingSpots
                    .filter(spot => spot.status === 'available')
                    .map(spot => (
                      <option key={spot.id} value={spot.id}>{spot.id}</option>
                    ))}
                </select>
              </div>
              <div className="form-group">
                <button type="submit" className="submit-button">
                  <i className="fas fa-plus"></i> Thêm xe
                </button>
              </div>
            </div>
          </form>
        </div> */}
      </div>
      <Footer />
    </div>
  );
}

export default ParkingManagement;