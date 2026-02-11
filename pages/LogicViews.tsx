import React, { useState } from 'react';
import { mockLogicViews } from '../services/mockData';
import { 
    Search, ChevronDown, ChevronRight, LayoutList, 
    ArrowRight, Sparkles, RefreshCw, Eye, FileText, 
    Database, AlertTriangle, CheckCircle, Clock 
} from 'lucide-react';

const LogicViews: React.FC = () => {
    // --- State ---
    const [selectedStatus, setSelectedStatus] = useState<string>('全部');
    
    // Status tabs configuration
    const tabs = [
        { label: '全部', count: 35 },
        { label: '未开始', count: 13 },
        { label: '理解中', count: 2 },
        { label: '需要裁决', count: 17 },
        { label: '已完成', count: 3 },
    ];

    // Data Source Tree Mock
    const dataSourceGroups = [
        { type: 'MySQL', count: 15 },
        { type: 'PostgreSQL', count: 8 },
        { type: 'Oracle', count: 5 },
        { type: 'SQL Server', count: 2 },
        { type: 'MongoDB', count: 2 },
        { type: 'Redis', count: 1 },
        { type: 'Elasticsearch', count: 1 },
        { type: 'ClickHouse', count: 1 },
        { type: 'Hive', count: 0 },
    ];

    // --- Helpers ---
    const getStatusColor = (status: string) => {
        switch(status) {
            case '未开始语义理解': return 'bg-slate-100 text-slate-500';
            case '语义理解中': return 'bg-blue-100 text-blue-600';
            case '部分完成': return 'bg-indigo-100 text-indigo-600';
            case '需要裁决': return 'bg-amber-100 text-amber-700'; // Amber/Orange
            case '已完成': return 'bg-emerald-100 text-emerald-600'; // Green
            default: return 'bg-slate-100 text-slate-500';
        }
    };

    const getCoverageColor = (val: number) => {
        if (val === 0) return 'text-red-500';
        if (val < 60) return 'text-amber-500';
        if (val < 90) return 'text-brand-500';
        return 'text-emerald-500';
    };

    const filteredViews = selectedStatus === '全部' 
        ? mockLogicViews 
        : mockLogicViews.filter(v => {
            if (selectedStatus === '未开始') return v.status === '未开始语义理解';
            if (selectedStatus === '理解中') return v.status === '语义理解中';
            if (selectedStatus === '需要裁决') return v.status === '需要裁决';
            if (selectedStatus === '已完成') return v.status === '已完成' || v.status === '部分完成';
            return true;
        });

    return (
        <div className="flex h-full">
            {/* Left Sidebar: Data Source Filter */}
            <div className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
                <div className="p-4 border-b border-slate-100">
                    <h2 className="font-bold text-slate-800 flex items-center gap-2">
                        <Database className="w-4 h-4 text-slate-500" />
                        数据源筛选
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">表名请用顶部搜索</p>
                </div>
                
                <div className="p-3">
                    <div className="relative mb-4">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="搜索数据源..." 
                            className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                        />
                    </div>

                    <div className="flex items-center justify-between px-2 py-2 bg-brand-50 text-brand-700 rounded-md mb-2 cursor-pointer font-medium text-sm">
                        <div className="flex items-center gap-2">
                            <LayoutList className="w-4 h-4" /> 全部资源
                        </div>
                    </div>

                    <div className="space-y-1">
                        {dataSourceGroups.map((group, idx) => (
                            <div key={idx} className="group">
                                <div className="flex items-center gap-2 px-2 py-2 hover:bg-slate-50 rounded-md cursor-pointer text-sm text-slate-600 transition-colors">
                                    <ChevronDown className="w-3 h-3 text-slate-400" />
                                    <span className={`w-2 h-2 rounded-full ${
                                        group.type === 'MySQL' ? 'bg-blue-400' :
                                        group.type === 'PostgreSQL' ? 'bg-cyan-400' :
                                        group.type === 'Oracle' ? 'bg-red-400' : 
                                        'bg-slate-400'
                                    }`}></span>
                                    <span className="flex-1">{group.type}</span>
                                </div>
                                {/* Mock Expansion for MySQL to show databases */}
                                {group.type === 'MySQL' && (
                                    <div className="pl-9 space-y-1 mt-1">
                                        <div className="flex items-center gap-2 py-1 text-xs text-slate-500 hover:text-slate-800 cursor-pointer">
                                            <div className="w-1 h-1 bg-slate-300 rounded-full"></div> CRM_Primary_DB
                                        </div>
                                        <div className="flex items-center gap-2 py-1 text-xs text-slate-500 hover:text-slate-800 cursor-pointer">
                                            <div className="w-1 h-1 bg-slate-300 rounded-full"></div> Order_Management
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
                {/* Header */}
                <div className="px-8 py-6 pb-2">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-slate-800">逻辑视图列表</h1>
                            <span className="text-slate-400 text-sm font-medium mt-1">35 张</span>
                        </div>
                        <div className="flex gap-3">
                            <button className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-md hover:bg-brand-700 shadow-sm shadow-brand-200 text-sm font-medium transition-all">
                                <ArrowRight className="w-4 h-4" /> 查看 AI 语义待办
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-md hover:bg-slate-200 text-sm font-medium transition-colors">
                                <Sparkles className="w-4 h-4 text-purple-500" /> 批量重新语义理解
                            </button>
                            <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-md hover:bg-slate-50 text-sm font-medium transition-colors">
                                展开
                            </button>
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex gap-2">
                        {tabs.map(tab => (
                            <button
                                key={tab.label}
                                onClick={() => setSelectedStatus(tab.label)}
                                className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all ${
                                    selectedStatus === tab.label 
                                    ? 'bg-brand-600 text-white border-brand-600 shadow-sm' 
                                    : 'bg-white text-slate-500 border-slate-200 hover:border-brand-300 hover:text-brand-600'
                                }`}
                            >
                                {tab.label} <span className={`ml-1 opacity-80`}>{tab.count}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table Area */}
                <div className="flex-1 p-8 pt-4 overflow-hidden">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm h-full flex flex-col">
                        {/* Table Header */}
                        <div className="flex items-center px-6 py-3 border-b border-slate-100 bg-slate-50 text-xs font-bold text-slate-500 rounded-t-xl">
                            <div className="w-12 flex justify-center"><input type="checkbox" className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"/></div>
                            <div className="flex-1">全选</div> {/* Logic View Col */}
                            <div className="w-48"></div> {/* Data Source Col */}
                            <div className="w-24 text-right pr-4">行数 <ChevronDown className="w-3 h-3 inline text-slate-300"/></div>
                            <div className="w-24 text-center">字段数</div>
                            <div className="w-36">语义理解状态</div>
                            <div className="w-24 text-center">AI 覆盖率</div>
                            <div className="w-36 text-right pr-4">更新时间</div>
                            <div className="w-20 text-center">操作</div>
                        </div>

                        {/* Table Header Labels Fix - The above was "Select All" row. Let's do real headers visually mapped */}
                        <div className="hidden">
                           {/* Hidden structured header for accessibility if needed */}
                        </div>

                        {/* Table Body */}
                        <div className="overflow-y-auto flex-1 divide-y divide-slate-50">
                            {filteredViews.map(view => (
                                <div key={view.id} className="flex items-center px-6 py-4 hover:bg-slate-50 transition-colors group">
                                    <div className="w-12 flex justify-center">
                                        <input type="checkbox" className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"/>
                                    </div>
                                    
                                    {/* Logic View Info */}
                                    <div className="flex-1 min-w-0 pr-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded bg-brand-50 text-brand-600 flex items-center justify-center border border-brand-100 shrink-0">
                                                <Database className="w-4 h-4" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="font-bold text-sm text-brand-600 truncate hover:underline cursor-pointer">{view.name}</div>
                                                {view.description && <div className="text-xs text-slate-400 mt-0.5 truncate">{view.description}</div>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Data Source */}
                                    <div className="w-48">
                                        <div className="flex flex-col items-start gap-1">
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                                                view.dataSourceType === 'MySQL' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                view.dataSourceType === 'PostgreSQL' ? 'bg-cyan-50 text-cyan-600 border-cyan-100' :
                                                view.dataSourceType === 'Oracle' ? 'bg-red-50 text-red-600 border-red-100' :
                                                'bg-slate-50 text-slate-600 border-slate-200'
                                            }`}>
                                                {view.dataSourceType}
                                            </span>
                                            <span className="text-xs text-slate-500 truncate max-w-full">{view.dataSourceName}</span>
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div className="w-24 text-right pr-4 text-sm text-slate-700 font-mono">{view.rowCount}</div>
                                    <div className="w-24 text-center text-sm text-slate-500">{view.fieldCount}</div>

                                    {/* Status */}
                                    <div className="w-36">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(view.status)}`}>
                                            {view.status === '需要裁决' && <AlertTriangle className="w-3 h-3" />}
                                            {view.status}
                                        </span>
                                    </div>

                                    {/* AI Coverage */}
                                    <div className={`w-24 text-center text-sm font-bold ${getCoverageColor(view.aiCoverage)}`}>
                                        {view.aiCoverage}%
                                    </div>

                                    {/* Time */}
                                    <div className="w-36 text-right pr-4 text-xs text-slate-400 flex justify-end items-center gap-1">
                                        <Clock className="w-3 h-3 text-slate-300" />
                                        {view.updatedAt}
                                    </div>

                                    {/* Actions */}
                                    <div className="w-20 flex justify-center gap-2">
                                        {view.status === '需要裁决' ? (
                                            <button className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-md transition-colors" title="去裁决">
                                                <ArrowRight className="w-4 h-4" />
                                            </button>
                                        ) : (
                                            <button className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-slate-100 rounded-md transition-colors" title="查看详情">
                                                <FileText className="w-4 h-4" />
                                            </button>
                                        )}
                                        {view.aiCoverage > 0 && (
                                            <button className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-slate-100 rounded-md transition-colors" title="预览数据">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LogicViews;