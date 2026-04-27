import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "givetoget.ai",
  description: "Give contacts. Get contacts.",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
