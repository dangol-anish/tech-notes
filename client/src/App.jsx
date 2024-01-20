import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Public from "./components/Public";
import Login from "./features/auth/Login";
import DashLayout from "./components/DashLayout";
import Welcome from "./features/auth/Welcome";
import NotesList from "./features/notes/NotesList";
import UsersList from "./features/users/UsersList";
import EditUser from "./features/users/EditUser";
import NewUserForm from "./features/users/NewUserForm";
import EditNote from "./features/notes/EditNote";
import NewNote from "./features/notes/NewNote";
import Prefetch from "./features/auth/Prefetch";
import PersistLogin from "./features/auth/PersistLogin";
import { Navigate } from "react-router-dom";
import { ROLES } from "./config/roles";
import RouteGuard from "./components/RouteGuard";

function App() {
  return (
    <Routes>
      {/* <Route element={<RequireAuth />}> */}
      <Route path="/" element={<Layout />}>
        <Route element={<RouteGuard />}>
          <Route index element={<Public />} />
          <Route path="login" element={<Login />} />
        </Route>
        {/* Protected */}{" "}
        <Route element={<PersistLogin />}>
          <Route element={<Prefetch />}>
            <Route path="dash" element={<DashLayout />}>
              <Route index element={<Welcome />} />

              <Route path="users">
                <Route index element={<UsersList />} />
                <Route path=":id" element={<EditUser />} />
                <Route path="new" element={<NewUserForm />} />
              </Route>
              <Route path="notes">
                <Route index element={<NotesList />} />
                <Route path=":id" element={<EditNote />} />
                <Route path="new" element={<NewNote />} />
              </Route>
            </Route>
          </Route>
        </Route>
        {/* </Route> */}
        {/* End Dash */}
      </Route>
    </Routes>
  );
}

export default App;
