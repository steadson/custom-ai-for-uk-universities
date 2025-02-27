import { Metadata } from "next";
import { ReactNode } from "react";
import React from "react";
import "./global.css";

export const metadata: Metadata = {
  title: "UK UNIVERSITIES",
  description: "all uk unversity that offer computer science in msc"
};

interface RootLayoutProps {
  children: ReactNode;
}

const RootLayout = ({ children }: RootLayoutProps) => {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
};

export default RootLayout;
