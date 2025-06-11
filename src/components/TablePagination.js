import React from 'react';

/**
 * Reusable pagination component for tables
 * 
 * @param {Object} props
 * @param {number} props.totalRecords - Total number of records available
 * @param {number} props.currentPage - Current page number (1-based)
 * @param {number} props.recordsPerPage - Number of records to display per page
 * @param {Function} props.onPageChange - Function to call when page changes
 * @param {Function} props.onRecordsPerPageChange - Function to call when records per page changes
 */
function TablePagination({
  totalRecords,
  currentPage,
  recordsPerPage,
  onPageChange,
  onRecordsPerPageChange
}) {
  const totalPages = Math.ceil(totalRecords / recordsPerPage);
  
  // Calculate start and end record numbers
  const startRecord = totalRecords === 0 
    ? 0 
    : ((currentPage - 1) * recordsPerPage) + 1;
    
  const endRecord = Math.min(currentPage * recordsPerPage, totalRecords);

  return (
    <div className="pagination">
      <button 
        className="pagination-btn" 
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <i className="fas fa-chevron-left"></i>
      </button>
      
      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
        <button
          key={page}
          className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}
      
      <button 
        className="pagination-btn" 
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <i className="fas fa-chevron-right"></i>
      </button>
      
      <div className="pagination-controls">
        <div className="records-per-page">
          <label>Hiển thị:</label>
          <select 
            value={recordsPerPage} 
            onChange={(e) => onRecordsPerPageChange(Number(e.target.value))}
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
          <span>dòng</span>
        </div>
        
        <span className="pagination-info">
          Hiển thị {startRecord}-{endRecord} của {totalRecords} bản ghi
        </span>
      </div>
    </div>
  );
}

export default TablePagination; 