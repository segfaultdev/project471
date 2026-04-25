import { useEffect, useState } from 'react';
import { ordersAPI } from '../api/api';

const statuses = ['pending', 'confirmed', 'shipped', 'delivered', 'returned'];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    try {
      const res = await ordersAPI.getAll();
      setOrders(res.data);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await ordersAPI.updateStatus(id, status);
      loadOrders();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  // ✅ NEW: create order
  const createOrder = async () => {
    try {
      await ordersAPI.create({
        storeId: 1,          // make sure this store exists
        totalAmount: 500,
        status: 'pending',
      });
      alert('Order created!');
      loadOrders();
    } catch (err) {
      console.error(err);
      alert('Failed to create order');
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 px-8 py-10">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Order Management</h1>
            <p className="text-slate-600">
              Manage seller orders and update their status.
            </p>
          </div>

          {/* ✅ NEW BUTTON */}
          <button
            onClick={createOrder}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
          >
            + Create Order
          </button>
        </div>

        {loading && <p>Loading orders...</p>}

        {!loading && orders.length === 0 && (
          <div className="border rounded-xl p-8 text-center">
            <h2 className="text-xl font-semibold">No orders found</h2>
            <p className="text-slate-500 mt-2">
              Orders will appear here after they are created.
            </p>
          </div>
        )}

        {orders.length > 0 && (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-100 text-left">
                <th className="p-3">Order ID</th>
                <th className="p-3">Store ID</th>
                <th className="p-3">Total</th>
                <th className="p-3">Status</th>
                <th className="p-3">Update Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b">
                  <td className="p-3">{order.id}</td>
                  <td className="p-3">{order.storeId}</td>
                  <td className="p-3">৳{order.totalAmount}</td>
                  <td className="p-3">{order.status}</td>
                  <td className="p-3">
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      className="border rounded-lg px-3 py-2"
                    >
                      {statuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}