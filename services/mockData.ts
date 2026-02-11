
import { BNode, BEdge, EntityStatus, RelationType, KPI, ChangeSet, TodoItem, AlignmentCandidate, SchemaTypeDefinition, ProcessNode, DataAssetNode, AlignmentStatus, LogicView, DataElement, CodeTable, CodingRule, StandardDocument, StandardDirectory } from '../types';

export const mockNodes: BNode[] = [
  { id: '1', name: '客户订单 (Customer Order)', type: 'BusinessObject', status: EntityStatus.PUBLISHED, confidence: 1.0, description: '客户购买商品或服务的主要记录。', owner: '销售运营', domain: '销售域', tags: ['核心', 'PII'] },
  { id: '2', name: '发票 (Invoice)', type: 'BusinessObject', status: EntityStatus.PUBLISHED, confidence: 0.98, description: '向客户开具的结算单据。', owner: '财务部', domain: '财务域', tags: ['核心'] },
  { id: '3', name: '支付处理流程', type: 'Process', status: EntityStatus.REVIEW, confidence: 0.85, description: '资金从客户流向商户的处理流程。', owner: 'FinTech 团队', domain: '财务域', tags: [] },
  { id: '4', name: '欺诈检测', type: 'Process', status: EntityStatus.DRAFT, confidence: 0.60, description: 'AI 驱动的欺诈风险识别步骤。', owner: '风控团队', domain: '风控域', tags: ['AI生成'] },
  { id: '5', name: '客户 ID', type: 'Term', status: EntityStatus.PUBLISHED, confidence: 1.0, description: '客户的唯一标识符。', owner: '数据治理', domain: '通用域', tags: ['主键'] },
  { id: '6', name: '总营收 (Total Revenue)', type: 'Metric', status: EntityStatus.PUBLISHED, confidence: 0.95, description: '所有已结算发票的金额汇总。', owner: '财务部', domain: '财务域', tags: ['报表'] },
  { id: '7', name: 'CRM 系统', type: 'System', status: EntityStatus.PUBLISHED, confidence: 1.0, description: 'Salesforce 实例', owner: 'IT 部', domain: 'IT', tags: [] },
];

export const mockEdges: BEdge[] = [
  { id: 'e1', source: '1', target: '2', type: RelationType.ASSOCIATED_WITH, confidence: 0.99 },
  { id: 'e2', source: '1', target: '5', type: RelationType.OWNS, confidence: 1.0 },
  { id: 'e3', source: '3', target: '2', type: RelationType.AFFECTS, confidence: 0.85 },
  { id: 'e4', source: '2', target: '6', type: RelationType.DERIVED_FROM, confidence: 0.90 },
  { id: 'e5', source: '7', target: '1', type: RelationType.ASSOCIATED_WITH, confidence: 0.95 },
];

export const mockKPIs: KPI[] = [
  { label: '对象覆盖率', value: '87%', trend: 2.5, status: 'good' },
  { label: '术语绑定率', value: '64%', trend: -1.2, status: 'warning' },
  { label: '活跃冲突数', value: '12', status: 'warning' },
  { label: '待评审事项', value: '5', status: 'neutral' },
];

export const mockTodos: TodoItem[] = [
  { id: 't1', title: '完善 "欺诈检测" 的业务定义', type: 'Definition', priority: 'High', targetId: '4' },
  { id: 't2', title: '解决 "支付条款" 中的冲突', type: 'Conflict', priority: 'High' },
  { id: 't3', title: '复核低置信度关系: 发票 -> 发货单', type: 'Review', priority: 'Medium' },
];

export const mockChangeSets: ChangeSet[] = [
  { id: 'cs1', name: 'Q3 财务对齐', description: '根据新 ERP 系统调整发票结构。', status: 'Open', author: '陈爱丽', createdAt: '2023-10-24', stats: { additions: 12, deletions: 2, modifications: 5 } },
  { id: 'cs2', name: '风控模型 V2', description: '新增欺诈检测相关指标。', status: 'In Review', author: '李雷', createdAt: '2023-10-23', stats: { additions: 4, deletions: 0, modifications: 1 } },
  { id: 'cs3', name: '客户域清理', description: '废弃旧字段。', status: 'Merged', author: 'Agent Auto', createdAt: '2023-10-20', stats: { additions: 0, deletions: 15, modifications: 2 } },
];

// --- Align Page Mocks ---

export const mockProcessTree: ProcessNode[] = [
    {
        id: 'p_root',
        name: '订单到现金 (Order to Cash)',
        type: 'Phase',
        children: [
            {
                id: 'p_1',
                name: '订单创建',
                type: 'Activity',
                children: [
                    { id: 'p_1_1', name: '验证客户信用', type: 'Step' },
                    { id: 'p_1_2', name: '检查库存', type: 'Step' },
                ]
            },
            {
                id: 'p_2',
                name: '订单履行',
                type: 'Activity',
                children: [
                    { id: 'p_2_1', name: '生成发货单', type: 'Step' },
                    { id: 'p_2_2', name: '物流调度', type: 'Step' },
                ]
            },
            {
                id: 'p_3',
                name: '财务结算',
                type: 'Activity',
                children: [
                    { id: 'p_3_1', name: '开具发票', type: 'Step' },
                    { id: 'p_3_2', name: '确认回款', type: 'Step' },
                ]
            }
        ]
    }
];

export const mockDataAssets: DataAssetNode[] = [
    {
        id: 'db_1',
        name: 'CRM_DB_RAW',
        type: 'Database',
        children: [
            {
                id: 't_1',
                name: 't_sales_order',
                type: 'Table',
                children: [
                    { id: 'c_1_1', name: 'order_id', type: 'Column', dataType: 'VARCHAR' },
                    { id: 'c_1_2', name: 'customer_ref', type: 'Column', dataType: 'INT' },
                    { id: 'c_1_3', name: 'total_amt', type: 'Column', dataType: 'DECIMAL' },
                ]
            },
            {
                id: 't_2',
                name: 't_credit_check_log',
                type: 'Table',
                children: [
                    { id: 'c_2_1', name: 'check_id', type: 'Column', dataType: 'INT' },
                    { id: 'c_2_2', name: 'score', type: 'Column', dataType: 'INT' },
                    { id: 'c_2_3', name: 'status', type: 'Column', dataType: 'VARCHAR' },
                ]
            }
        ]
    },
    {
        id: 'db_2',
        name: 'ERP_FINANCE',
        type: 'Database',
        children: [
             {
                id: 't_3',
                name: 'fin_invoice_header',
                type: 'Table',
                children: [
                    { id: 'c_3_1', name: 'inv_no', type: 'Column', dataType: 'VARCHAR' },
                    { id: 'c_3_2', name: 'due_date', type: 'Column', dataType: 'DATE' },
                ]
            }
        ]
    }
];

export const mockCandidates: AlignmentCandidate[] = [
  { id: 'a1', sourceId: 'p_1', sourceName: '订单创建 (Activity)', targetId: 't_1', targetName: 't_sales_order (Table)', confidence: 0.92, matchReason: '名称 "Order" 语义高度相似，且包含客户引用。', status: AlignmentStatus.PENDING },
  { id: 'a2', sourceId: 'p_1_1', sourceName: '验证客户信用 (Step)', targetId: 't_2', targetName: 't_credit_check_log (Table)', confidence: 0.78, matchReason: '发现数据血缘追踪痕迹，且 "Credit" 关键词匹配。', status: AlignmentStatus.PENDING },
  { id: 'a3', sourceId: 'p_3_1', sourceName: '开具发票 (Step)', targetId: 't_3', targetName: 'fin_invoice_header (Table)', confidence: 0.95, matchReason: '强规则匹配：业务术语 "Invoice" 直接映射。', status: AlignmentStatus.ACCEPTED },
  { id: 'a4', sourceId: 'p_2_1', sourceName: '生成发货单 (Step)', targetId: 'c_1_3', targetName: 'total_amt (Column)', confidence: 0.35, matchReason: '仅部分关键词匹配，建议人工复核。', status: AlignmentStatus.REJECTED },
];

export const mockSchema: SchemaTypeDefinition[] = [
    {
        id: 'st1',
        name: 'BusinessObject',
        label: '业务对象',
        description: '承载具体业务活动信息的实体，通常对应数据库中的表或领域对象。',
        icon: 'Box',
        attributes: [
            { id: 'a1', name: 'name', dataType: 'String', required: true, isPii: false, description: '对象的业务名称' },
            { id: 'a2', name: 'owner', dataType: 'String', required: true, isPii: false, description: '业务负责人' },
            { id: 'a3', name: 'dataLevel', dataType: 'Enum', required: false, isPii: false, description: '数据保密等级 (L1-L4)' },
        ],
        allowedRelations: [
            { id: 'r1', relationType: RelationType.ASSOCIATED_WITH, targetType: 'Term', cardinality: 'N:N', description: '关联到业务术语' },
            { id: 'r2', relationType: RelationType.DERIVED_FROM, targetType: 'BusinessObject', cardinality: 'N:1', description: '从其他对象衍生' },
            { id: 'r3', relationType: RelationType.OWNS, targetType: 'Metric', cardinality: '1:N', description: '拥有的业务指标' },
        ],
        constraints: [
            { id: 'c1', name: 'UniqueName', type: 'UNIQUE', targetAttributes: ['name', 'owner'], expression: '', description: '同一负责人下的对象名称必须唯一' }
        ]
    },
    {
        id: 'st2',
        name: 'Process',
        label: '业务流程',
        description: '描述一系列为实现特定业务目标而执行的活动或步骤。',
        icon: 'GitCommit',
        attributes: [
            { id: 'p1', name: 'bpmnId', dataType: 'String', required: true, isPii: false, description: 'BPMN 流程 ID' },
            { id: 'p2', name: 'criticality', dataType: 'Enum', required: true, isPii: false, description: '业务关键性 (High/Med/Low)' },
        ],
        allowedRelations: [
            { id: 'r4', relationType: RelationType.AFFECTS, targetType: 'BusinessObject', cardinality: 'N:N', description: '流程读写或修改的对象' },
            { id: 'r5', relationType: RelationType.ASSOCIATED_WITH, targetType: 'System', cardinality: 'N:1', description: '承载该流程的 IT 系统' },
        ],
        constraints: []
    },
    {
        id: 'st3',
        name: 'Metric',
        label: '指标',
        description: '用于衡量业务绩效的量化度量标准。',
        icon: 'BarChart2',
        attributes: [
            { id: 'm1', name: 'formula', dataType: 'String', required: true, isPii: false, description: '计算逻辑公式' },
            { id: 'm2', name: 'frequency', dataType: 'Enum', required: true, isPii: false, description: '计算频率 (T+1/Realtime)' },
        ],
        allowedRelations: [
            { id: 'r6', relationType: RelationType.DERIVED_FROM, targetType: 'BusinessObject', cardinality: '1:N', description: '指标的数据来源' },
        ],
        constraints: []
    }
];

export const mockLogicViews: LogicView[] = [
    { id: 'lv1', name: 't_hr_employee', dataSourceType: 'MySQL', dataSourceName: 'HR_Master_DB', rowCount: '3.5K', fieldCount: 5, status: '未开始语义理解', aiCoverage: 0, updatedAt: '2024-06-20' },
    { id: 'lv2', name: 't_hr_payroll', dataSourceType: 'PostgreSQL', dataSourceName: 'Finance_DB', rowCount: '42.0K', fieldCount: 5, status: '未开始语义理解', aiCoverage: 0, updatedAt: '2024-06-20' },
    { id: 'lv3', name: 't_hr_attendance', dataSourceType: 'MySQL', dataSourceName: 'HR_Master_DB', rowCount: '850K', fieldCount: 5, status: '语义理解中', aiCoverage: 80, updatedAt: '2024-06-21' },
    { id: 'lv4', name: 't_hr_performance', dataSourceType: 'MySQL', dataSourceName: 'HR_Master_DB', rowCount: '12K', fieldCount: 5, status: '语义理解中', aiCoverage: 40, updatedAt: '2024-06-01' },
    { id: 'lv5', name: 't_hr_position', dataSourceType: 'MySQL', dataSourceName: 'HR_Master_DB', rowCount: '80', fieldCount: 4, status: '未开始语义理解', aiCoverage: 0, updatedAt: '2024-05-15' },
    { id: 'lv6', name: 't_scm_supplier', description: '供应商', dataSourceType: 'MySQL', dataSourceName: 'SCM_Supply_DB', rowCount: '1.2K', fieldCount: 25, status: '部分完成', aiCoverage: 100, updatedAt: '2024-06-15' },
    { id: 'lv7', name: 't_scm_purchase_order', description: '采购订单', dataSourceType: 'MySQL', dataSourceName: 'SCM_Supply_DB', rowCount: '45.6K', fieldCount: 5, status: '部分完成', aiCoverage: 100, updatedAt: '2024-06-15' },
    { id: 'lv8', name: 't_scm_inventory', description: '库存', dataSourceType: 'PostgreSQL', dataSourceName: 'WMS_Warehouse_DB', rowCount: '8.5K', fieldCount: 4, status: '需要裁决', aiCoverage: 50, updatedAt: '2024-06-15' },
    { id: 'lv9', name: 't_scm_delivery', description: '物流运单', dataSourceType: 'Oracle', dataSourceName: 'TMS_Transport_DB', rowCount: '22.1K', fieldCount: 5, status: '需要裁决', aiCoverage: 60, updatedAt: '2024-06-15' },
];

// --- Data Standards Mocks ---

export const mockStandardDirectory: StandardDirectory[] = [
    {
        id: 'dir_1', name: '基础数据', code: 'BASE', level: 1, children: [
            { id: 'dir_1_1', name: '人员数据', code: 'BASE_PER', level: 2 },
            { id: 'dir_1_2', name: '组织数据', code: 'BASE_ORG', level: 2 },
        ]
    },
    {
        id: 'dir_2', name: '业务数据', code: 'BIZ', level: 1, children: [
            { id: 'dir_2_1', name: '销售域', code: 'BIZ_SALE', level: 2 },
            { id: 'dir_2_2', name: '财务域', code: 'BIZ_FIN', level: 2 },
        ]
    }
];

export const mockDataElements: DataElement[] = [
    { 
        id: 'de_1', name: '客户姓名', nameEn: 'Customer Name', code: 'DE_CUST_NAME', 
        dataType: 'String', dataLength: 100, isRequired: true, isUnique: false,
        description: '客户的法定注册名称', directoryId: 'dir_2_1', status: 'Published' 
    },
    { 
        id: 'de_2', name: '客户性别', nameEn: 'Customer Gender', code: 'DE_CUST_GENDER', 
        dataType: 'String', dataLength: 1, isRequired: true, isUnique: false,
        relatedCodeTableId: 'ct_1',
        description: '引用性别码表 GB/T 2261.1', directoryId: 'dir_2_1', status: 'Published' 
    },
    { 
        id: 'de_3', name: '订单金额', nameEn: 'Order Amount', code: 'DE_ORDER_AMT', 
        dataType: 'Decimal', precision: 18, scale: 2, minValue: '0.00', isRequired: true,
        description: '交易总金额，包含税费', businessRules: '必须大于等于0，且精确到分。', directoryId: 'dir_2_1', status: 'Published' 
    },
    { 
        id: 'de_4', name: '员工工号', nameEn: 'Employee ID', code: 'DE_EMP_ID', 
        dataType: 'String', dataLength: 20, isRequired: true, isUnique: true,
        description: '唯一员工标识', directoryId: 'dir_1_1', status: 'Draft' 
    },
];

export const mockCodeTables: CodeTable[] = [
    { 
        id: 'ct_1', name: '性别代码', code: 'CT_GENDER', status: 'Active', description: '国家标准 GB/T 2261.1',
        values: [
            { code: '0', label: '未知' },
            { code: '1', label: '男' },
            { code: '2', label: '女' },
            { code: '9', label: '未说明' }
        ]
    },
    { 
        id: 'ct_2', name: '证件类型', code: 'CT_ID_TYPE', status: 'Active', description: '常用证件类型定义',
        values: [
            { code: '01', label: '身份证' },
            { code: '02', label: '护照' },
            { code: '03', label: '军官证' }
        ]
    },
    { 
        id: 'ct_3', name: '订单状态', code: 'CT_ORDER_STATUS', status: 'Active', description: '销售订单生命周期状态',
        values: [
            { code: 'NEW', label: '新建' },
            { code: 'PAID', label: '已支付' },
            { code: 'SHIPPED', label: '已发货' },
            { code: 'CLOSED', label: '已关闭' }
        ]
    }
];

export const mockCodingRules: CodingRule[] = [
    { id: 'cr_1', name: '销售订单号', code: 'RULE_SO_NO', template: 'SO-{YYYY}{MM}{DD}-{SEQ:6}', example: 'SO-20231024-000001', status: 'Active', description: '每日重置流水号' },
    { id: 'cr_2', name: '客户编码', code: 'RULE_CUST_ID', template: 'C-{SEQ:8}', example: 'C-00001024', status: 'Active', description: '全局自增客户ID' },
    { id: 'cr_3', name: '资产标签', code: 'RULE_ASSET_TAG', template: 'AST-{DEPT}-{YYYY}-{SEQ:4}', example: 'AST-IT-2023-0055', status: 'Inactive', description: '固定资产标签规则' },
];

export const mockStandardDocuments: StandardDocument[] = [
    { id: 'doc_1', title: '企业数据分类分级规范 v2.0', docNumber: 'ENT-2023-001', type: 'Enterprise', fileType: 'PDF', uploadDate: '2023-11-01', status: 'Effective' },
    { id: 'doc_2', title: '个人信息安全规范', docNumber: 'GB/T 35273-2020', type: 'National', fileType: 'PDF', uploadDate: '2023-05-15', status: 'Effective' },
    { id: 'doc_3', title: '银行营业网点服务基本要求', docNumber: 'GB/T 32320-2015', type: 'Industry', fileType: 'DOCX', uploadDate: '2022-09-10', status: 'Deprecated' },
];
