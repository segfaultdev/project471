import { useEffect, useState } from 'react';
import { notificationsAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);

  const loadNotifications = async () => {
    try {
      const res = await notificationsAPI.getByBuyer(user.id);
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const markAsRead = async (id) => {
    await notificationsAPI.markAsRead(id);
    loadNotifications();
  };

  const deleteNotification = async (id) => {
    await notificationsAPI.delete(id);
    loadNotifications();
  };

  useEffect(() => {
    if (user) loadNotifications();
  }, [user]);

  return (
    <div className="min-h-screen bg-slate-50 px-8 py-10">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow p-8">
        <h1 className="text-3xl font-bold mb-6">Notifications</h1>

        {notifications.length === 0 && (
          <p>No notifications available</p>
        )}

        {notifications.map((n) => (
          <div
            key={n.id}
            className={`p-4 mb-3 border rounded-xl ${
              n.isRead ? 'bg-gray-100' : 'bg-blue-50'
            }`}
          >
            <h2 className="font-semibold">{n.title}</h2>
            <p>{n.message}</p>

            <div className="mt-2 flex gap-2">
              {!n.isRead && (
                <button
                  onClick={() => markAsRead(n.id)}
                  className="bg-green-500 text-white px-3 py-1 rounded"
                >
                  Mark as read
                </button>
              )}

              <button
                onClick={() => deleteNotification(n.id)}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}