import React, { useState, useRef } from 'react'
import { useSqlCompletion } from '../hooks/useSqlCompletion'

interface SqlInputProps {
  onExecute: (sql: string) => void
  tables: string[]
  columnsMap: Record<string, string[]>
}

const SqlInput: React.FC<SqlInputProps> = ({
  onExecute,
  tables,
  columnsMap
}) => {
  const [sql, setSql] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const {
    suggestions,
    showSuggestions,
    getSuggestions,
    applySuggestion
  } = useSqlCompletion(tables, columnsMap)

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSql(e.target.value)
  }

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      onExecute(sql)
    } else if (e.key === 'Tab' && showSuggestions && suggestions.length > 0) {
      e.preventDefault()
      const result = applySuggestion(suggestions[0], sql, e.currentTarget.selectionStart ?? 0)
      setSql(result.sql)
      // 设置光标位置
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.setSelectionRange(result.position, result.position)
        }
      }, 0)
    } else if (e.key === 'ArrowDown' && showSuggestions) {
      e.preventDefault()
      // 可以实现上下箭头选择建议
    }
  }

  // 处理输入框焦点和光标位置变化
  const handleFocus = () => {
    if (inputRef.current) {
      getSuggestions(sql, inputRef.current.selectionStart ?? 0)
    }
  }

  const handleClick = () => {
    if (inputRef.current) {
      getSuggestions(sql, inputRef.current.selectionStart ?? 0)
    }
  }

  // 应用建议
  const handleSuggestionClick = (suggestion: string) => {
    if (inputRef.current) {
      const result = applySuggestion(suggestion, sql, inputRef.current.selectionStart ?? 0)
      setSql(result.sql)
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.setSelectionRange(result.position, result.position)
        }
      }, 0)
    }
  }

  return (
    <div className="sql-input-container">
      <input
        ref={inputRef}
        type="text"
        value={sql}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onClick={handleClick}
        placeholder="Enter SQL query..."
        className="sql-input"
      />
      <button 
        onClick={() => onExecute(sql)}
        className="execute-btn"
      >
        Execute
      </button>
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="suggestions-container">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="suggestion-item"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default SqlInput