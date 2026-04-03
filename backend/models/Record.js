const mongoose = require('mongoose');

const recordSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  type: {
    type: String,
    required: true,
    enum: ['income', 'expense']
  },
  category: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 500
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Compound indexes to optimize our most common read queries (dashboard summaries and filtering)
recordSchema.index({ type: 1, category: 1, date: -1 });
recordSchema.index({ createdBy: 1 });

// Soft-delete middleware: Automatically exclude deleted records from all find/findOne queries
recordSchema.pre(/^find/, function(next) {
  this.where({ isDeleted: false });
  next();
});

module.exports = mongoose.model('Record', recordSchema);
