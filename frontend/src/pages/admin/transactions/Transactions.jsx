import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Transactions.css';
import ButtonLink from '../../../components/common/ButtonLink';

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [summary, setSummary] = useState({ total_amount_completed: 0, total_transactions: 0 });
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const totalAdminFee = transactions.reduce((total, t) => total + (t.admin_fee || 0), 0);

  /* Fetch transactions and summary */
  useEffect(() => {
    fetchTransactions();
    fetchSummary();
  }, [page, limit, search, sortOrder, startDate, endDate]);

  /* Fetch transactions */
  /* Returns paginated list of transactions based on filters */
  async function fetchTransactions() {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', limit);
    if (search) params.append('search', search);
    if (sortOrder) params.append('sort', sortOrder);
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end _date', endDate);

    try {
      /* fetch transactions from the backend */
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  }

  /* Fetch summary */
  /* Returns summary of transactions based on filters */
  async function fetchSummary() {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);

    try {
      /* fetch summary from the backend */
    } catch (error) {
      console.error("Error fetching summary:", error);
    }
  }

  /* Apply date range filters */
  /* Sets startDate and endDate based on predefined ranges */
  function applyDateRange(range) {
    const now = new Date();
    let start = '';
    let end = '';
    switch (range) {
      case '7':
        start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
        end = now.toISOString().slice(0, 10);
        break;
      case '30':
        start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
        end = now.toISOString().slice(0, 10);
        break;
      case 'month':
        start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
        end = now.toISOString().slice(0, 10);
        break;
      case 'year':
        start = new Date(now.getFullYear(), 0, 1).toISOString().slice(0, 10);
        end = now.toISOString().slice(0, 10);
        break;
      default:
        start = '';
        end = '';
    }
    setStartDate(start);
    setEndDate(end);
  }

  /* Downloads the current transactions list as a csv file */
  function downloadCSV() {
    const csvRows = [];
    const headers = ['Request ID', 'User', 'Amount', 'Payment Date'];
    /* Add the headers row to the csv row array */
    /* Loop thhrough transactions and add each as a row */
    /* Download the csv file */
  }

  /* Downloads the current transactions list as a pdf file */
  function downloadPDF() {
    window.print();
  }

  /* Downloads invoice for a specific transaction */
  function downloadInvoice() {
    
  }

  return (
    <div className="transactions-page">
      {/* Page Header with Summary and Controls */}
      <div className="page-header">
        <div className="summary-section">
          <div className="summary-card">
            <span className="summary-label">Total Amount (Paid)</span>
            <span className="summary-value">₱{(summary?.total_amount_completed || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="summary-card">
            <span className="summary-label">Total Transactions</span>
            <span className="summary-value">{summary?.total_transactions || 0}</span>
          </div>
          <div className="summary-card">
            <span className="summary-label">Total Admin Fee</span>
            <span className="summary-value">{totalAdminFee}</span>
          </div>
          <div className="summary-card">
            <span className="summary-label">Unpaid Requests</span>
            <span className="summary-value">{summary?.total_unpaid || 0}</span>
          </div>
        </div>
        <h2>Transactions</h2>
        {/* Controls: Search, Sort, Date Filters, Export Buttons */}
        <div className="controls">
          <input className="search-input" placeholder="Search Transaction ID, User, Request ID" value={search} onChange={(e) => setSearch(e.target.value)} />
          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
            <option value="desc">Newest to Oldest</option>
            <option value="asc">Oldest to Newest</option>
          </select>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          <div className="date-filters"> 
            <button className="small" onClick={() => applyDateRange('7')}>Last 7 days</button>
            <button className="small" onClick={() => applyDateRange('30')}>Last 30 days</button>
            <button className="small" onClick={() => applyDateRange('month')}>This Month</button>
            <button className="small" onClick={() => applyDateRange('year')}>This Year</button>
          </div>
          <button onClick={() => downloadCSV()}>Export CSV</button>
          <button onClick={() => downloadPDF()}>Export PDF</button>
        </div>
      </div>
      <div className="table-wrapper">
        <table className="transactions-table">
          <thead>
            <tr>
              <th>Request ID</th>
              <th>User</th>
              <th>Amount</th>
              <th>Payment Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center">No transactions found</td>
              </tr>
            )}
            {transactions.map((tx) => (
              <tr key={tx.request_id}>
                <td>
                  <a href={`/admin/requests?request_id=${tx.request_id}`}>{tx.request_id}</a>
                </td>
                <td>{tx.full_name} ({tx.student_id})</td>
                <td>₱{parseFloat(tx.amount).toFixed(2)}</td>
                <td>{tx.payment_date ? new Date(tx.payment_date).toLocaleString() : '-'}</td>
                <td>{tx.request_status}</td>
                <td>
                  <button className="small" onClick={() => downloadInvoice(tx)} disabled={!tx.paid}>Download Invoice</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <ButtonLink placeholder="Prev" onClick={() => setPage(Math.max(1, page - 1))} variant="secondary" />
        <span>Page {page} of {totalPages} ({total})</span>
        <ButtonLink placeholder="Next" onClick={() => setPage(Math.min(totalPages, page + 1))} variant="secondary" />
      </div>
    </div>
  );
}

export default Transactions;
