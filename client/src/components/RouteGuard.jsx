import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import usePersist from "../hooks/usePersist";

const RouteGuard = () => {
  const [persist] = usePersist();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if persist is true
    if (persist) {
      // Navigate to /dash
      navigate("/dash");
    } else {
      navigate("/login");
    }
  }, [persist, navigate]);

  return <Outlet />;
};

export default RouteGuard;
