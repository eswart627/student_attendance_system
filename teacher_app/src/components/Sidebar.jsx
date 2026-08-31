import { useNavigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import {
  LayoutDashboard,
  ClipboardList,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { AuthContext } from "@/context/AuthContext";

export default function Sidebar({ isOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useContext(AuthContext);

  const menu = [
    {
      name: "Dashboard",
      path: "/home",
      icon: LayoutDashboard,
    },
    {
      name: "Attendance Report",
      path: "/report",
      icon: ClipboardList,
    },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <aside
      className={`
        fixed top-0 left-0 z-40 h-full
        bg-[#172d38]
        border-r border-[#29434d]
        shadow-[8px_0_30px_rgba(23,45,56,0.12)]
        transition-all duration-300 ease-in-out
        ${isOpen ? "w-64" : "w-16"}
        overflow-hidden
      `}
    >
      {/* DECORATIVE SIDEBAR TEXTURE */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Large circles */}
        <div className="absolute -left-32 -top-24 h-72 w-72 rounded-full border border-[#527c7a]/20" />

        <div className="absolute -left-20 -top-12 h-48 w-48 rounded-full border border-[#527c7a]/10" />

        <div className="absolute -right-40 top-[18%] h-80 w-80 rounded-full border border-[#9a804f]/10" />

        <div className="absolute -right-24 top-[25%] h-48 w-48 rounded-full border border-[#527c7a]/10" />

        <div className="absolute -left-36 bottom-[12%] h-72 w-72 rounded-full border border-[#527c7a]/10" />

        <div className="absolute -right-32 bottom-[-80px] h-80 w-80 rounded-full border border-[#9a804f]/10" />

        {/* Inner circles */}
        <div className="absolute left-10 top-[12%] h-2 w-2 rounded-full bg-[#527c7a]/35" />

        <div className="absolute right-8 top-[34%] h-1.5 w-1.5 rounded-full bg-[#9a804f]/40" />

        <div className="absolute left-5 top-[55%] h-1.5 w-1.5 rounded-full bg-[#527c7a]/30" />

        <div className="absolute right-10 bottom-[28%] h-2 w-2 rounded-full bg-[#9a804f]/30" />

        {/* Diamond details */}
        <div className="absolute right-7 top-[13%] h-4 w-4 rotate-45 border border-[#527c7a]/20" />

        <div className="absolute left-6 bottom-[18%] h-3 w-3 rotate-45 border border-[#9a804f]/15" />

        {/* Subtle dotted texture */}
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(184,207,203,0.55) 1px, transparent 1px)",
            backgroundSize: "26px 26px",
            maskImage:
              "linear-gradient(to bottom, black, transparent 85%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, black, transparent 85%)",
          }}
        />

        {/* Soft glow areas */}
        <div className="absolute -left-20 top-32 h-48 w-48 rounded-full bg-[#527c7a]/[0.045] blur-3xl" />

        <div className="absolute -right-20 bottom-20 h-56 w-56 rounded-full bg-[#9a804f]/[0.035] blur-3xl" />
      </div>

      {/* NAVIGATION */}
      {isOpen && (
        <nav className="relative z-10 flex h-full flex-col px-3 py-6">

          {/* SECTION LABEL */}
          <div className="mb-4 px-3">
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#71878a]">
              Navigation
            </p>
          </div>

          {/* MENU */}
          <div className="space-y-1.5">
            {menu.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => navigate(item.path)}
                  className={`
                    group flex w-full items-center gap-3
                    rounded-xl px-3 py-2.5
                    text-left text-sm font-medium
                    transition-all duration-200
                    ${
                      active
                        ? "bg-[#527c7a] text-white shadow-[0_5px_16px_rgba(82,124,122,0.25)]"
                        : "text-[#b7c5c5] hover:bg-[#213b46] hover:text-white"
                    }
                  `}
                >
                  <Icon
                    className={`
                      h-[17px] w-[17px] shrink-0
                      transition-transform duration-200
                      ${
                        active
                          ? "text-white"
                          : "text-[#819799] group-hover:text-[#b9cfca]"
                      }
                    `}
                    strokeWidth={active ? 2.2 : 1.8}
                  />

                  <span className="flex-1 whitespace-nowrap">
                    {item.name}
                  </span>

                  <ChevronRight
                    className={`
                      h-3.5 w-3.5
                      transition-all duration-200
                      ${
                        active
                          ? "translate-x-0 opacity-100"
                          : "-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-60"
                      }
                    `}
                  />
                </button>
              );
            })}
          </div>

          {/* BOTTOM */}
          <div className="mt-auto">

            <div className="mb-4 h-px bg-[#29434d]" />

            {/* LOGOUT */}
            <button
              type="button"
              onClick={handleLogout}
              className="
                group flex w-full items-center gap-3
                rounded-xl px-3 py-2.5
                text-left text-sm font-medium
                text-[#b7a0a0]
                transition-all duration-200
                hover:bg-[#442f32]
                hover:text-[#e4b4b4]
              "
            >
              <LogOut
                className="
                  h-[17px] w-[17px] shrink-0
                  text-[#a87575]
                  transition-colors
                  group-hover:text-[#d08a8a]
                "
                strokeWidth={1.9}
              />

              <span>Logout</span>
            </button>

            {/* FOOTER LABEL */}
            <div className="mt-5 px-3">
              <p className="text-[9px] font-medium uppercase tracking-[0.14em] text-[#627b80]">
                IIIT Pune
              </p>
            </div>
          </div>
        </nav>
      )}
    </aside>
  );
}