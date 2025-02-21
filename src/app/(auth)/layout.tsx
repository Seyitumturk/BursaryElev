export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Only render the auth content (no global sidebar/header)
  return <>{children}</>;
} 