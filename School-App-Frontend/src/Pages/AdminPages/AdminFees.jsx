import { useState, useEffect } from "react";
import axios from "axios";
import AdminSidebar from "../../Layouts/AdminSidebar";
import { API_BASE_URL } from "../../apiConfig";
import {
  Wallet,
  TrendingUp,
  AlertCircle,
  Bell,
  Search,
  Filter,
  Download,
  Users,
  CheckCircle2,
  Clock,
} from "lucide-react";

export default function AdminFees() {
  const [stats, setStats] = useState(null);
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reminding, setReminding] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchStats();
    fetchAllFees();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/admin/fees/stats`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setStats(res.data?.data || {});
    } catch (err) {
      console.error(err);
      setStats({});
    }
  };

  const fetchAllFees = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/admin/fees/all`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setFees(res.data?.data || []);
    } catch (err) {
      console.error(err);
      setFees([]);
    } finally {
      setLoading(false);
    }
  };

  const sendReminders = async () => {
    if (!window.confirm("Send fee reminders?")) return;

    setReminding(true);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/admin/fees/send-reminders`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      alert(res.data.message);
    } catch {
      alert("Error sending reminders");
    } finally {
      setReminding(false);
    }
  };

  // ✅ SAFE FILTER
  const filteredFees = fees.filter((f) => {
    const name = f.student?.name?.toLowerCase() || "";
    const roll = f.student?.rollNumber?.toLowerCase() || "";

    return (
      name.includes(searchTerm.toLowerCase()) ||
      roll.includes(searchTerm.toLowerCase())
    );
  });

  // ✅ SAFE STATS
  const paidRatio =
    stats?.totalInvoices > 0
      ? Math.round((stats.paidCount / stats.totalInvoices) * 100)
      : 0;

  return (
    <AdminSidebar>
      <div className="space-y-8 pb-10">
        
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Finance Dashboard</h1>

          <div className="flex gap-3">
            <button
              onClick={sendReminders}
              className="bg-rose-500 text-white px-4 py-2 rounded"
            >
              Send Reminders
            </button>

            <button className="bg-indigo-500 text-white px-4 py-2 rounded">
              Export
            </button>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-4 gap-4">
          <Card
            title="Collected"
            value={`₹${stats?.totalCollected || 0}`}
            icon={Wallet}
          />
          <Card
            title="Pending"
            value={`₹${stats?.totalPending || 0}`}
            icon={AlertCircle}
          />
          <Card
            title="Fines"
            value={`₹${stats?.totalFines || 0}`}
            icon={TrendingUp}
          />
          <Card title="Paid %" value={`${paidRatio}%`} icon={CheckCircle2} />
        </div>

        {/* SEARCH */}
        <div className="flex gap-3">
          <input
            placeholder="Search student..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border p-2 rounded w-80"
          />
        </div>

        {/* TABLE */}
        {loading ? (
          <p>Loading...</p>
        ) : (
          <table className="w-full mt-4 border">
            <thead>
              <tr className="bg-gray-100">
                <th>Name</th>
                <th>Month</th>
                <th>Total</th>
                <th>Paid</th>
                <th>Status</th>
                <th>Balance</th>
              </tr>
            </thead>

            <tbody>
              {filteredFees.map((fee, i) => (
                <tr key={i} className="text-center border-t">
                  <td>{fee.student?.name || "N/A"}</td>

                  <td>
                    {fee.month} {fee.year}
                  </td>

                  <td>
                    ₹
                    {(fee.tuitionFee || 0) +
                      (fee.transportFee || 0) +
                      (fee.developmentFee || 0)}
                  </td>

                  <td className="text-green-600">
                    ₹{fee.paidAmount || 0}
                  </td>

                  <td>{fee.status}</td>

                  <td>
                    ₹
                    {(fee.totalPayable || 0) -
                      (fee.paidAmount || 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminSidebar>
  );
}

// 🔥 CARD
const Card = ({ title, value, icon: Icon }) => (
  <div className="bg-white p-4 rounded shadow flex items-center gap-3">
    <Icon size={20} />
    <div>
      <p className="text-gray-500 text-sm">{title}</p>
      <p className="font-bold">{value}</p>
    </div>
  </div>
);