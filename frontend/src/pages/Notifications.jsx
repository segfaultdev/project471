import { useEffect, useCallback, useState } from "react";
import { notificationsAPI } from "../api/api";
import { useAuth } from "../context/AuthContext";

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const notifyNavbar = () => {
    window.dispatchEvent(new Event("notifications:updated"));
  };

  const loadNotifications = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const res = await notificationsAPI.getByBuyer(user.id);
      setNotifications(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const markAsRead = async (id) => {
    try {
      await notificationsAPI.markAsRead(id);
      setNotifications((prev) =>
        prev.map((item) => (item.id === id ? { ...item, isRead: true } : item)),
      );
      notifyNavbar();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await notificationsAPI.delete(id);
      setNotifications((prev) => prev.filter((item) => item.id !== id));
      notifyNavbar();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!user?.id) return;

    loadNotifications();

    const intervalId = window.setInterval(loadNotifications, 10000);

    const handleFocus = () => loadNotifications();
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        loadNotifications();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [user?.id, loadNotifications]);

  return (
    <div className="min-h-screen bg-slate-50 px-8 py-10">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow p-8">
        <h1 className="text-3xl font-bold mb-6">Notifications</h1>

        {loading && notifications.length === 0 && (
          <p className="text-slate-500 mb-4">Loading notifications...</p>
        )}

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