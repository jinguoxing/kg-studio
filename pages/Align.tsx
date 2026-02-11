import React, { useState, useEffect } from 'react';
import { mockCandidates, mockProcessTree, mockDataAssets } from '../services/mockData';
import { AlignmentCandidate, AlignmentStatus, ProcessNode, DataAssetNode } from '../types';
import { 
    GitMerge, ArrowRight, Check, X, Sparkles, FileText, Database, 
    ChevronRight, ChevronDown, Activity, PlayCircle, Table, Columns, Link as LinkIcon 
} from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

const Align: React.FC = () => {
  const { setDockOpen, setActiveDockTab } = useOutletContext<any>();
  
  // --- State ---
  const [candidates, setCandidates] = useState<AlignmentCandidate[]>(mockCandidates);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  
  // Manual Selection State
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set());

  // --- Helpers ---
  
  const toggleNode = (id: string) => {
      const newSet = new Set(collapsedNodes);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      setCollapsedNodes(newSet);
  };

  const getActiveCandidate = () => candidates.find(c => c.id === selectedCandidateId);

  // Determine if a node is highlighted
  const isSourceHighlighted = (id: string) => {
      if (selectedSourceId === id) return true;
      const active = getActiveCandidate();
      return active?.sourceId === id;
  };

  const isTargetHighlighted = (id: string) => {
      if (selectedTargetId === id) return true;
      const active = getActiveCandidate();
      return active?.targetId === id;
  };

  const isSourceDimmed = (id: string) => {
      // If we have a selection but this isn't it, dim it
      if (selectedSourceId && selectedSourceId !== id) return true;
      const active = getActiveCandidate();
      if (active && active.sourceId !== id) return true;
      return false;
  };

  const isTargetDimmed = (id: string) => {
      if (selectedTargetId && selectedTargetId !== id) return true;
      const active = getActiveCandidate();
      if (active && active.targetId !== id) return true;
      return false;
  };

  // --- Interactions ---

  const handleCandidateClick = (id: string) => {
      if (selectedCandidateId === id) {
          setSelectedCandidateId(null); // Deselect
      } else {
          setSelectedCandidateId(id);
          // Clear manual selections when picking a suggestion
          setSelectedSourceId(null);
          setSelectedTargetId(null);
      }
  };

  const handleSourceClick = (id: string) => {
      setSelectedSourceId(id === selectedSourceId ? null : id);
      setSelectedCandidateId(null); // Clear candidate selection when manually picking
  };

  const handleTargetClick = (id: string) => {
      setSelectedTargetId(id === selectedTargetId ? null : id);
      setSelectedCandidateId(null); // Clear candidate selection when manually picking
  };

  const handleAccept = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      setCandidates(prev => prev.map(c => c.id === id ? { ...c, status: AlignmentStatus.ACCEPTED } : c));
  };

  const handleReject = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      setCandidates(prev => prev.map(c => c.id === id ? { ...c, status: AlignmentStatus.REJECTED } : c));
  };

  const handleGenerate = () => {
    setDockOpen(true);
    setActiveDockTab('agent');
  };

  const handleManualLink = () => {
      if (!selectedSourceId || !selectedTargetId) return;
      
      const newCandidate: AlignmentCandidate = {
          id: `manual_${Date.now()}`,
          sourceId: selectedSourceId,
          sourceName: 'Manual Selection', // In real app, look up name
          targetId: selectedTargetId,
          targetName: 'Manual Selection', // In real app, look up name
          confidence: 1.0,
          matchReason: '人工手动创建对齐关联',
          status: AlignmentStatus.ACCEPTED
      };
      setCandidates([newCandidate, ...candidates]);
      setSelectedSourceId(null);
      setSelectedTargetId(null);
      setSelectedCandidateId(newCandidate.id);
  };

  // --- Renderers ---

  const renderProcessNode = (node: ProcessNode, level: number = 0) => {
      const isCollapsed = collapsedNodes.has(node.id);
      const highlighted = isSourceHighlighted(node.id);
      const dimmed = isSourceDimmed(node.id);
      const hasChildren = node.children && node.children.length > 0;

      return (
          <div key={node.id}>
              <div 
                  className={`flex items-center gap-2 py-1.5 px-2 rounded cursor-pointer text-sm transition-all border
                    ${highlighted ? 'bg-violet-100 border-violet-300 text-violet-900 shadow-sm ring-1 ring-violet-200' : 'border-transparent hover:bg-slate-100 text-slate-700'}
                    ${dimmed ? 'opacity-40' : 'opacity-100'}
                  `}
                  style={{ marginLeft: `${level * 16}px` }}
                  onClick={() => handleSourceClick(node.id)}
              >
                   <button 
                      onClick={(e) => { e.stopPropagation(); toggleNode(node.id); }}
                      className={`p-0.5 rounded hover:bg-black/5 ${!hasChildren ? 'invisible' : ''}`}
                   >
                       {isCollapsed ? <ChevronRight className="w-3 h-3 text-slate-400"/> : <ChevronDown className="w-3 h-3 text-slate-400"/>}
                   </button>
                   {node.type === 'Phase' && <Activity className="w-4 h-4 text-violet-500" />}
                   {node.type === 'Activity' && <PlayCircle className="w-4 h-4 text-slate-500" />}
                   {node.type === 'Step' && <FileText className="w-3.5 h-3.5 text-slate-400" />}
                   <span className="truncate">{node.name}</span>
              </div>
              {!isCollapsed && node.children && (
                  <div>
                      {node.children.map(child => renderProcessNode(child, level + 1))}
                  </div>
              )}
          </div>
      );
  };

  const renderDataNode = (node: DataAssetNode, level: number = 0) => {
      const isCollapsed = collapsedNodes.has(node.id);
      const highlighted = isTargetHighlighted(node.id);
      const dimmed = isTargetDimmed(node.id);
      const hasChildren = node.children && node.children.length > 0;

      return (
          <div key={node.id}>
              <div 
                  className={`flex items-center gap-2 py-1.5 px-2 rounded cursor-pointer text-sm transition-all border
                    ${highlighted ? 'bg-blue-100 border-blue-300 text-blue-900 shadow-sm ring-1 ring-blue-200' : 'border-transparent hover:bg-slate-100 text-slate-700'}
                    ${dimmed ? 'opacity-40' : 'opacity-100'}
                  `}
                  style={{ marginLeft: `${level * 16}px` }}
                  onClick={() => handleTargetClick(node.id)}
              >
                   <button 
                      onClick={(e) => { e.stopPropagation(); toggleNode(node.id); }}
                      className={`p-0.5 rounded hover:bg-black/5 ${!hasChildren ? 'invisible' : ''}`}
                   >
                       {isCollapsed ? <ChevronRight className="w-3 h-3 text-slate-400"/> : <ChevronDown className="w-3 h-3 text-slate-400"/>}
                   </button>
                   {node.type === 'Database' && <Database className="w-4 h-4 text-blue-500" />}
                   {node.type === 'Table' && <Table className="w-4 h-4 text-slate-500" />}
                   {node.type === 'Column' && <Columns className="w-3.5 h-3.5 text-slate-400" />}
                   <span className="truncate flex-1">{node.name}</span>
                   {node.dataType && <span className="text-[10px] text-slate-400 font-mono bg-slate-100 px-1 rounded">{node.dataType}</span>}
              </div>
              {!isCollapsed && node.children && (
                  <div>
                      {node.children.map(child => renderDataNode(child, level + 1))}
                  </div>
              )}
          </div>
      );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
                <GitMerge className="w-5 h-5 text-brand-600" />
                对齐中心
            </h2>
            <div className="h-6 w-px bg-slate-200"></div>
            <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 uppercase font-bold">Top-Down:</span>
                <select className="text-sm bg-slate-50 border-slate-200 rounded p-1">
                    <option>场景: 订单到现金</option>
                    <option>场景: 客户入职</option>
                </select>
            </div>
            <div className="text-slate-300"><ArrowRight className="w-4 h-4"/></div>
            <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 uppercase font-bold">Bottom-Up:</span>
                <select className="text-sm bg-slate-50 border-slate-200 rounded p-1">
                    <option>域: 财务数据</option>
                    <option>视图: CRM_Raw</option>
                </select>
            </div>
        </div>
        <div className="flex items-center gap-3">
            {selectedSourceId && selectedTargetId && (
                <button 
                    onClick={handleManualLink}
                    className="flex items-center gap-2 px-3 py-1.5 bg-brand-600 text-white rounded-md hover:bg-brand-700 transition-colors text-sm font-medium animate-in fade-in zoom-in"
                >
                    <LinkIcon className="w-4 h-4" />
                    建立关联
                </button>
            )}
            <button 
                onClick={handleGenerate}
                className="flex items-center gap-2 px-3 py-1.5 bg-brand-50 text-brand-700 rounded-md border border-brand-200 hover:bg-brand-100 transition-colors text-sm font-medium"
            >
                <Sparkles className="w-4 h-4" />
                自动生成建议
            </button>
        </div>
      </div>

      {/* Main 3-Col Layout */}
      <div className="flex-1 grid grid-cols-12 bg-slate-50 overflow-hidden">
        
        {/* Left: Top Down Source (Tree) */}
        <div className="col-span-3 bg-white border-r border-slate-200 flex flex-col">
            <div className="p-3 bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wide flex justify-between items-center">
                <span>业务流程视图</span>
                {selectedSourceId && <span className="text-[10px] bg-violet-100 text-violet-700 px-1.5 rounded">Selected</span>}
            </div>
            <div className="flex-1 overflow-y-auto p-2">
                {mockProcessTree.map(node => renderProcessNode(node))}
            </div>
        </div>

        {/* Middle: Alignment Matrix */}
        <div className="col-span-6 flex flex-col">
            <div className="p-4 border-b border-slate-200 bg-white shadow-sm z-10 flex justify-between items-center">
                <div>
                    <h3 className="text-sm font-semibold text-slate-700">对齐候选列表</h3>
                    <p className="text-xs text-slate-500">点击卡片查看两端关联，或手动选择两端进行连接。</p>
                </div>
                <div className="flex bg-slate-100 rounded p-1">
                    <button className="px-3 py-1 text-xs font-medium rounded bg-white shadow-sm text-slate-800">全部</button>
                    <button className="px-3 py-1 text-xs font-medium rounded text-slate-500 hover:text-slate-700">待处理</button>
                    <button className="px-3 py-1 text-xs font-medium rounded text-slate-500 hover:text-slate-700">已接受</button>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {candidates.map(candidate => {
                    const isActive = selectedCandidateId === candidate.id;
                    const isAccepted = candidate.status === AlignmentStatus.ACCEPTED;
                    const isRejected = candidate.status === AlignmentStatus.REJECTED;

                    if (isRejected && !isActive) return null; // Hide rejected unless active

                    return (
                        <div 
                            key={candidate.id} 
                            className={`bg-white rounded-lg border shadow-sm p-4 transition-all cursor-pointer relative overflow-hidden
                                ${isActive ? 'border-brand-500 ring-1 ring-brand-500 shadow-md' : 'border-slate-200 hover:border-brand-300'}
                                ${isAccepted ? 'bg-emerald-50/30' : ''}
                            `}
                            onClick={() => handleCandidateClick(candidate.id)}
                        >
                            {isAccepted && <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-emerald-100 to-transparent pointer-events-none"></div>}
                            
                            <div className="flex items-center justify-between mb-3 relative z-10">
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold 
                                        ${isAccepted ? 'bg-emerald-100 text-emerald-700' : 
                                          candidate.confidence > 0.8 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                        {isAccepted ? '已接受' : `${(candidate.confidence * 100).toFixed(0)}% 匹配`}
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    {!isAccepted && !isRejected && (
                                        <>
                                            <button 
                                                onClick={(e) => handleAccept(e, candidate.id)}
                                                className="p-1.5 rounded-full hover:bg-emerald-100 text-slate-400 hover:text-emerald-600 transition-colors" 
                                                title="接受"
                                            >
                                                <Check className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={(e) => handleReject(e, candidate.id)}
                                                className="p-1.5 rounded-full hover:bg-red-100 text-slate-400 hover:text-red-600 transition-colors" 
                                                title="拒绝"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </>
                                    )}
                                    {isAccepted && <Check className="w-5 h-5 text-emerald-500" />}
                                </div>
                            </div>

                            <div className="flex items-center gap-4 relative z-10">
                                <div className={`flex-1 p-3 rounded border transition-colors ${isActive ? 'bg-violet-50 border-violet-200' : 'bg-slate-50 border-slate-100'}`}>
                                    <div className={`text-[10px] uppercase font-bold mb-1 ${isActive ? 'text-violet-600' : 'text-slate-400'}`}>业务侧</div>
                                    <div className="text-sm font-medium text-slate-800">{candidate.sourceName}</div>
                                </div>
                                <div className={`text-slate-300 ${isActive ? 'text-brand-400' : ''}`}><GitMerge className="w-5 h-5" /></div>
                                <div className={`flex-1 p-3 rounded border transition-colors ${isActive ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-100'}`}>
                                    <div className={`text-[10px] uppercase font-bold mb-1 ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>数据侧</div>
                                    <div className="text-sm font-medium text-slate-800">{candidate.targetName}</div>
                                </div>
                            </div>

                            <div className="mt-3 flex items-start gap-2 text-xs text-slate-500 bg-white/50 p-2 rounded">
                                <Sparkles className="w-3 h-3 mt-0.5 text-brand-500 shrink-0" />
                                {candidate.matchReason}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>

        {/* Right: Bottom Up Source (Tree) */}
        <div className="col-span-3 bg-white border-l border-slate-200 flex flex-col">
            <div className="p-3 bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wide flex justify-between items-center">
                <span>数据资产视图</span>
                {selectedTargetId && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 rounded">Selected</span>}
            </div>
            <div className="flex-1 overflow-y-auto p-2">
                 {mockDataAssets.map(node => renderDataNode(node))}
            </div>
        </div>

      </div>
    </div>
  );
};

export default Align;