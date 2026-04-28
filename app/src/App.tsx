import { useState, useEffect } from 'react'
import './App.css'
import ConnectionSelector from './components/ConnectionSelector'
import TableSelector from './components/TableSelector'
import DataGrid from './components/DataGrid'
import SqlInput from './components/SqlInput'
import ExplainTree from './components/ExplainTree'
import { useDatabase } from './hooks/useDatabase'
import { generateUpdate, generateDelete } from './utils/sqlParser'
// import { DataRow, ExplainNode } from './types'

// 临时类型定义
type DataRow = Record<string, any>
type ExplainNode = any

function App() {
  const {
    connections,
    currentConnection,
    tables,
    currentTable,
    data,
    loading,
    error,
    connectDatabase,
    loadTableData,
    executeQuery
  } = useDatabase()

  const [columnsMap, setColumnsMap] = useState<Record<string, string[]>>({})
  const [explainPlan, setExplainPlan] = useState<ExplainNode | null>(null)

  // 加载表的列信息
  useEffect(() => {
    if (currentConnection && tables.length > 0) {
      const newColumnsMap: Record<string, string[]> = {}
      tables.forEach(table => {
        // 简单实现，实际应该查询INFORMATION_SCHEMA获取列信息
        if (data.length > 0 && currentTable === table) {
          newColumnsMap[table] = Object.keys(data[0])
        }
      })
      setColumnsMap(newColumnsMap)
    }
  }, [currentConnection, tables, data, currentTable])

  // 处理连接选择
  const handleConnect = async (config: any) => {
    await connectDatabase(config)
  }

  // 处理表选择
  const handleTableChange = async (tableName: string) => {
    await loadTableData(tableName)
  }

  // 处理单元格编辑
  const handleCellValueChanged = async (row: DataRow, colId: string, newValue: any) => {
    if (!currentTable) return
    
    // 生成并执行UPDATE语句
    const primaryKey = Object.keys(row)[0] // 假设第一列为主键
    const updatedRow = { ...row, [colId]: newValue }
    const updateQuery = generateUpdate(currentTable, updatedRow, primaryKey)
    
    try {
      await executeQuery(updateQuery)
      // 重新加载数据
      await loadTableData(currentTable)
    } catch (error) {
      console.error('Update error:', error)
    }
  }

  // 处理行删除
  const handleRowDeleted = async (row: DataRow) => {
    if (!currentTable) return
    
    // 生成并执行DELETE语句
    const primaryKey = Object.keys(row)[0] // 假设第一列为主键
    const deleteQuery = generateDelete(currentTable, primaryKey, row[primaryKey])
    
    try {
      await executeQuery(deleteQuery)
      // 重新加载数据
      await loadTableData(currentTable)
    } catch (error) {
      console.error('Delete error:', error)
    }
  }

  // 处理SQL执行
  const handleExecuteSql = async (sql: string) => {
    if (!sql.trim()) return
    
    // 检查是否是EXPLAIN语句
    if (sql.toLowerCase().startsWith('explain')) {
      try {
        const result = await executeQuery(sql)
        // 解析执行计划结果
        if (result.length > 0) {
          setExplainPlan(parseExplainResult(result))
        }
      } catch (error) {
        console.error('Explain error:', error)
      }
    } else {
      // 普通SQL语句
      await executeQuery(sql)
      setExplainPlan(null)
    }
  }

  // 解析执行计划结果
  const parseExplainResult = (result: any[]): ExplainNode | null => {
    if (result.length === 0) return null
    
    // 简单解析，实际需要根据PostgreSQL的EXPLAIN输出格式进行调整
    const rootNode: ExplainNode = {
      'Node Type': result[0]['Node Type'] || 'Unknown',
      'Startup Cost': parseFloat(result[0]['Startup Cost']) || 0,
      'Total Cost': parseFloat(result[0]['Total Cost']) || 0,
      'Plan Rows': parseInt(result[0]['Plan Rows']) || 0,
      'Plan Width': parseInt(result[0]['Plan Width']) || 0
    }
    
    // 复制其他属性
    Object.entries(result[0]).forEach(([key, value]) => {
      if (!['Node Type', 'Startup Cost', 'Total Cost', 'Plan Rows', 'Plan Width'].includes(key)) {
        rootNode[key] = value
      }
    })
    
    return rootNode
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>TinyDB Studio</h1>
        <div className="header-controls">
          <ConnectionSelector
            connections={connections}
            currentConnection={currentConnection}
            onConnect={handleConnect}
          />
          {currentConnection && (
            <TableSelector
              tables={tables}
              currentTable={currentTable}
              onTableChange={handleTableChange}
            />
          )}
        </div>
      </header>

      <main className="app-main">
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <DataGrid
          data={data}
          onCellValueChanged={handleCellValueChanged}
          onRowDeleted={handleRowDeleted}
          loading={loading}
        />

        {explainPlan && (
          <ExplainTree data={explainPlan} />
        )}
      </main>

      <footer className="app-footer">
        <SqlInput
          onExecute={handleExecuteSql}
          tables={tables}
          columnsMap={columnsMap}
        />
      </footer>
    </div>
  )
}

export default App
