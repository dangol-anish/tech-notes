import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import usePersist from "../hooks/usePersist";
import { selectCurrentToken } from "../features/auth/authSlice";
import { useSelector } from "react-redux";

const RouteGuard = () => {
  const [persist] = usePersist();
  const navigate = useNavigate();

  const token = useSelector(selectCurrentToken);
  console.log("token", token);
  useEffect(() => {
    // Check if persist is true
    if (persist) {
      // Navigate to /dash
      navigate("/dash");
    } else if (token == null) {
      navigate("/login");
    }
  }, [persist, navigate]);

  return <Outlet />;
};

export default RouteGuard;
