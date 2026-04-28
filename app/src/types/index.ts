// 数据库连接配置类型
export interface ConnectionConfig {
  name: string
  type: 'postgresql' | 'sqlite'
  host?: string
  port?: number
  username?: string
  password?: string
  database?: string
  path?: string
}

// 数据库表结构类型
export interface TableInfo {
  name: string
  columns: ColumnInfo[]
}

// 列信息类型
export interface ColumnInfo {
  name: string
  type: string
  nullable: boolean
  defaultValue?: any
}

// 执行计划节点类型
export interface ExplainNode {
  'Node Type': string
  'Startup Cost': number
  'Total Cost': number
  'Plan Rows': number
  'Plan Width': number
  [key: string]: any
  Children?: ExplainNode[]
}

// 数据行类型
export type DataRow = Record<string, any>

