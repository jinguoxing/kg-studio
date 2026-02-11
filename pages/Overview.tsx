import React from 'react';
import { mockKPIs, mockTodos } from '../services/mockData';
import { ArrowUpRight, ArrowDownRight, CheckCircle, AlertTriangle, Clock, PlayCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const Overview: React.FC = () => {
  const chartData = [
    { name: '周一', changes: 4 },
    { name: '周二', changes: 7 },
    { name: '周三', changes: 2 },
    { name: '周四', changes: 12 },
    { name: '周五', changes: 9 },
    { name: '周六', changes: 3 },
    { name: '周日', changes: 1 },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-2xl font-bold text-slate-800">网络总览</h1>
            <p className="text-slate-500">工作空间健康度、关键指标及待办事项。</p>
        </div>
        <div className="text-sm text-slate-500">最后更新: 刚刚</div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mockKPIs.map((kpi, idx) => (
            <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div className="text-sm font-medium text-slate-500">{kpi.label}</div>
                <div className="flex items-end justify-between mt-2">
                    <div className="text-3xl font-bold text-slate-800">{kpi.value}</div>
                    {kpi.trend !== undefined && (
                        <div className={`flex items-center text-xs font-semibold px-2 py-1 rounded-full ${kpi.trend >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                            {kpi.trend >= 0 ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                            {Math.abs(kpi.trend)}%
                        </div>
                    )}
                </div>
                <div className={`h-1 w-full mt-4 rounded-full ${kpi.status === 'good' ? 'bg-emerald-500' : kpi.status === 'warning' ? 'bg-amber-500' : 'bg-slate-300'}`}></div>
            </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* AI Todo Board */}
          <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-brand-600" />
                    AI 待办事项板
                </h3>
                <button className="text-sm text-brand-600 hover:underline">查看全部</button>
              </div>

              <div className="space-y-3">
                  {mockTodos.map(todo => (
                      <div key={todo.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4 cursor-pointer">
                          <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                              todo.priority === 'High' ? 'bg-red-500' : todo.priority === 'Medium' ? 'bg-amber-500' : 'bg-blue-500'
                          }`}></div>
                          <div className="flex-1">
                              <div className="flex items-center justify-between">
                                  <h4 className="font-semibold text-slate-800 text-sm">{todo.title}</h4>
                                  <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded">{todo.type}</span>
                              </div>
                              <p className="text-xs text-slate-500 mt-1">
                                  AI 基于最近对逻辑视图的扫描，检测到了潜在问题。
                              </p>
                          </div>
                          <button className="text-slate-400 hover:text-brand-600">
                              <ArrowUpRight className="w-5 h-5" />
                          </button>
                      </div>
                  ))}
              </div>

               {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                <button className="p-4 bg-gradient-to-br from-brand-50 to-white border border-brand-100 rounded-xl text-left hover:border-brand-300 transition-colors group">
                    <div className="w-8 h-8 rounded-lg bg-brand-100 text-brand-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <PlayCircle className="w-5 h-5" />
                    </div>
                    <h4 className="font-semibold text-brand-900">运行逻辑视图扫描</h4>
                    <p className="text-xs text-brand-700/70 mt-1">从数据库 Schema 生成子图</p>
                </button>
                <button className="p-4 bg-gradient-to-br from-violet-50 to-white border border-violet-100 rounded-xl text-left hover:border-violet-300 transition-colors group">
                    <div className="w-8 h-8 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Clock className="w-5 h-5" />
                    </div>
                    <h4 className="font-semibold text-violet-900">导入业务场景</h4>
                    <p className="text-xs text-violet-700/70 mt-1">对齐 Top-down 业务流程</p>
                </button>
              </div>
          </div>

          {/* Trend Panel */}
          <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-800">本周活动</h3>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <XAxis dataKey="name" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                        <Tooltip 
                            cursor={{fill: 'transparent'}}
                            contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                        />
                        <Bar dataKey="changes" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={20} />
                    </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                          <h4 className="font-semibold text-amber-800 text-sm">检测到低置信度</h4>
                          <p className="text-xs text-amber-700 mt-1">
                              12 个 AI 生成的新关系置信度低于 60% 阈值。
                          </p>
                          <button className="text-xs font-semibold text-amber-800 mt-2 hover:underline">批量复核</button>
                      </div>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};

export default Overview;