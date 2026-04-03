import { useState, useCallback, useEffect, useRef } from 'react';
import TransactionTable from '../components/TransactionTable';
import Spinner from '../components/Spinner';
import { useFetch } from '../hooks/useFetch';
import { getRecords, createRecord } from '../api/client';
import './Records.css';

const INITIAL_FORM = { amount: '', type: 'income', category: '', date: '', notes: '' };
const INITIAL_FILTERS = { type: '', category: '', startDate: '', endDate: '' };

export default function Records() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [debouncedCategory, setDebouncedCategory] = useState('');
  const debounceRef = useRef(null);

  // Debounce category input
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedCategory(filters.category);
    }, 300);
  }, [filters.category]);

  const fetcher = useCallback(() => {
    const params = { limit: 100 };
    if (filters.type) params.type = filters.type;
    if (debouncedCategory) params.category = debouncedCategory;
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    return getRecords(params);
  }, [refreshKey, filters.type, debouncedCategory, filters.startDate, filters.endDate]);

  const { data, loading, error } = useFetch(fetcher, [fetcher]);
  const records = data?.data || [];

  const handleFilterChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const resetFilters = () => {
    setFilters(INITIAL_FILTERS);
    setDebouncedCategory('');
    setRefreshKey((k) => k + 1);
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.amount || !form.category) {
      setFormError('Amount and category are required.');
      return;
    }
    try {
      setSubmitting(true);
      await createRecord({ ...form, amount: parseFloat(form.amount) });
      setForm(INITIAL_FORM);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to create record.');
    } finally {
      setSubmitting(false);
    }
  };

  const hasActiveFilters = Object.values(filters).some(Boolean);

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Records</h1>
        <p className="page-subtitle">Add and manage financial entries</p>
      </div>

      <div className="section">
        <h2 className="section-title">Add Record</h2>
        <form className="record-form" onSubmit={handleSubmit}>
          {formError && <p className="form-error">{formError}</p>}
          <div className="form-row">
            <div className="form-group">
              <label>Amount</label>
              <input type="number" name="amount" value={form.amount} onChange={handleChange} placeholder="0.00" min="0.01" step="0.01" required />
            </div>
            <div className="form-group">
              <label>Type</label>
              <select name="type" value={form.type} onChange={handleChange}>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
            <div className="form-group">
              <label>Category</label>
              <input type="text" name="category" value={form.category} onChange={handleChange} placeholder="e.g. Salary, Food" required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Date</label>
              <input type="date" name="date" value={form.date} onChange={handleChange} />
            </div>
            <div className="form-group form-group--wide">
              <label>Notes</label>
              <input type="text" name="notes" value={form.notes} onChange={handleChange} placeholder="Optional note" />
            </div>
          </div>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Adding...' : '+ Add Record'}
          </button>
        </form>
      </div>

      <div className="section">
        <div className="records-header">
          <h2 className="section-title">All Records</h2>
          {hasActiveFilters && (
            <span className="filter-count">{records.length} result{records.length !== 1 ? 's' : ''}</span>
          )}
        </div>

        <div className="filter-bar">
          <div className="filter-group">
            <label>Type</label>
            <select name="type" value={filters.type} onChange={handleFilterChange}>
              <option value="">All</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>
          <div className="filter-group filter-group--grow">
            <label>Category</label>
            <input
              type="text"
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              placeholder="Filter by category..."
            />
          </div>
          <div className="filter-group">
            <label>From</label>
            <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} />
          </div>
          <div className="filter-group">
            <label>To</label>
            <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} />
          </div>
          {hasActiveFilters && (
            <button className="btn-reset" onClick={resetFilters}>Reset</button>
          )}
        </div>

        {loading ? (
          <Spinner />
        ) : error ? (
          <p className="error-msg">{error}</p>
        ) : (
          <TransactionTable records={records} />
        )}
      </div>
    </div>
  );
}
