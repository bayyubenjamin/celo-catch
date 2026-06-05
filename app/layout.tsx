import "./globals.css";

export const metadata = {
  title: "Celo Catch",
  description: "Cast daily. Catch rare fish. Climb the Genesis leaderboard.",
  other: {
    "talentapp:project_verification":
      "928a7d0ece3f0dda719b5fd9207e27ac14a616a8815000eb3c044ee3918610df5b70b01648d25e130882131023d3d7c3f122ea22739d08af2608b40e5004ff46",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
