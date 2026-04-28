import { useState, useCallback } from 'react'

export function useSqlCompletion(tables: string[], columnsMap: Record<string, string[]>) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false)

  // 分析SQL语句，生成补全建议
  const getSuggestions = useCallback((sql: string, position: number) => {
    
    // 提取当前输入的SQL片段
    const currentSql = sql.substring(0, position)
    const words = currentSql.split(/\s+/).filter(word => word.length > 0)
    
    if (words.length === 0) {
      setSuggestions(['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'EXPLAIN'])
      setShowSuggestions(true)
      return
    }

    const lastWord = words[words.length - 1]
    const secondLastWord = words.length > 1 ? words[words.length - 2] : ''

    // 处理表名补全（FROM后）
    if (secondLastWord.toUpperCase() === 'FROM') {
      const filteredTables = tables.filter(table => 
        table.toLowerCase().startsWith(lastWord.toLowerCase())
      )
      setSuggestions(filteredTables)
      setShowSuggestions(filteredTables.length > 0)
      return
    }

    // 处理列名补全（表名.后）
    const tableDotMatch = lastWord.match(/([a-zA-Z0-9_]+)\.$/)
    if (tableDotMatch) {
      const tableName = tableDotMatch[1]
      const tableColumns = columnsMap[tableName] || []
      const filteredColumns = tableColumns.filter(column => 
        column.toLowerCase().startsWith(lastWord.substring(tableName.length + 1).toLowerCase())
      )
      setSuggestions(filteredColumns)
      setShowSuggestions(filteredColumns.length > 0)
      return
    }

    // 处理其他SQL关键字补全
    const keywords = ['SELECT', 'FROM', 'WHERE', 'JOIN', 'GROUP', 'ORDER', 'LIMIT', 'OFFSET', 'INSERT', 'UPDATE', 'DELETE', 'EXPLAIN']
    const filteredKeywords = keywords.filter(keyword => 
      keyword.toLowerCase().startsWith(lastWord.toLowerCase())
    )
    
    setSuggestions(filteredKeywords)
    setShowSuggestions(filteredKeywords.length > 0)
  }, [tables, columnsMap])

  // 应用补全建议
  const applySuggestion = useCallback((suggestion: string, input: string, position: number) => {
    const currentSql = input.substring(0, position)
    const remainingSql = input.substring(position)
    
    // 找到最后一个空格的位置
    const lastSpaceIndex = currentSql.lastIndexOf(' ')
    const startIndex = lastSpaceIndex >= 0 ? lastSpaceIndex + 1 : 0
    
    const newSql = currentSql.substring(0, startIndex) + suggestion + ' ' + remainingSql
    const newPosition = startIndex + suggestion.length + 1
    
    setShowSuggestions(false)
    return { sql: newSql, position: newPosition }
  }, [])

  return {
    suggestions,
    showSuggestions,
    getSuggestions,
    applySuggestion
  }
}