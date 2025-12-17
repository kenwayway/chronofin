# ChronoFin

一个简洁优雅的个人财务追踪应用，灵感来自 [chronolog](https://github.com/kenwayway/chronolog)。

## 功能特点

- 📊 **时间线视图** - 按日期分组的交易记录
- 💰 **多账户管理** - 追踪银行卡、现金、电子账户余额
- 📈 **统计面板** - 月度收支汇总和分类统计
- 🎨 **深色/浅色主题** - 自动保存偏好设置
- 📱 **响应式设计** - 移动优先的界面

## 技术栈

- **前端**: React 19 + Vite
- **样式**: Vanilla CSS (CSS 变量主题系统)
- **图标**: Lucide React
- **日期**: date-fns
- **数据库**: Cloudflare D1 (已准备schema)
- **部署**: Cloudflare Pages

## 开始使用

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问 http://localhost:5173
```

## 数据库设置 (生产环境)

```bash
# 创建 D1 数据库
npx wrangler d1 create chronofin

# 更新 wrangler.toml 中的 database_id

# 运行迁移
npx wrangler d1 execute chronofin --remote --file=./schema.sql

# 部署
npm run build
npx wrangler pages deploy dist
```

## 项目结构

```
src/
├── components/          # 可复用组件
│   └── TransactionForm # 交易表单
├── contexts/           # React Context
│   ├── ThemeContext   # 主题切换
│   └── DataContext    # 数据管理
├── pages/             # 页面组件
│   ├── Timeline       # 时间线
│   ├── Accounts       # 账户列表
│   └── Statistics     # 统计面板
└── index.css          # 设计系统
```

## 当前状态

✅ 完整的前端实现（使用模拟数据）  
✅ D1 数据库 schema 已就绪  
⏳ 等待 Cloudflare API 集成

## License

MIT
