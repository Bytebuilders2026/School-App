import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from "../../Layouts/AdminSidebar";
import { Search, Plus, UserPlus, Filter, X } from "lucide-react";
import { API_BASE_URL } from "../../apiConfig";

export default function AdminAdmission() {
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [viewStudent, setViewStudent] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    rollNumber: "",
    admissionNumber: "",
    class: "",
    section: "",
    phone: "",
    address: "",
    parentName: "",
    parentPhone: "",
    parentEmail: "",
    parentOccupation: "",
    parentAddress: "",
  });

  const classOptions = [
    "Pre-Nursery",
    "Nursery",
    "KG",
    "1st",
    "2nd",
    "3rd",
    "4th",
    "5th",
    "6th",
    "7th",
    "8th",
    "9th",
    "10th",
    "11th",
    "12th",
  ];
  const sectionOptions = ["A", "B", "C", "D"];

  useEffect(() => {
    fetchTotal();
    handleSearch(""); // Fetch recent initially
  }, []);

  const fetchTotal = () => {
    axios
      .get(`/students/total`)
      .then((res) => setTotal(res.data.total))
      .catch((err) => console.log(err));
  };

  const handleSearch = async (queryToSearch) => {
    setLoading(true);
    try {
      const q = typeof queryToSearch === "string" ? queryToSearch : search;
      const res = await axios.get(`/students/search?query=${q}`);
      setStudents(res.data || []);
    } catch {
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    // Basic validation
    if (
      !form.name ||
      !form.email ||
      !form.password ||
      !form.rollNumber ||
      !form.class ||
      !form.section ||
      !form.parentName ||
      !form.parentPhone
    ) {
      alert("Please fill all required fields (*)");
      return;
    }

    try {
      await axios.post(`/students/add`, form);
      alert("Student Added successfully");
      setShowForm(false);
      // Reset form
      setForm({
        name: "",
        email: "",
        password: "",
        rollNumber: "",
        admissionNumber: "",
        class: "",
        section: "",
        phone: "",
        address: "",
        parentName: "",
        parentPhone: "",
        parentEmail: "",
        parentOccupation: "",
        parentAddress: "",
      });
      fetchTotal();
      handleSearch(""); // reset to show recent
    } catch (err) {
      alert(err.response?.data?.message || err.response?.data?.error || "Error adding student");
    }
  };

  // Prevent default form submission if they press enter in search
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch(search);
    }
  };

  return (
    <AdminSidebar>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Admissions & Directory
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Manage new enrollments and search student records
            </p>
          </div>

          <div className="flex items-center gap-6 text-right">
            <div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                Total Enrolled
              </p>
              <h2 className="text-3xl font-bold text-[#89D4FF] leading-none">
                {total}
              </h2>
            </div>
            <div className="w-px h-10 bg-gray-200"></div>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-[#89D4FF] hover:bg-[#6ac0f0] text-white px-5 py-3 rounded-xl shadow-sm transition font-bold"
            >
              <UserPlus size={18} /> New Admission
            </button>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
          <div className="flex-1 relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              placeholder="Search by student name, roll number, or admission NO..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-[#89D4FF]/50 focus:outline-none transition"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            {search && (
              <button
                onClick={() => {
                  setSearch("");
                  handleSearch("");
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <button
            onClick={() => handleSearch(search)}
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-xl text-sm transition flex items-center gap-2"
          >
            <Filter size={16} /> Search
          </button>
        </div>

        {/* RESULT TABLE */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <h2 className="font-bold text-gray-700 text-sm">
              {search ? "Search Results" : "Recently Admitted Students"}
            </h2>
            <p className="text-xs text-gray-400">
              {students.length} record(s) found
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-48">
              <div className="w-8 h-8 border-4 border-[#89D4FF] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Search
                size={48}
                className="mx-auto text-gray-200 mb-4"
                strokeWidth={1}
              />
              <p className="text-sm">No students found matching your search.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-white border-b border-gray-100 text-gray-400">
                    <th className="text-left px-6 py-4 font-semibold text-xs tracking-wider">
                      STUDENT
                    </th>
                    <th className="text-left px-6 py-4 font-semibold text-xs tracking-wider">
                      ROLL NO
                    </th>
                    <th className="text-left px-6 py-4 font-semibold text-xs tracking-wider">
                      CLASS - SEC
                    </th>
                    <th className="text-left px-6 py-4 font-semibold text-xs tracking-wider">
                      ADMISSION NO
                    </th>
                    <th className="text-left px-6 py-4 font-semibold text-xs tracking-wider">
                      STATUS
                    </th>
                    <th className="text-right px-6 py-4 font-semibold text-xs tracking-wider">
                      ACTION
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr
                      key={student._id}
                      className="border-b border-gray-50 hover:bg-gray-50/60 transition"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#89D4FF]/20 flex items-center justify-center text-[#89D4FF] font-bold text-xs shrink-0">
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-semibold text-gray-700 block">
                              {student.name}
                            </span>
                            <span className="text-[11px] text-gray-400">
                              {student.email || "No email"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-medium">
                        {student.rollNumber}
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-semibold">
                          {student.class} — {student.section}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {student.admissionNumber || "—"}
                      </td>
                      <td className="px-6 py-4">
                        {student.isActive !== false ? (
                          <span className="flex items-center gap-1.5 text-xs font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-full w-fit">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>{" "}
                            Active
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-50 px-2.5 py-1 rounded-full w-fit">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>{" "}
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setViewStudent(student)}
                          className="text-xs text-[#1a8fc7] font-semibold hover:underline"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: View Details */}
      {viewStudent && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white p-8 rounded-2xl w-[500px] shadow-2xl relative">
            <button
              onClick={() => setViewStudent(null)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-[#89D4FF]/20 flex items-center justify-center text-[#89D4FF] font-bold text-2xl">
                {viewStudent.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {viewStudent.name}
                </h2>
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <span>
                    Class {viewStudent.class} {viewStudent.section}
                  </span>
                  <span>•</span>
                  <span>Roll {viewStudent.rollNumber}</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div>
                <p className="text-[11px] text-gray-400 font-semibold mb-1">
                  Email
                </p>
                <p className="font-medium text-gray-700">
                  {viewStudent.email || "—"}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-gray-400 font-semibold mb-1">
                  Phone
                </p>
                <p className="font-medium text-gray-700">
                  {viewStudent.phone || "—"}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-gray-400 font-semibold mb-1">
                  Admission No
                </p>
                <p className="font-medium text-gray-700">
                  {viewStudent.admissionNumber || "—"}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-gray-400 font-semibold mb-1">
                  Joined Date
                </p>
                <p className="font-medium text-gray-700">
                  {new Date(viewStudent.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-[11px] text-gray-400 font-semibold mb-1">
                  Address
                </p>
                <p className="font-medium text-gray-700">
                  {viewStudent.address || "—"}
                </p>
              </div>
              <div className="col-span-2 mt-2">
                <h3 className="text-sm font-bold text-gray-700 pb-2 border-b border-gray-100">
                  Parent / Guardian Information
                </h3>
                {viewStudent.parent ? (
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <p className="text-xs text-gray-600">
                      <span className="font-semibold text-gray-500">Name:</span>{" "}
                      {viewStudent.parent.name}
                    </p>
                    <p className="text-xs text-gray-600">
                      <span className="font-semibold text-gray-500">
                        Phone:
                      </span>{" "}
                      {viewStudent.parent.phone}
                    </p>
                    <p className="text-xs text-gray-600">
                      <span className="font-semibold text-gray-500">
                        Email:
                      </span>{" "}
                      {viewStudent.parent.email || "—"}
                    </p>
                    <p className="text-xs text-gray-600">
                      <span className="font-semibold text-gray-500">
                        Occupation:
                      </span>{" "}
                      {viewStudent.parent.occupation || "—"}
                    </p>
                    <p className="text-xs text-gray-600 col-span-2">
                      <span className="font-semibold text-gray-500">
                        Address:
                      </span>{" "}
                      {viewStudent.parent.address || "—"}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 mt-3 italic">
                    No parent profile linked to this student.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: New Admission */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white p-8 rounded-2xl w-[700px] max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
            <div className="flex items-center gap-3 mb-6">
              <UserPlus className="text-[#89D4FF]" size={24} />
              <h2 className="text-xl font-bold text-gray-800">
                New Admission Enrollment
              </h2>
            </div>

            <form
              className="grid grid-cols-2 gap-x-4 gap-y-5"
              onSubmit={(e) => e.preventDefault()}
            >
              <div className="col-span-2">
                <h3 className="text-sm font-bold text-gray-700 pb-2 border-b border-gray-100 text-[#89D4FF]">
                  Student Details
                </h3>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide block mb-1">
                  Full Name *
                </label>
                <input
                  placeholder="e.g. John Doe"
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:border-[#89D4FF] focus:outline-none bg-gray-50 focus:bg-white transition"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide block mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:border-[#89D4FF] focus:outline-none bg-gray-50 focus:bg-white transition"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide block mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:border-[#89D4FF] focus:outline-none bg-gray-50 focus:bg-white transition"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide block mb-1">
                  Roll Number *
                </label>
                <input
                  placeholder="Roll Number"
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:border-[#89D4FF] focus:outline-none bg-gray-50 focus:bg-white transition"
                  value={form.rollNumber}
                  onChange={(e) =>
                    setForm({ ...form, rollNumber: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide block mb-1">
                  Admission No
                </label>
                <input
                  placeholder="Admission Number"
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:border-[#89D4FF] focus:outline-none bg-gray-50 focus:bg-white transition"
                  value={form.admissionNumber}
                  onChange={(e) =>
                    setForm({ ...form, admissionNumber: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide block mb-1">
                  Class *
                </label>
                <select
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:border-[#89D4FF] focus:outline-none bg-gray-50 focus:bg-white transition"
                  value={form.class}
                  onChange={(e) => setForm({ ...form, class: e.target.value })}
                >
                  <option value="">Select Class</option>
                  {classOptions.map((cls, i) => (
                    <option key={i} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide block mb-1">
                  Section *
                </label>
                <select
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:border-[#89D4FF] focus:outline-none bg-gray-50 focus:bg-white transition"
                  value={form.section}
                  onChange={(e) =>
                    setForm({ ...form, section: e.target.value })
                  }
                >
                  <option value="">Select Section</option>
                  {sectionOptions.map((sec, i) => (
                    <option key={i} value={sec}>
                      {sec}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide block mb-1">
                  Phone
                </label>
                <input
                  placeholder="Phone"
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:border-[#89D4FF] focus:outline-none bg-gray-50 focus:bg-white transition"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>

              <div className="col-span-2">
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide block mb-1">
                  Address
                </label>
                <input
                  placeholder="Full Address"
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:border-[#89D4FF] focus:outline-none bg-gray-50 focus:bg-white transition"
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                />
              </div>

              <div className="col-span-2 mt-4">
                <h3 className="text-sm font-bold text-gray-700 pb-2 border-b border-gray-100 text-[#89D4FF]">
                  Parent Details
                </h3>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide block mb-1">
                  Parent Name *
                </label>
                <input
                  placeholder="e.g. Robert Doe"
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:border-[#89D4FF] focus:outline-none bg-gray-50 focus:bg-white transition"
                  value={form.parentName}
                  onChange={(e) =>
                    setForm({ ...form, parentName: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide block mb-1">
                  Parent Phone *
                </label>
                <input
                  placeholder="10-digit Phone Number"
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:border-[#89D4FF] focus:outline-none bg-gray-50 focus:bg-white transition"
                  value={form.parentPhone}
                  onChange={(e) =>
                    setForm({ ...form, parentPhone: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide block mb-1">
                  Parent Email (Optional)
                </label>
                <input
                  type="email"
                  placeholder="parent@example.com"
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:border-[#89D4FF] focus:outline-none bg-gray-50 focus:bg-white transition"
                  value={form.parentEmail}
                  onChange={(e) =>
                    setForm({ ...form, parentEmail: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide block mb-1">
                  Parent Occupation
                </label>
                <input
                  placeholder="e.g. Engineer"
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:border-[#89D4FF] focus:outline-none bg-gray-50 focus:bg-white transition"
                  value={form.parentOccupation}
                  onChange={(e) =>
                    setForm({ ...form, parentOccupation: e.target.value })
                  }
                />
              </div>

              <div className="col-span-2">
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide block mb-1">
                  Parent Address
                </label>
                <input
                  placeholder="Parent's Address"
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:border-[#89D4FF] focus:outline-none bg-gray-50 focus:bg-white transition"
                  value={form.parentAddress}
                  onChange={(e) =>
                    setForm({ ...form, parentAddress: e.target.value })
                  }
                />
              </div>
            </form>

            <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
              <button
                onClick={() => setShowForm(false)}
                className="px-5 py-2.5 font-semibold text-gray-500 hover:bg-gray-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                className="px-6 py-2.5 bg-[#89D4FF] text-white font-bold rounded-xl hover:bg-[#6ac0f0] transition shadow-md"
              >
                Enroll Student
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminSidebar>
  );
}
