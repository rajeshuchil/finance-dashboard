import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts';
import Card from '../components/Card';
import Spinner from '../components/Spinner';
import { useFetch } from '../hooks/useFetch';
import { getSummary } from '../api/client';
import './Summary.css';

const fmt = (n = 0) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const PIE_COLORS = ['#635bff', '#1a9e5c', '#df1b41', '#f59e0b', '#06b6d4', '#8b5cf6', '#ec4899', '#10b981'];

export default function Summary() {
  const { data, loading, error } = useFetch(getSummary);

  if (loading) return <Spinner />;
  if (error) return <p className="error-msg">Failed to load summary: {error}</p>;

  const summary = data?.data || {};
  const { income = 0, expenses = 0, balance = 0, categories = {} } = summary;

  const incomeCategories = categories.income || [];
  const expenseCategories = categories.expense || [];

  const barData = [
    { name: 'Total Income', amount: income },
    { name: 'Total Expenses', amount: expenses },
    { name: 'Net Balance', amount: Math.abs(balance) },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Summary</h1>
        <p className="page-subtitle">Category-wise breakdown and income vs expenses</p>
      </div>

      <div className="cards-row">
        <Card label="Total Income" value={fmt(income)} color="green" />
        <Card label="Total Expenses" value={fmt(expenses)} color="red" />
        <Card label="Net Balance" value={fmt(balance)} color={balance >= 0 ? 'blue' : 'red'} />
      </div>

      <div className="section">
        <h2 className="section-title">Income vs Expenses</h2>
        <div className="chart-wrap">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={barData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#8898aa' }} />
              <YAxis tick={{ fontSize: 12, fill: '#8898aa' }} />
              <Tooltip formatter={(val) => fmt(val)} />
              <Bar dataKey="amount" fill="#635bff" radius={[4, 4, 0, 0]}>
                <Cell fill="#1a9e5c" />
                <Cell fill="#df1b41" />
                <Cell fill="#635bff" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="summary-charts-row">
        <div className="section summary-section">
          <h2 className="section-title">Expense Categories</h2>
          {expenseCategories.length === 0 ? (
            <p className="empty-msg">No expense data.</p>
          ) : (
            <div className="pie-wrap">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={expenseCategories} dataKey="total" nameKey="category" cx="50%" cy="50%" outerRadius={80} label={({ category }) => category}>
                    {expenseCategories.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => fmt(val)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="category-list">
                {expenseCategories.map((c) => (
                  <div key={c.category} className="category-row">
                    <span>{c.category}</span>
                    <span className="amount--expense">{fmt(c.total)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="section summary-section">
          <h2 className="section-title">Income Categories</h2>
          {incomeCategories.length === 0 ? (
            <p className="empty-msg">No income data.</p>
          ) : (
            <div className="pie-wrap">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={incomeCategories} dataKey="total" nameKey="category" cx="50%" cy="50%" outerRadius={80} label={({ category }) => category}>
                    {incomeCategories.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => fmt(val)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="category-list">
                {incomeCategories.map((c) => (
                  <div key={c.category} className="category-row">
                    <span>{c.category}</span>
                    <span className="amount--income">{fmt(c.total)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
