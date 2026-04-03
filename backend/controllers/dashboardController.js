const Record = require('../models/Record');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

const BASE_MATCH = { isDeleted: false };

const normalizeTotals = (rows) => {
  let income = 0, expenses = 0, incomeCount = 0, expenseCount = 0;

  rows.forEach((row) => {
    if (row._id === 'income') { income = row.total; incomeCount = row.count; }
    if (row._id === 'expense') { expenses = row.total; expenseCount = row.count; }
  });

  return { income, expenses, balance: income - expenses, transactionCount: incomeCount + expenseCount };
};

const groupCategoriesByType = (rows) => {
  return rows.reduce((acc, row) => {
    if (!acc[row.type]) acc[row.type] = [];
    acc[row.type].push({ category: row.category, total: row.total, count: row.count });
    return acc;
  }, { income: [], expense: [] });
};

const aggregateTotals = () => Record.aggregate([
  { $match: BASE_MATCH },
  { $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 } } }
]);

const aggregateCategories = (type) => {
  const match = type ? { ...BASE_MATCH, type } : BASE_MATCH;
  return Record.aggregate([
    { $match: match },
    { $group: { _id: { type: '$type', category: '$category' }, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    { $project: { _id: 0, type: '$_id.type', category: '$_id.category', total: 1, count: 1 } },
    { $sort: { type: 1, total: -1 } }
  ]);
};

/**
 * Groups data by calendar month for the last 12 months.
 * We anchor the range to the start of the current month to avoid partial-month gaps
 * and filter to a fixed 12-month window before aggregating.
 */
const aggregateMonthly = () => {
  const now = new Date();
  const endOfThisMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1); // exclusive upper bound
  const startOf12MonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1); // 12 calendar months back

  return Record.aggregate([
    {
      $match: {
        ...BASE_MATCH,
        date: { $gte: startOf12MonthsAgo, $lt: endOfThisMonth }
      }
    },
    {
      $group: {
        _id: { year: { $year: '$date' }, month: { $month: '$date' }, type: '$type' },
        total: { $sum: '$amount' }
      }
    },
    {
      $group: {
        _id: { year: '$_id.year', month: '$_id.month' },
        income: { $sum: { $cond: [{ $eq: ['$_id.type', 'income'] }, '$total', 0] } },
        expenses: { $sum: { $cond: [{ $eq: ['$_id.type', 'expense'] }, '$total', 0] } }
      }
    },
    {
      $project: {
        _id: 0,
        year: '$_id.year',
        month: '$_id.month',
        income: 1,
        expenses: 1,
        balance: { $subtract: ['$income', '$expenses'] }
      }
    },
    { $sort: { year: -1, month: -1 } }
  ]);
};

const getSummary = asyncHandler(async (req, res) => {
  const [totalRows, categoryRows, recent, monthly] = await Promise.all([
    aggregateTotals(),
    aggregateCategories(),
    Record.find(BASE_MATCH).sort({ date: -1 }).limit(5).populate('createdBy', 'name'),
    aggregateMonthly()
  ]);

  res.json({
    data: {
      ...normalizeTotals(totalRows),
      categories: groupCategoriesByType(categoryRows),
      recent: recent || [],
      monthly: monthly || []
    }
  });
});

const getTotals = asyncHandler(async (req, res) => {
  const rows = await aggregateTotals();
  res.json({ data: normalizeTotals(rows) });
});

const getCategoryBreakdown = asyncHandler(async (req, res) => {
  const { type } = req.query;

  if (type && !['income', 'expense'].includes(type)) {
    throw new ApiError(400, 'type must be one of: income, expense');
  }

  const rows = await aggregateCategories(type);
  const grouped = groupCategoriesByType(rows);

  res.json({ data: type ? { type, categories: grouped[type] || [] } : grouped });
});

module.exports = { getSummary, getTotals, getCategoryBreakdown };
