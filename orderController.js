import Order from "../models/orderModel.js";
import userModel from "../models/userModel.js";

// ✅ Place Order
export const placeOrder = async (req, res) => {
    try {
        const { userId, products, totalAmount } = req.body;

        if (!userId || !products.length || !totalAmount) {
            return res.json({ success: false, message: "Missing order details" });
        }

        const order = new Order({ userId, products, totalAmount });
        await order.save();

        res.json({ success: true, message: "Order placed successfully", order });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// ✅ Get User Orders
export const getUserOrders = async (req, res) => {
    try {
        const { userId } = req.body;
        const orders = await Order.find({ userId }).populate("products.itemId");

        res.json({ success: true, orders });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};
