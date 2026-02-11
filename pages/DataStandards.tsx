
import React, { useState, useMemo } from 'react';
import { 
    mockStandardDirectory, mockDataElements, mockCodeTables, 
    mockCodingRules, mockStandardDocuments 
} from '../services/mockData';
import { 
    Book, Folder, Database, Hash, FileText, List, 
    Search, Plus, MoreHorizontal, ChevronRight, ChevronDown,
    Filter, Download, Eye, Tag, X, Save, Edit, Trash2, Check,
    HelpCircle, Upload, ArrowUp, ArrowDown, AlertCircle, Calendar, Sparkles, FolderPlus, FolderOpen, Lock, Key
} from 'lucide-react';
import { StandardDirectory, DataElement, CodeTable, CodingRule, StandardDocument } from '../types';

type ModuleType = 'elements' | 'directories' | 'codetables' | 'rules' | 'documents';

const DataStandards: React.FC = () => {
  const [activeModule, setActiveModule] = useState<ModuleType>('elements');
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set(['dir_1', 'dir_2']));

  // --- Data Element State ---
  const [elements, setElements] = useState<DataElement[]>(mockDataElements);
  const [elementSearch, setElementSearch] = useState('');
  const [isElModalOpen, setIsElModalOpen] = useState(false);
  const [editingElId, setEditingElId] = useState<string | null>(null);
  
  // Updated Form State to support new fields
  const [elForm, setElForm] = useState<Partial<DataElement>>({
      name: '', nameEn: '', code: '', 
      dataType: 'String', dataLength: 50, precision: 0, scale: 0,
      minValue: '', maxValue: '',
      isRequired: false, isUnique: false,
      relatedCodeTableId: '',
      directoryId: '', status: 'Draft', 
      description: '', businessRules: '', calculationFormula: ''
  });

  // --- Code Table State ---
  const [codeTables, setCodeTables] = useState<CodeTable[]>(mockCodeTables);
  const [ctSearch, setCtSearch] = useState('');
  const [isCtModalOpen, setIsCtModalOpen] = useState(false);
  const [editingCtId, setEditingCtId] = useState<string | null>(null);
  const [ctForm, setCtForm] = useState<Partial<CodeTable>>({
      name: '', code: '', description: '', status: 'Active', values: []
  });
  
  // Code Table Extra UI State
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');

  // --- Coding Rule State ---
  const [codingRules, setCodingRules] = useState<CodingRule[]>(mockCodingRules);
  const [ruleSearch, setRuleSearch] = useState('');
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [ruleForm, setRuleForm] = useState<Partial<CodingRule>>({
      name: '', code: '', template: '', example: '', status: 'Active', description: ''
  });

  // --- Standard Document State ---
  const [documents, setDocuments] = useState<StandardDocument[]>(mockStandardDocuments);
  const [docSearch, setDocSearch] = useState('');
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [docForm, setDocForm] = useState<Partial<StandardDocument>>({
      title: '', docNumber: '', type: 'Enterprise', fileType: 'PDF', status: 'Effective'
  });

  // --- Directory State ---
  const [directories, setDirectories] = useState<StandardDirectory[]>(mockStandardDirectory);
  const [isDirModalOpen, setIsDirModalOpen] = useState(false);
  const [dirForm, setDirForm] = useState<{id?: string, name: string, code: string, parentId: string | null}>({
      name: '', code: '', parentId: null
  });
  const [editingDirNode, setEditingDirNode] = useState<StandardDirectory | null>(null);

  // --- Helpers ---

  // Flatten directory tree for dropdown options
  const getDirectoryOptions = (nodes: StandardDirectory[], prefix = ''): {id: string, label: string}[] => {
      let options: {id: string, label: string}[] = [];
      nodes.forEach(node => {
          options.push({ id: node.id, label: prefix + node.name });
          if (node.children) {
              options = [...options, ...getDirectoryOptions(node.children, prefix + node.name + ' / ')];
          }
      });
      return options;
  };

  const directoryOptions = useMemo(() => getDirectoryOptions(directories), [directories]);

  // Tree Manipulation Helpers
  const addToTree = (nodes: StandardDirectory[], parentId: string | null, newNode: StandardDirectory): StandardDirectory[] => {
      if (!parentId) return [...nodes, newNode];
      return nodes.map(node => {
          if (node.id === parentId) {
              return { ...node, children: [...(node.children || []), newNode] };
          }
          if (node.children) {
              return { ...node, children: addToTree(node.children, parentId, newNode) };
          }
          return node;
      });
  };

  const updateTree = (nodes: StandardDirectory[], id: string, updateFn: (node: StandardDirectory) => StandardDirectory): StandardDirectory[] => {
      return nodes.map(node => {
          if (node.id === id) return updateFn(node);
          if (node.children) return { ...node, children: updateTree(node.children, id, updateFn) };
          return node;
      });
  };

  const deleteFromTree = (nodes: StandardDirectory[], id: string): StandardDirectory[] => {
      return nodes.filter(node => node.id !== id).map(node => ({
          ...node,
          children: node.children ? deleteFromTree(node.children, id) : undefined
      }));
  };

  // --- Data Element Handlers ---

  const handleOpenAddEl = () => {
      setEditingElId(null);
      setElForm({ 
          name: '', nameEn: '', code: '', 
          dataType: 'String', dataLength: 50, precision: 0, scale: 0,
          minValue: '', maxValue: '', isRequired: false, isUnique: false,
          directoryId: '', status: 'Draft', description: '', businessRules: '', calculationFormula: ''
      });
      setIsElModalOpen(true);
  };

  const handleOpenEditEl = (el: DataElement) => {
      setEditingElId(el.id);
      setElForm({ ...el });
      setIsElModalOpen(true);
  };

  const handleSaveEl = () => {
      if (!elForm.name || !elForm.code) return; // Simple validation

      if (editingElId) {
          // Update
          setElements(prev => prev.map(item => item.id === editingElId ? { ...item, ...elForm } as DataElement : item));
      } else {
          // Create
          const newEl: DataElement = {
              ...elForm as DataElement,
              id: `de_${Date.now()}`,
          };
          setElements(prev => [newEl, ...prev]);
      }
      setIsElModalOpen(false);
  };

  const handleDeleteEl = (id: string) => {
      if (confirm('确定要删除这个数据元吗？')) {
          setElements(prev => prev.filter(item => item.id !== id));
      }
  };

  // --- Code Table Handlers ---

  const handleOpenAddCt = () => {
      setEditingCtId(null);
      setCtForm({ name: '', code: '', description: '', status: 'Active', values: [{ code: '', label: '' }] });
      setShowImport(false);
      setImportText('');
      setIsCtModalOpen(true);
  };

  const handleOpenEditCt = (ct: CodeTable, e?: React.MouseEvent) => {
      e?.stopPropagation();
      setEditingCtId(ct.id);
      // Deep copy values to avoid reference issues
      setCtForm({ ...ct, values: ct.values ? ct.values.map(v => ({...v})) : [] });
      setShowImport(false);
      setImportText('');
      setIsCtModalOpen(true);
  };

  const handleImportValues = () => {
      if (!importText.trim()) return;
      const lines = importText.split('\n');
      const newItems: {code: string, label: string}[] = [];
      
      lines.forEach(line => {
          const trimmed = line.trim();
          if(!trimmed) return;
          
          // Regex to handle "CODE LABEL" or "CODE,LABEL" or "CODE:LABEL"
          // Match first occurrences of separator
          const separatorMatch = trimmed.match(/[,:\s\t]/);
          
          if (separatorMatch && separatorMatch.index !== undefined) {
              const code = trimmed.substring(0, separatorMatch.index).trim();
              const label = trimmed.substring(separatorMatch.index + 1).replace(/^[,:]/, '').trim();
              if (code && label) {
                  newItems.push({ code, label });
              }
          }
      });

      if (newItems.length > 0) {
          setCtForm(prev => ({
              ...prev,
              values: [...(prev.values || []), ...newItems]
          }));
          setImportText('');
          setShowImport(false);
      }
  };

  const handleMoveValue = (index: number, direction: 'up' | 'down') => {
      const values = [...(ctForm.values || [])];
      if (direction === 'up' && index > 0) {
          [values[index], values[index-1]] = [values[index-1], values[index]];
      } else if (direction === 'down' && index < values.length - 1) {
          [values[index], values[index+1]] = [values[index+1], values[index]];
      }
      setCtForm({...ctForm, values});
  };

  const handleSaveCt = () => {
      if (!ctForm.name || !ctForm.code) return;

      // Duplicate Check
      const codes = new Set();
      const hasDuplicates = ctForm.values?.some(v => {
          if (codes.has(v.code)) return true;
          codes.add(v.code);
          return false;
      });

      if (hasDuplicates) {
          alert("码值列表中存在重复的代码 (Code)，请修正后再保存。");
          return;
      }

      const newCt: CodeTable = {
          id: editingCtId || `ct_${Date.now()}`,
          name: ctForm.name!,
          code: ctForm.code!,
          description: ctForm.description,
          status: ctForm.status as 'Active' | 'Deprecated',
          values: ctForm.values || []
      };

      if (editingCtId) {
          setCodeTables(prev => prev.map(item => item.id === editingCtId ? newCt : item));
      } else {
          setCodeTables(prev => [newCt, ...prev]);
      }
      setIsCtModalOpen(false);
  };

  const handleDeleteCt = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (confirm('确定删除该码表吗？')) {
          setCodeTables(prev => prev.filter(c => c.id !== id));
      }
  };

  // --- Coding Rule Handlers ---

  const handleOpenAddRule = () => {
      setEditingRuleId(null);
      setRuleForm({ name: '', code: '', template: '', example: '', status: 'Active', description: '' });
      setIsRuleModalOpen(true);
  };

  const handleOpenEditRule = (rule: CodingRule, e?: React.MouseEvent) => {
      e?.stopPropagation();
      setEditingRuleId(rule.id);
      setRuleForm({ ...rule });
      setIsRuleModalOpen(true);
  };

  const handleAddTemplateTag = (tag: string) => {
      setRuleForm(prev => ({ ...prev, template: (prev.template || '') + tag }));
  };

  const handleGenerateExample = () => {
      if (!ruleForm.template) return;
      let result = ruleForm.template;
      const now = new Date();
      
      // Date substitutions
      result = result.replace(/{YYYY}/g, now.getFullYear().toString());
      result = result.replace(/{MM}/g, (now.getMonth() + 1).toString().padStart(2, '0'));
      result = result.replace(/{DD}/g, now.getDate().toString().padStart(2, '0'));
      
      // Sequence substitution {SEQ:n} -> 00...01
      result = result.replace(/{SEQ:(\d+)}/g, (match, width) => {
          return '1'.padStart(parseInt(width), '0');
      });
      
      // Random substitution {RAND:n} -> random digits
      result = result.replace(/{RAND:(\d+)}/g, (match, width) => {
          return Math.floor(Math.random() * Math.pow(10, parseInt(width))).toString().padStart(parseInt(width), '0');
      });

      setRuleForm(prev => ({ ...prev, example: result }));
  };

  const handleSaveRule = () => {
      if (!ruleForm.name || !ruleForm.code || !ruleForm.template) return;

      const newRule: CodingRule = {
          id: editingRuleId || `rule_${Date.now()}`,
          name: ruleForm.name!,
          code: ruleForm.code!,
          template: ruleForm.template!,
          example: ruleForm.example || '',
          description: ruleForm.description,
          status: ruleForm.status as 'Active' | 'Inactive'
      };

      if (editingRuleId) {
          setCodingRules(prev => prev.map(item => item.id === editingRuleId ? newRule : item));
      } else {
          setCodingRules(prev => [newRule, ...prev]);
      }
      setIsRuleModalOpen(false);
  };

  const handleDeleteRule = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (confirm('确定删除该编码规则吗？')) {
          setCodingRules(prev => prev.filter(c => c.id !== id));
      }
  };

  // --- Document Handlers ---
  const handleOpenAddDoc = () => {
      setEditingDocId(null);
      setDocForm({ title: '', docNumber: '', type: 'Enterprise', fileType: 'PDF', status: 'Effective' });
      setIsDocModalOpen(true);
  };

  const handleOpenEditDoc = (doc: StandardDocument) => {
      setEditingDocId(doc.id);
      setDocForm({ ...doc });
      setIsDocModalOpen(true);
  };

  const handleSaveDoc = () => {
      if (!docForm.title || !docForm.docNumber) return;

      const newDoc: StandardDocument = {
          id: editingDocId || `doc_${Date.now()}`,
          title: docForm.title!,
          docNumber: docForm.docNumber!,
          type: docForm.type as any,
          fileType: docForm.fileType as any,
          status: docForm.status as any,
          uploadDate: editingDocId ? (docForm.uploadDate || new Date().toISOString().split('T')[0]) : new Date().toISOString().split('T')[0]
      };

      if (editingDocId) {
          setDocuments(prev => prev.map(d => d.id === editingDocId ? newDoc : d));
      } else {
          setDocuments(prev => [newDoc, ...prev]);
      }
      setIsDocModalOpen(false);
  };

  const handleDeleteDoc = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (confirm('确定删除该标准文件吗？')) {
          setDocuments(prev => prev.filter(d => d.id !== id));
      }
  };

  // --- Directory Handlers ---

  const handleOpenAddDir = (parentId: string | null = null, e?: React.MouseEvent) => {
      e?.stopPropagation();
      setEditingDirNode(null);
      setDirForm({ name: '', code: '', parentId });
      setIsDirModalOpen(true);
      // Auto expand the parent if we are adding a child
      if (parentId) {
          setExpandedDirs(prev => new Set(prev).add(parentId));
      }
  };

  const handleOpenEditDir = (node: StandardDirectory, e?: React.MouseEvent) => {
      e?.stopPropagation();
      setEditingDirNode(node);
      setDirForm({ name: node.name, code: node.code, parentId: null }); 
      setIsDirModalOpen(true);
  };

  const handleSaveDir = () => {
      if (!dirForm.name || !dirForm.code) return;

      if (editingDirNode) {
          // Edit
          setDirectories(prev => updateTree(prev, editingDirNode.id, (node) => ({
              ...node,
              name: dirForm.name,
              code: dirForm.code
          })));
      } else {
          // Create
          const newDir: StandardDirectory = {
              id: `dir_${Date.now()}`,
              name: dirForm.name,
              code: dirForm.code,
              level: 0, // Level calculation skipped for simplification in MVP
              children: []
          };
          setDirectories(prev => addToTree(prev, dirForm.parentId, newDir));
      }
      setIsDirModalOpen(false);
  };

  const handleDeleteDir = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (confirm('确定删除该目录及其所有子目录吗？')) {
          setDirectories(prev => deleteFromTree(prev, id));
      }
  };


  // --- Renderers ---

  const ModuleNavItem = ({ id, icon: Icon, label }: { id: ModuleType, icon: any, label: string }) => (
      <button 
        onClick={() => setActiveModule(id)}
        className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-all ${
            activeModule === id 
            ? 'bg-brand-50 text-brand-700 border border-brand-100 font-medium' 
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
        }`}
      >
          <Icon className={`w-4 h-4 ${activeModule === id ? 'text-brand-600' : 'text-slate-400'}`} />
          {label}
      </button>
  );

  const renderDataElements = () => {
      const filteredElements = elements.filter(el => 
          el.name.toLowerCase().includes(elementSearch.toLowerCase()) || 
          el.code.toLowerCase().includes(elementSearch.toLowerCase())
      );

      return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-800">数据元管理</h2>
                <button 
                    onClick={handleOpenAddEl}
                    className="flex items-center gap-2 px-3 py-1.5 bg-brand-600 text-white rounded text-sm hover:bg-brand-700 shadow-sm transition-colors"
                >
                    <Plus className="w-4 h-4" /> 新建数据元
                </button>
            </div>
            
            <div className="flex gap-4 mb-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input 
                        value={elementSearch}
                        onChange={(e) => setElementSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" 
                        placeholder="搜索名称或编码..." 
                    />
                </div>
                <button className="px-3 py-2 border border-slate-200 rounded-md text-slate-600 hover:bg-slate-50 flex items-center gap-2 text-sm">
                    <Filter className="w-4 h-4" /> 筛选
                </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200 text-xs uppercase tracking-wide">
                        <tr>
                            <th className="px-6 py-3">中文名称</th>
                            <th className="px-6 py-3">英文名称</th>
                            <th className="px-6 py-3">标识符 (Code)</th>
                            <th className="px-6 py-3">类型</th>
                            <th className="px-6 py-3">约束</th>
                            <th className="px-6 py-3">状态</th>
                            <th className="px-6 py-3 w-24 text-center">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredElements.length > 0 ? (
                            filteredElements.map(de => (
                                <tr key={de.id} className="hover:bg-slate-50 group transition-colors">
                                    <td className="px-6 py-3 font-medium text-slate-700">
                                        {de.name}
                                        {de.description && <div className="text-[10px] text-slate-400 truncate max-w-[150px]">{de.description}</div>}
                                    </td>
                                    <td className="px-6 py-3 text-slate-500">{de.nameEn || '-'}</td>
                                    <td className="px-6 py-3 font-mono text-slate-500 text-xs">{de.code}</td>
                                    <td className="px-6 py-3">
                                        <div className="flex items-center gap-1">
                                            <span className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono text-slate-600 border border-slate-200">
                                                {de.dataType}
                                                {de.dataType === 'String' && de.dataLength ? `(${de.dataLength})` : ''}
                                                {de.dataType === 'Decimal' ? `(${de.precision},${de.scale})` : ''}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-3">
                                        <div className="flex items-center gap-2">
                                            {de.isRequired && <span className="text-[10px] bg-red-50 text-red-600 px-1 rounded border border-red-100" title="必填">Req</span>}
                                            {de.isUnique && <span className="text-[10px] bg-amber-50 text-amber-600 px-1 rounded border border-amber-100" title="唯一">Unq</span>}
                                            {!de.isRequired && !de.isUnique && <span className="text-slate-300 text-xs">-</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-3">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                                            de.status === 'Published' 
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                                            : de.status === 'Draft' 
                                                ? 'bg-amber-50 text-amber-700 border-amber-100' 
                                                : 'bg-slate-100 text-slate-500 border-slate-200'
                                        }`}>
                                            {de.status === 'Published' ? '已发布' : de.status === 'Draft' ? '草稿' : '已废弃'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 text-right">
                                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => handleOpenEditEl(de)}
                                                className="p-1 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded" 
                                                title="编辑"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteEl(de.id)}
                                                className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded" 
                                                title="删除"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                                    没有找到符合条件的数据元
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Data Element Modal - Updated with new sections */}
            {isElModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm">
                    <div className="bg-white rounded-lg shadow-xl w-[700px] border border-slate-200 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
                            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                                <Database className="w-5 h-5 text-brand-500" />
                                {editingElId ? '编辑数据元标准' : '新建数据元标准'}
                            </h3>
                            <button onClick={() => setIsElModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5"/>
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto flex-1 space-y-8">
                            
                            {/* Section 1: Basic Info */}
                            <div>
                                <h4 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4 flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-slate-400" /> 基础定义
                                </h4>
                                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">中文名称 <span className="text-red-500">*</span></label>
                                        <input 
                                            value={elForm.name}
                                            onChange={e => setElForm({...elForm, name: e.target.value})}
                                            className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500" 
                                            placeholder="e.g. 客户姓名"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">英文名称</label>
                                        <input 
                                            value={elForm.nameEn}
                                            onChange={e => setElForm({...elForm, nameEn: e.target.value})}
                                            className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500" 
                                            placeholder="e.g. Customer Name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">标识符 (Code) <span className="text-red-500">*</span></label>
                                        <input 
                                            value={elForm.code}
                                            onChange={e => setElForm({...elForm, code: e.target.value})}
                                            className="w-full border border-slate-300 rounded px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-brand-500 focus:border-brand-500" 
                                            placeholder="e.g. DE_CUST_NAME"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">所属目录</label>
                                        <select 
                                            value={elForm.directoryId}
                                            onChange={e => setElForm({...elForm, directoryId: e.target.value})}
                                            className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                                        >
                                            <option value="">选择目录...</option>
                                            {directoryOptions.map(opt => (
                                                <option key={opt.id} value={opt.id}>{opt.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">状态</label>
                                        <div className="flex gap-4 mt-2">
                                            {['Draft', 'Published', 'Deprecated'].map(status => (
                                                <label key={status} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                                                    <input 
                                                        type="radio" 
                                                        name="status"
                                                        checked={elForm.status === status}
                                                        onChange={() => setElForm({...elForm, status: status as any})}
                                                        className="text-brand-600 focus:ring-brand-500"
                                                    />
                                                    {status === 'Draft' ? '草稿' : status === 'Published' ? '已发布' : '已废弃'}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Data Attributes */}
                            <div>
                                <h4 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4 flex items-center gap-2">
                                    <Hash className="w-4 h-4 text-slate-400" /> 数据属性与约束
                                </h4>
                                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">数据类型 <span className="text-red-500">*</span></label>
                                        <select 
                                            value={elForm.dataType}
                                            onChange={e => setElForm({...elForm, dataType: e.target.value})}
                                            className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                                        >
                                            {['String', 'Integer', 'Decimal', 'Date', 'DateTime', 'Boolean', 'Binary', 'LargeText'].map(t => (
                                                <option key={t} value={t}>{t}</option>
                                            ))}
                                        </select>
                                    </div>
                                    
                                    {/* Conditional Inputs based on Type */}
                                    {(elForm.dataType === 'String' || elForm.dataType === 'LargeText' || elForm.dataType === 'Binary') && (
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-1">长度 (Length)</label>
                                            <input 
                                                type="number"
                                                value={elForm.dataLength || ''}
                                                onChange={e => setElForm({...elForm, dataLength: parseInt(e.target.value)})}
                                                className="w-full border border-slate-300 rounded px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-brand-500 focus:border-brand-500" 
                                            />
                                        </div>
                                    )}

                                    {elForm.dataType === 'Decimal' && (
                                        <>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 mb-1">精度 (Precision)</label>
                                                <input 
                                                    type="number"
                                                    value={elForm.precision || ''}
                                                    onChange={e => setElForm({...elForm, precision: parseInt(e.target.value)})}
                                                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-brand-500 focus:border-brand-500" 
                                                    placeholder="总位数"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 mb-1">小数位 (Scale)</label>
                                                <input 
                                                    type="number"
                                                    value={elForm.scale || ''}
                                                    onChange={e => setElForm({...elForm, scale: parseInt(e.target.value)})}
                                                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-brand-500 focus:border-brand-500" 
                                                    placeholder="小数位数"
                                                />
                                            </div>
                                        </>
                                    )}

                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">值域范围 (Min/Max)</label>
                                        <div className="flex items-center gap-2">
                                            <input 
                                                value={elForm.minValue || ''}
                                                onChange={e => setElForm({...elForm, minValue: e.target.value})}
                                                className="w-full border border-slate-300 rounded px-2 py-2 text-sm font-mono focus:ring-2 focus:ring-brand-500" 
                                                placeholder="Min"
                                            />
                                            <span className="text-slate-400">-</span>
                                            <input 
                                                value={elForm.maxValue || ''}
                                                onChange={e => setElForm({...elForm, maxValue: e.target.value})}
                                                className="w-full border border-slate-300 rounded px-2 py-2 text-sm font-mono focus:ring-2 focus:ring-brand-500" 
                                                placeholder="Max"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-2">约束控制</label>
                                        <div className="flex gap-4">
                                            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer p-2 border border-slate-200 rounded hover:bg-slate-50 transition-colors">
                                                <input 
                                                    type="checkbox" 
                                                    checked={elForm.isRequired}
                                                    onChange={e => setElForm({...elForm, isRequired: e.target.checked})}
                                                    className="rounded text-brand-600 focus:ring-brand-500"
                                                />
                                                <span className="flex items-center gap-1"><Lock className="w-3 h-3 text-slate-400"/> 必填 (Required)</span>
                                            </label>
                                            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer p-2 border border-slate-200 rounded hover:bg-slate-50 transition-colors">
                                                <input 
                                                    type="checkbox" 
                                                    checked={elForm.isUnique}
                                                    onChange={e => setElForm({...elForm, isUnique: e.target.checked})}
                                                    className="rounded text-brand-600 focus:ring-brand-500"
                                                />
                                                <span className="flex items-center gap-1"><Key className="w-3 h-3 text-slate-400"/> 唯一 (Unique)</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: Relations */}
                            <div>
                                <h4 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4 flex items-center gap-2">
                                    <List className="w-4 h-4 text-slate-400" /> 关联标准
                                </h4>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">关联码表 (Code Table)</label>
                                    <select 
                                        value={elForm.relatedCodeTableId || ''}
                                        onChange={e => setElForm({...elForm, relatedCodeTableId: e.target.value})}
                                        className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                                    >
                                        <option value="">无关联码表</option>
                                        {codeTables.map(ct => (
                                            <option key={ct.id} value={ct.id}>{ct.name} ({ct.code})</option>
                                        ))}
                                    </select>
                                    <p className="text-[10px] text-slate-400 mt-1">关联后，该数据元的取值范围将受限于码表定义。</p>
                                </div>
                            </div>

                            {/* Section 4: Business Logic */}
                            <div>
                                <h4 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-slate-400" /> 业务语义与规则
                                </h4>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">业务含义 (Description)</label>
                                        <textarea 
                                            value={elForm.description}
                                            onChange={e => setElForm({...elForm, description: e.target.value})}
                                            className="w-full border border-slate-300 rounded px-3 py-2 text-sm h-16 resize-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500" 
                                            placeholder="数据元的业务定义、来源或用途说明..."
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-1">业务规则 (Business Rules)</label>
                                            <textarea 
                                                value={elForm.businessRules || ''}
                                                onChange={e => setElForm({...elForm, businessRules: e.target.value})}
                                                className="w-full border border-slate-300 rounded px-3 py-2 text-sm h-20 resize-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500" 
                                                placeholder="e.g. 必须大于0；仅限工作日填写"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-1">计算逻辑 (Calculation)</label>
                                            <textarea 
                                                value={elForm.calculationFormula || ''}
                                                onChange={e => setElForm({...elForm, calculationFormula: e.target.value})}
                                                className="w-full border border-slate-300 rounded px-3 py-2 text-sm h-20 resize-none font-mono text-slate-600 focus:ring-2 focus:ring-brand-500 focus:border-brand-500" 
                                                placeholder="e.g. price * quantity"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>

                        <div className="p-6 border-t border-slate-100 flex justify-end gap-2 shrink-0 bg-slate-50 rounded-b-lg">
                            <button onClick={() => setIsElModalOpen(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded font-medium">取消</button>
                            <button onClick={handleSaveEl} className="px-4 py-2 text-sm bg-brand-600 text-white rounded hover:bg-brand-700 font-medium shadow-sm flex items-center gap-2">
                                <Save className="w-4 h-4" /> 保存
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
      );
  };

  const renderCodeTables = () => {
      const filteredCts = codeTables.filter(ct => 
          ct.name.toLowerCase().includes(ctSearch.toLowerCase()) ||
          ct.code.toLowerCase().includes(ctSearch.toLowerCase())
      );
      
      return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-800">码表管理</h2>
                <button 
                    onClick={handleOpenAddCt}
                    className="flex items-center gap-2 px-3 py-1.5 bg-brand-600 text-white rounded text-sm hover:bg-brand-700 shadow-sm transition-colors"
                >
                    <Plus className="w-4 h-4" /> 新建码表
                </button>
            </div>

            <div className="flex gap-4 mb-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input 
                        value={ctSearch}
                        onChange={(e) => setCtSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" 
                        placeholder="搜索码表名称或编码..." 
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCts.map(ct => (
                    <div 
                        key={ct.id} 
                        onClick={() => handleOpenEditCt(ct)}
                        className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all group cursor-pointer relative hover:border-brand-300"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                                <List className="w-4 h-4 text-brand-500" />
                                <h3 className="font-bold text-slate-700">{ct.name}</h3>
                            </div>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                                ct.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200'
                            }`}>{ct.status === 'Active' ? '有效' : '废弃'}</span>
                        </div>
                        <div className="text-xs text-slate-400 font-mono mb-3">{ct.code}</div>
                        <p className="text-xs text-slate-500 mb-4 line-clamp-2 h-8">{ct.description || '暂无描述'}</p>
                        
                        <div className="bg-slate-50 rounded p-2 space-y-1 mb-2">
                            {(ct.values || []).slice(0, 3).map((v, i) => (
                                <div key={i} className="flex justify-between text-xs">
                                    <span className="font-mono text-slate-500">{v.code}</span>
                                    <span className="text-slate-700">{v.label}</span>
                                </div>
                            ))}
                            {(ct.values || []).length > 3 && (
                                <div className="text-[10px] text-center text-slate-400 italic pt-1">
                                    + {(ct.values || []).length - 3} more values...
                                </div>
                            )}
                            {(ct.values || []).length === 0 && (
                                <div className="text-[10px] text-center text-slate-400 italic">暂无码值</div>
                            )}
                        </div>

                        {/* Hover Actions */}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-white/80 backdrop-blur-sm rounded border border-slate-100">
                             <button 
                                onClick={(e) => handleOpenEditCt(ct, e)}
                                className="p-1.5 text-slate-400 hover:text-brand-600 rounded hover:bg-slate-100"
                             >
                                 <Edit className="w-4 h-4" />
                             </button>
                             <button 
                                onClick={(e) => handleDeleteCt(ct.id, e)}
                                className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-slate-100"
                             >
                                 <Trash2 className="w-4 h-4" />
                             </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal for Code Table */}
            {isCtModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm">
                    <div className="bg-white rounded-lg shadow-xl w-[600px] border border-slate-200 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
                             <h3 className="font-bold text-lg text-slate-800">
                                 {editingCtId ? '编辑码表' : '新建码表'}
                             </h3>
                             <button onClick={() => setIsCtModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                 <X className="w-5 h-5"/>
                             </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto flex-1 space-y-6">
                             {/* Basic Info */}
                             <div className="grid grid-cols-2 gap-4">
                                 <div>
                                     <label className="block text-xs font-bold text-slate-500 mb-1">码表名称 <span className="text-red-500">*</span></label>
                                     <input 
                                         value={ctForm.name}
                                         onChange={e => setCtForm({...ctForm, name: e.target.value})}
                                         className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500" 
                                         placeholder="e.g. 性别代码"
                                     />
                                 </div>
                                 <div>
                                     <label className="block text-xs font-bold text-slate-500 mb-1">标识符 (Code) <span className="text-red-500">*</span></label>
                                     <input 
                                         value={ctForm.code}
                                         onChange={e => setCtForm({...ctForm, code: e.target.value})}
                                         className="w-full border border-slate-300 rounded px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-brand-500" 
                                         placeholder="e.g. CT_GENDER"
                                     />
                                 </div>
                             </div>

                             <div>
                                 <label className="block text-xs font-bold text-slate-500 mb-1">状态</label>
                                 <div className="flex gap-4">
                                     {['Active', 'Deprecated'].map(s => (
                                         <label key={s} className="flex items-center gap-2 text-sm cursor-pointer">
                                             <input 
                                                type="radio" 
                                                name="ctStatus"
                                                checked={ctForm.status === s}
                                                onChange={() => setCtForm({...ctForm, status: s as any})}
                                                className="text-brand-600 focus:ring-brand-500"
                                             />
                                             {s === 'Active' ? '有效' : '已废弃'}
                                         </label>
                                     ))}
                                 </div>
                             </div>

                             <div>
                                 <label className="block text-xs font-bold text-slate-500 mb-1">描述</label>
                                 <textarea 
                                     value={ctForm.description}
                                     onChange={e => setCtForm({...ctForm, description: e.target.value})}
                                     className="w-full border border-slate-300 rounded px-3 py-2 text-sm h-16 resize-none focus:ring-2 focus:ring-brand-500" 
                                     placeholder="码表用途说明..."
                                 />
                             </div>

                             {/* Values Editor */}
                             <div>
                                 <div className="flex justify-between items-center mb-2">
                                     <div className="flex items-center gap-2">
                                         <label className="block text-xs font-bold text-slate-500">码值列表</label>
                                         <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">{ctForm.values?.length || 0} 个</span>
                                     </div>
                                     <div className="flex gap-2">
                                        <button 
                                            onClick={() => setShowImport(!showImport)}
                                            className="text-xs text-slate-500 hover:text-brand-600 font-medium flex items-center gap-1 bg-white border border-slate-200 px-2 py-1 rounded hover:bg-slate-50"
                                        >
                                            <Upload className="w-3 h-3" /> 批量导入
                                        </button>
                                        <button 
                                            onClick={() => setCtForm({...ctForm, values: [...(ctForm.values||[]), {code: '', label: ''}]})}
                                            className="text-xs text-white bg-brand-600 hover:bg-brand-700 px-2 py-1 rounded font-medium flex items-center gap-1 shadow-sm"
                                        >
                                            <Plus className="w-3 h-3" /> 添加码值
                                        </button>
                                     </div>
                                 </div>
                                 
                                 {showImport && (
                                     <div className="mb-3 p-3 bg-slate-50 border border-brand-200 rounded-lg animate-in fade-in slide-in-from-top-2">
                                         <div className="flex justify-between items-start mb-2">
                                             <div className="text-xs font-bold text-brand-700 flex items-center gap-1">
                                                 <Upload className="w-3 h-3" /> 批量粘贴 (每行一个)
                                             </div>
                                             <button onClick={() => setShowImport(false)} className="text-slate-400 hover:text-slate-600"><X className="w-3 h-3"/></button>
                                         </div>
                                         <textarea 
                                            className="w-full h-24 text-xs font-mono border border-slate-300 rounded p-2 focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
                                            placeholder={`示例:\n01 男\n02 女\n\n或:\nM, Male\nF, Female`}
                                            value={importText}
                                            onChange={e => setImportText(e.target.value)}
                                         />
                                         <div className="flex justify-end mt-2">
                                             <button 
                                                onClick={handleImportValues}
                                                className="px-3 py-1 bg-brand-600 text-white text-xs rounded hover:bg-brand-700 font-medium"
                                             >
                                                 解析并追加
                                             </button>
                                         </div>
                                     </div>
                                 )}

                                 <div className="bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
                                     <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-slate-100 border-b border-slate-200 text-xs font-bold text-slate-500">
                                         <div className="col-span-1 text-center">#</div>
                                         <div className="col-span-3">代码 (Value)</div>
                                         <div className="col-span-6">名称 (Label)</div>
                                         <div className="col-span-2 text-center">操作</div>
                                     </div>
                                     <div className="max-h-60 overflow-y-auto divide-y divide-slate-100">
                                         {(ctForm.values || []).map((val, idx) => (
                                             <div key={idx} className="grid grid-cols-12 gap-2 px-3 py-2 items-center group bg-white hover:bg-slate-50">
                                                 <div className="col-span-1 text-center text-xs text-slate-400 font-mono">
                                                     {idx + 1}
                                                 </div>
                                                 <div className="col-span-3">
                                                     <input 
                                                        value={val.code}
                                                        onChange={(e) => {
                                                            const newVals = [...(ctForm.values||[])];
                                                            newVals[idx].code = e.target.value;
                                                            setCtForm({...ctForm, values: newVals});
                                                        }}
                                                        className="w-full border border-slate-300 rounded px-2 py-1 text-xs font-mono focus:ring-1 focus:ring-brand-500"
                                                        placeholder="Code"
                                                     />
                                                 </div>
                                                 <div className="col-span-6">
                                                     <input 
                                                        value={val.label}
                                                        onChange={(e) => {
                                                            const newVals = [...(ctForm.values||[])];
                                                            newVals[idx].label = e.target.value;
                                                            setCtForm({...ctForm, values: newVals});
                                                        }}
                                                        className="w-full border border-slate-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-brand-500"
                                                        placeholder="Label"
                                                     />
                                                 </div>
                                                 <div className="col-span-2 flex justify-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                                     <button 
                                                        onClick={() => handleMoveValue(idx, 'up')}
                                                        disabled={idx === 0}
                                                        className="p-1 text-slate-400 hover:text-brand-600 disabled:opacity-30 disabled:hover:text-slate-400"
                                                        title="上移"
                                                     >
                                                         <ArrowUp className="w-3 h-3" />
                                                     </button>
                                                     <button 
                                                        onClick={() => handleMoveValue(idx, 'down')}
                                                        disabled={idx === (ctForm.values?.length || 0) - 1}
                                                        className="p-1 text-slate-400 hover:text-brand-600 disabled:opacity-30 disabled:hover:text-slate-400"
                                                        title="下移"
                                                     >
                                                         <ArrowDown className="w-3 h-3" />
                                                     </button>
                                                     <button 
                                                        onClick={() => {
                                                            const newVals = (ctForm.values||[]).filter((_, i) => i !== idx);
                                                            setCtForm({...ctForm, values: newVals});
                                                        }}
                                                        className="p-1 text-slate-300 hover:text-red-500 ml-1"
                                                        title="删除"
                                                     >
                                                         <X className="w-3.5 h-3.5" />
                                                     </button>
                                                 </div>
                                             </div>
                                         ))}
                                         {(ctForm.values || []).length === 0 && (
                                             <div className="p-8 text-center text-xs text-slate-400 italic flex flex-col items-center gap-2">
                                                 <List className="w-8 h-8 text-slate-200" />
                                                 <span>暂无码值，请点击右上角添加或导入</span>
                                             </div>
                                         )}
                                     </div>
                                 </div>
                                 {/* Duplicate Warning */}
                                 {(() => {
                                     const codes = new Set();
                                     const hasDuplicates = ctForm.values?.some(v => {
                                         if(v.code && codes.has(v.code)) return true;
                                         if(v.code) codes.add(v.code);
                                         return false;
                                     });
                                     if(hasDuplicates) return (
                                         <div className="mt-2 text-xs text-red-600 flex items-center gap-1">
                                             <AlertCircle className="w-3 h-3" /> 检测到重复的代码 (Code)，请修正。
                                         </div>
                                     )
                                 })()}
                             </div>
                        </div>

                        <div className="p-6 border-t border-slate-100 flex justify-end gap-2 shrink-0 bg-slate-50 rounded-b-lg">
                            <button onClick={() => setIsCtModalOpen(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded">取消</button>
                            <button onClick={handleSaveCt} className="px-4 py-2 text-sm bg-brand-600 text-white rounded hover:bg-brand-700 font-medium shadow-sm flex items-center gap-2">
                                <Save className="w-4 h-4" /> 保存
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
      );
  };

  const renderCodingRules = () => {
      const filteredRules = codingRules.filter(rule => 
          rule.name.toLowerCase().includes(ruleSearch.toLowerCase()) || 
          rule.code.toLowerCase().includes(ruleSearch.toLowerCase())
      );

      return (
      <div className="space-y-4">
          <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">编码规则</h2>
              <button 
                onClick={handleOpenAddRule}
                className="flex items-center gap-2 px-3 py-1.5 bg-brand-600 text-white rounded text-sm hover:bg-brand-700 shadow-sm transition-colors"
              >
                  <Plus className="w-4 h-4" /> 新建规则
              </button>
          </div>

          <div className="flex gap-4 mb-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input 
                        value={ruleSearch}
                        onChange={(e) => setRuleSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" 
                        placeholder="搜索规则名称或编码..." 
                    />
                </div>
            </div>

          <div className="space-y-3">
              {filteredRules.map(rule => (
                  <div 
                    key={rule.id} 
                    onClick={() => handleOpenEditRule(rule)}
                    className="bg-white p-4 rounded-lg border border-slate-200 flex items-center justify-between shadow-sm hover:shadow-md hover:border-brand-300 transition-all cursor-pointer group"
                  >
                      <div>
                          <div className="flex items-center gap-3">
                              <h3 className="font-bold text-slate-700 text-sm">{rule.name}</h3>
                              <span className="text-xs text-slate-400 font-mono">{rule.code}</span>
                              {rule.status === 'Inactive' && <span className="text-[10px] bg-slate-100 text-slate-500 px-1 rounded">已停用</span>}
                              {rule.status === 'Active' && <span className="text-[10px] bg-emerald-50 text-emerald-600 px-1 rounded">生效中</span>}
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                              <code className="text-xs bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-brand-700 font-mono">
                                  {rule.template}
                              </code>
                              <span className="text-xs text-slate-400">→ 示例: {rule.example}</span>
                          </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                                onClick={(e) => handleOpenEditRule(rule, e)}
                                className="p-1.5 text-slate-400 hover:text-brand-600 rounded hover:bg-slate-100"
                             >
                                 <Edit className="w-4 h-4" />
                             </button>
                             <button 
                                onClick={(e) => handleDeleteRule(rule.id, e)}
                                className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-slate-100"
                             >
                                 <Trash2 className="w-4 h-4" />
                             </button>
                      </div>
                  </div>
              ))}
              {filteredRules.length === 0 && (
                  <div className="text-center py-8 text-slate-400 text-sm bg-white border border-slate-200 rounded-lg border-dashed">
                      没有找到匹配的编码规则
                  </div>
              )}
          </div>

          {/* Modal for Coding Rules */}
          {isRuleModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm">
                    <div className="bg-white rounded-lg shadow-xl w-[550px] border border-slate-200 p-6 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-5">
                            <h3 className="font-bold text-lg text-slate-800">
                                {editingRuleId ? '编辑编码规则' : '新建编码规则'}
                            </h3>
                            <button onClick={() => setIsRuleModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5"/>
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">规则名称 <span className="text-red-500">*</span></label>
                                    <input 
                                        value={ruleForm.name}
                                        onChange={e => setRuleForm({...ruleForm, name: e.target.value})}
                                        className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500" 
                                        placeholder="e.g. 订单号生成"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">规则编码 <span className="text-red-500">*</span></label>
                                    <input 
                                        value={ruleForm.code}
                                        onChange={e => setRuleForm({...ruleForm, code: e.target.value})}
                                        className="w-full border border-slate-300 rounded px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-brand-500" 
                                        placeholder="e.g. RULE_ORDER_NO"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-2">生成模板 <span className="text-red-500">*</span></label>
                                
                                {/* Template Helper Buttons */}
                                <div className="flex flex-wrap gap-2 mb-2">
                                    <button onClick={() => handleAddTemplateTag('{YYYY}')} className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-xs font-mono border border-slate-200 transition-colors flex items-center gap-1">
                                        <Calendar className="w-3 h-3"/> 年 {`{YYYY}`}
                                    </button>
                                    <button onClick={() => handleAddTemplateTag('{MM}')} className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-xs font-mono border border-slate-200 transition-colors flex items-center gap-1">
                                        <Calendar className="w-3 h-3"/> 月 {`{MM}`}
                                    </button>
                                    <button onClick={() => handleAddTemplateTag('{DD}')} className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-xs font-mono border border-slate-200 transition-colors flex items-center gap-1">
                                        <Calendar className="w-3 h-3"/> 日 {`{DD}`}
                                    </button>
                                    <button onClick={() => handleAddTemplateTag('{SEQ:6}')} className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-xs font-mono border border-slate-200 transition-colors flex items-center gap-1">
                                        <Hash className="w-3 h-3"/> 流水号 {`{SEQ:6}`}
                                    </button>
                                    <button onClick={() => handleAddTemplateTag('{RAND:4}')} className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-xs font-mono border border-slate-200 transition-colors flex items-center gap-1">
                                        <Sparkles className="w-3 h-3"/> 随机 {`{RAND:4}`}
                                    </button>
                                </div>

                                <input 
                                    value={ruleForm.template}
                                    onChange={e => setRuleForm({...ruleForm, template: e.target.value})}
                                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-brand-500" 
                                    placeholder="e.g. ORD-{YYYY}{MM}-{SEQ:6}"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1 flex justify-between items-center">
                                    <span>生成预览</span>
                                    <button 
                                        onClick={handleGenerateExample}
                                        className="text-xs text-brand-600 hover:text-brand-700 flex items-center gap-1 font-medium"
                                    >
                                        <Sparkles className="w-3 h-3"/> 自动生成
                                    </button>
                                </label>
                                <div className="relative">
                                    <input 
                                        value={ruleForm.example}
                                        onChange={e => setRuleForm({...ruleForm, example: e.target.value})}
                                        className="w-full border border-slate-300 bg-slate-50 rounded px-3 py-2 text-sm font-mono text-slate-600 focus:ring-2 focus:ring-brand-500" 
                                        placeholder="点击右上方自动生成预览..."
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">状态</label>
                                <div className="flex gap-4 mt-1">
                                    {['Active', 'Inactive'].map(status => (
                                        <label key={status} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                                            <input 
                                                type="radio" 
                                                name="ruleStatus"
                                                checked={ruleForm.status === status}
                                                onChange={() => setRuleForm({...ruleForm, status: status as any})}
                                                className="text-brand-600 focus:ring-brand-500"
                                            />
                                            {status === 'Active' ? '生效中' : '已停用'}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">描述</label>
                                <textarea 
                                    value={ruleForm.description}
                                    onChange={e => setRuleForm({...ruleForm, description: e.target.value})}
                                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm h-20 resize-none focus:ring-2 focus:ring-brand-500" 
                                    placeholder="规则用途、重置周期等说明..."
                                />
                            </div>

                            <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-slate-100">
                                <button onClick={() => setIsRuleModalOpen(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded font-medium">取消</button>
                                <button onClick={handleSaveRule} className="px-4 py-2 text-sm bg-brand-600 text-white rounded hover:bg-brand-700 font-medium shadow-sm flex items-center gap-2">
                                    <Save className="w-4 h-4" /> 保存
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
      </div>
      );
  };

  const renderDocuments = () => {
      const filteredDocs = documents.filter(doc => 
          doc.title.toLowerCase().includes(docSearch.toLowerCase()) || 
          doc.docNumber.toLowerCase().includes(docSearch.toLowerCase())
      );

      return (
          <div className="space-y-4">
              <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold text-slate-800">标准文件库</h2>
                  <button 
                    onClick={handleOpenAddDoc}
                    className="flex items-center gap-2 px-3 py-1.5 bg-brand-600 text-white rounded text-sm hover:bg-brand-700 shadow-sm transition-colors"
                  >
                      <Upload className="w-4 h-4" /> 上传文件
                  </button>
              </div>

              <div className="flex gap-4 mb-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input 
                        value={docSearch}
                        onChange={(e) => setDocSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" 
                        placeholder="搜索文件标题或文号..." 
                    />
                </div>
            </div>

              <div className="grid grid-cols-1 gap-3">
                  {filteredDocs.map(doc => (
                      <div 
                        key={doc.id} 
                        onClick={() => handleOpenEditDoc(doc)}
                        className="bg-white p-4 rounded-lg border border-slate-200 flex items-center gap-4 hover:border-brand-300 transition-colors cursor-pointer group"
                      >
                          <div className={`w-10 h-10 rounded flex items-center justify-center shrink-0 ${
                              doc.fileType === 'PDF' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'
                          }`}>
                              <FileText className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-slate-700 text-sm truncate">{doc.title}</h3>
                              <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                                  <span className="font-mono bg-slate-100 px-1 rounded border border-slate-200">{doc.docNumber}</span>
                                  <span className={`px-1.5 rounded ${
                                      doc.type === 'National' ? 'bg-amber-50 text-amber-700' : 
                                      doc.type === 'Industry' ? 'bg-indigo-50 text-indigo-700' : 
                                      'bg-brand-50 text-brand-700'
                                  }`}>
                                      {doc.type === 'National' ? '国家标准' : doc.type === 'Industry' ? '行业标准' : '企业标准'}
                                  </span>
                                  <span>{doc.uploadDate}</span>
                              </div>
                          </div>
                          <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded text-xs border ${doc.status === 'Effective' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                                  {doc.status === 'Effective' ? '现行' : '废止'}
                              </span>
                              
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button 
                                      className="p-2 text-slate-400 hover:text-brand-600 hover:bg-slate-50 rounded"
                                      title="下载"
                                      onClick={(e) => e.stopPropagation()}
                                  >
                                      <Download className="w-4 h-4" />
                                  </button>
                                  <button 
                                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                                      title="删除"
                                      onClick={(e) => handleDeleteDoc(doc.id, e)}
                                  >
                                      <Trash2 className="w-4 h-4" />
                                  </button>
                              </div>
                          </div>
                      </div>
                  ))}
                  {filteredDocs.length === 0 && (
                      <div className="text-center py-8 text-slate-400 text-sm bg-white border border-slate-200 rounded-lg border-dashed">
                          没有找到匹配的文件
                      </div>
                  )}
              </div>

              {/* Modal for Documents */}
              {isDocModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm">
                    <div className="bg-white rounded-lg shadow-xl w-[500px] border border-slate-200 p-6 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-5">
                            <h3 className="font-bold text-lg text-slate-800">
                                {editingDocId ? '编辑标准文件' : '上传标准文件'}
                            </h3>
                            <button onClick={() => setIsDocModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5"/>
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">文件标题 <span className="text-red-500">*</span></label>
                                <input 
                                    value={docForm.title}
                                    onChange={e => setDocForm({...docForm, title: e.target.value})}
                                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500" 
                                    placeholder="e.g. 企业数据分类分级管理办法"
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">标准文号 <span className="text-red-500">*</span></label>
                                    <input 
                                        value={docForm.docNumber}
                                        onChange={e => setDocForm({...docForm, docNumber: e.target.value})}
                                        className="w-full border border-slate-300 rounded px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-brand-500" 
                                        placeholder="e.g. Q/ENT 1001-2023"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">标准类型</label>
                                    <select 
                                        value={docForm.type}
                                        onChange={e => setDocForm({...docForm, type: e.target.value as any})}
                                        className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500"
                                    >
                                        <option value="Enterprise">企业标准</option>
                                        <option value="Industry">行业标准</option>
                                        <option value="National">国家标准</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">文件格式</label>
                                    <div className="flex gap-4 mt-1.5">
                                        {['PDF', 'DOCX'].map(ft => (
                                            <label key={ft} className="flex items-center gap-2 text-sm cursor-pointer">
                                                <input 
                                                    type="radio"
                                                    name="fileType" 
                                                    checked={docForm.fileType === ft}
                                                    onChange={() => setDocForm({...docForm, fileType: ft as any})}
                                                    className="text-brand-600 focus:ring-brand-500"
                                                />
                                                {ft}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">状态</label>
                                    <select 
                                        value={docForm.status}
                                        onChange={e => setDocForm({...docForm, status: e.target.value as any})}
                                        className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500"
                                    >
                                        <option value="Effective">现行有效</option>
                                        <option value="Deprecated">已废止</option>
                                    </select>
                                </div>
                            </div>
                            
                            {!editingDocId && (
                                <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 flex flex-col items-center justify-center bg-slate-50 text-slate-400">
                                    <Upload className="w-8 h-8 mb-2 text-slate-300" />
                                    <span className="text-xs">点击或拖拽文件至此上传</span>
                                    <span className="text-[10px] mt-1">(模拟上传，仅保存元数据)</span>
                                </div>
                            )}

                            <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-slate-100">
                                <button onClick={() => setIsDocModalOpen(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded font-medium">取消</button>
                                <button onClick={handleSaveDoc} className="px-4 py-2 text-sm bg-brand-600 text-white rounded hover:bg-brand-700 font-medium shadow-sm flex items-center gap-2">
                                    <Save className="w-4 h-4" /> 保存
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
              )}
          </div>
      );
  }

  const renderDirectories = () => {
      const toggleDir = (id: string) => {
          const newSet = new Set(expandedDirs);
          if (newSet.has(id)) newSet.delete(id);
          else newSet.add(id);
          setExpandedDirs(newSet);
      };

      const handleOpenAddDir = (parentId: string | null = null, e?: React.MouseEvent) => {
          e?.stopPropagation();
          setEditingDirNode(null);
          setDirForm({ name: '', code: '', parentId });
          setIsDirModalOpen(true);
          if (parentId) {
              setExpandedDirs(prev => new Set(prev).add(parentId));
          }
      };

      const handleOpenEditDir = (node: StandardDirectory, e?: React.MouseEvent) => {
          e?.stopPropagation();
          setEditingDirNode(node);
          setDirForm({ name: node.name, code: node.code, parentId: null });
          setIsDirModalOpen(true);
      };

      const handleSaveDir = () => {
          if (!dirForm.name || !dirForm.code) return;

          if (editingDirNode) {
              setDirectories(prev => updateTree(prev, editingDirNode.id, (node) => ({
                  ...node,
                  name: dirForm.name,
                  code: dirForm.code
              })));
          } else {
              const newDir: StandardDirectory = {
                  id: `dir_${Date.now()}`,
                  name: dirForm.name,
                  code: dirForm.code,
                  level: 0,
                  children: []
              };
              setDirectories(prev => addToTree(prev, dirForm.parentId, newDir));
          }
          setIsDirModalOpen(false);
      };

      const handleDeleteDir = (id: string, e: React.MouseEvent) => {
          e.stopPropagation();
          if (confirm('确定删除该目录及其所有子目录吗？')) {
              setDirectories(prev => deleteFromTree(prev, id));
          }
      };

      const renderTree = (nodes: StandardDirectory[]) => (
          <div className="space-y-1">
              {nodes.map(node => (
                  <div key={node.id} className="pl-4">
                      <div 
                        className="flex items-center gap-2 py-2 px-2 rounded hover:bg-slate-50 cursor-pointer text-sm group relative"
                        onClick={() => toggleDir(node.id)}
                      >
                          {node.children && node.children.length > 0 ? (
                              <button className="text-slate-400 hover:text-slate-600">
                                  {expandedDirs.has(node.id) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                              </button>
                          ) : <span className="w-4" />}
                          <Folder className={`w-4 h-4 ${node.children ? 'text-brand-500' : 'text-slate-400'}`} />
                          <span className="text-slate-700 font-medium flex-1">{node.name}</span>
                          <span className="text-xs text-slate-400 font-mono opacity-50">{node.code}</span>

                          {/* Hover Actions */}
                          <div className="absolute right-2 top-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 backdrop-blur-sm rounded-md shadow-sm border border-slate-100 p-0.5 z-10">
                              <button 
                                onClick={(e) => handleOpenAddDir(node.id, e)}
                                className="p-1 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded"
                                title="添加子目录"
                              >
                                  <FolderPlus className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={(e) => handleOpenEditDir(node, e)}
                                className="p-1 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded"
                                title="编辑"
                              >
                                  <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={(e) => handleDeleteDir(node.id, e)}
                                className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                                title="删除"
                              >
                                  <Trash2 className="w-3.5 h-3.5" />
                              </button>
                          </div>
                      </div>
                      {node.children && node.children.length > 0 && expandedDirs.has(node.id) && (
                          <div className="border-l border-slate-200 ml-3.5">
                              {renderTree(node.children)}
                          </div>
                      )}
                  </div>
              ))}
          </div>
      );

      return (
          <div className="space-y-4">
               <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold text-slate-800">标准目录管理</h2>
                  <button 
                    onClick={(e) => handleOpenAddDir(null, e)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-brand-600 text-white rounded text-sm hover:bg-brand-700"
                  >
                      <Plus className="w-4 h-4" /> 新建根目录
                  </button>
              </div>
              <div className="bg-white border border-slate-200 rounded-lg p-4 min-h-[400px]">
                  {renderTree(directories)}
                  {directories.length === 0 && (
                      <div className="flex flex-col items-center justify-center h-48 text-slate-400 gap-2">
                          <FolderOpen className="w-10 h-10 text-slate-200" />
                          <span className="text-sm">暂无目录，点击上方新建</span>
                      </div>
                  )}
              </div>

              {/* Directory Modal */}
              {isDirModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm">
                    <div className="bg-white rounded-lg shadow-xl w-[400px] border border-slate-200 p-6 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-5">
                            <h3 className="font-bold text-lg text-slate-800">
                                {editingDirNode ? '编辑目录' : '新建目录'}
                            </h3>
                            <button onClick={() => setIsDirModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5"/>
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">目录名称 <span className="text-red-500">*</span></label>
                                <input 
                                    value={dirForm.name}
                                    onChange={e => setDirForm({...dirForm, name: e.target.value})}
                                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500" 
                                    placeholder="e.g. 客户数据域"
                                    autoFocus
                                />
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">目录编码 <span className="text-red-500">*</span></label>
                                <input 
                                    value={dirForm.code}
                                    onChange={e => setDirForm({...dirForm, code: e.target.value})}
                                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-brand-500" 
                                    placeholder="e.g. DIR_CUSTOMER"
                                />
                            </div>

                            <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-slate-100">
                                <button onClick={() => setIsDirModalOpen(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded font-medium">取消</button>
                                <button onClick={handleSaveDir} className="px-4 py-2 text-sm bg-brand-600 text-white rounded hover:bg-brand-700 font-medium shadow-sm flex items-center gap-2">
                                    <Save className="w-4 h-4" /> 保存
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
              )}
          </div>
      )
  };

  return (
    <div className="flex h-full bg-slate-50">
        {/* Left Sidebar for Modules */}
        <div className="w-60 bg-white border-r border-slate-200 p-4 flex flex-col gap-1 shrink-0">
            <div className="mb-6 px-2">
                <h1 className="font-bold text-xl text-slate-800 flex items-center gap-2">
                    <Book className="w-6 h-6 text-brand-600" />
                    数据标准
                </h1>
                <p className="text-xs text-slate-500 mt-1">统一管理企业级数据规范</p>
            </div>

            <ModuleNavItem id="elements" icon={Database} label="数据元" />
            <ModuleNavItem id="codetables" icon={List} label="码表管理" />
            <ModuleNavItem id="rules" icon={Hash} label="编码规则" />
            <ModuleNavItem id="documents" icon={FileText} label="标准文件" />
            <div className="my-2 border-t border-slate-100"></div>
            <ModuleNavItem id="directories" icon={Folder} label="标准目录" />
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8 overflow-y-auto">
            {activeModule === 'elements' && renderDataElements()}
            {activeModule === 'codetables' && renderCodeTables()}
            {activeModule === 'rules' && renderCodingRules()}
            {activeModule === 'documents' && renderDocuments()}
            {activeModule === 'directories' && renderDirectories()}
        </div>
    </div>
  );
};

export default DataStandards;
