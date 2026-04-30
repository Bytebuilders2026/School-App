import React, { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../apiConfig";

const GatePassRequest = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    rollNo: "",
    visitorName: "",
    visitorPhone: "",
    purpose: "",
  });
  const [studentDetails, setStudentDetails] = useState(null);
  const [gatePassId, setGatePassId] = useState(null);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleFetchStudent = async () => {
    if (!formData.rollNo) return alert("Please enter Roll Number");
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/gatepass/student/${formData.rollNo}`);
      setStudentDetails(res.data.student);
    } catch (error) {
      alert(error.response?.data?.message || "Student not found");
      setStudentDetails(null);
    }
    setLoading(false);
  };

  const handleRequest = async (e) => {
    e.preventDefault();
    if (!studentDetails) return alert("Please fetch student details first");
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/gatepass/request`, formData);
      setGatePassId(res.data.gatePassId);
      setMessage(res.data.message + (res.data.otp ? ` (Demo OTP: ${res.data.otp})` : ""));
      setStep(2);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to submit request");
    }
    setLoading(false);
  };

  const [approvalLink, setApprovalLink] = useState("");

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/gatepass/verify-otp`, {
        id: gatePassId,
        otp,
      });
      setMessage(res.data.message);
      if (res.data.approvalLink) {
        setApprovalLink(res.data.approvalLink);
      }
      setStep(3);
    } catch (error) {
      alert(error.response?.data?.message || "Invalid OTP");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-center text-blue-600 mb-6">Smart Gate Pass Request</h2>

        {message && <div className="bg-blue-50 text-blue-700 p-3 rounded mb-4 text-sm font-medium">{message}</div>}

        {step === 1 && (
          <form onSubmit={handleRequest} className="space-y-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Student Roll Number</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="flex-1 px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter Roll No."
                  value={formData.rollNo}
                  onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={handleFetchStudent}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  disabled={loading}
                >
                  Fetch
                </button>
              </div>
            </div>

            {studentDetails && (
              <div className="bg-gray-50 p-3 rounded border text-sm">
                <p><strong>Name:</strong> {studentDetails.name}</p>
                <p><strong>Class:</strong> {studentDetails.class} - {studentDetails.section}</p>
              </div>
            )}

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Visitor Name</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.visitorName}
                onChange={(e) => setFormData({ ...formData, visitorName: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Visitor Phone</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.visitorPhone}
                onChange={(e) => setFormData({ ...formData, visitorPhone: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Purpose of Visit</label>
              <textarea
                className="w-full px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                required
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700"
              disabled={loading}
            >
              Request Gate Pass
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Enter OTP</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded shadow-sm text-center text-xl tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength="6"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 rounded font-bold hover:bg-green-700"
              disabled={loading}
            >
              Verify OTP
            </button>
          </form>
        )}

        {step === 3 && (
          <div className="text-center py-8">
            <div className="text-5xl text-green-500 mb-4">✅</div>
            <h3 className="text-xl font-bold text-gray-800">Request Sent!</h3>
            <p className="text-gray-600 mt-2">Waiting for parent approval.</p>
            {approvalLink && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded text-sm text-left">
                <p className="font-bold text-yellow-800 mb-2">Demo Purposes Only:</p>
                <p className="text-gray-700">A notification with the following link would be sent to the parent:</p>
                <a href={approvalLink} target="_blank" rel="noreferrer" className="text-blue-600 break-all hover:underline block mt-2">
                  {approvalLink}
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GatePassRequest;
