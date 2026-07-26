import { useState } from 'react'
import { Navigate, Route, Routes } from "react-router";
import { LoginPage } from "./features/auth/LoginPage";
import { MyRequestsPage } from "./features/requests/MyRequestsPage";
import { NewRequestPage } from "./features/requests/NewRequestPage";
import { QueuePage } from "./features/requests/QueuePage";
import { RequestDetailPage } from "./features/requests/RequestDetailPage";
import './App.css'

function App() {

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/my-requests" element={<MyRequestsPage />} />
      <Route path="/queue" element={<QueuePage />} />
      <Route path="/requests/new" element={<NewRequestPage />} />
      <Route path="/requests/:id" element={<RequestDetailPage />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );

}

export default App;