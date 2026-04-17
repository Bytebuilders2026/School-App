import StudentSidebar from "../../Layouts/StudentSidebar";

export default function StudentMessage() {
  return (
    <StudentSidebar>
      <div className="flex flex-col items-center justify-center h-[70vh] text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Messages</h1>
        <p className="text-gray-500">Inbox is empty. This feature is coming soon!</p>
      </div>
    </StudentSidebar>
  );
}
