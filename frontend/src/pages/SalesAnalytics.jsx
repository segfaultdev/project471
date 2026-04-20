/**
 * SalesAnalytics - Sales analytics page for sellers
 */
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ordersAPI, storesAPI } from '../api/api';
import { Loader2, TrendingUp, TrendingDown, Package, DollarSign, Percent, MapPin } from 'lucide-react';

const SalesAnalytics = () => {
  const { isVendor } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState('');
  const [stats, setStats] = useState(null);
  const [bestSellers, setBestSellers] = useState([]);
  const [returnRate, setReturnRate] = useState(0);
  const [dailySales, setDailySales] = useState(0);
  const [locationData, setLocationData] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchStores();
  }, []);

  useEffect(() => {
    if (selectedStore) {
      fetchAnalytics();
    }
  }, [selectedStore, date]);

  const fetchStores = async () => {
    try {
      const response = await storesAPI.getMyStores();
      const storesData = response.data || response;
      setStores(storesData);
      if (storesData.length > 0) {
        setSelectedStore(storesData[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch stores:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [statsRes, bestSellersRes, returnRateRes, dailySalesRes, locationRes] = await Promise.all([
        ordersAPI.getStoreStats(selectedStore),
        ordersAPI.getBestSellers(selectedStore),
        ordersAPI.getReturnRate(selectedStore),
        ordersAPI.getDailySales(selectedStore, date),
        ordersAPI.getOrdersByLocation(selectedStore),
      ]);

      setStats(statsRes.data || statsRes);
      setBestSellers(bestSellersRes.data || bestSellersRes);
      setReturnRate(returnRateRes.data || returnRateRes);
      setDailySales(dailySalesRes.data || dailySalesRes);
      setLocationData(locationRes.data || locationRes);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Sales Analytics</h1>
          <p className="text-slate-600 mt-2">Track your store performance and insights</p>
        </div>

        {/* Store Selector & Date Picker */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-slate-700 mb-1">Select Store</label>
            <select
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {stores.map((store) => (
                <option key={store.id} value={store.id}>{store.name}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-sm text-slate-600">Today's Sales</p>
            <p className="text-2xl font-bold text-slate-900">${dailySales.toFixed(2)}</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Package className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <p className="text-sm text-slate-600">Total Orders</p>
            <p className="text-2xl font-bold text-slate-900">{stats?.totalOrders || 0}</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <p className="text-sm text-slate-600">Total Revenue</p>
            <p className="text-2xl font-bold text-slate-900">${(stats?.totalRevenue || 0).toFixed(2)}</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <Percent className="h-6 w-6 text-red-600" />
              </div>
              <TrendingDown className="h-5 w-5 text-red-500" />
            </div>
            <p className="text-sm text-slate-600">Return Rate</p>
            <p className="text-2xl font-bold text-slate-900">{returnRate.toFixed(2)}%</p>
          </div>
        </div>

        {/* Best Selling Products */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Best Selling Products</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Product</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Quantity Sold</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {bestSellers.length > 0 ? (
                  bestSellers.map((product, index) => (
                    <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 text-slate-900">{product.productName || product.productId}</td>
                      <td className="py-3 px-4 text-right text-slate-900">{product.totalQuantity}</td>
                      <td className="py-3 px-4 text-right text-slate-900">${parseFloat(product.totalRevenue).toFixed(2)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="py-8 text-center text-slate-500">No sales data yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Orders by Location */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-bold text-slate-900">Orders by Location</h2>
          </div>
          {locationData.length > 0 ? (
            <div className="space-y-3">
              {locationData.map((location, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-slate-500" />
                    <span className="font-medium text-slate-900">{location.city}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-slate-600">{location.orderCount} orders</span>
                    <span className="text-sm font-semibold text-blue-600">{location.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-center py-8">No location data yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalesAnalytics;