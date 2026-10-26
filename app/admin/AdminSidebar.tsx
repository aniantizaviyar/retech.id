"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export type AdminNavigationGroup<TabId extends string> = {
  id: string;
  label: string;
  icon: string;
  items: ReadonlyArray<{ id: TabId; label: string; icon: string }>;
};

type Props<TabId extends string> = {
  logo: ReactNode;
  groups: ReadonlyArray<AdminNavigationGroup<TabId>>;
  activeTab: TabId;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  onSelect: (tab: TabId) => void;
  onLogout: () => void | Promise<void>;
};

export function AdminSidebar<TabId extends string>({
  logo, groups, activeTab, collapsed, onCollapsedChange, onSelect, onLogout,
}: Props<TabId>) {
  const activeGroup = groups.find((group) => group.items.some((item) => item.id === activeTab))?.id;
  const [openGroup, setOpenGroup] = useState<string | null>(() => activeGroup || groups.find((group) => group.items.length > 0)?.id || null);
  const navigation = useRef<HTMLElement>(null);

  useEffect(() => {
    if (activeGroup) setOpenGroup(activeGroup);
  }, [activeGroup]);

  useEffect(() => {
    const nav = navigation.current;
    if (!nav) return;
    const revealActiveItem = () => {
      const item = nav.querySelector<HTMLElement>('[aria-current="page"]');
      if (!item || !item.getClientRects().length) return;
      const frame = nav.getBoundingClientRect();
      const target = item.getBoundingClientRect();
      // Reveal only inside the navigation; never move the dashboard document.
      if (target.top < frame.top + 4) nav.scrollTop += target.top - frame.top - 4;
      else if (target.bottom > frame.bottom - 4) nav.scrollTop += target.bottom - frame.bottom + 4;
      if (target.left < frame.left + 4) nav.scrollLeft += target.left - frame.left - 4;
      else if (target.right > frame.right - 4) nav.scrollLeft += target.right - frame.right + 4;
    };
    revealActiveItem();
    const observer = new ResizeObserver(revealActiveItem);
    observer.observe(nav);
    return () => observer.disconnect();
  }, [activeTab, collapsed, openGroup]);

  function toggleGroup(id: string) {
    if (collapsed) {
      onCollapsedChange(false);
      setOpenGroup(id);
    } else {
      setOpenGroup((current) => current === id ? null : id);
    }
  }

  function toggleCollapsed() {
    if (collapsed && activeGroup) setOpenGroup(activeGroup);
    onCollapsedChange(!collapsed);
  }

  return (
    <aside className="admin-sidebar" aria-label="Sidebar admin">
      <button
        className="admin-sidebar-collapse"
        type="button"
        onClick={toggleCollapsed}
        aria-label={collapsed ? "Tampilkan sidebar" : "Ringkas sidebar"}
        aria-pressed={collapsed}
        title={collapsed ? "Tampilkan sidebar" : "Ringkas sidebar"}
      >
        {collapsed ? "›" : "‹"}
      </button>

      <header className="admin-brand">
        {logo}
        <div><strong>RETECH CMS</strong><span>Content Operations</span></div>
      </header>

      <nav className="admin-navigation" ref={navigation} aria-label="Navigasi utama admin">
        {groups.filter((group) => group.items.length > 0).map((group) => {
          const expanded = collapsed || openGroup === group.id;
          const current = group.items.some((item) => item.id === activeTab);
          const panelId = `admin-nav-${group.id}`;

          return (
            <div className="admin-nav-group" key={group.id}>
              <button
                type="button"
                className={`admin-nav-toggle${current ? " current" : ""}`}
                onClick={() => toggleGroup(group.id)}
                aria-label={group.label}
                aria-controls={panelId}
                aria-expanded={expanded}
                title={group.label}
              >
                <i aria-hidden="true">{group.icon}</i>
                <span className="admin-nav-label">{group.label}</span>
                <b aria-hidden="true">⌄</b>
              </button>
              <div className="admin-subnav" id={panelId} hidden={!expanded}>
                {group.items.map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    className={activeTab === item.id ? "active" : ""}
                    aria-current={activeTab === item.id ? "page" : undefined}
                    onClick={() => onSelect(item.id)}
                    title={item.label}
                    aria-label={item.label}
                  >
                    <i aria-hidden="true">{item.icon}</i>
                    <span className="admin-nav-label">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </nav>

      <footer className="admin-sidebar-footer">
        <a href="https://retech.id" target="_blank" rel="noopener noreferrer" title="Lihat website" aria-label="Lihat website">
          <i aria-hidden="true">↗</i>
          <span className="admin-footer-label">Lihat website</span>
        </a>
        <button type="button" onClick={() => void onLogout()} title="Logout" aria-label="Logout">
          <i aria-hidden="true">⇥</i>
          <span className="admin-footer-label">Logout</span>
        </button>
      </footer>
    </aside>
  );
}
