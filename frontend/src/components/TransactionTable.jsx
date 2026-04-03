import './Table.css';

const fmt = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

export default function TransactionTable({ records = [], limit }) {
  const rows = limit ? records.slice(0, limit) : records;

  if (!rows.length) {
    return <p className="empty-msg">No transactions found.</p>;
  }

  return (
    <div className="table-wrap">
      <table className="txn-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Category</th>
            <th>Type</th>
            <th className="amount-col">Amount</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r._id}>
              <td>{fmtDate(r.date)}</td>
              <td>{r.category}</td>
              <td>
                <span className={`badge badge--${r.type}`}>{r.type}</span>
              </td>
              <td className={`amount-col amount--${r.type}`}>{fmt(r.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
