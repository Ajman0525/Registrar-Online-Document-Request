import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Transactions.css';
import TotalRequestsIcon from "../../../components/icons/TotalRequestsIcon";
import ProcessedIcon from '../../../components/icons/ProcessedIcon';
import AdminFeeIcon from "../../../components/icons/AdminFeeIcon";
import PaidIcon from "../../../components/icons/PaidIcon";
import SearchIcon from "../../../components/icons/SearchIcon";

const SummaryCard = ({ title, icon: Icon, value, subText, trend }) => (
  <div className="summary-card">
    <div className="card-header">
      <div className="card-icon">
        <Icon className="card-metric-icon" />
      </div>
      <p className="card-title">{title}</p>
    </div>
    <div className="card-content-body">
      <p className="card-subtext">{subText}</p>
      <div className="card-value-row">
        <h2 className="card-value">{value}</h2>
      </div>
    </div>
  </div>
);

function Transactions() {
  const navigate = useNavigate();
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
  const [range, setRange] = useState('all');
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
    if (endDate) params.append('end_date', endDate);

    try {
      const res = await fetch(`/api/admin/transactions?${params.toString()}`, {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (res.status === 401) {
        navigate('/admin/login');
        return;
      }

      const data = await res.json();
      if (data.transactions) {
        setTransactions(data.transactions);
        setTotal(data.total);
        setTotalPages(data.total_pages || 1);
      }
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
      const res = await fetch('/api/admin/transactions/summary?'+params.toString(), {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (res.status === 401) {
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setSummary(data);
      }
    } catch (error) {
      console.error("Error fetching summary:", error);
    }
  }

  /* Apply date range filters */
  /* Sets startDate and endDate based on predefined ranges */
  function applyDateRange(selectedRange) {
    setRange(selectedRange);
    const now = new Date();
    let start = '';
    let end = '';
    switch (selectedRange) {
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
    csvRows.push(headers.join(','));

    /* Loop thhrough transactions and add each as a row */
    transactions.forEach((t) => {
      csvRows.push(
        [
          t.request_id,
          `"${t.full_name} (${t.student_id})"`,
          t.amount,
          t.payment_date || ''
        ].join(',')
      );
    });
    /* Download the csv file */
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transactions.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  /* Downloads the current transactions list as a pdf file */
  function downloadPDF() {
    window.print();
  }

  /* Downloads invoice for a specific transaction */
  function downloadInvoice(tx) {
    const invoiceWindow = window.open('', '_blank');
    if (invoiceWindow) {
      invoiceWindow.document.title = `Invoice ${tx.transaction_id}`;
      invoiceWindow.document.body.innerHTML = `
        <h1>Invoice: ${tx.transaction_id}</h1>
        <p>Request ID: ${tx.request_id}</p>
        <p>User: ${tx.full_name} (${tx.student_id})</p>
        <p>Amount: ₱${tx.amount.toFixed(2)}</p>
        <p>Payment Date: ${tx.payment_date || '-'}</p>
      `;
      invoiceWindow.print();
    }
  }

  return (
    <div className="transactions-page">
      {/* Header */}
      <div className="dashboard-header-wrapper">
        <div className="header-content">
          <h1>Transactions Management</h1>
        </div>

        <select className="date-select" value={range} onChange={(e) => applyDateRange(e.target.value)}>
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
          <option value="all">All Time</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards-content">
        <div className="summary-cards-wrapper">
          <div className="summary-card-inner-scroll">
            <SummaryCard 
              title="Total Requests" 
              icon={TotalRequestsIcon} 
              value={summary?.total_transactions || 0}
              subText={startDate || endDate ? "Transactions in selected period" : "All time transactions"}
            />
            <SummaryCard 
              title="Paid Requests" 
              icon={PaidIcon} 
              value={summary?.total_paid || 0}
              subText="Completed payments"
            />
            <SummaryCard 
              title="Total Amount Paid" 
              icon={ProcessedIcon} 
              value={`₱${(summary?.total_amount_completed || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              subText="Total revenue from requests"
            />
            <SummaryCard 
              title="Total Admin Fee Collected" 
              icon={AdminFeeIcon} 
              value={`₱${totalAdminFee.toLocaleString()}`}
              subText="Accumulated fees"
            />
          </div>
        </div>
      </div>

      {/* Main Content / Table */}
      <div className="transaction-table-wrapper">
        <div className="transactions-list-header">
          <h2 className="transactions-list-title">Transaction List</h2>
          
          <div className="transactions-controls">
            <div className="search-input-wrapper">
              <SearchIcon className="search-icon" />
              <input 
                className="header-search" 
                placeholder="Search..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
              />
            </div>
            
            <select className="sort-select" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>

            <select className="export" defaultValue="" onChange={(e) => {
              if (e.target.value === 'csv') downloadCSV();
              if (e.target.value === 'pdf') downloadPDF();
              e.target.value = "";
            }}>
              <option value="" disabled hidden>Export</option>
              <option value="csv">CSV</option>
              <option value="pdf">PDF</option>
            </select>
          </div>
        </div>

        <div className="transactions-table-container">
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
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">No transactions found</td>
                </tr>
              )}
              {transactions.map((tx) => (
                <tr key={tx.request_id}>
                  <td className="td-request-id">
                    <a href={`/admin/requests?request_id=${tx.request_id}`}>#{tx.request_id}</a>
                  </td>
                  <td className="td-user-info">
                    <div className="font-medium">{tx.full_name}</div>
                    <div className="text-gray-500 text-xs">{tx.student_id}</div>
                  </td>
                  <td className="td-amount">
                    ₱{parseFloat(tx.amount).toFixed(2)}
                  </td>
                  <td className="td-date">
                    {tx.payment_date ? new Date(tx.payment_date).toLocaleDateString() : '-'}
                  </td>
                  <td className="td-actions">
                    <button 
                      className={`btn-invoice ${!tx.paid ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => downloadInvoice(tx)} 
                      disabled={!tx.paid}
                    >
                      Invoice
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="transactions-pagination">
          <button 
            className="pagination-btn" 
            onClick={() => setPage(Math.max(1, page - 1))} 
            disabled={page === 1}
          >
            Prev
          </button>
          <span className="pagination-info">Page {page} of {totalPages} ({total} items)</span>
          <button 
            className="pagination-btn" 
            onClick={() => setPage(Math.min(totalPages, page + 1))} 
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default Transactions;
