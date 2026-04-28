# TinyDB Studio

TinyDB Studio is a lightweight database client focused on three core features: viewing data, modifying data, and exporting CSV. The design philosophy is minimalism, solving the problems of slow startup, high memory usage, and complex interfaces in traditional database clients.

## Features / 功能特性

- **Lightweight & Fast** / **轻量快速**: Minimal resource usage, fast startup
- **Multi-Database Support** / **多数据库支持**: SQLite and PostgreSQL
- **Data Browsing** / **数据浏览**: View and explore database tables with ease
- **Data Editing** / **数据编辑**: Modify data directly in the grid
- **SQL Execution** / **SQL执行**: Execute SQL queries with intelligent autocomplete
- **Query Plan Visualization** / **执行计划可视化**: Visualize PostgreSQL execution plans
- **CSV Export** / **CSV导出**: Export data to CSV format

## Tech Stack / 技术栈

| Layer / 层级 | Technology / 技术 | Version / 版本 |
|--------------|-------------------|----------------|
| Desktop Framework / 桌面框架 | Electron | ^20.0.0 |
| Frontend Framework / 前端框架 | React + TypeScript | React ^18.0.0, TypeScript ^6.0.0 |
| Build Tool / 构建工具 | Vite | ^8.0.0 |
| Table Component / 表格组件 | ag-grid-react | ^29.0.0 |
| SQLite Driver / SQLite驱动 | better-sqlite3 | ^9.6.0 |
| PostgreSQL Driver / PostgreSQL驱动 | pg | ^8.8.0 |
| SQL Parser / SQL解析 | node-sql-parser | ^4.13.0 |
| Password Storage / 密码存储 | keytar | ^7.9.0 |

## Getting Started / 快速开始

### Prerequisites / 前置要求

- Node.js (v16 or higher)
- npm or yarn

### Installation / 安装

```bash
# Clone the repository / 克隆仓库
git clone <repository-url>
cd tinydbeaver/app

# Install dependencies / 安装依赖
npm install

# Rebuild native modules / 重新构建原生模块
npm run electron-rebuild
```

### Development / 开发

```bash
# Start development server / 启动开发服务器
npm run electron:dev
```

### Build / 构建

```bash
# Build for production / 构建生产版本
npm run electron:build
```

The built application will be in the `release` directory.

构建后的应用程序将在 `release` 目录中。

## Project Structure / 项目结构

```
tinydbeaver/
├── app/
│   ├── electron/                  # Electron main process / Electron主进程
│   │   ├── main.ts                # Main process entry / 主进程入口
│   │   ├── preload.ts             # Preload script / 预加载脚本
│   │   └── utils/                 # Main process utilities / 主进程工具
│   │       ├── database.ts        # Database connection management / 数据库连接管理
│   │       └── password.ts        # Password management / 密码管理
│   ├── src/                       # Renderer process / 渲染进程
│   │   ├── App.tsx                # Main application component / 主应用组件
│   │   ├── components/            # Components / 组件
│   │   │   ├── ConnectionSelector.tsx  # Connection selector / 连接选择器
│   │   │   ├── TableSelector.tsx       # Table selector / 表选择器
│   │   │   ├── DataGrid.tsx            # Data grid / 数据表格
│   │   │   ├── SqlInput.tsx            # SQL input / SQL输入框
│   │   │   ├── ExplainTree.tsx         # Execution plan tree / 执行计划树
│   │   │   └── ExportButton.tsx        # Export button / 导出按钮
│   │   ├── hooks/                 # Custom hooks / 自定义钩子
│   │   │   ├── useDatabase.ts     # Database operations hook / 数据库操作钩子
│   │   │   └── useSqlCompletion.ts # SQL completion hook / SQL补全钩子
│   │   ├── types/                 # Type definitions / 类型定义
│   │   └── utils/                 # Utility functions / 工具函数
│   │       ├── sqlParser.ts       # SQL parser / SQL解析工具
│   │       └── csvExporter.ts     # CSV exporter / CSV导出工具
│   ├── package.json               # Project configuration / 项目配置
│   └── vite.config.ts             # Vite configuration / Vite配置
```

## Usage / 使用说明

### Connection Management / 连接管理

1. On first launch, a connection configuration dialog will appear
   首次启动时，会显示连接配置弹窗
2. Configure your database connection (SQLite or PostgreSQL)
   配置数据库连接（SQLite 或 PostgreSQL）
3. Passwords are securely stored using keytar
   密码使用 keytar 安全存储
4. Use the connection dropdown to switch between connections
   使用连接下拉菜单切换不同的连接

### Data Browsing / 数据浏览

1. Select a table from the table dropdown
   从表下拉菜单中选择表
2. Data is automatically loaded and displayed
   数据会自动加载并显示
3. The grid supports virtual scrolling for 100,000+ rows
   表格支持虚拟滚动，可处理 10 万+ 行数据

### Data Editing / 数据编辑

1. Double-click a cell to enter edit mode
   双击单元格进入编辑模式
2. Edit the cell value
   编辑单元格值
3. Changes are automatically saved with UPDATE statements
   更改会自动通过 UPDATE 语句保存
4. Right-click to delete a row
   右键点击删除行

### SQL Execution / SQL执行

1. Enter SQL queries in the input box
   在输入框中输入 SQL 查询
2. Use intelligent autocomplete:
   使用智能补全：
   - Table names after FROM keyword
     FROM 关键字后提示表名
   - Column names after table name
     表名后提示列名
3. Click execute button to run the query
   点击执行按钮运行查询
4. Supports SELECT, INSERT, UPDATE, DELETE statements
   支持 SELECT、INSERT、UPDATE、DELETE 语句

### Query Plan / 执行计划

1. PostgreSQL-specific feature
   PostgreSQL 专用功能
2. Use `EXPLAIN` before your query
   在查询前使用 `EXPLAIN`
3. Execution plan is visualized as a tree
   执行计划以树状图展示
4. Key execution metrics are displayed
   显示关键执行指标

### CSV Export / CSV导出

1. Click the export button
   点击导出按钮
2. Current table data is exported to CSV
   当前表格数据导出为 CSV
3. CSV format and encoding are automatically handled
   CSV 格式和编码自动处理

## Design Philosophy / 设计理念

- **Minimalism** / **极简主义**: No unnecessary features, focus on essentials / 无不必要功能，专注于核心需求
- **Performance** / **性能**: Fast startup, low memory usage / 快速启动，低内存占用
- **Simplicity** / **简洁**: Intuitive interface, maximum 2 clicks for any operation / 直观界面，任何操作最多 2 次点击
- **Efficiency** / **高效**: Instant feedback, intelligent autocomplete / 即时反馈，智能补全

## Future Plans / 未来计划

- Support for more database types (MySQL, SQL Server, etc.)
  支持更多数据库类型（MySQL、SQL Server 等）
- Basic table structure management
  基本的表结构管理
- Query history
  查询历史记录
- CSV data import
  CSV 数据导入
- Simple data visualization
  简单的数据可视化

## License / 许可证

This project is licensed under the MIT License.

本项目采用 MIT 许可证。

## Contributing / 贡献

Contributions are welcome! Please feel free to submit a Pull Request.

欢迎贡献！请随时提交 Pull Request。
