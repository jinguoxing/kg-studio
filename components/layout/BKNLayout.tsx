import React, { useState } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { 
  Network, Compass, GitMerge, List, Database, 
  Search, Plus, Bell, ChevronDown, User, Sparkles,
  Table as TableIcon, Book
} from 'lucide-react';
import RightSideDock from './RightSideDock';
import { BNode } from '../../types';

interface BKNLayoutProps {
  // Props can be passed from App.tsx if needed
}

export const BKNLayout: React.FC<BKNLayoutProps> = () => {
  const location = useLocation();
  const [isDockOpen, setDockOpen] = useState(true); // Default open for demo
  const [activeDockTab, setActiveDockTab] = useState<string | undefined>('details');
  const [selectedEntity, setSelectedEntity] = useState<BNode | null>(null);

  const isActive = (path: string) => location.pathname.startsWith(path);

  // Helper to toggle dock from children if needed (via context in real app)
  const toggleDock = (tab?: string) => {
    if (tab) setActiveDockTab(tab);
    setDockOpen(prev => (tab && tab !== activeDockTab) ? true : !prev);
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      {/* Top Bar */}
      <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0 z-30">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-600 rounded flex items-center justify-center text-white font-bold">
              B
            </div>
            <span className="font-semibold text-lg text-slate-800">业务知识网络</span>
          </div>

          <div className="h-6 w-px bg-slate-200 mx-2"></div>

          <button className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 bg-slate-100 px-3 py-1.5 rounded-md transition-colors">
            <span>工作空间: 企业核心域</span>
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>

        <div className="flex-1 max-w-xl mx-8">
            <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="搜索节点、关系、数据资产..." 
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
                />
            </div>
        </div>

        <div className="flex items-center gap-3">
            <button className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-md shadow-sm flex items-center gap-1.5">
                <Plus className="w-4 h-4" /> 新建
            </button>
            <div className="h-6 w-px bg-slate-200 mx-2"></div>
            <button className="text-slate-500 hover:text-slate-700 relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            <button 
                onClick={() => toggleDock('agent')}
                className={`text-slate-500 hover:text-brand-600 ${isDockOpen && activeDockTab === 'agent' ? 'text-brand-600' : ''}`}
            >
                <Sparkles className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 border border-slate-300">
                <User className="w-4 h-4" />
            </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left SubNav */}
        <nav className="w-16 bg-slate-900 flex flex-col items-center py-4 gap-4 shrink-0">
             <NavIcon to="/bkn/overview" icon={Network} label="总览" active={isActive('/bkn/overview')} />
             <NavIcon to="/bkn/logic-views" icon={TableIcon} label="逻辑视图" active={isActive('/bkn/logic-views')} />
             <NavIcon to="/bkn/explore" icon={Compass} label="探索" active={isActive('/bkn/explore')} />
             <NavIcon to="/bkn/align" icon={GitMerge} label="对齐" active={isActive('/bkn/align')} />
             <NavIcon to="/bkn/changesets" icon={List} label="变更" active={isActive('/bkn/changesets')} />
             <div className="flex-1"></div>
             <NavIcon to="/bkn/standards" icon={Book} label="标准" active={isActive('/bkn/standards')} />
             <NavIcon to="/bkn/schema" icon={Database} label="模型" active={isActive('/bkn/schema')} />
        </nav>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50 relative">
           <Outlet context={{ setSelectedEntity, setDockOpen, setActiveDockTab }} />
        </main>

        {/* Right Dock */}
        <RightSideDock 
            isOpen={isDockOpen} 
            selectedEntity={selectedEntity} 
            onClose={() => setDockOpen(false)} 
            activeTab={activeDockTab}
        />
      </div>
    </div>
  );
};

const NavIcon = ({ to, icon: Icon, label, active }: { to: string, icon: any, label: string, active: boolean }) => (
    <Link to={to} className="group relative flex items-center justify-center w-full">
        <div className={`p-3 rounded-xl transition-all ${active ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <Icon className="w-5 h-5" />
        </div>
        <div className="absolute left-14 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
            {label}
        </div>
    </Link>
);

export default BKNLayout;