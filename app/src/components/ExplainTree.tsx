import React from 'react'
// import { ExplainNode } from '../types'

// 临时类型定义
type ExplainNode = any

interface ExplainTreeProps {
  data: ExplainNode | null
}

const ExplainTree: React.FC<ExplainTreeProps> = ({ data }) => {
  if (!data) {
    return <div className="explain-tree-empty">No execution plan</div>
  }

  const renderNode = (node: ExplainNode, level: number = 0) => {
    const indentStyle = {
      marginLeft: `${level * 20}px`
    }

    return (
      <div key={JSON.stringify(node)} className="explain-node">
        <div style={indentStyle} className="node-header">
          <strong>{node['Node Type']}</strong>
          <span className="node-cost">
            Cost: {node['Startup Cost'].toFixed(2)} - {node['Total Cost'].toFixed(2)}
          </span>
          <span className="node-rows">
            Rows: {node['Plan Rows']}
          </span>
        </div>
        <div style={indentStyle} className="node-details">
          {Object.entries(node)
            .filter(([key]) => !['Node Type', 'Startup Cost', 'Total Cost', 'Plan Rows', 'Plan Width', 'Children'].includes(key))
            .map(([key, value]) => (
              <div key={key} className="node-detail-item">
                <span className="detail-key">{key}:</span>
                <span className="detail-value">{String(value)}</span>
              </div>
            ))}
        </div>
        {node.Children && node.Children.length > 0 && (
          <div className="node-children">
            {node.Children.map((child: ExplainNode) => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="explain-tree">
      <h3>Execution Plan</h3>
      {renderNode(data)}
    </div>
  )
}

export default ExplainTree