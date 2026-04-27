import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./Pages/Login";
import AdminDashboard from "./Pages/AdminPages/AdminDashboard";
import AdminAllTeachers from "./Pages/AdminPages/AdminAllTeachers";
import AdminAdmission from "./Pages/AdminPages/AdminAdmission";
import AdminStudents from "./Pages/AdminPages/AdminStudents";
import AdminTimetable from "./Pages/AdminPages/AdminTimetable";
import AdminAttendence from "./Pages/AdminPages/AdminAttendence";
import TeacherDashboard from "./Pages/TeacherPages/TeacherDashboard";
import TeacherTimetable from "./Pages/TeacherPages/TeacherTimetable";
import TeacherAttendance from "./Pages/TeacherPages/TeacherAttendance";
import TeacherHomework from "./Pages/TeacherPages/TeacherHomework";
import AdminHomework from "./Pages/AdminPages/AdminHomework";
import AdminParents from "./Pages/AdminPages/AdminParents";
import AdminSyllabus from "./Pages/AdminPages/AdminSyllabus";
import AdminDatesheet from "./Pages/AdminPages/AdminDatesheet";
import AdminFees from "./Pages/AdminPages/AdminFees";
import AdminTimetableAdjustments from "./Pages/AdminPages/AdminTimetableAdjustments";
import AdminAutoTimetable from "./Pages/AdminPages/AdminAutoTimetable";
import AdminTeacherTimetable from "./Pages/AdminPages/AdminTeacherTimetable";
import AdminAnnouncements from "./Pages/AdminPages/AdminAnnouncements";
import AdminSidebar from "./Layouts/AdminSidebar";


// Teacher Pages
import TeacherMarks from "./Pages/TeacherPages/TeacherMarks";
import TeacherDocManagement from "./Pages/TeacherPages/TeacherDocManagement";
import TeacherLeavePanel from "./Pages/TeacherPages/TeacherLeavePanel";


// Student Routes
import StudentDashboard from "./Pages/StudentPages/StudentDashboard";
import StudentTimetable from "./Pages/StudentPages/StudentTimetable";
import StudentHomework from "./Pages/StudentPages/StudentHomework";
import StudentAttendance from "./Pages/StudentPages/StudentAttendance";
import StudentSyllabus from "./Pages/StudentPages/StudentSyllabus";
import StudentDatesheet from "./Pages/StudentPages/StudentDatesheet";
import StudentMessage from "./Pages/StudentPages/StudentMessage";
import StudentPerformance from "./Pages/StudentPages/StudentPerformance";
import StudentResult from "./Pages/StudentPages/StudentResult";
import StudentDocRequest from "./Pages/StudentPages/StudentDocRequest";
import StudentLeavePanel from "./Pages/StudentPages/StudentLeavePanel";


// Parent Routes
import ParentDashboard from "./Pages/ParentPages/ParentDashboard";
import ParentChildren from "./Pages/ParentPages/ParentChildren";
import ParentAttendance from "./Pages/ParentPages/ParentAttendance";
import ParentMarks from "./Pages/ParentPages/ParentMarks";
import ParentRemarks from "./Pages/ParentPages/ParentRemarks";
import ParentFees from "./Pages/ParentPages/ParentFees";
import ParentSidebar from "./Layouts/ParentSidebar";


function App() {
  return (
    <Router>
      <Routes>
        {/* Login */}
        <Route path="/" element={<Login />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/teachers" element={<AdminAllTeachers />} />
        <Route path="/admin/admissions" element={<AdminAdmission />} />
        <Route path="/admin/students" element={<AdminStudents />} />
        <Route path="/admin/timetable" element={<AdminTimetable />} />
        <Route path="/admin/attendance" element={<AdminAttendence />} />
        <Route path="/admin/homework" element={<AdminHomework />} />
        <Route path="/admin/parents" element={<AdminParents />} />
        <Route path="/admin/syllabus" element={<AdminSyllabus />} />
        <Route path="/admin/datesheet" element={<AdminDatesheet />} />
        <Route path="/admin/fees" element={<AdminFees />} />
        <Route path="/admin/timetable-adjustments" element={<AdminTimetableAdjustments />} />
        <Route path="/admin/auto-timetable" element={<AdminAutoTimetable />} />
        <Route path="/admin/teacher-timetable" element={<AdminTeacherTimetable />} />
        <Route path="/admin/announcements" element={<AdminAnnouncements />} />


        {/* Teacher Routes */}
        <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
        <Route path="/teacher/timetable" element={<TeacherTimetable />} />
        <Route path="/teacher/attendance" element={<TeacherAttendance />} />
        <Route path="/teacher/homework" element={<TeacherHomework />} />
        <Route path="/teacher/marks" element={<TeacherMarks />} />
        <Route path="/teacher/doc-requests" element={<TeacherDocManagement />} />
        <Route path="/teacher/leave-panel" element={<TeacherLeavePanel />} />


        {/* Student Routes */}
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/timetable" element={<StudentTimetable />} />
        <Route path="/student/homework" element={<StudentHomework />} />
        <Route path="/student/attendance" element={<StudentAttendance />} />
        <Route path="/student/syllabus" element={<StudentSyllabus />} />
        <Route path="/student/datesheet" element={<StudentDatesheet />} />
        <Route path="/student/message" element={<StudentMessage />} />
        <Route path="/student/performance" element={<StudentPerformance />} />
        <Route path="/student/result" element={<StudentResult />} />
        <Route path="/student/doc-requests" element={<StudentDocRequest />} />
        <Route path="/student/leave-panel" element={<StudentLeavePanel />} />


        {/* Parent Routes */}
        <Route path="/parent/dashboard" element={<ParentSidebar><ParentDashboard /></ParentSidebar>} />
        <Route path="/parent/children" element={<ParentSidebar><ParentChildren /></ParentSidebar>} />
        <Route path="/parent/attendance" element={<ParentSidebar><ParentAttendance /></ParentSidebar>} />
        <Route path="/parent/marks" element={<ParentSidebar><ParentMarks /></ParentSidebar>} />
        <Route path="/parent/remarks" element={<ParentSidebar><ParentRemarks /></ParentSidebar>} />
        <Route path="/parent/fees" element={<ParentSidebar><ParentFees /></ParentSidebar>} />

      </Routes>
    </Router>
  );
}

export default App;
