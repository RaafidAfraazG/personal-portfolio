export const isAdminRoute = ({ hostname = "", pathname = "" }) => {
  const normalizedHostname = hostname.toLowerCase();

  return (
    normalizedHostname.startsWith("admin.") ||
    (normalizedHostname === "localhost" && pathname.startsWith("/admin"))
  );
};
