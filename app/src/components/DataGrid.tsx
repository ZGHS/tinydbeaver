import React, { useMemo } from 'react'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
// import { DataRow } from '../types'

// 临时类型定义
type DataRow = any

interface DataGridProps {
  data: DataRow[]
  onCellValueChanged: (row: DataRow, colId: string, newValue: any) => void
  onRowDeleted: (row: DataRow) => void
  loading: boolean
}

const DataGrid: React.FC<DataGridProps> = ({
  data,
  onCellValueChanged,
  onRowDeleted,
  loading
}) => {
  // 生成列定义
  const columnDefs = useMemo(() => {
    if (data.length === 0) return []
    
    const columns = Object.keys(data[0]).map(field => ({
      field,
      headerName: field,
      editable: true,
      flex: 1,
      minWidth: 100
    }))
    
    return columns
  }, [data])

  // 处理单元格值变化
  const handleCellValueChanged = (event: any) => {
    onCellValueChanged(event.data, event.colDef.field, event.newValue)
  }

  // 处理行右键菜单
  const getContextMenuItems = (params: any) => {
    return [
      {
        name: 'Delete Row',
        action: () => {
          onRowDeleted(params.node.data)
        }
      }
    ]
  }

  return (
    <div className="data-grid-container">
      <div className="ag-theme-alpine" style={{ height: '600px', width: '100%' }}>
        <AgGridReact
          columnDefs={columnDefs}
          rowData={loading ? [] : data}
          domLayout="normal"
          enableCellChangeFlash={true}
          onCellValueChanged={handleCellValueChanged}
          getContextMenuItems={getContextMenuItems}
          animateRows={true}
        />
        {loading && (
          <div className="loading-overlay">Loading...</div>
        )}
      </div>
    </div>
  )
}

export default DataGrid