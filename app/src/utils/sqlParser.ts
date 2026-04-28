import { Parser } from 'node-sql-parser'

const parser = new Parser()

// AST类型定义
interface SqlAst {
  type: string
  from?: Array<{ type: string; table: string }>
  columns?: Array<{ expr: { column?: string } }>
  table?: string
}

// 解析SQL语句，提取表名和列名
export function parseSql(query: string): {
  tables: string[]
  columns: string[]
  type: string
} {
  try {
    const ast = parser.parse(query) as unknown as SqlAst
    const tables: string[] = []
    const columns: string[] = []
    let type = 'unknown'

    if (ast.type === 'select') {
      type = 'select'
      // 提取FROM子句中的表名
      if (ast.from) {
        ast.from.forEach((item) => {
          if (item.type === 'table') {
            tables.push(item.table)
          }
        })
      }
      // 提取SELECT子句中的列名
      if (ast.columns) {
        ast.columns.forEach((col) => {
          if (col.expr && col.expr.column) {
            columns.push(col.expr.column)
          }
        })
      }
    } else if (ast.type === 'insert') {
      type = 'insert'
      if (ast.table) {
        tables.push(ast.table)
      }
    } else if (ast.type === 'update') {
      type = 'update'
      if (ast.table) {
        tables.push(ast.table)
      }
    } else if (ast.type === 'delete') {
      type = 'delete'
      if (ast.table) {
        tables.push(ast.table)
      }
    }

    return { tables, columns, type }
  } catch (error) {
    console.error('SQL parse error:', error)
    return { tables: [], columns: [], type: 'unknown' }
  }
}

// 生成UPDATE语句
export function generateUpdate(table: string, row: any, primaryKey: string): string {
  const setClauses = Object.entries(row)
    .filter(([key]) => key !== primaryKey)
    .map(([key, value]) => {
      const formattedValue = typeof value === 'string' ? `'${value}'` : value
      return `${key} = ${formattedValue}`
    })
    .join(', ')

  return `UPDATE ${table} SET ${setClauses} WHERE ${primaryKey} = ${row[primaryKey]}`
}

// 生成DELETE语句
export function generateDelete(table: string, primaryKey: string, value: any): string {
  const formattedValue = typeof value === 'string' ? `'${value}'` : value
  return `DELETE FROM ${table} WHERE ${primaryKey} = ${formattedValue}`
}

// 生成INSERT语句
export function generateInsert(table: string, row: any): string {
  const columns = Object.keys(row).join(', ')
  const values = Object.values(row)
    .map(value => typeof value === 'string' ? `'${value}'` : value)
    .join(', ')
  
  return `INSERT INTO ${table} (${columns}) VALUES (${values})`
}