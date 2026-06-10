import { useEffect, useState } from "react";

import AdminApp from "./apps/AdminApp";
import PublicApp from "./apps/PublicApp";
import { isAdminRoute } from "./lib/appRoute";

const getCurrentRoute = () =>
  isAdminRoute({
    hostname: window.location.hostname,
    pathname: window.location.pathname,
  });

const App = () => {
  const [showAdminApp, setShowAdminApp] = useState(false);

  useEffect(() => {
    setShowAdminApp(getCurrentRoute());
  }, []);

  return showAdminApp ? <AdminApp /> : <PublicApp />;
};

export default App;
