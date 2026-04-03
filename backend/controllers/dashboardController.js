const Record = require('../models/Record');

/**
 * Executes a high-performance multi-pipeline aggregation to generate the full dashboard summary.
 * We use Promise.all to run all aggregations concurrently rather than sequentially.
 */
const getSummary = async (req, res, next) => {
  try {
    const [totals, categories, recent, monthly] = await Promise.all([
      // 1. Calculate overall income vs expenses
      Record.aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: '$type', total: { $sum: '$amount' } } }
      ]),
      
      // 2. Breakdown totals by individual categories, grouped by income/expense type
      Record.aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: { type: '$type', category: '$category' }, total: { $sum: '$amount' }, count: { $sum: 1 } } },
        { $group: { _id: '$_id.type', categories: { $push: { category: '$_id.category', total: '$total', count: '$count' } } } }
      ]),
      
      // 3. Fetch the 5 most recent transactions
      Record.find({ isDeleted: false }).sort({ date: -1 }).limit(5).populate('createdBy', 'name'),
      
      // 4. Group totals incrementally by calendar month and year for trend charts
      Record.aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: { year: { $year: '$date' }, month: { $month: '$date' }, type: '$type' }, total: { $sum: '$amount' } } },
        { $group: { _id: { year: '$_id.year', month: '$_id.month' }, breakdown: { $push: { type: '$_id.type', total: '$total' } } } },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 12 }
      ])
    ]);

    // Flatten the totals array into simple primitives for the frontend
    let income = 0;
    let expenses = 0;
    totals.forEach(t => {
      if (t._id === 'income') income = t.total;
      if (t._id === 'expense') expenses = t.total;
    });

    res.json({
      balance: income - expenses,
      income,
      expenses,
      categories,
      recent,
      monthly
    });
  } catch (err) {
    next(err); // Forward to global errorHandler middleware
  }
};

const getTotals = async (req, res, next) => {
  try {
    const totals = await Record.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);

    let income = 0;
    let expenses = 0;
    
    totals.forEach(t => {
      if (t._id === 'income') income = t.total;
      if (t._id === 'expense') expenses = t.total;
    });

    res.json({ income, expenses, balance: income - expenses });
  } catch (err) {
    next(err);
  }
};

const getCategoryBreakdown = async (req, res, next) => {
  try {
    const match = { isDeleted: false };
    
    // Allow optional filtering by transaction type (income/expense)
    if (req.query.type) match.type = req.query.type;

    const categories = await Record.aggregate([
      { $match: match },
      { $group: { _id: { type: '$type', category: '$category' }, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } }
    ]);

    res.json(categories);
  } catch (err) {
    next(err);
  }
};

module.exports = { getSummary, getTotals, getCategoryBreakdown };
