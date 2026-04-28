import { useState, useEffect, useCallback } from 'react'
// import { ConnectionConfig, DataRow } from '../types'

// 临时类型定义
type ConnectionConfig = any
type DataRow = any

// 声明 electronAPI 类型
declare global {
  interface Window {
    electronAPI: {
      getConnections: () => Promise<ConnectionConfig[]>
      connectDatabase: (config: ConnectionConfig) => Promise<boolean>
      getTables: () => Promise<string[]>
      executeQuery: (query: string) => Promise<DataRow[]>
      exportCsv: (data: DataRow[], filename: string) => Promise<boolean>
      openFileDialog: () => Promise<string | null>
    }
  }
}

export function useDatabase() {
  const [connections, setConnections] = useState<ConnectionConfig[]>([])
  const [currentConnection, setCurrentConnection] = useState<ConnectionConfig | null>(null)
  const [tables, setTables] = useState<string[]>([])
  const [currentTable, setCurrentTable] = useState<string>('')
  const [data, setData] = useState<DataRow[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')

  // 加载表数据
  const loadTableData = useCallback(async (tableName: string) => {
    setLoading(true)
    try {
      const result = await window.electronAPI.executeQuery(`SELECT * FROM ${tableName}`)
      setData(result)
      setCurrentTable(tableName)
    } catch (error) {
      console.error('Load table data error:', error)
      setError('Failed to load table data')
    } finally {
      setLoading(false)
    }
  }, [])

  // 加载表列表
  const loadTables = useCallback(async () => {
    if (!currentConnection) return
    
    setLoading(true)
    try {
      const tableList = await window.electronAPI.getTables()
      setTables(tableList)
      if (tableList.length > 0) {
        setCurrentTable(tableList[0])
        await loadTableData(tableList[0])
      }
    } catch (error) {
      console.error('Load tables error:', error)
      setError('Failed to load tables')
    } finally {
      setLoading(false)
    }
  }, [currentConnection, loadTableData])

  // 加载连接配置
  const loadConnections = useCallback(async () => {
    try {
      const connections = await window.electronAPI.getConnections()
      setConnections(connections)
      if (connections.length > 0) {
        setCurrentConnection(connections[0])
      }
    } catch (error) {
      console.error('Load connections error:', error)
    }
  }, [])

  // 连接数据库
  const connectDatabase = useCallback(async (config: ConnectionConfig) => {
    setLoading(true)
    setError('')
    
    // 检查是否在 Electron 环境中
    if (!window.electronAPI) {
      setError('Database operations require Electron environment. Please run the app using "npm run electron:dev".')
      setLoading(false)
      return
    }
    
    try {
      const success = await window.electronAPI.connectDatabase(config)
      if (success) {
        setCurrentConnection(config)
        await loadTables()
      } else {
        setError('Failed to connect to database. Please check your connection settings.')
      }
    } catch (error) {
      console.error('Connect database error:', error)
      setError('Failed to connect to database. ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }, [loadTables])

  // 执行SQL查询
  const executeQuery = useCallback(async (query: string) => {
    setLoading(true)
    setError('')
    try {
      const result = await window.electronAPI.executeQuery(query)
      setData(result)
      return result
    } catch (error: any) {
      console.error('Execute query error:', error)
      setError(error.message || 'Failed to execute query')
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  // 导出CSV
  const exportCsv = useCallback(async (filename: string) => {
    try {
      const result = await window.electronAPI.exportCsv(data, filename)
      
      if (result === false) {
        console.log('Export canceled by user')
        return false
      }
      
      if (result.success) {
        if (result.fallback) {
          console.log(`CSV exported to fallback location: ${result.filePath}`)
          alert(`CSV exported successfully to: ${result.filePath}\n\nNote: Could not write to your selected location, so the file was saved to the application data directory.`)
        } else {
          console.log(`CSV exported to: ${result.filePath}`)
        }
        return true
      } else {
        console.error('Export failed:', result.error)
        alert(`Export failed: ${result.error}`)
        return false
      }
    } catch (error) {
      console.error('Export CSV error:', error)
      return false
    }
  }, [data])

  // 初始化
  useEffect(() => {
    loadConnections()
  }, [loadConnections])

  // 当连接变化时自动加载表列表
  useEffect(() => {
    if (currentConnection) {
      loadTables()
    }
  }, [currentConnection])

  return {
    connections,
    currentConnection,
    tables,
    currentTable,
    data,
    loading,
    error,
    connectDatabase,
    loadTables,
    loadTableData,
    executeQuery,
    exportCsv
  }
}