import { useEffect, useState } from 'react';
import { couponsAPI } from '../api/api';

export default function Coupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    storeId: '',
    expiresAt: '',
  });

  const loadCoupons = async () => {
    try {
      const res = await couponsAPI.getAll();
      setCoupons(res.data);
    } catch (err) {
      console.error('Failed to load coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  const createCoupon = async (e) => {
    e.preventDefault();

    try {
      if (!form.code || !form.discountValue || !form.storeId) {
        alert('Please fill all required fields');
        return;
      }

      if (Number(form.discountValue) <= 0) {
        alert('Discount must be greater than 0');
        return;
      }

      if (
        form.discountType === 'percentage' &&
        Number(form.discountValue) > 100
      ) {
        alert('Percentage cannot be more than 100');
        return;
      }

      await couponsAPI.create({
        ...form,
        discountValue: Number(form.discountValue),
        expiresAt: form.expiresAt || null,
      });

      alert('Coupon created successfully ✅');

      setForm({
        code: '',
        discountType: 'percentage',
        discountValue: '',
        storeId: '',
        expiresAt: '',
      });

      loadCoupons();
    } catch (err) {
      console.error('Failed to create coupon:', err);
      alert('Error creating coupon');
    }
  };

  const toggleActive = async (coupon) => {
    try {
      await couponsAPI.update(coupon.id, {
        isActive: !coupon.isActive,
      });
      loadCoupons();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const deleteCoupon = async (id) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;

    try {
      await couponsAPI.delete(id);
      loadCoupons();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 px-8 py-10">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow p-8">
        <h1 className="text-3xl font-bold mb-2">Coupons</h1>
        <p className="text-slate-600 mb-6">
          Create and manage seller discount coupons.
        </p>

        <form
          onSubmit={createCoupon}
          className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8"
        >
          <input
            placeholder="Code"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            className="border rounded-lg px-3 py-2"
            required
          />

          <select
            value={form.discountType}
            onChange={(e) =>
              setForm({ ...form, discountType: e.target.value })
            }
            className="border rounded-lg px-3 py-2"
          >
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed</option>
          </select>

          <input
            placeholder="Discount"
            type="number"
            min="0"
            max={form.discountType === 'percentage' ? 100 : undefined}
            value={form.discountValue}
            onChange={(e) =>
              setForm({ ...form, discountValue: e.target.value })
            }
            className="border rounded-lg px-3 py-2"
            required
          />

          <input
            placeholder="Store ID"
            value={form.storeId}
            onChange={(e) =>
              setForm({ ...form, storeId: e.target.value })
            }
            className="border rounded-lg px-3 py-2"
            required
          />

          <input
            type="date"
            value={form.expiresAt}
            onChange={(e) =>
              setForm({ ...form, expiresAt: e.target.value })
            }
            className="border rounded-lg px-3 py-2"
          />

          <button className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 md:col-span-5">
            Create Coupon
          </button>
        </form>

        {loading && <p>Loading coupons...</p>}

        {!loading && coupons.length === 0 && (
          <div className="border rounded-xl p-8 text-center">
            <h2 className="text-xl font-semibold">No coupons found</h2>
            <p className="text-slate-500 mt-2">
              Created coupons will appear here.
            </p>
          </div>
        )}

        {!loading && coupons.length > 0 && (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-100 text-left">
                <th className="p-3">Code</th>
                <th className="p-3">Type</th>
                <th className="p-3">Value</th>
                <th className="p-3">Store</th>
                <th className="p-3">Status</th>
                <th className="p-3">Expires</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => (
                <tr key={coupon.id} className="border-b">
                  <td className="p-3 font-semibold">{coupon.code}</td>
                  <td className="p-3">{coupon.discountType}</td>
                  <td className="p-3">
                    {coupon.discountType === 'percentage'
                      ? `${coupon.discountValue}%`
                      : `৳${coupon.discountValue}`}
                  </td>
                  <td className="p-3">{coupon.storeId}</td>

                  <td className="p-3">
                    <button
                      onClick={() => toggleActive(coupon)}
                      className={`px-3 py-1 rounded-lg text-white ${
                        coupon.isActive ? 'bg-green-600' : 'bg-gray-500'
                      }`}
                    >
                      {coupon.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>

                  <td className="p-3">
                    {coupon.expiresAt
                      ? new Date(coupon.expiresAt).toLocaleDateString()
                      : 'No expiry'}
                  </td>

                  <td className="p-3">
                    <button
                      onClick={() => deleteCoupon(coupon.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600"
                    >
                      Delete
                    </button>
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