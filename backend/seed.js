require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Record = require('./models/Record');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB Atlas...');

    // 1. Get or create a default user
    let user = await User.findOne({ email: 'admin@example.com' });
    if (!user) {
      user = await User.create({
        name: 'Test Admin',
        email: 'admin@example.com',
        password: 'Admin@123',
        role: 'admin',
        status: 'active'
      });
      console.log('Created test user: admin@example.com');
    }

    // 2. Clear out any existing records
    await Record.deleteMany({});
    console.log('Cleared existing records...');

    // 3. Generate 75 random records over the last 6 months
    const records = [];
    const incomeCategories = ['Salary', 'Freelance', 'Investments', 'Bonus', 'Refund'];
    const expenseCategories = ['Food & Dining', 'Rent', 'Utilities', 'Travel', 'Shopping', 'Healthcare', 'Entertainment', 'Miscellaneous'];

    const now = new Date();

    for (let i = 0; i < 75; i++) {
      const isIncome = Math.random() > 0.65; // ~35% income, 65% expense
      const type = isIncome ? 'income' : 'expense';
      const categoryList = isIncome ? incomeCategories : expenseCategories;
      const category = categoryList[Math.floor(Math.random() * categoryList.length)];
      
      // Calculate realistic amounts
      const amount = isIncome 
        ? Math.floor(Math.random() * 40000) + 15000 // 15k - 55k for income
        : Math.floor(Math.random() * 6000) + 200;   // 200 - 6200 for expenses

      // Distribute dates randomly over the last ~180 days (6 months)
      const daysAgo = Math.floor(Math.random() * 180);
      const date = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));

      records.push({
        amount,
        type,
        category,
        date,
        notes: `Auto-generated seed transaction for ${category}`,
        createdBy: user._id
      });
    }

    // 4. Insert data
    await Record.insertMany(records);
    console.log('✅ Successfully seeded 75 real-looking financial records!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
