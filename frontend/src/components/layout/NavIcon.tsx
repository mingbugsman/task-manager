import {
  LayoutDashboard,
  FolderKanban,
  ListTodo,
  Calendar,
  BarChart3,
  Users,
  Bell,
  Info,
  Mail,
  HelpCircle,
  Settings,
  ScrollText,
  Shield,
  User,
  Zap,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  FolderKanban,
  ListTodo,
  Calendar,
  BarChart3,
  Users,
  Bell,
  Info,
  Mail,
  HelpCircle,
  Settings,
  ScrollText,
  Shield,
  User,
  Zap,
};

export function NavIcon({ name, size = 18 }: { name: string; size?: number }) {
  const Icon = iconMap[name] ?? LayoutDashboard;
  return <Icon size={size} />;
}
