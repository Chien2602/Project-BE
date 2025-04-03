const Cart = require("../../models/cartModel");
const Product = require("../../models/productModel");

// [GET] Lấy giỏ hàng của người dùng
const getCart = async (req, res) => {
    try {
        const { userId } = req.params;
        const cart = await Cart.findOne({ userId }).populate("items.productId", "title price");

        if (!cart) {
            return res.status(404).json({ success: false, message: "Giỏ hàng không tồn tại" });
        }

        res.status(200).json({ success: true, cart });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
    }
};

// [POST] Thêm sản phẩm vào giỏ hàng
const addToCart = async (req, res) => {
    try {
        const { userId, productId, quantity } = req.body;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Sản phẩm không tồn tại" });
        }

        let cart = await Cart.findOne({ userId });

        if (!cart) {
            cart = new Cart({
                userId,
                items: [{ productId, quantity, price: product.price, total: product.price * quantity }],
                totalPrice: product.price * quantity
            });
        } else {
            const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
            if (itemIndex > -1) {
                cart.items[itemIndex].quantity += quantity;
                cart.items[itemIndex].total = cart.items[itemIndex].quantity * product.price;
            } else {
                cart.items.push({ productId, quantity, price: product.price, total: product.price * quantity });
            }
            cart.totalPrice = cart.items.reduce((total, item) => total + item.total, 0);
        }

        await cart.save();
        res.status(200).json({ success: true, message: "Đã thêm vào giỏ hàng", cart });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
    }
};

// [PUT] Cập nhật số lượng sản phẩm trong giỏ hàng
const updateCartItem = async (req, res) => {
    try {
        const { userId, productId, quantity } = req.body;

        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ success: false, message: "Giỏ hàng không tồn tại" });
        }

        const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
        if (itemIndex === -1) {
            return res.status(404).json({ success: false, message: "Sản phẩm không có trong giỏ hàng" });
        }

        cart.items[itemIndex].quantity = quantity;
        cart.items[itemIndex].total = cart.items[itemIndex].quantity * cart.items[itemIndex].price;
        cart.totalPrice = cart.items.reduce((total, item) => total + item.total, 0);

        await cart.save();
        res.status(200).json({ success: true, message: "Cập nhật giỏ hàng thành công", cart });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
    }
};

// [DELETE] Xóa sản phẩm khỏi giỏ hàng
const removeCartItem = async (req, res) => {
    try {
        const { userId, productId } = req.body;

        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ success: false, message: "Giỏ hàng không tồn tại" });
        }

        cart.items = cart.items.filter(item => item.productId.toString() !== productId);
        cart.totalPrice = cart.items.reduce((total, item) => total + item.total, 0);

        await cart.save();
        res.status(200).json({ success: true, message: "Xóa sản phẩm khỏi giỏ hàng thành công", cart });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
    }
};

// [DELETE] Làm rỗng giỏ hàng
const clearCart = async (req, res) => {
    try {
        const { userId } = req.params;

        await Cart.findOneAndDelete({ userId });

        res.status(200).json({ success: true, message: "Đã làm rỗng giỏ hàng" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
    }
};

module.exports = { getCart, addToCart, updateCartItem, removeCartItem, clearCart };
