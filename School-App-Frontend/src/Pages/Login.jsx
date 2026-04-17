import { useState } from "react";
import LoginForm from "../Components/LoginForm";

export default function Login() {
  const [role, setRole] = useState(null);

  const roles = [
    { name: "admin", label: "Admin" },
    { name: "teacher", label: "Teacher" },
    { name: "student", label: "Student" },
    { name: "parent", label: "Parent" },
  ];

  return (
    <div className="h-screen flex bg-[#F7F6E5]">
      {/* LEFT SIDE */}
      <div className="hidden md:flex w-1/2 flex-col justify-center px-20 relative bg-[#89D4FF]">
        {/* soft gradient overlay */}
        {/* <div className="absolute inset-0 bg-gradient-to-br from-[#89D4FF] to-[#FE9EC7] opacity-40"></div> */}

        <div className="relative z-10">
          <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
            ByteBuilders <br /> School
          </h1>

          <p className="text-white/90 text-lg max-w-md leading-relaxed">
            A modern platform to manage students, teachers, attendance and
            communication — simple, fast and efficient.
          </p>

          <div className="mt-10 w-16 h-1 bg-white/70 rounded-full"></div>

          <div className="mt-6 text-sm text-white/80">© 2026 School System</div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex-1 flex items-center justify-center">
        {!role ? (
          <div className="bg-white p-10 rounded-3xl shadow-xl w-[380px] border border-[#89D4FF]/30">
            {/* Title */}
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-[#374151]">
                Welcome Back
              </h1>
              <p className="text-sm text-[#89D4FF] mt-1">
                Select your role to continue
              </p>
            </div>

            {/* Role Cards */}
            <div className="grid grid-cols-2 gap-4">
              {roles.map((r) => (
                <div
                  key={r.name}
                  onClick={() => setRole(r.name)}
                  className="cursor-pointer p-5 rounded-2xl border border-[#F9F6C4]
                  hover:bg-[#89D4FF] hover:text-white hover:shadow-md
                  transition duration-300 group"
                >
                  <h3 className="font-semibold text-[#374151] group-hover:text-white">
                    {r.label}
                  </h3>

                  <p className="text-xs mt-1 text-gray-500 group-hover:text-white/80">
                    Login as {r.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="mt-8 text-center text-xs text-gray-400">
              Secure login for authorized users only
            </div>
          </div>
        ) : (
          <LoginForm role={role} setRole={setRole} />
        )}
      </div>
    </div>
  );
}
