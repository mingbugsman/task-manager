"use client";

import Link from "next/link";
import {
  Zap,
  CheckCircle2,
  Users,
  BarChart3,
  Clock,
  Shield,
  ArrowRight,
  Star,
  Target,
  Layers,
} from "lucide-react";

import { users } from "@/src/data/mockData"; 

export default function HomePage() {
  const features = [
    {
      icon: CheckCircle2,
      title: "Quản Lý Tác Vụ Thông Minh",
      description: "Theo dõi tiến độ công việc với hệ thống trạng thái linh hoạt và timeline rõ ràng.",
      color: "#2563EB",
    },
    {
      icon: Users,
      title: "Cộng Tác Nhóm Hiệu Quả",
      description: "Làm việc nhóm mượt mà với comments, mentions, reactions và realtime notifications.",
      color: "#0891B2",
    },
    {
      icon: BarChart3,
      title: "Báo Cáo & Phân Tích",
      description: "Thống kê chi tiết về tiến độ dự án, hiệu suất team và xu hướng công việc.",
      color: "#7C3AED",
    },
    {
      icon: Clock,
      title: "Lịch & Deadline",
      description: "Quản lý thời gian với calendar view và thông báo deadline tự động.",
      color: "#DC2626",
    },
    {
      icon: Shield,
      title: "Bảo Mật Cao",
      description: "Hệ thống authentication mạnh mẽ với phân quyền chi tiết theo role và project.",
      color: "#059669",
    },
    {
      icon: Layers,
      title: "Multi-Project",
      description: "Quản lý nhiều dự án cùng lúc với workspace riêng biệt và dashboard tổng quan.",
      color: "#EA580C",
    },
  ];

  const stats = [
    { value: "99.9%", label: "Uptime", icon: Target },
    { value: "2000+", label: "Active Users", icon: Users },
    { value: "50K+", label: "Tasks Completed", icon: CheckCircle2 },
    { value: "4.9/5", label: "User Rating", icon: Star },
  ];

  // Lọc lấy các thành viên chính
  const teamMembers = users.filter(u => ["u-001", "u-002", "u-003"].includes(u.user_id));

  return (
    <div className="h-screen overflow-y-auto" style={{ background: "#F8FAFC" }}>
      {/* Hero Section */}
      <section
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0B1F3A 0%, #1E3A5F 25%, #2563EB 50%, #1E3A5F 75%, #0B1F3A 100%)",
          minHeight: "600px",
        }}
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute rounded-full blur-3xl"
            style={{
              width: "600px",
              height: "600px",
              background: "#3B82F6",
              top: "-200px",
              right: "-100px",
              animation: "float 20s infinite ease-in-out",
            }}
          />
          <div
            className="absolute rounded-full blur-3xl"
            style={{
              width: "500px",
              height: "500px",
              background: "#0891B2",
              bottom: "-150px",
              left: "-150px",
              animation: "float 15s infinite ease-in-out reverse",
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-8 py-20">
          {/* Logo & Nav */}
          <div className="flex items-center justify-between mb-16">
            <div className="flex items-center gap-3">
              <div
                className="flex items-center justify-center rounded-xl"
                style={{
                  width: "48px",
                  height: "48px",
                  background: "linear-gradient(135deg, #2563EB, #1D4ED8)",
                  boxShadow: "0 8px 24px rgba(37,99,235,0.4)",
                }}
              >
                <Zap className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-white font-bold text-xl">TaskManager</h1>
                <p style={{ color: "#93C5FD", fontSize: "12px" }}>Pro Workspace</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link
                href="/login"
                className="px-6 py-2.5 rounded-xl transition-all"
                style={{
                  color: "#FFFFFF",
                  border: "1px solid rgba(255,255,255,0.2)",
                  fontSize: "14px",
                  fontWeight: 500,
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.1)";
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.3)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.2)";
                }}
              >
                Đăng Nhập
              </Link>
              <Link
                href="/register"
                className="px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all"
                style={{
                  background: "linear-gradient(135deg, #2563EB, #1D4ED8)",
                  color: "#FFFFFF",
                  fontSize: "14px",
                  fontWeight: 600,
                  boxShadow: "0 4px 14px rgba(37,99,235,0.4)",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 20px rgba(37,99,235,0.5)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 14px rgba(37,99,235,0.4)";
                }}
              >
                Bắt Đầu Ngay
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* Hero Content */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div
                className="inline-block px-4 py-2 rounded-full mb-6"
                style={{
                  background: "rgba(37,99,235,0.2)",
                  border: "1px solid rgba(37,99,235,0.3)",
                }}
              >
                <span style={{ color: "#93C5FD", fontSize: "13px", fontWeight: 600 }}>
                  Platform Quản Lý Dự Án Thông Minh
                </span>
              </div>
              <h2 className="text-white font-bold mb-6" style={{ fontSize: "48px", lineHeight: "1.2" }}>
                Quản Lý Dự Án
                <br />
                <span
                  style={{
                    background: "linear-gradient(135deg, #60A5FA, #3B82F6, #2563EB)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Hiệu Quả Hơn Bao Giờ Hết
                </span>
              </h2>
              <p className="text-lg mb-8" style={{ color: "#93C5FD", lineHeight: "1.8" }}>
                Nền tảng quản lý tác vụ và dự án toàn diện, giúp team làm việc nhịp nhàng với công cụ
                collaboration mạnh mẽ, analytics chi tiết, và giao diện trực quan.
              </p>
              {/* <Link
                href="/register"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl transition-all"
                style={{
                  background: "#FFFFFF",
                  color: "#2563EB",
                  fontSize: "15px",
                  fontWeight: 700,
                  boxShadow: "0 8px 24px rgba(255,255,255,0.2)",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 32px rgba(255,255,255,0.3)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(255,255,255,0.2)";
                }}
              >
                Dùng Thử Miễn Phí
                <ArrowRight size={18} />
              </Link> */}
            </div>

            {/* Hero Image */}
            <div className="relative">
              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1670419628604-a88559b24137?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9kdWN0aXZpdHklMjBkYXNoYm9hcmQlMjB3b3Jrc3BhY2UlMjBtb2Rlcm58ZW58MXx8fHwxNzc2MzIwOTQ0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Dashboard Preview"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="rounded-2xl p-6 text-center"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <stat.icon className="mx-auto mb-3" size={28} style={{ color: "#60A5FA" }} />
                <p className="text-white font-bold mb-1" style={{ fontSize: "32px" }}>
                  {stat.value}
                </p>
                <p style={{ color: "#93C5FD", fontSize: "13px" }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-8 py-20">
        <div className="text-center mb-16">
          <div
            className="inline-block px-4 py-2 rounded-full mb-4"
            style={{
              background: "rgba(37,99,235,0.1)",
              border: "1px solid rgba(37,99,235,0.2)",
            }}
          >
            <span style={{ color: "#2563EB", fontSize: "13px", fontWeight: 600 }}>
              TÍNH NĂNG NỔI BẬT
            </span>
          </div>
          <h3 className="font-bold mb-4" style={{ fontSize: "36px", color: "#0F172A" }}>
            Mọi Thứ Bạn Cần Cho Dự Án Thành Công
          </h3>
          <p style={{ fontSize: "16px", color: "#64748B", maxWidth: "600px", margin: "0 auto" }}>
            Từ quản lý task đơn giản đến phân tích hiệu suất phức tạp, chúng tôi có tất cả công cụ bạn cần.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="rounded-2xl p-8 transition-all cursor-pointer group"
              style={{
                background: "#FFFFFF",
                border: "1px solid #E2E8F0",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(-8px)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 40px rgba(37,99,235,0.15)";
                (e.currentTarget as HTMLElement).style.borderColor = feature.color;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)";
                (e.currentTarget as HTMLElement).style.borderColor = "#E2E8F0";
              }}
            >
              <div
                className="rounded-xl flex items-center justify-center mb-5 transition-all"
                style={{
                  width: "56px",
                  height: "56px",
                  background: `${feature.color}15`,
                }}
              >
                <feature.icon size={28} style={{ color: feature.color }} />
              </div>
              <h4 className="font-bold mb-3" style={{ fontSize: "18px", color: "#0F172A" }}>
                {feature.title}
              </h4>
              <p style={{ fontSize: "14px", color: "#64748B", lineHeight: "1.7" }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Team Section */}
      <section
        className="py-20"
        style={{
          background: "linear-gradient(180deg, #F8FAFC 0%, #EFF6FF 50%, #F8FAFC 100%)",
        }}
      >
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <div
              className="inline-block px-4 py-2 rounded-full mb-4"
              style={{
                background: "rgba(37,99,235,0.1)",
                border: "1px solid rgba(37,99,235,0.2)",
              }}
            >
              <span style={{ color: "#2563EB", fontSize: "13px", fontWeight: 600 }}>
                👥 ĐỘI NGŨ PHÁT TRIỂN
              </span>
            </div>
            <h3 className="font-bold mb-4" style={{ fontSize: "36px", color: "#0F172A" }}>
              Đội Ngũ Đằng Sau Sản Phẩm
            </h3>
            <p style={{ fontSize: "16px", color: "#64748B", maxWidth: "600px", margin: "0 auto" }}>
              Những con người tài năng và đam mê, cùng nhau xây dựng nền tảng quản lý dự án tốt nhất.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {teamMembers.map((member) => (
              <div
                key={member.user_id}
                className="rounded-2xl p-8 text-center transition-all group"
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-8px)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 40px rgba(37,99,235,0.15)";
                  (e.currentTarget as HTMLElement).style.borderColor = "#2563EB";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)";
                  (e.currentTarget as HTMLElement).style.borderColor = "#E2E8F0";
                }}
              >
                <img
                  src={member.avatar_url}
                  alt={member.user_name}
                  className="rounded-full mx-auto mb-5 transition-all"
                  style={{
                    width: "100px",
                    height: "100px",
                    border: "4px solid #2563EB",
                    boxShadow: "0 8px 24px rgba(37,99,235,0.2)",
                  }}
                />
                <h4 className="font-bold mb-2" style={{ fontSize: "18px", color: "#0F172A" }}>
                  {member.user_name}
                </h4>
                <p className="mb-2" style={{ fontSize: "13px", color: "#2563EB", fontWeight: 600 }}>
                  {member.role_global}
                </p>
                <p style={{ fontSize: "13px", color: "#64748B" }}>{member.email}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className="py-20"
        style={{
          background: "linear-gradient(135deg, #0B1F3A 0%, #1E3A5F 25%, #2563EB 50%, #1E3A5F 75%, #0B1F3A 100%)",
        }}
      >
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h3 className="text-white font-bold mb-6" style={{ fontSize: "40px" }}>
            Sẵn Sàng Nâng Tầm Quản Lý Dự Án?
          </h3>
          <p className="mb-10" style={{ fontSize: "18px", color: "#93C5FD", lineHeight: "1.8" }}>
            Tham gia cùng hàng ngàn team đang sử dụng TaskManager để tăng hiệu suất làm việc mỗi ngày.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl transition-all"
              style={{
                background: "#FFFFFF",
                color: "#2563EB",
                fontSize: "16px",
                fontWeight: 700,
                boxShadow: "0 8px 24px rgba(255,255,255,0.2)",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 32px rgba(255,255,255,0.3)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(255,255,255,0.2)";
              }}
            >
              Đăng Ký Miễn Phí
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl transition-all"
              style={{
                border: "1px solid rgba(255,255,255,0.3)",
                color: "#FFFFFF",
                fontSize: "16px",
                fontWeight: 600,
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.1)";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.5)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = "transparent";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.3)";
              }}
            >
              Đăng Nhập
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t" style={{ background: "#FFFFFF", borderColor: "#E2E8F0" }}>
        <div className="max-w-7xl mx-auto px-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div
              className="flex items-center justify-center rounded-xl"
              style={{
                width: "40px",
                height: "40px",
                background: "linear-gradient(135deg, #2563EB, #1D4ED8)",
              }}
            >
              <Zap className="text-white" size={20} />
            </div>
            <span className="font-bold" style={{ fontSize: "18px", color: "#0F172A" }}>
              TaskManager
            </span>
          </div>
          <p style={{ fontSize: "13px", color: "#64748B" }}>
            © 2026 TaskManager. Made with ❤️ by HCMUNRE Students.
          </p>
        </div>
      </footer>

      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(30px, -30px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
          }
        `}
      </style>
    </div>
  );
}