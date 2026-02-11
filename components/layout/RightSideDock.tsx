import React, { useState, useEffect } from 'react';
import { BNode, EntityStatus } from '../../types';
import { mockEdges, mockNodes } from '../../services/mockData';
import { 
  X, MessageSquare, FileText, GitBranch, Share2, 
  ShieldCheck, AlertTriangle, Send, Sparkles, Check,
  ArrowUpRight, ArrowDownRight, ArrowRight, User, CheckCircle, Activity, ExternalLink
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface RightSideDockProps {
  isOpen: boolean;
  selectedEntity: BNode | null;
  onClose: () => void;
  activeTab?: string;
}

const RightSideDock: React.FC<RightSideDockProps> = ({ isOpen, selectedEntity, onClose, activeTab: initialTab }) => {
  const [activeTab, setActiveTab] = useState('details');
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'model', text: string}[]>([
    { role: 'model', text: '您好！我是您的业务知识网络助手。今天需要协助您进行建模或治理吗？' }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (selectedEntity) {
        // Switch to details if an entity is selected, unless we are already in Agent mode
        if (activeTab !== 'agent') setActiveTab('details');
    }
  }, [selectedEntity]);

  if (!isOpen) return null;

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    
    const userMsg = chatInput;
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatInput('');
    setIsTyping(true);

    // Simulation of Gemini response
    setTimeout(() => {
        let responseText = "我可以为您提供帮助。";
        if (userMsg.toLowerCase().includes('对齐') || userMsg.toLowerCase().includes('align')) {
            responseText = "我分析了最近的变更。逻辑视图中的 'Customer Order' 与物理模型中的 'SalesOrder' 匹配度为 88%。需要我为您创建映射建议吗？";
        } else if (userMsg.toLowerCase().includes('风险') || userMsg.toLowerCase().includes('risk')) {
            responseText = "'欺诈检测' 流程当前处于草稿状态，且缺少与 '风险评分' 指标的绑定。需要我为您生成该关系吗？";
        } else if (selectedEntity) {
            responseText = `关于 ${selectedEntity.name}，我在 '旧版销售域' 中发现了 2 个潜在的重复项。`;
        }

        setChatHistory(prev => [...prev, { role: 'model', text: responseText }]);
        setIsTyping(false);
    }, 1000);
  };

  const getTabLabel = (tab: string) => {
    switch(tab) {
        case 'details': return '详情';
        case 'relations': return '关系';
        case 'evidence': return '证据';
        case 'changes': return '变更';
        case 'agent': return 'Agent';
        default: return tab;
    }
  };

  const renderTabs = () => (
    <div className="flex border-b border-slate-200 bg-white">
      {['details', 'relations', 'evidence', 'changes', 'agent'].map(tab => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === tab 
              ? 'border-brand-600 text-brand-600' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          {getTabLabel(tab)}
        </button>
      ))}
    </div>
  );

  const getTypeLabel = (type: string) => {
      switch(type) {
          case 'BusinessObject': return '业务对象';
          case 'Process': return '业务流程';
          case 'Term': return '业务术语';
          case 'Metric': return '指标';
          case 'System': return '系统';
          default: return type;
      }
  };

  // --- TAB CONTENT RENDERERS ---

  const renderDetails = () => {
    if (!selectedEntity) return <div className="p-10 text-slate-400 text-center italic flex flex-col items-center gap-2"><div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center"><FileText className="w-6 h-6 text-slate-300"/></div><p>请在画布或列表中选择一个实体以查看详情</p></div>;

    return (
      <div className="p-4 space-y-6 overflow-y-auto h-[calc(100vh-180px)]">
        {/* Header */}
        <div>
           <div className="flex items-center justify-between mb-2">
             <h2 className="text-xl font-bold text-slate-800">{selectedEntity.name}</h2>
             <span className={`px-2 py-0.5 rounded-full text-xs font-semibold 
               ${selectedEntity.status === EntityStatus.PUBLISHED ? 'bg-emerald-100 text-emerald-700' : 
                 selectedEntity.status === EntityStatus.DRAFT ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
               {selectedEntity.status}
             </span>
           </div>
           <div className="text-xs text-slate-500 flex gap-3">
             <span>Owner: {selectedEntity.owner}</span>
             <span>领域: {selectedEntity.domain}</span>
           </div>
        </div>

        {/* Definition */}
        <div className="bg-slate-50 p-3 rounded border border-slate-200">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">业务定义</h3>
            <p className="text-sm text-slate-700 leading-relaxed">{selectedEntity.description}</p>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 gap-4">
            <div className="p-3 border border-slate-100 rounded bg-white shadow-sm">
                <div className="text-xs text-slate-400">置信度</div>
                <div className="text-lg font-semibold text-brand-600">{(selectedEntity.confidence * 100).toFixed(0)}%</div>
            </div>
            <div className="p-3 border border-slate-100 rounded bg-white shadow-sm">
                <div className="text-xs text-slate-400">类型</div>
                <div className="text-lg font-semibold text-slate-700">{getTypeLabel(selectedEntity.type)}</div>
            </div>
        </div>

        {/* Tags */}
        <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">绑定 & 标签</h3>
            <div className="flex flex-wrap gap-2">
                {selectedEntity.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 rounded bg-slate-200 text-slate-600 text-xs">{tag}</span>
                ))}
                <button className="px-2 py-1 rounded border border-dashed border-slate-300 text-slate-400 text-xs hover:border-brand-500 hover:text-brand-500 transition-colors">+ 添加</button>
            </div>
        </div>

        {/* Governance */}
        <div className="space-y-2">
             <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide">治理策略</h3>
             <div className="flex items-center gap-2 text-sm text-slate-600 bg-white p-2 rounded border border-slate-100">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>标准数据质量规则集</span>
             </div>
             <div className="flex items-center gap-2 text-sm text-slate-600 bg-white p-2 rounded border border-slate-100">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>GDPR 合规等级 2</span>
             </div>
        </div>
      </div>
    );
  };

  const renderRelations = () => {
    if (!selectedEntity) return <div className="p-10 text-slate-400 text-center italic flex flex-col items-center gap-2"><div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center"><Share2 className="w-6 h-6 text-slate-300"/></div><p>请选择一个实体以查看关系拓扑</p></div>;

    // Helper to find node name
    const getName = (id: string) => mockNodes.find(n => n.id === id)?.name || id;

    const outgoing = mockEdges.filter(e => e.source === selectedEntity.id);
    const incoming = mockEdges.filter(e => e.target === selectedEntity.id);

    return (
        <div className="h-[calc(100vh-180px)] overflow-y-auto p-4 space-y-6">
             {/* Outgoing */}
             <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <ArrowUpRight className="w-4 h-4" /> 输出关系 (Outgoing)
                </h3>
                <div className="space-y-3">
                    {outgoing.length === 0 && <div className="text-sm text-slate-400 italic bg-slate-50 p-3 rounded text-center border border-slate-100">无输出关系</div>}
                    {outgoing.map(edge => (
                        <div key={edge.id} className="bg-white border border-slate-200 p-3 rounded-lg shadow-sm flex flex-col gap-2 group hover:border-brand-300 transition-colors">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">{edge.type}</span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${edge.confidence > 0.8 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                    {(edge.confidence * 100).toFixed(0)}%
                                </span>
                            </div>
                            <div className="flex items-center gap-2 font-medium text-slate-700 text-sm pl-1">
                                <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                                <ArrowRight className="w-4 h-4 text-slate-300" />
                                {getName(edge.target)}
                            </div>
                        </div>
                    ))}
                </div>
             </div>

             {/* Incoming */}
             <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <ArrowDownRight className="w-4 h-4" /> 输入关系 (Incoming)
                </h3>
                <div className="space-y-3">
                    {incoming.length === 0 && <div className="text-sm text-slate-400 italic bg-slate-50 p-3 rounded text-center border border-slate-100">无输入关系</div>}
                    {incoming.map(edge => (
                        <div key={edge.id} className="bg-white border border-slate-200 p-3 rounded-lg shadow-sm flex flex-col gap-2 group hover:border-brand-300 transition-colors">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 font-medium text-slate-700 text-sm pl-1">
                                    {getName(edge.source)}
                                </div>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${edge.confidence > 0.8 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                    {(edge.confidence * 100).toFixed(0)}%
                                </span>
                            </div>
                            <div className="flex items-center justify-end">
                                <span className="text-xs font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded flex items-center gap-1 border border-slate-200">
                                    {edge.type} <ArrowRight className="w-3 h-3" /> This
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
             </div>
             
             <button className="w-full py-2 border border-dashed border-slate-300 rounded-lg text-slate-400 text-xs hover:border-brand-400 hover:text-brand-600 transition-colors flex items-center justify-center gap-1">
                  <ExternalLink className="w-3 h-3" /> 在图谱中探索所有路径
             </button>
        </div>
    )
  };

  const renderEvidence = () => {
    if (!selectedEntity) return <div className="p-10 text-slate-400 text-center italic flex flex-col items-center gap-2"><div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center"><ShieldCheck className="w-6 h-6 text-slate-300"/></div><p>请选择一个实体以查看溯源证据</p></div>;

    // Mock evidence list based on entity type for variety
    const evidences = [
        { type: 'Auto', source: 'Logic View Scanner', content: `Matched table "${selectedEntity.name.split(' ')[0]}_tbl" with name similarity (0.92)`, time: '2h ago' },
        { type: 'Doc', source: 'Wiki: Enterprise Dict', content: `Definition extracted from "Q3 Domain Definitions" section 4.2.`, time: '1w ago' },
        ...(selectedEntity.status === EntityStatus.PUBLISHED ? [{ type: 'Manual', source: 'Data Steward', content: 'Verified by Alice during Q3 Review', time: '2d ago' }] : [])
    ];

    return (
        <div className="h-[calc(100vh-180px)] overflow-y-auto p-4 space-y-4">
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-800 mb-4">
                此实体的定义由 <b>{evidences.length}</b> 个证据来源支持。综合置信度为 <b>{(selectedEntity.confidence * 100).toFixed(0)}%</b>。
            </div>
            
            {evidences.map((ev, i) => (
                <div key={i} className="bg-white border border-slate-200 p-3 rounded-lg shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                            {ev.type === 'Auto' && <Sparkles className="w-3.5 h-3.5 text-brand-500"/>}
                            {ev.type === 'Manual' && <User className="w-3.5 h-3.5 text-slate-500"/>}
                            {ev.type === 'Doc' && <FileText className="w-3.5 h-3.5 text-slate-500"/>}
                            {ev.source}
                        </span>
                        <span className="text-[10px] text-slate-400">{ev.time}</span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-2 rounded border border-slate-100 italic">
                        "{ev.content}"
                    </p>
                    <div className="mt-2 flex justify-end">
                         <button className="text-xs text-brand-600 hover:text-brand-800 font-medium hover:underline">查看源文件</button>
                    </div>
                </div>
            ))}
             <button className="w-full py-3 border border-dashed border-slate-300 rounded text-slate-400 text-xs hover:border-brand-400 hover:text-brand-600 transition-colors mt-4">
                  + 添加人工佐证 (文件/链接/备注)
             </button>
        </div>
    )
  };

  const renderChanges = () => {
    if (!selectedEntity) return <div className="p-10 text-slate-400 text-center italic flex flex-col items-center gap-2"><div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center"><GitBranch className="w-6 h-6 text-slate-300"/></div><p>请选择一个实体以查看变更历史</p></div>;

    return (
        <div className="h-[calc(100vh-180px)] overflow-y-auto p-4">
             {selectedEntity.status === EntityStatus.PUBLISHED ? (
                 <div className="flex flex-col items-center justify-center h-64 text-slate-500 gap-3 border border-dashed border-slate-200 rounded-lg bg-slate-50">
                     <CheckCircle className="w-10 h-10 text-emerald-400" />
                     <div className="text-center">
                        <p className="text-sm font-medium text-slate-700">当前版本已发布</p>
                        <p className="text-xs text-slate-400 mt-1">v2.3.1 - Released 2 days ago</p>
                     </div>
                     <button className="mt-2 text-xs bg-white border border-brand-200 text-brand-600 px-4 py-2 rounded shadow-sm hover:bg-brand-50 font-medium">
                        创建变更草案
                     </button>
                 </div>
             ) : (
                 <div className="space-y-6">
                    {/* Status Banner */}
                    <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-amber-900 text-sm flex items-start gap-3">
                        <GitBranch className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
                        <div>
                            <p className="font-bold">处于 {selectedEntity.status} 状态</p>
                            <p className="text-xs mt-1 text-amber-700/80">属于变更集: <span className="underline cursor-pointer">Q3 财务对齐 (ID: cs1)</span></p>
                        </div>
                    </div>

                    {/* Diff Viewer (Mock) */}
                    <div>
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3 flex items-center justify-between">
                            <span>变更对比 (Diff)</span>
                            <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded normal-case font-normal">v2.3.1 vs Draft</span>
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 px-1">
                                <div>Original</div>
                                <div>Draft</div>
                            </div>
                            <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100 shadow-sm overflow-hidden">
                                <div className="p-2.5 grid grid-cols-2 gap-2 hover:bg-slate-50">
                                    <div className="text-red-700 bg-red-50 line-through decoration-red-400 px-1.5 py-0.5 rounded w-fit text-xs">confidence: 0.65</div>
                                    <div className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded w-fit text-xs font-medium">confidence: 0.92</div>
                                </div>
                                <div className="p-2.5 grid grid-cols-2 gap-2 hover:bg-slate-50">
                                    <div className="text-slate-400 px-1.5 italic text-xs">null</div>
                                    <div className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded w-fit text-xs font-medium">+ tag: "Core"</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Impact Analysis */}
                    <div>
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">影响分析</h3>
                        <div className="space-y-2">
                             <div className="flex items-start gap-2 text-sm text-slate-600 bg-white p-2 rounded border border-slate-100">
                                 <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                 <span>可能影响 <b>2</b> 个下游报表 (Revenue_Q3, Tax_Report)</span>
                             </div>
                             <div className="flex items-start gap-2 text-sm text-slate-600 bg-white p-2 rounded border border-slate-100">
                                 <Activity className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                                 <span>需要重新运行 "Data Quality" 检查规则集</span>
                             </div>
                        </div>
                    </div>
                    
                    <button className="w-full bg-brand-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-brand-700 shadow-sm">
                        提交评审
                    </button>
                 </div>
             )}
        </div>
    )
  };

  const renderAgent = () => (
    <div className="flex flex-col h-[calc(100vh-110px)]">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatHistory.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-lg p-3 text-sm ${
                        msg.role === 'user' 
                        ? 'bg-brand-600 text-white rounded-br-none shadow-sm' 
                        : 'bg-white text-slate-800 rounded-bl-none border border-slate-200 shadow-sm'
                    }`}>
                        {msg.role === 'model' && <Sparkles className="w-3 h-3 text-amber-500 mb-1" />}
                        {msg.text}
                    </div>
                </div>
            ))}
            {isTyping && (
                <div className="flex justify-start">
                    <div className="bg-white border border-slate-200 rounded-lg p-3 rounded-bl-none shadow-sm">
                        <div className="flex space-x-1">
                            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
        
        {/* Suggested Actions */}
        <div className="px-4 pb-2">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <button onClick={() => setChatInput('检查潜在冲突')} className="whitespace-nowrap px-3 py-1 bg-brand-50 text-brand-600 rounded-full text-xs border border-brand-100 hover:bg-brand-100 transition-colors">
                    检查冲突
                </button>
                <button onClick={() => setChatInput('生成业务描述')} className="whitespace-nowrap px-3 py-1 bg-brand-50 text-brand-600 rounded-full text-xs border border-brand-100 hover:bg-brand-100 transition-colors">
                    自动生成描述
                </button>
                <button onClick={() => setChatInput('创建变更草案')} className="whitespace-nowrap px-3 py-1 bg-brand-50 text-brand-600 rounded-full text-xs border border-brand-100 hover:bg-brand-100 transition-colors">
                    创建变更草案
                </button>
            </div>
        </div>

        <div className="p-4 border-t border-slate-200 bg-white">
            <div className="relative">
                <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="让 Agent 协助编辑、分析或对齐..."
                    className="w-full pl-4 pr-10 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 shadow-sm"
                />
                <button onClick={handleSendMessage} className="absolute right-2 top-2 text-slate-400 hover:text-brand-600 p-1">
                    <Send className="w-4 h-4" />
                </button>
            </div>
            <div className="text-[10px] text-slate-400 mt-2 text-center flex items-center justify-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Agent 生成的所有更改将保存到变更集草稿中。
            </div>
        </div>
    </div>
  );

  return (
    <div className="w-96 bg-white border-l border-slate-200 h-full shadow-xl flex flex-col relative z-20">
      <div className="h-14 border-b border-slate-200 flex items-center justify-between px-4 bg-slate-50">
        <span className="font-semibold text-slate-700 flex items-center gap-2">
           {activeTab === 'agent' ? <Sparkles className="w-4 h-4 text-brand-500"/> : <FileText className="w-4 h-4"/>}
           {activeTab === 'agent' ? 'AI 驾驶舱' : '检查器'}
        </span>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
          <X className="w-5 h-5" />
        </button>
      </div>

      {renderTabs()}

      <div className="flex-1 overflow-hidden bg-slate-50/50">
        {activeTab === 'details' && renderDetails()}
        {activeTab === 'relations' && renderRelations()}
        {activeTab === 'evidence' && renderEvidence()}
        {activeTab === 'changes' && renderChanges()}
        {activeTab === 'agent' && renderAgent()}
      </div>
    </div>
  );
};

export default RightSideDock;