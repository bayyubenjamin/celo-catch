import "./globals.css";

export const metadata = {
  title: "Celo Catch",
  description: "Cast daily. Catch rare fish. Climb the Genesis leaderboard."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
