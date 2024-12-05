const { GeweBot, Filebox, UrlLink, WeVideo, Voice, MiniApp, AppMsg } = require("gewechaty");
const config = require('../config/env');
const OpenAIService = require('./openaiService');

// 加载环境变量
// dotenv.config();

class WechatBot {
    constructor() {
        this.bot = new GeweBot({
            debug: config.DEBUG,
            port: config.PORT,  // 使用统一的端口
            static: "static",
            route: "/getWechatCallBack",
            proxy: config.WEGE_LOCAL_PROXY,
            base_api: config.WEGE_BASE_API_URL,
            file_api: config.WEGE_FILE_API_URL,
        });

        // 确保allowedRoomList始终是数组
        const roomList = config.ALLOWED_ROOM_LIST || '';
        this.allowedRoomList = roomList ? roomList.split(',').map(roomName => roomName.trim()) : [];

        this.openaiService = new OpenAIService();
        this.initEventHandlers();
    }

    async initEventHandlers() {
        // 处理消息事件
        this.bot.on("message", this.onMessage.bind(this));

        // 处理好友请求事件
        this.bot.on("friendship", this.onFriendship.bind(this));

        // 处理群邀请事件
        this.bot.on("room-invite", this.onRoomInvite.bind(this));

        // 处理扫码事件
        this.bot.on("scan", this.onScan.bind(this));

        // 处理所有事件
        //this.bot.on("all", this.onAll.bind(this));
    }

    async initRoomListeners() {
        try {
            console.log('允许的群列表:', this.allowedRoomList);

            // 为每个配置的群设置监听器
            for (const roomName of this.allowedRoomList) {
                console.log('正在初始化群:', roomName);
                const room = await this.bot.Room.find({ topic: roomName });
                if (room) {
                    console.log(`开始监听群：${roomName}`);

                    // 监听加入群事件
                    room.on('join', async (room, contact) => {
                        const urlLink = new UrlLink({
                            title: `欢迎 ${contact._name} 加入群聊`,
                            desc: `微信号：${contact._wxid}`,
                            //linkUrl: 'https://www.baidu.com'
                        })
                        room.say(urlLink)
                    })

                    // 监听退出群事件
                    room.on('leave', async (room, contact) => {
                        const urlLink = new UrlLink({
                            title: `很遗憾，${contact._name} 退出了群聊`,
                            desc: `微信号：${contact._wxid}`,
                            // linkUrl: 'https://www.baidu.com'
                        })
                        room.say(urlLink)
                    })

                    // 监听群名称变更事件
                    room.on('topic', async (room, newTopic, oldTopic, changer) => {
                        await room.say(`群名由"${oldTopic}"改为"${newTopic}"`, '@all');
                    });
                } else {
                    console.log(`未找到群：${roomName}，请确保群已保存到通讯录`);
                }
            }
        } catch (error) {
            console.error('初始化群监听时发生错误:', error);
        }
    }

    async onMessage(msg) {
        try {
            const room = await msg.room();
            // 如果是私聊消息，直接处理
            if (!room) {
                if (msg.type() === this.bot.Message.Type.Text) {
                    const text = msg.text();
                    const response = await this.openaiService.generateResponse(text);
                    await msg.say(response);
                }
                return;
            }

            // 如果是群消息，获取群名称
            const roomName = await room.topic();

            // 检查是否是允许的群
            if (!this.allowedRoomList.includes(roomName)) {
                console.log('不在允许的群列表中');
                return;
            } else {
                // 群消息需要@才回复
                const mentionSelf = await msg.mentionSelf();
                if (mentionSelf) {
                    const text = msg.text().replace(/@[^,，：:\s]*\s*/g, '').trim(); // 移除@部分
                    if (text) {
                        const response = await this.openaiService.generateResponse(text);
                        await msg.say(response);
                    }
                }
            }
        } catch (error) {
            console.error('处理消息时发生错误:', error);
        }
    }

    async onFriendship(friendship) {
        try {
            const scene = friendship.type();
            if (friendship.hello() === 'ding' && scene === 15) {
                await friendship.accept();
                const contact = friendship.contact();
                await contact.say('你好，很高兴认识你！');
            }
        } catch (error) {
            console.error('处理好友请求时发生错误:', error);
        }
    }

    async onRoomInvite(roomInvitation) {
        try {
            await roomInvitation.accept();
        } catch (error) {
            console.error('处理群邀请时发生错误:', error);
        }
    }

    onScan(qrcode) {
        console.log('请扫描二维码登录:', qrcode.url);
    }

    // onAll(msg) {
    //     console.log('收到事件:', msg);
    // }

    async start() {
        try {
            const { app, router } = await this.bot.start();

            // 添加自定义路由
            router.get('/sendText', async (ctx) => {
                try {
                    const { text, to } = ctx.request.query;
                    const contact = await this.bot.Contact.find({ name: to });
                    if (contact) {
                        await contact.say(text);
                        ctx.body = { success: true, message: '发送成功' };
                    } else {
                        ctx.body = { success: false, message: '联系人未找到' };
                    }
                } catch (error) {
                    ctx.body = { success: false, message: error.message };
                }
            });

            app.use(router.routes()).use(router.allowedMethods());

            // 初始化群监听
            await this.initRoomListeners();

            console.log('微信机器人启动成功！');
            return { app, router };
        } catch (error) {
            console.error('启动机器人时发生错误:', error);
            throw error;
        }
    }
}

module.exports = WechatBot;
