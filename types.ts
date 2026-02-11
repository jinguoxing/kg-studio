
export enum EntityStatus {
  DRAFT = '草稿',
  REVIEW = '审核中',
  PUBLISHED = '已发布',
  DEPRECATED = '已废弃'
}

export enum RelationType {
  ASSOCIATED_WITH = 'ASSOCIATED_WITH',
  AFFECTS = 'AFFECTS',
  DERIVED_FROM = 'DERIVED_FROM',
  OWNS = 'OWNS'
}

export interface BNode {
  id: string;
  name: string;
  type: 'BusinessObject' | 'Process' | 'Term' | 'Metric' | 'System';
  status: EntityStatus;
  confidence: number;
  description: string;
  owner: string;
  domain: string;
  tags: string[];
}

export interface BEdge {
  id: string;
  source: string;
  target: string;
  type: RelationType;
  confidence: number;
}

export interface KPI {
  label: string;
  value: string | number;
  trend?: number;
  status: 'good' | 'warning' | 'neutral';
}

export interface ChangeSet {
  id: string;
  name: string;
  description: string;
  status: 'Open' | 'In Review' | 'Merged';
  author: string;
  createdAt: string;
  stats: {
    additions: number;
    deletions: number;
    modifications: number;
  };
}

export interface TodoItem {
  id: string;
  title: string;
  type: 'Definition' | 'Conflict' | 'Review' | 'Publish';
  priority: 'High' | 'Medium' | 'Low';
  targetId?: string;
}

export enum AlignmentStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED'
}

export interface AlignmentCandidate {
  id: string;
  sourceId: string; // ID from Top-down tree
  sourceName: string;
  targetId: string; // ID from Bottom-up tree
  targetName: string;
  confidence: number;
  matchReason: string;
  status: AlignmentStatus;
}

// --- Hierarchy Data Types for Align Page ---

export interface ProcessNode {
    id: string;
    name: string;
    type: 'Phase' | 'Activity' | 'Step';
    children?: ProcessNode[];
}

export interface DataAssetNode {
    id: string;
    name: string;
    type: 'Database' | 'Table' | 'Column';
    dataType?: string;
    children?: DataAssetNode[];
}

// --- Schema Types ---

export interface SchemaAttribute {
  id: string;
  name: string;
  dataType: 'String' | 'Integer' | 'Boolean' | 'Date' | 'Enum' | 'JSON';
  required: boolean;
  isPii: boolean;
  description?: string;
}

export interface SchemaRelationRule {
  id: string;
  relationType: RelationType;
  targetType: string; // e.g. 'Term'
  cardinality: '1:1' | '1:N' | 'N:1' | 'N:N';
  description?: string;
}

export interface SchemaConstraint {
  id: string;
  name: string;
  type: 'UNIQUE' | 'CHECK' | 'REGEX';
  targetAttributes: string[]; // List of attribute names involved
  expression: string; // Logic or Pattern
  description?: string;
}

export interface SchemaTypeDefinition {
  id: string;
  name: string; // e.g. BusinessObject
  label: string; // e.g. 业务对象
  description: string;
  icon?: string;
  attributes: SchemaAttribute[];
  allowedRelations: SchemaRelationRule[];
  constraints: SchemaConstraint[];
}

// --- Logic View Types ---

export type DataSourceType = 'MySQL' | 'PostgreSQL' | 'Oracle' | 'SQL Server' | 'MongoDB' | 'Redis' | 'Elasticsearch' | 'ClickHouse' | 'Hive';

export interface LogicView {
  id: string;
  name: string;
  description?: string;
  dataSourceType: DataSourceType;
  dataSourceName: string;
  rowCount: string;
  fieldCount: number;
  status: '未开始语义理解' | '语义理解中' | '部分完成' | '需要裁决' | '已完成';
  aiCoverage: number;
  updatedAt: string;
}

// --- Data Standard Types ---

export interface StandardDirectory {
  id: string;
  name: string;
  code: string;
  level: number;
  children?: StandardDirectory[];
}

export interface DataElement {
  id: string;
  name: string; // 中文名称 e.g. 客户姓名
  nameEn?: string; // 英文名称 e.g. Customer Name
  code: string; // 标识符 e.g. DE_CUST_NAME
  dataType: string; // e.g. String
  
  // Format Constraints
  dataLength?: number; // 长度
  precision?: number; // 精度 (Total digits)
  scale?: number; // 小数位
  
  // Value Domain
  minValue?: string;
  maxValue?: string;
  relatedCodeTableId?: string; // 关联码表ID
  
  // Constraints
  isRequired?: boolean;
  isUnique?: boolean;
  
  // Business Context
  description?: string; // 业务含义/说明
  businessRules?: string; // 业务规则
  calculationFormula?: string; // 计算逻辑
  
  directoryId: string;
  status: 'Published' | 'Draft' | 'Deprecated';
}

export interface CodeTable {
  id: string;
  name: string; // e.g. 性别代码
  code: string; // e.g. CT_GENDER
  description?: string;
  values: { code: string; label: string }[];
  status: 'Active' | 'Deprecated';
}

export interface CodingRule {
  id: string;
  name: string; // e.g. 订单号生成规则
  code: string; // e.g. RULE_ORDER_NO
  template: string; // e.g. ORD-{YYYY}{MM}-{SEQ:6}
  example: string;
  description?: string;
  status: 'Active' | 'Inactive';
}

export interface StandardDocument {
  id: string;
  title: string;
  docNumber: string; // e.g. GB/T 2024-001
  type: 'National' | 'Industry' | 'Enterprise';
  fileType: 'PDF' | 'DOCX';
  uploadDate: string;
  status: 'Effective' | 'Deprecated';
}
