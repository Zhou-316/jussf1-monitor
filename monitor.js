const puppeteer = require('puppeteer');
const EventEmitter = require('events');

class TicketMonitor extends EventEmitter {
    constructor() {
        super();
        this.browser = null;
        this.page = null;
        this.isRunning = false;
        // 配置保持不变
        this.TASKS = [
            { id: 'A', label: 'A看台', url: "https://ztmen.jussyun.com/cyy_gatewayapi/show/pub/v3/show/693133c84996310001244e59/show_session/693133c904da9600012415f4/seat_plans_dynamic_data?src=WEB&channelId=&terminalSrc=WEB&lang=en" },
            { id: 'B', label: 'B看台', url: "https://ztmen.jussyun.com/cyy_gatewayapi/show/pub/v3/show/693132f64996310001244995/show_session/693132f74996310001244a13/seat_plans_dynamic_data?src=WEB&channelId=&terminalSrc=WEB&lang=en" },
            { id: 'H', label: 'H看台', url: "https://ztmen.jussyun.com/cyy_gatewayapi/show/pub/v3/show/6931529204da960001255be6/show_session/693152944996310001259557/seat_plans_dynamic_data?src=WEB&channelId=&terminalSrc=WEB&lang=en" },
            { id: 'K', label: 'K看台', url: "https://ztmen.jussyun.com/cyy_gatewayapi/show/pub/v3/show/693152ad04da960001255d56/show_session/693152ae04da960001255d91/seat_plans_dynamic_data?src=WEB&channelId=&terminalSrc=WEB&lang=en" }
        ];
        this.ID_A_TOP = "693133c904da9600012415f7";
        this.ID_A_BOTTOM = "693133c904da9600012415f6";
    }

    // 辅助函数
    log(msg) {
        const time = new Date().toLocaleTimeString();
        const logStr = `[${time}] ${msg}`;
        console.log(logStr);
        this.emit('log', logStr); // 发送日志事件给 server.js
    }

    sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
    randomDelay(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
    shuffle(arr) { return arr.sort(() => Math.random() - 0.5); }

    // 停止功能
    async stop() {
        this.isRunning = false;
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
        }
        this.log("🛑 监控已停止");
    }

    // 启动功能
    async start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.log("🚀 正在启动浏览器引擎...");

        try {
            this.browser = await puppeteer.launch({
                headless: "new",
                args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled']
            });
            this.page = await this.browser.newPage();
            await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

            this.log("🌐 正在访问主页获取 Cookie...");
            await this.page.goto('https://ztmen.jussyun.com/', { waitUntil: 'networkidle2' });
            this.log("✅ Cookie 获取成功，监控循环开始！");

            while (this.isRunning) {
                let ticketCounts = {
                    "A_TOP": 0,
                    "A_BOTTOM": 0,
                    "B": 0,
                    "H": 0,
                    "K": 0
                };
                
                let foundAny = false;

                const tasks = this.shuffle(this.TASKS);

                for (const task of tasks) {
                    if (!this.isRunning) break;
                    try {
                        await this.page.goto(task.url, { waitUntil: 'domcontentloaded' });
                        const body = await this.page.evaluate(() => document.body.innerText);
                        let json = JSON.parse(body);

                        if (json && json.data && json.data.seatPlans) {
                            if (task.id === 'A') {
                                json.data.seatPlans.forEach(p => {
                                    if (p.seatPlanId === this.ID_A_TOP) ticketCounts["A_TOP"] = p.canBuyCount || 0;
                                    if (p.seatPlanId === this.ID_A_BOTTOM) ticketCounts["A_BOTTOM"] = p.canBuyCount || 0;
                                });
                            } else if (task.id === 'B') {
                                json.data.seatPlans.forEach(p => ticketCounts["B"] += (p.canBuyCount || 0));
                            } else if (task.id === 'H') {
                                json.data.seatPlans.forEach(p => ticketCounts["H"] += (p.canBuyCount || 0));
                            } else if (task.id === 'K') {
                                json.data.seatPlans.forEach(p => ticketCounts["K"] += (p.canBuyCount || 0));
                            }
                        }
                    } catch(e) {}
                    
                    // 随机间隔
                    await this.sleep(this.randomDelay(500, 1000));
                }

                // 检查是否有票
                let logMsgParts = [];
                for (let key in ticketCounts) {
                    if (ticketCounts[key] > 0) {
                        foundAny = true;
                        logMsgParts.push(`${key}:${ticketCounts[key]}`);
                    }
                }

                // 1. 发送详细数据给前端（用于更新UI变绿）
                this.emit('data_update', ticketCounts);

                // 2. 发送报警日志
                if (foundAny) {
                    const msg = logMsgParts.join(', ');
                    this.log(`🚨 发现余票: ${msg}`);
                    this.emit('ticket', msg); 
                }
                else {
                    this.log("暂无余票，继续监控");
                }

                if (!this.isRunning) break;
                await this.sleep(this.randomDelay(500, 1000));
            }
        } catch (e) {
            this.log(`💀 致命错误: ${e.message}`);
            this.isRunning = false;
        }
    }
}

module.exports = new TicketMonitor();