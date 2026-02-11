import React, { useState, useEffect } from 'react';
import { mockSchema } from '../services/mockData';
import { SchemaTypeDefinition, SchemaAttribute, SchemaRelationRule, RelationType, SchemaConstraint } from '../types';
import { 
  Settings, Plus, Box, GitCommit, BarChart2, Hash, 
  Trash2, Shield, AlertCircle, ArrowRight, Play, Database,
  X, Save, Check, Search, User, ShoppingCart, FileText, Activity, Layers, Key, Code, Regex
} from 'lucide-react';

const Schema: React.FC = () => {
  // --- State Management ---
  const [schema, setSchema] = useState<SchemaTypeDefinition[]>(mockSchema);
  const [selectedTypeId, setSelectedTypeId] = useState<string>(mockSchema[0]?.id);
  const [isAnimating, setIsAnimating] = useState(false);

  // --- Modal Visibility State ---
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [isAttrModalOpen, setIsAttrModalOpen] = useState(false);
  const [isRelModalOpen, setIsRelModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isConstraintModalOpen, setIsConstraintModalOpen] = useState(false); // Constraint Modal

  // --- Form State ---
  const [newTypeForm, setNewTypeForm] = useState({ name: '', label: '', description: '', icon: 'Box' });
  const [editTypeForm, setEditTypeForm] = useState({ id: '', name: '', label: '', description: '', icon: '' });
  
  const [newAttrForm, setNewAttrForm] = useState<Partial<SchemaAttribute>>({ 
      name: '', dataType: 'String', required: false, isPii: false, description: '' 
  });
  const [newRelForm, setNewRelForm] = useState<Partial<SchemaRelationRule>>({ 
      relationType: RelationType.ASSOCIATED_WITH, targetType: '', cardinality: '1:N', description: '' 
  });
  const [newConstraintForm, setNewConstraintForm] = useState<{
      name: string;
      type: 'UNIQUE' | 'CHECK' | 'REGEX';
      selectedAttributes: string[];
      expression: string;
      description: string;
  }>({
      name: '', type: 'UNIQUE', selectedAttributes: [], expression: '', description: ''
  });

  const selectedType = schema.find(t => t.id === selectedTypeId) || schema[0];

  // Helper to render icon dynamically
  const renderIcon = (iconName: string | undefined, className: string) => {
    switch(iconName) {
        case 'Box': return <Box className={className} />;
        case 'GitCommit': return <GitCommit className={className} />;
        case 'BarChart2': return <BarChart2 className={className} />;
        case 'User': return <User className={className} />;
        case 'ShoppingCart': return <ShoppingCart className={className} />;
        case 'FileText': return <FileText className={className} />;
        case 'Activity': return <Activity className={className} />;
        case 'Layers': return <Layers className={className} />;
        default: return <Database className={className} />;
    }
  };

  const availableIcons = ['Box', 'GitCommit', 'BarChart2', 'User', 'ShoppingCart', 'FileText', 'Activity', 'Layers', 'Database'];

  // --- Actions ---

  const handleAddType = () => {
      if (!newTypeForm.name || !newTypeForm.label) return;
      const newType: SchemaTypeDefinition = {
          id: `st_${Date.now()}`,
          name: newTypeForm.name,
          label: newTypeForm.label,
          description: newTypeForm.description,
          icon: newTypeForm.icon,
          attributes: [],
          allowedRelations: [],
          constraints: []
      };
      setSchema([...schema, newType]);
      setSelectedTypeId(newType.id);
      setIsTypeModalOpen(false);
      setNewTypeForm({ name: '', label: '', description: '', icon: 'Box' });
  };

  const handleDeleteType = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (schema.length <= 1) {
          alert("至少保留一个类型");
          return;
      }
      const newSchema = schema.filter(t => t.id !== id);
      setSchema(newSchema);
      if (selectedTypeId === id) {
          setSelectedTypeId(newSchema[0].id);
      }
  };

  const handleOpenConfig = () => {
      if (!selectedType) return;
      setEditTypeForm({
          id: selectedType.id,
          name: selectedType.name,
          label: selectedType.label,
          description: selectedType.description,
          icon: selectedType.icon || 'Database'
      });
      setIsConfigModalOpen(true);
  };

  const handleUpdateType = () => {
      const updatedSchema = schema.map(t => {
          if (t.id === editTypeForm.id) {
              return {
                  ...t,
                  label: editTypeForm.label,
                  description: editTypeForm.description,
                  icon: editTypeForm.icon
              };
          }
          return t;
      });
      setSchema(updatedSchema);
      setIsConfigModalOpen(false);
  };

  const handleAddAttribute = () => {
      if (!newAttrForm.name) return;
      const newAttr: SchemaAttribute = {
          id: `attr_${Date.now()}`,
          name: newAttrForm.name!,
          dataType: newAttrForm.dataType as any,
          required: !!newAttrForm.required,
          isPii: !!newAttrForm.isPii,
          description: newAttrForm.description || ''
      };
      const updatedSchema = schema.map(t => {
          if (t.id === selectedTypeId) {
              return { ...t, attributes: [...t.attributes, newAttr] };
          }
          return t;
      });
      setSchema(updatedSchema);
      setIsAttrModalOpen(false);
      setNewAttrForm({ name: '', dataType: 'String', required: false, isPii: false, description: '' });
  };

  const handleDeleteAttribute = (attrId: string) => {
      const updatedSchema = schema.map(t => {
          if (t.id === selectedTypeId) {
              return { ...t, attributes: t.attributes.filter(a => a.id !== attrId) };
          }
          return t;
      });
      setSchema(updatedSchema);
  };

  const handleAddConstraint = () => {
      if (!newConstraintForm.name) return;
      
      const newConstraint: SchemaConstraint = {
          id: `const_${Date.now()}`,
          name: newConstraintForm.name,
          type: newConstraintForm.type,
          targetAttributes: newConstraintForm.selectedAttributes,
          expression: newConstraintForm.expression,
          description: newConstraintForm.description
      };

      const updatedSchema = schema.map(t => {
          if (t.id === selectedTypeId) {
              return { ...t, constraints: [...(t.constraints || []), newConstraint] };
          }
          return t;
      });
      setSchema(updatedSchema);
      setIsConstraintModalOpen(false);
      setNewConstraintForm({ name: '', type: 'UNIQUE', selectedAttributes: [], expression: '', description: '' });
  };

  const handleDeleteConstraint = (constraintId: string) => {
      const updatedSchema = schema.map(t => {
          if (t.id === selectedTypeId) {
              return { ...t, constraints: (t.constraints || []).filter(c => c.id !== constraintId) };
          }
          return t;
      });
      setSchema(updatedSchema);
  };

  const handleAddRelation = () => {
      if (!newRelForm.targetType) return;
      const newRel: SchemaRelationRule = {
          id: `rel_${Date.now()}`,
          relationType: newRelForm.relationType as RelationType,
          targetType: newRelForm.targetType!,
          cardinality: newRelForm.cardinality as any,
          description: newRelForm.description || ''
      };
      const updatedSchema = schema.map(t => {
          if (t.id === selectedTypeId) {
              return { ...t, allowedRelations: [...t.allowedRelations, newRel] };
          }
          return t;
      });
      setSchema(updatedSchema);
      setIsRelModalOpen(false);
      setNewRelForm({ relationType: RelationType.ASSOCIATED_WITH, targetType: '', cardinality: '1:N', description: '' });
  };

  const handleDeleteRelation = (relId: string) => {
      const updatedSchema = schema.map(t => {
          if (t.id === selectedTypeId) {
              return { ...t, allowedRelations: t.allowedRelations.filter(r => r.id !== relId) };
          }
          return t;
      });
      setSchema(updatedSchema);
  };

  const handleRunValidation = () => {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 2000);
  };

  return (
    <div className="flex h-full bg-slate-50 relative">
      
      {/* 1. Left Sidebar: Type List */}
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col z-10 shadow-sm">
         <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
             <h2 className="font-bold text-slate-700 text-sm uppercase tracking-wide">对象类型</h2>
             <button 
                onClick={() => setIsTypeModalOpen(true)}
                className="text-slate-500 hover:text-brand-600 p-1 hover:bg-white rounded transition-colors"
                title="新建类型"
             >
                 <Plus className="w-4 h-4" />
             </button>
         </div>
         <div className="p-2 border-b border-slate-100">
             <div className="relative">
                 <Search className="w-3 h-3 absolute left-2.5 top-2.5 text-slate-400" />
                 <input type="text" placeholder="过滤..." className="w-full pl-8 pr-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-brand-300" />
             </div>
         </div>
         <div className="flex-1 overflow-y-auto p-2 space-y-1">
             {schema.map(type => (
                 <div key={type.id} className="group relative">
                     <button
                        onClick={() => setSelectedTypeId(type.id)}
                        className={`w-full text-left px-3 py-2.5 rounded-md flex items-center gap-3 transition-colors ${
                            selectedType?.id === type.id 
                            ? 'bg-brand-50 text-brand-700 border border-brand-100' 
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                        }`}
                     >
                        {renderIcon(type.icon, `w-4 h-4 ${selectedType?.id === type.id ? 'text-brand-500' : 'text-slate-400'}`)}
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{type.label}</div>
                            <div className="text-[10px] text-slate-400 font-mono truncate">{type.name}</div>
                        </div>
                     </button>
                     {/* Delete Type Button (Hidden for demo safety mostly, but adding functional) */}
                     {schema.length > 1 && (
                         <button 
                            onClick={(e) => handleDeleteType(type.id, e)}
                            className="absolute right-2 top-3 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                         >
                             <Trash2 className="w-3 h-3" />
                         </button>
                     )}
                 </div>
             ))}
         </div>
         <div className="p-3 border-t border-slate-100 bg-slate-50 text-xs text-slate-500 text-center flex justify-between items-center">
             <span>v2.4.0 (Draft)</span>
             <span className="w-2 h-2 rounded-full bg-amber-400"></span>
         </div>
      </div>

      {/* 2. Center: Type Definition Editor */}
      {selectedType ? (
      <div className="flex-1 flex flex-col bg-white border-r border-slate-200 min-w-0">
          {/* Header */}
          <div className="h-16 px-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
              <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                      {renderIcon(selectedType.icon, "w-6 h-6")}
                  </div>
                  <div>
                      <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                          {selectedType.label} 
                          <span className="text-sm font-normal text-slate-400 font-mono bg-slate-100 px-1.5 rounded">
                              {selectedType.name}
                          </span>
                      </h1>
                      <p className="text-xs text-slate-500 truncate max-w-md mt-0.5">{selectedType.description}</p>
                  </div>
              </div>
              <div className="flex gap-2">
                  <button 
                    onClick={handleOpenConfig}
                    className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-md bg-white hover:bg-slate-50 flex items-center gap-2 transition-colors"
                  >
                      <Settings className="w-4 h-4" /> 配置
                  </button>
              </div>
          </div>

          {/* Attributes Section */}
          <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
              <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-700 flex items-center gap-2 text-sm uppercase tracking-wide">
                      <Hash className="w-4 h-4 text-brand-500" />
                      属性定义 (Attributes)
                  </h3>
                  <button 
                    onClick={() => setIsAttrModalOpen(true)}
                    className="flex items-center gap-1 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 px-3 py-1.5 rounded shadow-sm transition-colors"
                  >
                      <Plus className="w-3 h-3" /> 添加属性
                  </button>
              </div>

              <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                  <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                          <tr>
                              <th className="px-4 py-3">属性名称</th>
                              <th className="px-4 py-3">数据类型</th>
                              <th className="px-4 py-3 w-16 text-center">必填</th>
                              <th className="px-4 py-3 w-16 text-center">PII</th>
                              <th className="px-4 py-3">描述</th>
                              <th className="px-4 py-3 w-10"></th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm">
                          {selectedType.attributes.map(attr => (
                              <tr key={attr.id} className="hover:bg-slate-50 group transition-colors">
                                  <td className="px-4 py-3 font-mono text-slate-700 font-medium">{attr.name}</td>
                                  <td className="px-4 py-3">
                                      <span className="px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-600 border border-slate-200 font-mono">
                                          {attr.dataType}
                                      </span>
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                      {attr.required && <div className="w-2 h-2 rounded-full bg-red-400 mx-auto ring-2 ring-red-100" title="必填"></div>}
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                      {attr.isPii && <Shield className="w-3 h-3 text-amber-500 mx-auto" title="PII 敏感数据" />}
                                  </td>
                                  <td className="px-4 py-3 text-slate-500 truncate max-w-[150px]">{attr.description}</td>
                                  <td className="px-4 py-3 text-right">
                                      <button 
                                        onClick={() => handleDeleteAttribute(attr.id)}
                                        className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                          <Trash2 className="w-4 h-4" />
                                      </button>
                                  </td>
                              </tr>
                          ))}
                          {selectedType.attributes.length === 0 && (
                              <tr>
                                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400 text-sm italic">
                                      暂无自定义属性，请点击右上角添加。
                                  </td>
                              </tr>
                          )}
                      </tbody>
                  </table>
                  <div className="p-2 bg-slate-50 border-t border-slate-100 text-center">
                      <button className="text-xs text-slate-400 hover:text-brand-600 flex items-center justify-center gap-1 w-full py-1 transition-colors">
                          <Database className="w-3 h-3" /> + 3 系统默认属性 (id, created_at, updated_at) 已隐藏
                      </button>
                  </div>
              </div>
              
              {/* Constraints Section */}
              <div className="mt-8">
                  <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-slate-700 flex items-center gap-2 text-sm uppercase tracking-wide">
                          <AlertCircle className="w-4 h-4 text-violet-500" />
                          业务约束 (Constraints)
                      </h3>
                      <button 
                        onClick={() => setIsConstraintModalOpen(true)}
                        className="flex items-center gap-1 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 px-3 py-1.5 rounded shadow-sm transition-colors"
                      >
                          <Plus className="w-3 h-3" /> 添加约束
                      </button>
                  </div>

                  {selectedType.constraints && selectedType.constraints.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {selectedType.constraints.map(constraint => (
                              <div key={constraint.id} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm relative group hover:border-violet-300 transition-colors">
                                  <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                          {constraint.type === 'UNIQUE' && <Key className="w-4 h-4 text-amber-500" />}
                                          {constraint.type === 'CHECK' && <Code className="w-4 h-4 text-blue-500" />}
                                          {constraint.type === 'REGEX' && <Regex className="w-4 h-4 text-pink-500" />}
                                          <span className="font-bold text-sm text-slate-700">{constraint.name}</span>
                                      </div>
                                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">
                                          {constraint.type}
                                      </span>
                                  </div>
                                  
                                  <div className="text-xs text-slate-600 mb-3 line-clamp-2 min-h-[2.5em]">
                                      {constraint.description || "无描述"}
                                  </div>

                                  <div className="bg-slate-50 rounded p-2 text-xs font-mono text-slate-600 border border-slate-100 break-all">
                                      {constraint.type === 'UNIQUE' && (
                                          <span className="flex items-center gap-1">
                                              <span className="text-slate-400">Fields:</span> 
                                              {constraint.targetAttributes.join(', ')}
                                          </span>
                                      )}
                                      {constraint.type === 'CHECK' && (
                                          <span className="text-blue-700">{constraint.expression}</span>
                                      )}
                                      {constraint.type === 'REGEX' && (
                                          <div>
                                              <span className="text-slate-400 block mb-1">Field: {constraint.targetAttributes[0]}</span>
                                              <span className="text-pink-700">/{constraint.expression}/</span>
                                          </div>
                                      )}
                                  </div>

                                  <button 
                                    onClick={() => handleDeleteConstraint(constraint.id)}
                                    className="absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                  >
                                      <Trash2 className="w-4 h-4" />
                                  </button>
                              </div>
                          ))}
                      </div>
                  ) : (
                      <div 
                        onClick={() => setIsConstraintModalOpen(true)}
                        className="p-8 border border-dashed border-slate-300 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer text-slate-500 text-sm flex flex-col items-center justify-center gap-3"
                      >
                           <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                                <Plus className="w-5 h-5 text-slate-400" /> 
                           </div>
                           <span>点击添加唯一性约束、逻辑校验或格式规则</span>
                      </div>
                  )}
              </div>
          </div>
      </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-slate-400">选择或创建一个类型</div>
      )}

      {/* 3. Right: Relation Editor & Validation */}
      {selectedType && (
      <div className="w-80 bg-white flex flex-col border-l border-slate-200 shrink-0 z-10 shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)]">
          <div className="p-4 border-b border-slate-200 bg-slate-50">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <GitCommit className="w-4 h-4 text-brand-600" />
                  关系规则 (Relations)
              </h3>
              <p className="text-xs text-slate-500 mt-1">定义 <span className="font-mono text-brand-700">{selectedType.name}</span> 允许作为起点发起的连线。</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
              {selectedType.allowedRelations.map(rel => (
                  <div key={rel.id} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm relative group hover:border-brand-200 hover:shadow-md transition-all">
                      <div className="flex items-center gap-2 mb-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">This</span>
                          <ArrowRight className="w-3 h-3 text-slate-300" />
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-brand-50 text-brand-700 border border-brand-100 uppercase">
                              {rel.relationType}
                          </span>
                          <ArrowRight className="w-3 h-3 text-slate-300" />
                          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-1 rounded">{rel.targetType}</span>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-500 font-medium uppercase bg-slate-100 px-1.5 rounded border border-slate-200">{rel.cardinality}</span>
                          </div>
                          {rel.description && <p className="text-xs text-slate-400 italic truncate max-w-[120px]" title={rel.description}>{rel.description}</p>}
                      </div>
                      <button 
                        onClick={() => handleDeleteRelation(rel.id)}
                        className="absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                      >
                          <Trash2 className="w-3 h-3" />
                      </button>
                  </div>
              ))}
              
              <button 
                onClick={() => setIsRelModalOpen(true)}
                className="w-full py-3 border border-dashed border-slate-300 rounded-lg text-slate-400 text-sm hover:border-brand-400 hover:text-brand-600 hover:bg-brand-50/50 transition-all flex items-center justify-center gap-2 group"
              >
                  <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" /> 添加关系规则
              </button>
          </div>

          {/* Validation Runner */}
          <div className="p-4 bg-white border-t border-slate-200">
              <div className="bg-slate-900 rounded-lg p-4 text-white shadow-lg">
                  <h4 className="font-bold text-sm flex items-center gap-2 mb-2">
                      <Play className="w-3 h-3 text-brand-400" />
                      模型校验器
                  </h4>
                  <p className="text-xs text-slate-400 mb-3 leading-relaxed">在样例子图上运行当前 Schema 约束以验证规则完整性。</p>
                  
                  <div className="space-y-2 mb-4 bg-slate-800/50 p-2 rounded">
                      <div className="flex justify-between text-xs items-center">
                          <span className="text-slate-400">环路检测</span>
                          <span className="text-emerald-400 flex items-center gap-1"><Check className="w-3 h-3"/> 通过</span>
                      </div>
                      <div className="flex justify-between text-xs items-center">
                          <span className="text-slate-400">孤立节点</span>
                          {isAnimating ? (
                              <span className="text-amber-400 animate-pulse">扫描中...</span>
                          ) : (
                              <span className="text-slate-500">待运行</span>
                          )}
                      </div>
                  </div>

                  <button 
                    onClick={handleRunValidation}
                    disabled={isAnimating}
                    className="w-full py-2 bg-brand-600 hover:bg-brand-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed rounded text-xs font-bold transition-all shadow-lg shadow-brand-900/20 active:scale-95"
                  >
                      {isAnimating ? '运行中...' : '运行全量校验'}
                  </button>
              </div>
          </div>
      </div>
      )}

      {/* --- Modals --- */}
      
      {/* 1. Add Type Modal */}
      {isTypeModalOpen && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm">
              <div className="bg-white rounded-lg shadow-xl w-96 border border-slate-200 p-6 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-lg text-slate-800">新建对象类型</h3>
                      <button onClick={() => setIsTypeModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
                  </div>
                  <div className="space-y-4">
                      <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1">系统名称 (English)</label>
                          <input 
                            value={newTypeForm.name}
                            onChange={e => setNewTypeForm({...newTypeForm, name: e.target.value})}
                            className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500" 
                            placeholder="e.g. SalesOrder"
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1">显示名称 (中文)</label>
                          <input 
                            value={newTypeForm.label}
                            onChange={e => setNewTypeForm({...newTypeForm, label: e.target.value})}
                            className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500" 
                            placeholder="e.g. 销售订单"
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1">描述</label>
                          <textarea 
                            value={newTypeForm.description}
                            onChange={e => setNewTypeForm({...newTypeForm, description: e.target.value})}
                            className="w-full border border-slate-300 rounded px-3 py-2 text-sm h-20 resize-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500" 
                            placeholder="描述该类型的业务含义..."
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-500 mb-2">默认图标</label>
                          <div className="flex flex-wrap gap-2">
                             {availableIcons.slice(0, 5).map(icon => (
                                 <button
                                    key={icon}
                                    onClick={() => setNewTypeForm({...newTypeForm, icon})}
                                    className={`p-2 rounded border ${newTypeForm.icon === icon ? 'border-brand-500 bg-brand-50 text-brand-600' : 'border-slate-200 hover:bg-slate-50 text-slate-500'}`}
                                 >
                                     {renderIcon(icon, "w-4 h-4")}
                                 </button>
                             ))}
                          </div>
                      </div>
                      <div className="flex justify-end gap-2 mt-4">
                          <button onClick={() => setIsTypeModalOpen(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded">取消</button>
                          <button onClick={handleAddType} className="px-4 py-2 text-sm bg-brand-600 text-white rounded hover:bg-brand-700 font-medium">创建</button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* 2. Config/Edit Type Modal */}
      {isConfigModalOpen && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm">
              <div className="bg-white rounded-lg shadow-xl w-[450px] border border-slate-200 p-6 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-3">
                          <div className="p-2 bg-brand-50 rounded-lg text-brand-600">
                             <Settings className="w-5 h-5" />
                          </div>
                          <div>
                              <h3 className="font-bold text-lg text-slate-800">类型配置</h3>
                              <p className="text-xs text-slate-500">修改 {editTypeForm.name} 的基本信息</p>
                          </div>
                      </div>
                      <button onClick={() => setIsConfigModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
                  </div>
                  <div className="space-y-5">
                      <div className="grid grid-cols-3 gap-4">
                         <div className="col-span-1">
                             <label className="block text-xs font-bold text-slate-500 mb-2">图标</label>
                             <div className="grid grid-cols-3 gap-2">
                                {availableIcons.map(icon => (
                                    <button
                                        key={icon}
                                        onClick={() => setEditTypeForm({...editTypeForm, icon})}
                                        className={`p-2 rounded flex items-center justify-center border transition-all ${editTypeForm.icon === icon ? 'border-brand-500 bg-brand-50 text-brand-600 ring-1 ring-brand-500' : 'border-slate-200 hover:bg-slate-50 text-slate-400'}`}
                                        title={icon}
                                    >
                                        {renderIcon(icon, "w-4 h-4")}
                                    </button>
                                ))}
                             </div>
                         </div>
                         <div className="col-span-2 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">系统名称 (不可修改)</label>
                                <input 
                                    value={editTypeForm.name}
                                    disabled
                                    className="w-full border border-slate-200 bg-slate-50 text-slate-500 rounded px-3 py-2 text-sm cursor-not-allowed font-mono" 
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">显示名称 (中文)</label>
                                <input 
                                    value={editTypeForm.label}
                                    onChange={e => setEditTypeForm({...editTypeForm, label: e.target.value})}
                                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500" 
                                />
                            </div>
                         </div>
                      </div>
                      
                      <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1">描述</label>
                          <textarea 
                            value={editTypeForm.description}
                            onChange={e => setEditTypeForm({...editTypeForm, description: e.target.value})}
                            className="w-full border border-slate-300 rounded px-3 py-2 text-sm h-24 resize-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 leading-relaxed" 
                          />
                      </div>
                      
                      <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                          <button onClick={() => setIsConfigModalOpen(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded font-medium">取消</button>
                          <button onClick={handleUpdateType} className="px-5 py-2 text-sm bg-brand-600 text-white rounded hover:bg-brand-700 font-medium shadow-sm flex items-center gap-2">
                              <Save className="w-4 h-4" /> 保存更改
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* 3. Add Attribute Modal */}
      {isAttrModalOpen && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm">
              <div className="bg-white rounded-lg shadow-xl w-96 border border-slate-200 p-6 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-lg text-slate-800">添加属性</h3>
                      <button onClick={() => setIsAttrModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
                  </div>
                  <div className="space-y-4">
                      <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1">属性名称</label>
                          <input 
                            value={newAttrForm.name}
                            onChange={e => setNewAttrForm({...newAttrForm, name: e.target.value})}
                            className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500" 
                            placeholder="e.g. totalAmount"
                          />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs font-bold text-slate-500 mb-1">数据类型</label>
                              <select 
                                value={newAttrForm.dataType}
                                onChange={e => setNewAttrForm({...newAttrForm, dataType: e.target.value as any})}
                                className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                              >
                                  {['String', 'Integer', 'Boolean', 'Date', 'Enum', 'JSON'].map(t => <option key={t} value={t}>{t}</option>)}
                              </select>
                          </div>
                          <div className="flex flex-col gap-2 pt-6">
                              <label className="flex items-center gap-2 text-sm text-slate-700">
                                  <input 
                                    type="checkbox" 
                                    checked={newAttrForm.required}
                                    onChange={e => setNewAttrForm({...newAttrForm, required: e.target.checked})}
                                    className="rounded text-brand-600 focus:ring-brand-500"
                                  />
                                  必填字段
                              </label>
                              <label className="flex items-center gap-2 text-sm text-slate-700">
                                  <input 
                                    type="checkbox" 
                                    checked={newAttrForm.isPii}
                                    onChange={e => setNewAttrForm({...newAttrForm, isPii: e.target.checked})}
                                    className="rounded text-brand-600 focus:ring-brand-500"
                                  />
                                  PII 敏感
                              </label>
                          </div>
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1">描述</label>
                          <textarea 
                            value={newAttrForm.description}
                            onChange={e => setNewAttrForm({...newAttrForm, description: e.target.value})}
                            className="w-full border border-slate-300 rounded px-3 py-2 text-sm h-16 resize-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500" 
                          />
                      </div>
                      <div className="flex justify-end gap-2 mt-4">
                          <button onClick={() => setIsAttrModalOpen(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded">取消</button>
                          <button onClick={handleAddAttribute} className="px-4 py-2 text-sm bg-brand-600 text-white rounded hover:bg-brand-700 font-medium">添加</button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* 4. Add Relation Modal */}
      {isRelModalOpen && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm">
              <div className="bg-white rounded-lg shadow-xl w-96 border border-slate-200 p-6 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-lg text-slate-800">添加关系规则</h3>
                      <button onClick={() => setIsRelModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
                  </div>
                  <div className="space-y-4">
                      <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1">关系类型</label>
                          <select 
                            value={newRelForm.relationType}
                            onChange={e => setNewRelForm({...newRelForm, relationType: e.target.value as any})}
                            className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                          >
                              {Object.values(RelationType).map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1">目标对象类型</label>
                          <select 
                            value={newRelForm.targetType}
                            onChange={e => setNewRelForm({...newRelForm, targetType: e.target.value})}
                            className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                          >
                              <option value="" disabled>选择目标类型...</option>
                              {schema.map(t => <option key={t.id} value={t.name}>{t.label} ({t.name})</option>)}
                          </select>
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1">基数约束 (Cardinality)</label>
                          <select 
                            value={newRelForm.cardinality}
                            onChange={e => setNewRelForm({...newRelForm, cardinality: e.target.value as any})}
                            className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                          >
                              {['1:1', '1:N', 'N:1', 'N:N'].map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1">描述规则</label>
                          <textarea 
                            value={newRelForm.description}
                            onChange={e => setNewRelForm({...newRelForm, description: e.target.value})}
                            className="w-full border border-slate-300 rounded px-3 py-2 text-sm h-16 resize-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500" 
                          />
                      </div>
                      <div className="flex justify-end gap-2 mt-4">
                          <button onClick={() => setIsRelModalOpen(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded">取消</button>
                          <button onClick={handleAddRelation} disabled={!newRelForm.targetType} className="px-4 py-2 text-sm bg-brand-600 text-white rounded hover:bg-brand-700 font-medium disabled:bg-slate-300 disabled:cursor-not-allowed">添加规则</button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* 5. Add Constraint Modal */}
      {isConstraintModalOpen && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm">
              <div className="bg-white rounded-lg shadow-xl w-[480px] border border-slate-200 p-6 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-lg text-slate-800">添加业务约束</h3>
                      <button onClick={() => setIsConstraintModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
                  </div>
                  <div className="space-y-5">
                      {/* Name */}
                      <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1">约束名称</label>
                          <input 
                            value={newConstraintForm.name}
                            onChange={e => setNewConstraintForm({...newConstraintForm, name: e.target.value})}
                            className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500" 
                            placeholder="e.g. UniqueCustomerName"
                          />
                      </div>

                      {/* Type Selector */}
                      <div>
                          <label className="block text-xs font-bold text-slate-500 mb-2">约束类型</label>
                          <div className="flex gap-2">
                              {[
                                  { id: 'UNIQUE', label: '唯一性键', icon: Key },
                                  { id: 'CHECK', label: '逻辑校验', icon: Code },
                                  { id: 'REGEX', label: '格式正则', icon: Regex }
                              ].map(t => {
                                  const Icon = t.icon;
                                  const isSelected = newConstraintForm.type === t.id;
                                  return (
                                    <button 
                                        key={t.id}
                                        onClick={() => setNewConstraintForm({...newConstraintForm, type: t.id as any, selectedAttributes: [], expression: ''})}
                                        className={`flex-1 flex flex-col items-center justify-center p-3 rounded border text-xs font-medium gap-1 transition-all ${
                                            isSelected 
                                            ? 'bg-violet-50 border-violet-500 text-violet-700 ring-1 ring-violet-500' 
                                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {t.label}
                                    </button>
                                  )
                              })}
                          </div>
                      </div>

                      {/* Dynamic Content based on Type */}
                      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                          {newConstraintForm.type === 'UNIQUE' && (
                              <div>
                                  <label className="block text-xs font-bold text-slate-500 mb-2">选择构成唯一键的属性</label>
                                  <div className="max-h-32 overflow-y-auto space-y-2">
                                      {selectedType.attributes.length > 0 ? selectedType.attributes.map(attr => (
                                          <label key={attr.id} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                                              <input 
                                                type="checkbox" 
                                                checked={newConstraintForm.selectedAttributes.includes(attr.name)}
                                                onChange={(e) => {
                                                    const newSelection = e.target.checked 
                                                        ? [...newConstraintForm.selectedAttributes, attr.name]
                                                        : newConstraintForm.selectedAttributes.filter(a => a !== attr.name);
                                                    setNewConstraintForm({...newConstraintForm, selectedAttributes: newSelection});
                                                }}
                                                className="rounded text-violet-600 focus:ring-violet-500"
                                              />
                                              <span className="font-mono">{attr.name}</span>
                                              <span className="text-xs text-slate-400">({attr.dataType})</span>
                                          </label>
                                      )) : <div className="text-xs text-slate-400 italic">暂无属性可供选择</div>}
                                  </div>
                              </div>
                          )}

                          {newConstraintForm.type === 'CHECK' && (
                              <div>
                                  <label className="block text-xs font-bold text-slate-500 mb-1">校验表达式 (Expression)</label>
                                  <textarea 
                                    value={newConstraintForm.expression}
                                    onChange={e => setNewConstraintForm({...newConstraintForm, expression: e.target.value})}
                                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm font-mono h-20 resize-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-slate-700"
                                    placeholder="e.g. amount > 0 && status != 'Draft'"
                                  />
                                  <p className="text-[10px] text-slate-400 mt-1">支持简单的逻辑运算符和属性引用。</p>
                              </div>
                          )}

                          {newConstraintForm.type === 'REGEX' && (
                              <div className="space-y-3">
                                  <div>
                                      <label className="block text-xs font-bold text-slate-500 mb-1">目标属性</label>
                                      <select 
                                        value={newConstraintForm.selectedAttributes[0] || ''}
                                        onChange={e => setNewConstraintForm({...newConstraintForm, selectedAttributes: [e.target.value]})}
                                        className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                                      >
                                          <option value="" disabled>选择属性...</option>
                                          {selectedType.attributes.filter(a => a.dataType === 'String').map(attr => (
                                              <option key={attr.id} value={attr.name}>{attr.name}</option>
                                          ))}
                                      </select>
                                  </div>
                                  <div>
                                      <label className="block text-xs font-bold text-slate-500 mb-1">正则表达式 (Regex)</label>
                                      <input 
                                        value={newConstraintForm.expression}
                                        onChange={e => setNewConstraintForm({...newConstraintForm, expression: e.target.value})}
                                        className="w-full border border-slate-300 rounded px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-violet-500 focus:border-violet-500" 
                                        placeholder="e.g. ^[A-Z]{3}-\d{4}$"
                                      />
                                  </div>
                              </div>
                          )}
                      </div>

                      {/* Description */}
                      <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1">业务含义描述</label>
                          <textarea 
                            value={newConstraintForm.description}
                            onChange={e => setNewConstraintForm({...newConstraintForm, description: e.target.value})}
                            className="w-full border border-slate-300 rounded px-3 py-2 text-sm h-16 resize-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500" 
                            placeholder="描述该约束的业务规则..."
                          />
                      </div>

                      <div className="flex justify-end gap-2 mt-2">
                          <button onClick={() => setIsConstraintModalOpen(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded">取消</button>
                          <button onClick={handleAddConstraint} className="px-4 py-2 text-sm bg-violet-600 text-white rounded hover:bg-violet-700 font-medium shadow-sm">添加约束</button>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Schema;