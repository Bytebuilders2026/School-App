import React from "react";
import TeacherSidebar from "../../Layouts/TeacherSidebar";
import ChatPage from "../Shared/ChatPage";

export default function TeacherMessage() {
  return (
    <TeacherSidebar>
      <ChatPage />
    </TeacherSidebar>
  );
}
