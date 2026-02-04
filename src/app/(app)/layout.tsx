import Navbar from "@/components/NavBar";


export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <Navbar/>
    </>
  );
}
