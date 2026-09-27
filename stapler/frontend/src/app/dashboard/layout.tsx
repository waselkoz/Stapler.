import Image from "next/image";
import Link from "next/link";
import {
  LayoutDashboard,
  LogOut,
  Sparkles,
  Zap,
  BarChart3,
  Package,
  Search,
  Megaphone
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black">
      {children}
    </div>
  );
}
