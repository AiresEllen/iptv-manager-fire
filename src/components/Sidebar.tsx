import { Monitor, Users, Bell, MessageSquare, Menu, X, LogOut, Link as LinkIcon } from "lucide-react";
import { Page } from "../types";

interface Props {
  current: Page;
  onNavigate: (p: Page) => void;
  alertCount: number;
  open: boolean;
  onToggle: () => void;
  userEmail?: string;
  onLogout: () => void;
}

const navItems: { page: Page; label: string; icon: React.ReactNode }[] = [
  { page: "dashboard", label: "Dashboard", icon: <Monitor size={20} /> },
  { page: "clients", label: "Clientes", icon: <Users size={20} /> },
  { page: "apps", label: "Apps / Links", icon: <LinkIcon size={20} /> },
  { page: "alerts", label: "Alertas", icon: <Bell size={20} /> },
  { page: "messages", label: "Mensagens", icon: <MessageSquare size={20} /> },
];

export default function Sidebar({ current, onNavigate, alertCount, open, onToggle, userEmail, onLogout }: Props) {
  return (
    <>
      <button
        className="lg:hidden fixed top-4 left-4 z-50 bg-gray-800 p-2 rounded-lg text-white"
        onClick={onToggle}
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-30"
          onClick={onToggle}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-gray-900 border-r border-gray-800 z-40 flex flex-col transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-800">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Monitor size={18} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-white text-sm leading-tight">IPTV Manager</p>
            <p className="text-gray-400 text-xs">Painel de controle</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ page, label, icon }) => (
            <button
              key={page}
              onClick={() => { onNavigate(page); onToggle(); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                ${current === page
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"}`}
            >
              {icon}
              <span>{label}</span>
              {page === "alerts" && alertCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {alertCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-gray-800 space-y-3">
          <div className="rounded-xl bg-gray-950 border border-gray-800 px-3 py-3">
            <p className="text-gray-500 text-xs mb-1">Logado como</p>
            <p className="text-sm text-gray-200 truncate">{userEmail || 'Usuario autenticado'}</p>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white px-4 py-3 text-sm font-medium transition-colors"
          >
            <LogOut size={18} />
            Sair
          </button>
          <p className="text-gray-600 text-xs px-2">v1.0.0</p>
        </div>
      </aside>
    </>
  );
}
