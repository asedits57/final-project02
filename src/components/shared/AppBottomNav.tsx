import { useLocation, useNavigate } from "react-router-dom";

import { workspaceNavItems, isWorkspaceRouteActive } from "@lib/brand";
import { cn } from "@lib/utils";

interface AppBottomNavProps {
  className?: string;
}

const AppBottomNav = ({ className }: AppBottomNavProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className={cn("fixed inset-x-3 bottom-3 z-50 xl:hidden", className)} aria-label="Primary">
      <div className="app-bottom-nav">
        <div className="grid grid-cols-5 gap-1">
          {workspaceNavItems.map(({ label, path, icon: Icon }) => {
            const active = isWorkspaceRouteActive(location.pathname, path);

            return (
              <button
                key={path}
                type="button"
                onClick={() => navigate(path)}
                className={cn("app-bottom-nav__item", active && "app-bottom-nav__item--active")}
                aria-current={active ? "page" : undefined}
              >
                <Icon className={cn("h-4 w-4", active ? "text-white" : "text-slate-300")} />
                <span className="truncate">{label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default AppBottomNav;
