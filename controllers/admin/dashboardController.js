const Account = require("../../models/accountModel");
const Product = require("../../models/productModel");
const Order = require("../../models/orderModel");

// Tổng người dùng

const getTotalUsers = async (req, res) => {
    try {
        const totalUsers = await Account.countDocuments({
            status: "active",
            deleted: false
        });

        return res.status(200).json({
            success: true,
            totalUsers: totalUsers
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống",
            error: error.message
        });
    }
};

// Tổng sản phẩm

const getTotalProducts = async (req, res) => {
    try {
        const totalProducts = await Product.countDocuments({
            active: "active",
            deleted: false
        });

        return res.status(200).json({
            success: true,
            totalProducts: totalProducts
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống",
            error: error.message
        });
    }
};


// Tổng đơn hàng

const getTotalOrdersByStatus = async (req, res) => {
    try {
        const {
            status
        } = req.params;
        const totalOrdersByStatus = await Order.countDocuments({
            status: status
        });

        return res.status(200).json({
            success: true,
            totalOrders: totalOrdersByStatus
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống",
            error: error.message
        });
    }
};



// Tổng doanh thu trong tháng

const getMonthlyRevenue = async (req, res) => {
    try {
        const {
            year,
            month
        } = req.query;

        const monthlyOrders = await Order.find({
            status: 'completed',
            createdAt: {
                $gte: new Date(`${year}-${month}-01`),
                $lt: new Date(`${year}-${month}-01`).setMonth(month)
            }
        });

        let totalRevenue = 0;

        monthlyOrders.forEach(order => {
            totalRevenue += order.quantity * order.price;
        });

        return res.status(200).json({
            success: true,
            totalRevenue: totalRevenue
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống",
            error: error.message
        });
    }
};

module.exports = {
    getTotalUsers,
    getTotalProducts,
    getTotalOrdersByStatus,
    getMonthlyRevenue
};