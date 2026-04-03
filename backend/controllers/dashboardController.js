const Record = require('../models/Record');
const ApiError = require('../utils/ApiError');

const BASE_MATCH = { isDeleted: false };

const normalizeTotals = (rows) => {
  let income = 0;
  let expenses = 0;
  let incomeCount = 0;
  let expenseCount = 0;

  rows.forEach((row) => {
    if (row._id === 'income') {
      income = row.total;
      incomeCount = row.count;
    }
    if (row._id === 'expense') {
      expenses = row.total;
      expenseCount = row.count;
    }
  });

  return {
    income,
    expenses,
    balance: income - expenses,
    transactionCount: incomeCount + expenseCount
  };
};

const groupCategoriesByType = (rows) => {
  return rows.reduce(
    (acc, row) => {
      const type = row.type;
      if (!acc[type]) {
        acc[type] = [];
      }

      acc[type].push({
        category: row.category,
        total: row.total,
        count: row.count
      });

      return acc;
    },
    { income: [], expense: [] }
  );
};

const aggregateTotals = async () => {
  return Record.aggregate([
    { $match: BASE_MATCH },
    { $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 } } }
  ]);
};

const aggregateCategories = async (type) => {
  const match = type ? { ...BASE_MATCH, type } : BASE_MATCH;

  return Record.aggregate([
    { $match: match },
    {
      $group: {
        _id: { type: '$type', category: '$category' },
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        type: '$_id.type',
        category: '$_id.category',
        total: 1,
        count: 1
      }
    },
    { $sort: { type: 1, total: -1, category: 1 } }
  ]);
};

const aggregateMonthly = async () => {
  return Record.aggregate([
    { $match: BASE_MATCH },
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' },
          type: '$type'
        },
        total: { $sum: '$amount' }
      }
    },
    {
      $group: {
        _id: { year: '$_id.year', month: '$_id.month' },
        income: {
          $sum: {
            $cond: [{ $eq: ['$_id.type', 'income'] }, '$total', 0]
          }
        },
        expenses: {
          $sum: {
            $cond: [{ $eq: ['$_id.type', 'expense'] }, '$total', 0]
          }
        }
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
    { $sort: { year: -1, month: -1 } },
    { $limit: 12 }
  ]);
};

const getSummary = async (req, res, next) => {
  try {
    const [totalRows, categoryRows, recent, monthly] = await Promise.all([
      aggregateTotals(),
      aggregateCategories(),
      Record.find(BASE_MATCH).sort({ date: -1 }).limit(5).populate('createdBy', 'name'),
      aggregateMonthly()
    ]);

    const totals = normalizeTotals(totalRows);
    const categories = groupCategoriesByType(categoryRows);

    res.json({
      ...totals,
      categories,
      recent: recent || [],
      monthly: monthly || []
    });
  } catch (err) {
    next(err);
  }
};

const getTotals = async (req, res, next) => {
  try {
    const totalRows = await aggregateTotals();
    const totals = normalizeTotals(totalRows);
    res.json(totals);
  } catch (err) {
    next(err);
  }
};

const getCategoryBreakdown = async (req, res, next) => {
  try {
    const { type } = req.query;

    if (type && !['income', 'expense'].includes(type)) {
      throw new ApiError(400, 'type must be one of: income, expense');
    }

    const rows = await aggregateCategories(type);
    const grouped = groupCategoriesByType(rows);

    if (type) {
      return res.json({ type, categories: grouped[type] || [] });
    }

    res.json(grouped);
  } catch (err) {
    next(err);
  }
};

module.exports = { getSummary, getTotals, getCategoryBreakdown };
