import React from 'react'

interface TableSelectorProps {
  tables: string[]
  currentTable: string
  onTableChange: (tableName: string) => void
}

const TableSelector: React.FC<TableSelectorProps> = ({
  tables,
  currentTable,
  onTableChange
}) => {
  const handleTableChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onTableChange(e.target.value)
  }

  return (
    <div className="table-selector">
      <select
        value={currentTable}
        onChange={handleTableChange}
        className="table-select"
      >
        <option value="">Select Table</option>
        {tables.map(table => (
          <option key={table} value={table}>
            {table}
          </option>
        ))}
      </select>
    </div>
  )
}

export default TableSelector