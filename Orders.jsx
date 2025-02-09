import React, { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";

const Orders = () => {
  const { orders, currency } = useContext(ShopContext);

  return (
    <div className="border-t pt-16 px-4 md:px-8">
      {/* Page Title */}
      <div className="text-2xl mb-6">
        <Title text1="MY" text2="ORDERS" />
      </div>

      {/* No Orders Message */}
      {orders.length === 0 ? (
        <p className="text-center text-gray-600 text-lg">No orders yet.</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order, index) => (
            <div
              key={index}
              className="border-t border-b py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6 bg-white shadow-sm rounded-lg px-6"
            >
              {/* Product Details */}
              <div className="flex items-start gap-6 text-sm">
                <img
                  className="w-20 h-20 object-cover rounded-md"
                  src={order.products[0].itemId.image[0]}
                  alt={order.products[0].itemId.name}
                />
                <div>
                  <p className="text-lg font-semibold">{order.products[0].itemId.name}</p>
                  <div className="flex items-center gap-4 mt-2 text-gray-700">
                    <p className="text-lg font-medium">
                      {currency} {order.totalAmount}
                    </p>
                    <p className="text-sm">Quantity: {order.products[0].quantity}</p>
                    <p className="text-sm">Size: {order.products[0].size}</p>
                  </div>
                  <p className="mt-2 text-gray-500 text-sm">
                    Ordered on:{" "}
                    <span className="font-medium">
                      {new Date(order.dateOrdered).toDateString()}
                    </span>
                  </p>
                </div>
              </div>

              {/* Order Status & Track Button */}
              <div className="md:w-1/2 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-3 h-3 rounded-full ${
                      order.status === "Shipped" ? "bg-blue-500" : "bg-green-500"
                    }`}
                  ></span>
                  <p className="text-sm md:text-base font-medium">{order.status}</p>
                </div>
                <button className="border px-5 py-2 text-sm font-medium rounded-lg bg-gray-100 hover:bg-gray-200 transition">
                  Track Order
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
