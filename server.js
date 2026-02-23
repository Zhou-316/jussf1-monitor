const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const open = require('open');
const monitor = require('./monitor'); // 引入刚才写的逻辑

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// 设置静态文件目录
app.use(express.static('public'));

// 监听 WebSocket 连接
io.on('connection', (socket) => {
    console.log('前端页面已连接');
    monitor.on('data_update', (data) => {
    io.emit('data_update', data); // 转发给前端
});

    // 如果已经在运行，告诉前端状态
    socket.emit('status', monitor.isRunning);

    // 监听前端发来的指令
    socket.on('start', () => {
        if (!monitor.isRunning) {
            monitor.start();
            io.emit('status', true);
        }
    });

    socket.on('stop', () => {
        if (monitor.isRunning) {
            monitor.stop();
            io.emit('status', false);
        }
    });
});

// 监听 Monitor 产生的日志，实时推送到前端
monitor.on('log', (msg) => {
    io.emit('log', msg);
});

monitor.on('ticket', (msg) => {
    io.emit('ticket_alert', msg); // 给前端发一个特殊的报警信号
});



// 启动服务器
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
    
    // === 服务器启动时，自动运行监控 🔥 ===
    console.log(">>> 系统正在自动启动监控任务...");
    if (!monitor.isRunning) {
        monitor.start();
    }
    // ===========================================

    // 自动打开浏览器
    open(`http://localhost:${PORT}`);
});