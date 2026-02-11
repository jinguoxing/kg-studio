import React from 'react';
import { mockChangeSets } from '../services/mockData';
import { GitBranch, Clock, User, ArrowRight, FileDiff } from 'lucide-react';

const ChangeSets: React.FC = () => {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
         <div>
            <h1 className="text-2xl font-bold text-slate-800">变更集 (ChangeSets)</h1>
            <p className="text-slate-500">管理草稿、评审以及向知识网络的发布。</p>
         </div>
         <button className="bg-brand-600 text-white px-4 py-2 rounded-md font-medium hover:bg-brand-700 flex items-center gap-2">
            <GitBranch className="w-4 h-4" /> 新建变更集
         </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wide">变更集名称</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wide">状态</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wide">作者</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wide">统计</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wide">创建时间</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wide">操作</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {mockChangeSets.map(cs => (
                    <tr key={cs.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4">
                            <div className="font-medium text-slate-800 flex items-center gap-2">
                                <FileDiff className="w-4 h-4 text-slate-400" />
                                {cs.name}
                            </div>
                            <div className="text-xs text-slate-500 mt-1 pl-6">{cs.description}</div>
                        </td>
                        <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold 
                                ${cs.status === 'Open' ? 'bg-blue-100 text-blue-700' : 
                                  cs.status === 'In Review' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                {cs.status}
                            </span>
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs">
                                    {cs.author.substring(0,1)}
                                </div>
                                {cs.author}
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex gap-2 text-xs font-mono">
                                <span className="text-emerald-600">+{cs.stats.additions}</span>
                                <span className="text-red-600">-{cs.stats.deletions}</span>
                                <span className="text-amber-600">~{cs.stats.modifications}</span>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">
                            <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {cs.createdAt}
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <button className="text-brand-600 hover:text-brand-800 font-medium text-sm flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                查看 <ArrowRight className="w-4 h-4" />
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
};

export default ChangeSets;