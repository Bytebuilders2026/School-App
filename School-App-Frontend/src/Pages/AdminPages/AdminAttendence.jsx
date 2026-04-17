import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from "../../Layouts/AdminSidebar";
import { API_BASE_URL } from "../../apiConfig";

axios.defaults.baseURL = API_BASE_URL;

const AdminAttendance = () => {
  const [stats, setStats] = useState({});
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);

  useEffect(() => {
    fetchStats();
    fetchClasses();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get("/attendance/admin/stats");
      setStats(res.data.data || {});
    } catch (err) {
      console.error(err);
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await axios.get("/attendance/admin/class-wise");
      setClasses(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStudents = async (cls, sec) => {
    try {
      const res = await axios.get(
        `/attendance/admin/class-students?className=${cls}&section=${sec}`,
      );
      setStudents(res.data.data || []);
      setSelectedClass({ cls, sec });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AdminSidebar>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Attendance Dashboard</h1>

        <div className="grid grid-cols-4 gap-6 mb-8">
          <Card title="Total Students" value={stats.totalStudents} />
          <Card title="Present Today" value={stats.present} />
          <Card title="Marked Today" value={stats.totalMarked} />
          <Card
            title="Attendance %"
            value={stats.percentage ? stats.percentage + "%" : "0%"}
          />
        </div>

        <div className="grid grid-cols-3 gap-6 mb-8">
          {classes.map((c, i) => (
            <div
              key={i}
              onClick={() => fetchStudents(c._id.class, c._id.section)}
              className="bg-white p-6 rounded shadow cursor-pointer"
            >
              <h2>
                {c._id.class} - {c._id.section}
              </h2>
              <p>
                {c.present}/{c.total}
              </p>
            </div>
          ))}
        </div>

        {selectedClass && (
          <div>
            <h2>
              {selectedClass.cls} - {selectedClass.sec}
            </h2>

            {students.map((s) => (
              <div key={s._id}>
                {s.student?.name} → {s.status}
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminSidebar>
  );
};

const Card = ({ title, value }) => (
  <div className="bg-white p-4 shadow rounded">
    <p>{title}</p>
    <h2>{value ?? 0}</h2>
  </div>
);

export default AdminAttendance;
