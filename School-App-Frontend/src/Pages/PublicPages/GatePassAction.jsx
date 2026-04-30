import React, { useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../apiConfig";

const GatePassAction = () => {
  const { token } = useParams();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // 'approved', 'rejected', 'error'
  const [message, setMessage] = useState("");

  const handleAction = async (action) => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/gatepass/${action}/${token}`);
      setStatus(action === "approve" ? "approved" : "rejected");
      setMessage(res.data.message);
    } catch (error) {
      setStatus("error");
      setMessage(error.response?.data?.message || `Failed to ${action}`);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Gate Pass Request</h2>

        {!status ? (
          <div>
            <p className="text-gray-600 mb-8">Please approve or reject the visitor request for your child.</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => handleAction("approve")}
                disabled={loading}
                className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 disabled:opacity-50"
              >
                Approve
              </button>
              <button
                onClick={() => handleAction("reject")}
                disabled={loading}
                className="bg-red-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-red-700 disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </div>
        ) : (
          <div className="py-6">
            {status === "approved" && <div className="text-5xl text-green-500 mb-4">✅</div>}
            {status === "rejected" && <div className="text-5xl text-red-500 mb-4">❌</div>}
            {status === "error" && <div className="text-5xl text-orange-500 mb-4">⚠️</div>}
            
            <h3 className={`text-xl font-bold ${status === 'error' ? 'text-orange-600' : 'text-gray-800'}`}>
              {status === "approved" ? "Approved!" : status === "rejected" ? "Rejected" : "Error"}
            </h3>
            <p className="text-gray-600 mt-2">{message}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GatePassAction;
