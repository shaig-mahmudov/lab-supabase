import "./globals.css";

export const metadata = {
  title: "Student List | Supabase Lab",
  description: "Fetching students from a Supabase backend",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
