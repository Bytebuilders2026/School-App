import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import { API_BASE_URL } from "../apiConfig";

export default function LoginForm({ role, setRole }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const getPlaceholder = () => {
    if (role === "admin") return "Enter Email";
    if (role === "teacher") return "Enter Email";
    if (role === "student") return "Enter Roll No";
    if (role === "parent") return "Enter Mobile Number";
  };

  const baseUrl = API_BASE_URL;
  axios.defaults.baseURL = baseUrl;

  const handleLogin = async () => {
    try {
      const res = await axios.post(`${baseUrl}/auth/login`, {
        role,
        identifier,
        password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("profile", JSON.stringify(res.data.profile));

      if (res.data.profile?.class) {
        localStorage.setItem("studentClass", res.data.profile.class);
      }

      const userRole = res.data.role;
      if (userRole === "admin") navigate("/admin/dashboard");
      if (userRole === "teacher") navigate("/teacher/dashboard");
      if (userRole === "student") navigate("/student/dashboard");
      if (userRole === "parent") navigate("/parent/dashboard");
    } catch (err) {
      if (!err.response) {
        alert("Server is not responding. Please make sure the backend is running.");
      } else if (err.response.status === 503) {
        alert(err.response.data.message || "Database is offline. Please start MongoDB.");
      } else {
        alert(err.response?.data?.message || err.response?.data?.error || "Error during login");
      }
    }
  };
  return (
    <div className="bg-white p-10 rounded-3xl shadow-xl w-[380px] border border-[#89D4FF]/30 transition-all">
      {/* Back */}
      <button
        onClick={() => setRole(null)}
        className="text-sm text-gray-500 hover:text-[#89D4FF] mb-4 transition"
      >
        ← Back
      </button>

      {/* Title */}
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        {role.charAt(0).toUpperCase() + role.slice(1)} Login
      </h2>

      {/* Input - Identifier */}
      <div className="mb-4">
        <input
          type="text"
          placeholder={getPlaceholder()}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 
          focus:outline-none focus:ring-2 focus:ring-[#89D4FF] 
          focus:border-transparent transition"
          onChange={(e) => setIdentifier(e.target.value)}
        />
      </div>

      {/* Input - Password */}
      <div className="mb-6">
        <input
          type="password"
          placeholder="Enter Password"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 
          focus:outline-none focus:ring-2 focus:ring-[#89D4FF] 
          focus:border-transparent transition"
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {/* Button */}
      <button
        onClick={handleLogin}
        className="w-full py-3 rounded-xl font-bold text-md text-white 
        bg-[#89D4FF]
        hover:opacity-90 transition shadow-md"
      >
        Login
      </button>

      {/* Footer */}
      <p className="text-xs text-gray-400 text-center mt-6">
        Secure login • Authorized access only
      </p>
    </div>
  );
}
