import { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import Card from '../components/Card';
import TransactionTable from '../components/TransactionTable';
import Spinner from '../components/Spinner';
import { useFetch } from '../hooks/useFetch';
import { getSummary } from '../api/client';
import './Dashboard.css';

const fmt = (n = 0) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function Dashboard() {
  const { data, loading, error } = useFetch(getSummary);

  if (loading) return <Spinner />;
  if (error) return <p className="error-msg">Failed to load dashboard: {error}</p>;

  const summary = data?.data || {};
  const { income = 0, expenses = 0, balance = 0, recent = [], monthly = [] } = summary;

  const chartData = [...monthly]
    .reverse()
    .map((m) => ({
      name: `${MONTH_NAMES[m.month - 1]} ${m.year}`,
      Income: m.income,
      Expenses: m.expenses,
    }));

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Financial overview at a glance</p>
      </div>

      <div className="cards-row">
        <Card label="Total Income" value={fmt(income)} color="green" icon="↑" />
        <Card label="Total Expenses" value={fmt(expenses)} color="red" icon="↓" />
        <Card label="Net Balance" value={fmt(balance)} color={balance >= 0 ? 'blue' : 'red'} icon="=" />
      </div>

      <div className="section">
        <div className="section-header">
          <h2 className="section-title">Monthly Trend</h2>
        </div>
        {chartData.length === 0 ? (
          <p className="empty-msg">No monthly data available.</p>
        ) : (
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#8898aa' }} />
                <YAxis tick={{ fontSize: 12, fill: '#8898aa' }} />
                <Tooltip formatter={(val) => fmt(val)} />
                <Legend />
                <Line type="monotone" dataKey="Income" stroke="#1a9e5c" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Expenses" stroke="#df1b41" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="section">
        <div className="section-header">
          <h2 className="section-title">Recent Transactions</h2>
        </div>
        <TransactionTable records={recent} />
      </div>
    </div>
  );
}
