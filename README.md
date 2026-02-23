# 🎫 玖拾体育抢票助手 | 全看台监控版

> 一个高效的实时门票监控工具，支持同时监控多个看台，自动发现可购票源并即时提醒。


## 📋 功能特性

- ✅ **全看台实时监控** - 支持 A看台（上下层）、B看台、H看台、K看台同时监控
- ✅ **可视化面板** - 实时显示各看台余票数量，有票时自动变绿高亮
- ✅ **智能告警** - 发现余票时弹窗提醒 + 红色日志标记
- ✅ **随机请求** - 随机打乱查询顺序，降低被拦截风险
- ✅ **Cookie 自动维护** - 启动时自动获取与更新认证信息
- ✅ **Web 控制台** - 现代化的响应式界面，一键启动/停止
- ✅ **直链抢票** - 发现余票时可直接跳转到购票页面（一键点击）

## 🛠 技术栈

- **后端框架**: Express.js
- **浏览器自动化**: Puppeteer
- **实时通信**: Socket.IO
- **前端**: HTML + CSS + JavaScript
- **运行环境**: Node.js

## 📦 项目结构

```
jiushi体育监控助手/
├── server.js           # Express 服务器及 WebSocket 控制
├── monitor.js          # 核心监控逻辑
├── package.json        # 项目依赖配置
├── 启动.bat            # Windows 启动脚本
├── README.md          # 项目说明文档
└── public/
    └── index.html     # Web 控制台前端
```

## 🚀 快速开始

### 环境要求

- Node.js 14.0 及以上版本

### 安装步骤

1. **安装依赖**
   ```bash
   npm install
   ```

2. **启动应用**

   **Windows 用户** (推荐):
   ```bash
   双击运行 启动.bat
   ```

   **Mac/Linux 用户**:
   ```bash
   node server.js
   ```

3. **访问控制台**
   
   应用将自动打开浏览器，访问 `http://localhost:3000`

## 🔧 进阶配置

### 修改监控 URL

编辑 `monitor.js` 中的 `TASKS` 数组，修改各看台的监控链接：

```javascript
this.TASKS = [
    { id: 'A', label: 'A看台', url: "https://ztmen.jussyun.com/cyy_gatewayapi/..." },
    { id: 'B', label: 'B看台', url: "https://ztmen.jussyun.com/cyy_gatewayapi/..." },
    { id: 'H', label: 'H看台', url: "https://ztmen.jussyun.com/cyy_gatewayapi/..." },
    { id: 'K', label: 'K看台', url: "https://ztmen.jussyun.com/cyy_gatewayapi/..." }
];
```

### 调整监控频率

在 `monitor.js` 中修改延迟参数：

#### 1. 检查间隔（轮询周期）
```javascript
await this.sleep(this.randomDelay(5000, 10000));  // 当前: 5-10秒
// 改为:
await this.sleep(this.randomDelay(3000, 5000));   // 改为: 3-5秒（更频繁）
```

#### 2. 请求间隔（防止被限流）
```javascript
await this.sleep(this.randomDelay(500, 1000));    // 当前: 500-1000ms
// 改为:
await this.sleep(this.randomDelay(200, 500));     // 改为: 200-500ms（更快）
```

⚠️ **警告**: 太高的频率可能导致 IP 被限制，建议保持 3-5 秒的间隔

### 修改特定看台的座位 ID

A看台的上下层需要特殊处理，座位 ID 位于：

```javascript
this.ID_A_TOP = "693133c904da9600012415f7";
this.ID_A_BOTTOM = "693133c904da9600012415f6";
```

### 服务器端口配置

在 `server.js` 中修改：

```javascript
const PORT = 3000;  // 改为其他端口，如 8080
```

## ⚠️ 注意事项

1. **IP 限制** - 频繁请求可能导致 IP 被暂时限制，请合理设置监控频率
2. **Cookie 有效期** - 程序启动时会自动获取 Cookie，有效期约 1 小时
3. **浏览器依赖** - 首次运行需要下载 Chromium（~200MB）
4. **网络连接** - 需要稳定的网络连接，建议有线网络
5. **防火墙** - 确保 3000 端口未被防火墙阻止

## 🐛 常见问题 (FAQ)

### Q: 启动后无法打开浏览器？
A: 这是正常的，系统已在后台运行。请手动访问 `http://localhost:3000`

### Q: "等待扫描..." 一直显示？
A: 这可能是因为：
- URL 配置已过期或不正确
- 网络连接不稳定
- 服务器暂时无法访问
- 账号/Cookie 已失效

解决方案：重新启动监控或检查 URL

### Q: 显示 "致命错误"？
A: 检查以下项目：
- 磁盘空间是否充足（至少 500MB）
- 网络连接是否正常
- 3000 端口是否被占用：`netstat -ano | find ":3000"` (Windows)
- 重启应用

### Q: 无法下载 Chromium？
A: Puppeteer 首次运行需要下载浏览器（~200MB）：
- 检查磁盘空间
- 检查网络连接（如需代理，参考 [Puppeteer 代理配置](https://pptr.dev/guides/chromium-migration)）
- 手动指定本地 Chromium：编辑 `monitor.js`，修改 `puppeteer.launch()` 参数

### Q: IP 被限制 (403/429 错误)？
A: 降低监控频率：
```javascript
// 将检查间隔改为 10-15 秒
await this.sleep(this.randomDelay(10000, 15000));
```

### Q: 如何修改监控的赛事/URL？
A: 编辑 `monitor.js` 中的 `TASKS` 数组和座位 ID 即可

### Q: 能否同时监控多个赛事？
A: 当前设计是监控单个赛事的多个看台。如需监控多个赛事，需要：
1. 启动多个实例（不同端口）
2. 或扩展代码支持多赛事

### Q: 如何在服务器上部署？
A: 
```bash
# 1. 安装 Node.js
# 2. 上传项目文件
# 3. npm install
# 4. 使用 PM2 保持后台运行
npm install -g pm2
pm2 start server.js --name "ticket-monitor"
# 5. 访问 http://server-ip:3000
```

### Q: 浏览器弹窗没有出现？
A: 需要允许弹窗权限。检查浏览器控制台（F12 开发者工具），查看是否有权限提示


### 核心流程

1. **初始化阶段**
   - Puppeteer 启动无头浏览器
   - 访问主页获取并维护 Cookie
   
2. **监控循环**
   - 随机打乱看台查询顺序（防爬）
   - 逐一查询各看台 API 端点
   - 解析 JSON 响应获取 `canBuyCount` 字段
   
3. **数据处理**
   - 统计各看台可购票数量
   - 标记有票的看台
   - 发送 `data_update` 事件到前端
   
4. **告警推送**
   - 如果发现余票，发送 `ticket_alert` 事件
   - 前端接收后：
     - 目标看台项目变绿高亮
     - 弹窗提醒用户
     - 激活"去抢票"按钮

### 防反爬机制

- ✅ 随机延迟 (500-1000ms)
- ✅ 随机请求顺序 (shuffle)
- ✅ 标准 UA (Chrome 122)
- ✅ 自动维护 Cookie
- ✅ 浏览器环境模拟 (`disable-blink-features`)

## 🙏 法律声明与免责

> 本工具仅供 **学习研究** 之用，用户需遵守相关法律法规与网站服务条款。

- ⚠️ 本工具不进行任何商业活动
- ⚠️ 不对爬虫行为造成的后果负责
- ⚠️ 强烈建议遵守 [玖拾体育官网](https://ztmen.jussyun.com/) 的使用规则
- ⚠️ 用户自行承担因使用本工具引发的所有风险和责任


## ⭐ 如果有帮助

如果这个项目对你有帮助，请给个 Star ⭐ 支持一下！

---

**最后更新**: 2026年2月23日  

