import { NAV_ITEMS } from "./Sidebar";

export default function MobileNav({ active, onNavigate }) {
  return (
    <nav className="sm:hidden fixed bottom-0 inset-x-0 z-20 bg-fu-surface/90 backdrop-blur-md border-t border-fu-border flex justify-around py-2">
      {NAV_ITEMS.map(({ key, short, Icon }) => {
        const isActive = active === key;
        return (
          <button
            key={key}
            onClick={() => onNavigate(key)}
            className={`flex flex-col items-center gap-1 px-2 py-1 text-[11px] ${
              isActive ? "text-fu-cyan" : "text-fu-muted"
            }`}
          >
            <Icon />
            {short}
          </button>
        );
      })}
    </nav>
  );
}
