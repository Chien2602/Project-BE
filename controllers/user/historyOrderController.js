const Order = require("../../models/orderModel");

const getOrderHistory = async (req, res) => {
    try {
        const {
            userId
        } = req.params;
        const orders = await Order.find({
            userId,
            status: "completed"
        }).populate("items.productId", "title price");

        if (!orders.length) {
            return res.status(404).json({
                success: false,
                message: "Không có đơn hàng nào"
            });
        }

        res.status(200).json({
            success: true,
            orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Lỗi server",
            error: error.message
        });
    }
};

module.exports = {
    getOrderHistory
};