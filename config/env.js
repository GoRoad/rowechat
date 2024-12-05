const path = require('path');

// Load environment variables based on NODE_ENV
require('dotenv').config({
    path: path.join(__dirname, '..', `.env.${process.env.NODE_ENV || 'development'}`)
});

module.exports = {
    PORT: process.env.PORT || 3000,  // 机器人服务端口
    DEBUG: process.env.DEBUG === 'true',
    WEGE_BASE_API_URL: process.env.WEGE_BASE_API_URL,
    WEGE_FILE_API_URL: process.env.WEGE_FILE_API_URL,
    WEGE_LOCAL_PROXY: process.env.WEGE_LOCAL_PROXY,
    OPENAI_API_BASE: process.env.OPENAI_API_BASE,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_MODEL: process.env.OPENAI_MODEL,
    ALLOWED_ROOM_LIST: process.env.ALLOWED_ROOM_LIST
};
