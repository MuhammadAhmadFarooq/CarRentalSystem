const express = require('express');
const Expense = require('../models/Expense');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all expenses
router.get('/', auth, async (req, res) => {
  try {
    const { category, status, search, startDate, endDate } = req.query;
    let query = {};

    if (category) {
      query.category = category;
    }

    if (status) {
      query.status = status;
    }

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const expenses = await Expense.find(query)
      .populate('booking')
      .populate('vehicle')
      .populate('driver')
      .sort({ date: -1 });

    if (search) {
      const filteredExpenses = expenses.filter(expense =>
        expense.description.toLowerCase().includes(search.toLowerCase()) ||
        expense.vendor?.toLowerCase().includes(search.toLowerCase()) ||
        expense.receiptNumber?.toLowerCase().includes(search.toLowerCase())
      );
      return res.json(filteredExpenses);
    }

    res.json(expenses);
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get expense by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id)
      .populate('booking')
      .populate('vehicle')
      .populate('driver');
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    res.json(expense);
  } catch (error) {
    console.error('Get expense error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create expense
router.post('/', auth, async (req, res) => {
  try {
    // Clean up empty ObjectId fields
    const expenseData = { ...req.body };
    
    // Convert empty strings to undefined for optional ObjectId fields
    if (expenseData.booking === '') expenseData.booking = undefined;
    if (expenseData.vehicle === '') expenseData.vehicle = undefined;
    if (expenseData.driver === '') expenseData.driver = undefined;
    
    const expense = new Expense(expenseData);
    await expense.save();

    const populatedExpense = await Expense.findById(expense._id)
      .populate('booking')
      .populate('vehicle')
      .populate('driver');

    res.status(201).json({ 
      message: 'Expense created successfully', 
      expense: populatedExpense 
    });
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update expense
router.put('/:id', auth, async (req, res) => {
  try {
    // Clean up empty ObjectId fields
    const updateData = { ...req.body };
    
    // Convert empty strings to undefined for optional ObjectId fields
    if (updateData.booking === '') updateData.booking = undefined;
    if (updateData.vehicle === '') updateData.vehicle = undefined;
    if (updateData.driver === '') updateData.driver = undefined;
    
    const expense = await Expense.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('booking')
     .populate('vehicle')
     .populate('driver');

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json({ message: 'Expense updated successfully', expense });
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete expense
router.delete('/:id', auth, async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve expense
router.patch('/:id/approve', auth, async (req, res) => {
  try {
    const expense = await Expense.findByIdAndUpdate(
      req.params.id,
      {
        status: 'Approved',
        approvedBy: req.user.username,
        approvalDate: new Date()
      },
      { new: true }
    ).populate('booking')
     .populate('vehicle')
     .populate('driver');

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json({ message: 'Expense approved successfully', expense });
  } catch (error) {
    console.error('Approve expense error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reject expense
router.patch('/:id/reject', auth, async (req, res) => {
  try {
    const { reason } = req.body;
    const expense = await Expense.findByIdAndUpdate(
      req.params.id,
      {
        status: 'Rejected',
        approvedBy: req.user.username,
        approvalDate: new Date(),
        notes: reason
      },
      { new: true }
    ).populate('booking')
     .populate('vehicle')
     .populate('driver');

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json({ message: 'Expense rejected successfully', expense });
  } catch (error) {
    console.error('Reject expense error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
