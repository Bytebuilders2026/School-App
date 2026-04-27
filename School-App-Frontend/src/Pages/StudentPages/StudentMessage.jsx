import React from "react";
import StudentSidebar from "../../Layouts/StudentSidebar";
import ChatPage from "../Shared/ChatPage";

export default function StudentMessage() {
  return (
    <StudentSidebar>
      <ChatPage />
    </StudentSidebar>
  );
}
