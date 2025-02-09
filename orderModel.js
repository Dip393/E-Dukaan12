import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    products: [
        {
            itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
            quantity: { type: Number, required: true },
            size: { type: String, required: true }
        }
    ],
    totalAmount: { type: Number, required: true },
    status: { type: String, default: "Processing" }, // Status: Processing, Shipped, Delivered
    dateOrdered: { type: Date, default: Date.now }
});

const Order = mongoose.model("Order", orderSchema);
export default Order;
