const Salary = require('../models/Salary');
const Attendance = require('../models/Attendance');
const User = require('../models/User');

// @desc    Generate salary for a user for a specific month
// @route   POST /salary/generate
// @access  Private (Admin)
const generateSalary = async (req, res) => {
    const { userId, month, year } = req.body;

    const user = await User.findById(userId);
    if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    // Calculate present days
    const presentCount = await Attendance.countDocuments({
        user: userId,
        date: { $gte: startDate, $lte: endDate },
        status: { $in: ['present', 'leave'] } // Assuming authorized leave counts as paid or separate logic needed
    });

    // Simple calculation logic: (Base / 30) * Present
    // Real logic would calculate working days in month, minus weekends/holidays etc.

    // Find unauthorized absences
    // For MVP, we'll assume baseSalary is monthly and we deduct for days not 'present' or 'leave'.
    // Or simpler: Per day salary = base / 30.

    // Adjust for annual vs monthly
    const monthlyBase = user.salaryType === 'annual' ? (user.salary / 12) : user.salary;

    const perDaySalary = monthlyBase / 30;
    const totalWorkingDays = 30; // Approximation
    const absentCount = totalWorkingDays - presentCount; // Very rough approximation

    const deductions = absentCount * perDaySalary;

    const totalPayable = monthlyBase - deductions;

    const salary = await Salary.create({
        user: userId,
        month: `${year}-${month}`,
        baseSalary: monthlyBase.toFixed(2),
        deductions: deductions.toFixed(2),
        totalPayable: totalPayable.toFixed(2)
    });

    res.status(201).json(salary);
};

// @desc    Get salary history for a user
// @route   GET /salary/user/:userId
// @access  Private
const getUserSalary = async (req, res) => {
    if (req.user.role === 'employee' && req.user._id.toString() !== req.params.userId) {
        res.status(401).json({ message: 'Not authorized' });
        return;
    }

    const salaries = await Salary.find({ user: req.params.userId });
    res.json(salaries);
};

// @desc    Mark salary as paid
// @route   POST /salary/pay/:id
// @access  Private (Admin)
const paySalary = async (req, res) => {
    const salary = await Salary.findById(req.params.id);

    if (salary) {
        salary.status = 'paid';
        salary.paidDate = new Date();
        await salary.save();
        res.json(salary);
    } else {
        res.status(404).json({ message: 'Salary record not found' });
    }
};

module.exports = {
    generateSalary,
    getUserSalary,
    paySalary,
    // Add missing exports
    getAllSalaries: async (req, res) => {
        // Fetch all salaries, maybe populate user details
        const salaries = await Salary.find({}).populate('user', 'name email image');

        // Map to frontend format `SalaryRecord` if needed, or frontend handles it
        // Frontend expects: { id, employeeName, month, baseSalary, deductions, netPay, status, ... }
        // We generally return raw data or mapped.
        // Let's assume frontend can handle `user.name` if we look at `Salary.tsx`.
        // `Salary.tsx` uses `item.employeeName`.
        // So we might need to map it here or in frontend. 
        // Let's map it here to be safe or ensure frontend adapts.
        // Checking Salary.tsx lines 64: item.employeeName.
        // So we should map.

        const mapped = salaries.map(s => ({
            id: s._id,
            employeeName: s.user ? s.user.name : 'Unknown',
            month: s.month,
            baseSalary: s.baseSalary,
            deductions: parseFloat(s.deductions),
            netPay: parseFloat(s.totalPayable),
            status: s.status ? (s.status.charAt(0).toUpperCase() + s.status.slice(1)) : 'Unpaid'
        }));
        res.json(mapped);
    },

    updateSalary: async (req, res) => {
        const salary = await Salary.findById(req.params.id);
        if (salary) {
            // Generic update
            if (req.body.status) salary.status = req.body.status.toLowerCase();
            if (req.body.deductions !== undefined) {
                salary.deductions = req.body.deductions;
                // Recalculate netPay
                salary.totalPayable = salary.baseSalary - salary.deductions;
            }
            if (req.body.baseSalary !== undefined) {
                salary.baseSalary = req.body.baseSalary;
                salary.totalPayable = salary.baseSalary - salary.deductions;
            }

            await salary.save();
            res.json(salary);
        } else {
            res.status(404).json({ message: 'Salary not found' });
        }
    },

    generateBatchSalary: async (req, res) => {
        try {
            const { month, year } = req.body;
            const employees = await User.find({ role: 'employee' });
            const results = [];

            for (const emp of employees) {
                // Check if salary already exists for this month
                const existing = await Salary.findOne({
                    user: emp._id,
                    month: `${year}-${month}`
                });

                if (existing) continue;

                // Simple generation logic (copied from generateSalary but for batch)
                const startDate = new Date(year, month - 1, 1);
                const endDate = new Date(year, month, 0);

                const presentCount = await Attendance.countDocuments({
                    user: emp._id,
                    date: { $gte: startDate, $lte: endDate },
                    status: { $in: ['present', 'leave'] }
                });

                const monthlyBase = emp.salaryType === 'annual' ? (emp.salary / 12) : emp.salary;
                const perDaySalary = monthlyBase / 30;
                const totalWorkingDays = 30;
                const absentCount = totalWorkingDays - presentCount;
                const deductions = absentCount * perDaySalary;
                const totalPayable = monthlyBase - deductions;

                const salary = await Salary.create({
                    user: emp._id,
                    month: `${year}-${month}`,
                    baseSalary: monthlyBase.toFixed(2),
                    deductions: deductions.toFixed(2),
                    totalPayable: totalPayable.toFixed(2)
                });
                results.push(salary);
            }

            res.status(201).json({ message: `Successfully generated ${results.length} salary records`, count: results.length });
        } catch (error) {
            console.error('Batch Generation Error:', error);
            res.status(500).json({ message: error.message });
        }
    }
};
