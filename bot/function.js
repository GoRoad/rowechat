import axios from 'axios';

// 模拟获取当前天气信息的函数
function getCurrentWeather(location) {
    // 这里应该实现调用真实天气API的逻辑，返回天气信息
    // 为了示例简单，我们直接返回一个固定的字符串
    return `北京天气晴，24~30度`;
}

// 模拟歌曲查询函数（根据描述实现具体逻辑）
function musicPlayer(query) {
    // 这里应该实现调用音乐查询API的逻辑，返回相关音乐信息
    // 为了示例简单，我们直接返回一个固定的字符串
    return `查询到与${query}相关的音乐信息`;
}

async function testFunctionCall() {
    const messages = [
        {
            role: 'system',
            content: '你是豆包，是由字节跳动开发的AI人工智能助手'
        },
        {
            role: 'user',
            content: '北京今天的天气'
        }
    ];

    const req = {
        model: 'ep-20240xxx',
        messages,
        temperature: 0.8,
        tools: [
            {
                type: 'function',
                function: {
                    name: 'MusicPlayer',
                    description: '歌曲查询Plugin，当用户需要搜索某个歌手或者歌曲时使用此plugin，给定歌手，歌名等特征返回相关音乐。例子1：query=想听孙燕姿的遇见， 输出{"artist":"孙燕姿","song_name":"遇见","description":""}',
                    parameters: {
                        properties: {
                            artist: { description: '表示歌手名字', type: 'string' },
                            description: { description: '表示描述信息', type: 'string' },
                            song_name: { description: '表示歌曲名字', type: 'string' }
                        },
                        required: [],
                        type: 'object'
                    }
                }
            },
            {
                type: 'function',
                function: {
                    name: 'get_current_weather',
                    description: '',
                    parameters: {
                        type: 'object',
                        properties: {
                            location: { type: 'string', description: '地理位置，比如北京' },
                            unit: { type: 'string', description: '枚举值 [摄氏度,华氏度]' }
                        },
                        required: ['location']
                    }
                }
            }
        ]
    };

    try {
        const ts = Date.now();
        const response = await axios.post('https://ark.cn-beijing.volces.com/api/v3/chat/completions', req, {
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                'Authorization': 'Bearer apikey'
            }
        });
        const completion = response.data;
        if (completion.choices[0].message.tool_calls) {
            console.log(completion.choices[0]);
            // 处理函数调用结果并构建新的messages
            const toolCall = completion.choices[0].message.tool_calls[0];
            let toolMessage;
            if (toolCall.function.name === 'get_current_weather') {
                const location = JSON.parse(toolCall.function.arguments).location;
                const weatherInfo = getCurrentWeather(location);
                toolMessage = {
                    role: 'tool',
                    tool_call_id: toolCall.id,
                    content: weatherInfo,
                    name: toolCall.function.name
                };
            } else if (toolCall.function.name === 'MusicPlayer') {
                const query = JSON.parse(toolCall.function.arguments).query;
                const musicInfo = musicPlayer(query);
                toolMessage = {
                    role: 'tool',
                    tool_call_id: toolCall.id,
                    content: musicInfo,
                    name: toolCall.function.name
                };
            }
            req.messages.push(completion.choices[0].message);
            req.messages.push(toolMessage);
            // 再次请求模型（如果需要）
            const ts2 = Date.now();
            const response2 = await axios.post('https://ark.cn-beijing.volces.com/api/v3/chat/completions', req, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer your_authorization_token'
                }
            });
            const completion2 = response2.data;
            console.log(`Bot [${(Date.now() - ts2) / 1000} s][FC Summary]: `, completion2.choices[0].message.content);
        }
    } catch (error) {
        console.error('Error:', error.response.data);
    }
}

testFunctionCall();