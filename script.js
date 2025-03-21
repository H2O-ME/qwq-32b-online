document.addEventListener('DOMContentLoaded', function() {
    // 添加自定义头像样式 - 放在函数最开始部分
    const avatarStyle = document.createElement('style');
    avatarStyle.textContent = `
        .logo-icon {
            background-image: url('https://img20.360buyimg.com/openfeedback/jfs/t1/275291/18/7473/12144/67dd638bF07767365/4cfd58139b349fd4.png') !important;
            background-size: contain;
            background-position: center;
            background-repeat: no-repeat;
        }
        
        .bot-avatar {
            background-image: url('https://img20.360buyimg.com/openfeedback/jfs/t1/275291/18/7473/12144/67dd638bF07767365/4cfd58139b349fd4.png') !important;
            background-size: contain;
            background-position: center;
            background-repeat: no-repeat;
        }
    `;
    document.head.appendChild(avatarStyle);
    
    const chatContainer = document.getElementById('chat-container');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-btn');
    const newChatButton = document.getElementById('new-chat');
    const themeToggle = document.getElementById('theme-toggle');
    
    // 设置当前日期
    const currentDateElem = document.getElementById('current-date');
    if (currentDateElem) {
        const now = new Date();
        currentDateElem.textContent = now.toLocaleDateString('zh-CN');
    }
    
    // 确保highlight.js加载
    function ensureHighlightJsLoaded() {
        if (!window.hljs) {
            console.warn("highlight.js 未加载，尝试动态加载...");
            const script = document.createElement('script');
            script.src = "https://cdn.jsdelivr.net/npm/highlight.js@11.7.0/lib/highlight.min.js";
            document.head.appendChild(script);
            
            return new Promise((resolve) => {
                script.onload = () => {
                    console.log("highlight.js 已成功加载");
                    resolve();
                };
                script.onerror = () => {
                    console.error("highlight.js 加载失败");
                    resolve(); // 即使失败也继续
                };
            });
        }
        return Promise.resolve();
    }
    
    // 在页面加载时检查
    ensureHighlightJsLoaded();
    
    // 配置marked.js以支持语法高亮
    marked.setOptions({
        highlight: function(code, lang) {
            try {
                if (lang && window.hljs && window.hljs.getLanguage(lang)) {
                    return window.hljs.highlight(code, { language: lang }).value;
                } else if (window.hljs) {
                    return window.hljs.highlightAuto(code).value;
                }
            } catch (e) {
                console.error("代码高亮出错:", e);
            }
            // 如果hljs未加载或出错，返回原始代码
            return code;
        },
        breaks: true
    });
    
    
    
    
    
    // 主题切换功能
    themeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-theme');
        const icon = this.querySelector('i');
        if (icon.classList.contains('ri-sun-line')) {
            icon.classList.remove('ri-sun-line');
            icon.classList.add('ri-moon-line');
        } else {
            icon.classList.remove('ri-moon-line');
            icon.classList.add('ri-sun-line');
        }
    });
    
    // 调整textarea高度
    userInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 150) + 'px';
    });
    
    // 按Enter键发送消息
    userInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // 点击发送按钮
    sendButton.addEventListener('click', sendMessage);
    
    // 新建对话
    newChatButton.addEventListener('click', function() {
        chatContainer.innerHTML = `
            <div class="welcome-message">
                <h2>欢迎使用清言AI</h2>
                <p>这是一个基于qwq-32b-online模型的AI聊天应用，请输入您的问题开始对话。</p>
                <div class="features-grid">
                    <div class="feature">
                        <i class="ri-brain-line"></i>
                        <span>比肩满血版 DeepSeek-R1</span>
                    </div>
                    <div class="feature">
                        <i class="ri-message-3-line"></i>
                        <span>推理模型</span>
                    </div>
                    <div class="feature">
                        <i class="ri-window-fill"></i>
                        <span>支持联网</span>
                    </div>
                </div>
            </div>
        `;
    });
    
    // 添加特性网格样式
    const featureStyles = document.createElement('style');
    featureStyles.textContent = `
        .features-grid {
            display: flex;
            justify-content: center;
            gap: 20px;
            margin-top: 25px;
            flex-wrap: wrap;
        }
        
        .feature {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
            padding: 15px;
            background: linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(96, 165, 250, 0.08));
            border-radius: 10px;
            width: 120px;
            transition: all 0.3s ease;
        }
        
        .feature:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 20px rgba(59, 130, 246, 0.1);
        }
        
        .feature i {
            font-size: 2rem;
            color: #3b82f6;
        }
        
        .feature span {
            font-size: 0.9rem;
            text-align: center;
            color: #64748b;
        }
    `;
    document.head.appendChild(featureStyles);
    
    // 添加用户消息
    function addUserMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message-container', 'user-container');
        messageElement.innerHTML = `
            <div class="avatar user-avatar">
                <i class="ri-user-fill"></i>
            </div>
            <div class="message user-message">
                ${message}
            </div>
        `;
        
        // 删除欢迎消息
        const welcomeMessage = document.querySelector('.welcome-message');
        if (welcomeMessage) {
            welcomeMessage.remove();
        }
        
        chatContainer.appendChild(messageElement);
        scrollToBottom();
        
        // 添加出现动画
        setTimeout(() => {
            messageElement.classList.add('appeared');
        }, 50);
    }
    
    // 添加机器人输入指示器
    function addBotTypingIndicator() {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message-container', 'bot-container');
        messageElement.innerHTML = `
            <div class="avatar bot-avatar">
            </div>
            <div class="message bot-message">
                <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        
        chatContainer.appendChild(messageElement);
        scrollToBottom();
        
        return messageElement.querySelector('.bot-message');
    }
    
    // 更新机器人消息 - 修改为支持推理内容和正式回复
    function updateBotMessage(element, content, reasoningContent = null) {
        let htmlContent = '';
        
        // 如果有推理内容，先显示推理内容
        if (reasoningContent) {
            htmlContent += `<div class="reasoning-content"><h4>🤔 推理过程</h4>${marked.parse(reasoningContent)}</div>`;
        }
        
        // 添加正式回复
        if (content) {
            htmlContent += `<div class="formal-response">${marked.parse(content)}</div>`;
        }
        
        element.innerHTML = htmlContent;
        
        // 应用语法高亮
        if (window.hljs) {
            element.querySelectorAll('pre code').forEach((block) => {
                try {
                    window.hljs.highlightBlock(block);
                } catch (e) {
                    console.warn("代码块高亮失败:", e);
                }
            });
        }
        
        scrollToBottom();
    }
    
    // 滚动到底部
    function scrollToBottom() {
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
    
    // 获取用户输入的密码并解密API密钥
    async function getDecryptedApiKey() {
        // 如果已经解密过，直接返回
        if (decryptedApiKey) {
            return decryptedApiKey;
        }
        
        // 创建密码输入对话框
        return new Promise((resolve) => {
            // 创建模态对话框
            const modalOverlay = document.createElement('div');
            modalOverlay.className = 'modal-overlay';
            
            const modalContainer = document.createElement('div');
            modalContainer.className = 'modal-container';
            
            modalContainer.innerHTML = `
                <div class="modal-header">
                    <h3>请输入授权码</h3>
                </div>
                <div class="modal-body">
                    <p>请输入作者提供的密码以继续使用</p>
                    <input type="password" id="decrypt-password" class="password-input" placeholder="输入密码...">
                    <div class="error-message" style="display: none; color: #dc3545; margin-top: 10px;"></div>
                </div>
                <div class="modal-footer">
                    <button id="decrypt-button" class="decrypt-button">解密</button>
                </div>
            `;
            
            // 添加到文档
            modalOverlay.appendChild(modalContainer);
            document.body.appendChild(modalOverlay);
            
            // 获取元素
            const passwordInput = document.getElementById('decrypt-password');
            const decryptButton = document.getElementById('decrypt-button');
            const errorMessage = document.querySelector('.error-message');
            
            // 自动聚焦到密码输入框
            passwordInput.focus();
            
            // 点击解密按钮
            const handleDecrypt = () => {
                const password = passwordInput.value.trim();
                if (!password) {
                    errorMessage.textContent = '请输入密码';
                    errorMessage.style.display = 'block';
                    return;
                }
                
                try {
                    // 尝试解密
                    const apiKey = decryptApiKey(encryptedApiKey, password);
                    if (!apiKey) {
                        throw new Error('解密失败，密码可能不正确');
                    }
                    
                    // 解密成功，移除模态框
                    document.body.removeChild(modalOverlay);
                    decryptedApiKey = apiKey; // 保存解密后的密钥
                    resolve(apiKey);
                } catch (error) {
                    errorMessage.textContent = '解密失败，请检查密码是否正确';
                    errorMessage.style.display = 'block';
                    passwordInput.value = '';
                    passwordInput.focus();
                }
            };
            
            // 点击解密按钮
            decryptButton.addEventListener('click', handleDecrypt);
            
            // 按Enter键也可以解密
            passwordInput.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    handleDecrypt();
                }
            });
        });
    }
    
    // 发送消息函数
    function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;
        
        // 添加用户消息到聊天容器
        addUserMessage(message);
        
        // 清空输入框并重置高度
        userInput.value = '';
        userInput.style.height = 'auto';
        
        // 添加正在输入指示器
        const botMessageElement = addBotTypingIndicator();
        
        // 调用GLM-4-Flash API
        fetchAIResponse(message, botMessageElement);
    }
    
    // 调用GLM-4-Flash API - 修改为处理content和reasoning_content
    async function fetchAIResponse(prompt, botMessageElement) {
        // 请求数据结构
        const requestData = {
            messages: [
                {
                    role: "user",
                    content: prompt
                }
            ],
            model: "qwq-32b-online",
            stream: true,
            temperature: 0.3,
            top_p: 0.7
        };

        try {
            // GLM-4-Flash API端点
            const apiUrl = "https://api.pearktrue.cn/api/aichat/";
            
            // 使用fetch API发送请求
            const response = await fetch(apiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestData)
            });

            if (!response.ok) {
                throw new Error(`API请求失败: ${response.status}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let responseText = "";
            let reasoningText = "";

            // 接收流式响应
            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                
                const chunk = decoder.decode(value, { stream: true });
                
                // 处理SSE格式的响应
                const lines = chunk.split('\n');
                for (const line of lines) {
                    if (line.startsWith('data:') && line.trim() !== 'data:') {
                        try {
                            const jsonStr = line.substring(5).trim();
                            if (jsonStr === '[DONE]') continue;
                            
                            const data = JSON.parse(jsonStr);
                            
                            // 处理推理内容
                            if (data.choices?.[0]?.delta?.reasoning_content) {
                                reasoningText += data.choices[0].delta.reasoning_content;
                                updateBotMessage(botMessageElement, responseText, reasoningText);
                            } 
                            // 处理正式回复内容
                            else if (data.choices?.[0]?.delta?.content) {
                                responseText += data.choices[0].delta.content;
                                updateBotMessage(botMessageElement, responseText, reasoningText);
                            }
                            else if (data.choices?.[0]?.finish_reason) {
                                // End of stream
                            } else {
                                throw new Error(data.msg || 'API响应异常');
                            }
                        } catch (e) {
                            console.error("解析响应数据错误:", e, line);
                        }
                    }
                }
            }

            // 确保最终更新
            updateBotMessage(botMessageElement, responseText, reasoningText);
            
        } catch (error) {
            console.error("API请求错误:", error);
            updateBotMessage(botMessageElement, "抱歉，请求出错了。错误信息: " + error.message);
        }
    }
    
    // 添加深色模式CSS
    const darkThemeStyle = document.createElement('style');
    darkThemeStyle.textContent = `
        body.dark-theme {
            background: linear-gradient(to bottom right, #1a1c2d, #2d2b3d);
            color: #f5f5f5;
        }
        
        body.dark-theme .sidebar {
            background: #252836;
            border-right: 1px solid #3f4156;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        }
        
        body.dark-theme .logo-icon {
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
        }
        
        body.dark-theme .model-name {
            color: #a3a8e0;
        }
        
        body.dark-theme .model-version,
        body.dark-theme .footer,
        body.dark-theme .history-title,
        body.dark-theme .light-text {
            color: #a0a0a0;
        }
        
        body.dark-theme .history-title-header {
            color: #a3a8e0;
        }
        
        body.dark-theme .footer {
            border-top: 1px solid #3f4156;
        }
        
        body.dark-theme .chat-history-item:hover {
            background-color: rgba(78, 84, 200, 0.15);
        }
        
        body.dark-theme .main {
            background-color: #1e1f2c;
        }
        
        body.dark-theme .header {
            background-color: #252836;
            box-shadow: 0 2px 15px rgba(0, 0, 0, 0.15);
        }
        
        body.dark-theme .welcome-message {
            background: #252836;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        }
        
        body.dark-theme .welcome-message p {
            color: #a0a0a0;
        }
        
        body.dark-theme .user-message {
            background: linear-gradient(135deg, #394175, #32386e);
            border-left: 1px solid rgba(255, 255, 255, 0.1);
            border-top: 1px solid rgba(255, 255, 255, 0.05);
            color: #f5f5f5;
        }
        
        body.dark-theme .bot-message {
            background: linear-gradient(135deg, #252836, #2a2d3e);
            border-left: 1px solid rgba(255, 255, 255, 0.05);
            border-top: 1px solid rgba(255, 255, 255, 0.02);
            color: #f5f5f5;
        }
        
        body.dark-theme .input-container {
            background-color: #252836;
            box-shadow: 0 -2px 15px rgba(0, 0, 0, 0.15);
        }
        
        body.dark-theme #user-input {
            background-color: #1e1f2c;
            border: 1px solid #3f4156;
            color: #f5f5f5;
        }
        
        body.dark-theme #user-input:focus {
            border-color: #4e54c8;
            box-shadow: 0 0 0 3px rgba(78, 84, 200, 0.2);
        }
        
        body.dark-theme .theme-toggle {
            background: #252836;
            border: 1px solid #3f4156;
        }
        
        body.dark-theme .theme-toggle i {
            color: #a3a8e0;
        }
        
        body.dark-theme .encryption-status {
            background: rgba(37, 40, 54, 0.9);
            color: #a0a0a0;
        }
        
        body.dark-theme .bot-message code:not(pre code) {
            background-color: #3f4156;
            color: #a3a8e0;
        }
        
        body.dark-theme .bot-message th {
            background-color: rgba(78, 84, 200, 0.15);
        }
        
        body.dark-theme .bot-message tr:hover {
            background-color: rgba(78, 84, 200, 0.1);
        }
        
        body.dark-theme ::-webkit-scrollbar-track {
            background: #252836;
        }
        
        body.dark-theme ::-webkit-scrollbar-thumb {
            background: #3f4156;
        }
        
        body.dark-theme ::-webkit-scrollbar-thumb:hover {
            background: #4e54c8;
        }
    `;
    
    document.head.appendChild(darkThemeStyle);
    
    // 添加模态对话框样式
    const modalStyle = document.createElement('style');
    modalStyle.textContent = `
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }
        
        .modal-container {
            background-color: white;
            border-radius: 10px;
            box-shadow: 0 5px 25px rgba(0, 0, 0, 0.2);
            width: 400px;
            max-width: 90%;
            overflow: hidden;
            animation: modalFadeIn 0.3s ease;
        }
        
        @keyframes modalFadeIn {
            from { transform: scale(0.9); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
        }
        
        .modal-header {
            padding: 15px 20px;
            border-bottom: 1px solid var(--border-color);
        }
        
        .modal-header h3 {
            margin: 0;
            color: var(--primary-color);
        }
        
        .modal-body {
            padding: 20px;
        }
        
        .modal-footer {
            padding: 15px 20px;
            border-top: 1px solid var(--border-color);
            display: flex;
            justify-content: flex-end;
        }
        
        .password-input {
            width: 100%;
            padding: 12px 15px;
            margin-top: 10px;
            border: 1px solid var(--border-color);
            border-radius: 8px;
            font-size: 1rem;
            transition: all 0.3s ease;
        }
        
        .password-input:focus {
            outline: none;
            border-color: var(--primary-color);
            box-shadow: 0 0 0 3px rgba(78, 84, 200, 0.2);
        }
        
        .decrypt-button {
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 1rem;
            transition: all 0.3s ease;
        }
        
        .decrypt-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(78, 84, 200, 0.3);
        }
        
        body.dark-theme .modal-container {
            background-color: #252836;
            box-shadow: 0 5px 25px rgba(0, 0, 0, 0.3);
        }
        
        body.dark-theme .modal-header,
        body.dark-theme .modal-footer {
            border-color: #3f4156;
        }
        
        body.dark-theme .modal-header h3,
        body.dark-theme .modal-body p {
            color: #f5f5f5;
        }
        
        body.dark-theme .password-input {
            background-color: #1e1f2c;
            border: 1px solid #3f4156;
            color: #f5f5f5;
        }
    `;
    document.head.appendChild(modalStyle);

    // 在DOMContentLoaded函数里，现有代码后面添加
    const blueThemeStyles = document.createElement('style');
    blueThemeStyles.textContent = `
        /* 蓝白主题增强样式 */
        body {
            background: linear-gradient(to bottom right, #f8fafc, #f1f5f9);
        }
        
        .logo-icon {
            box-shadow: 0 4px 10px rgba(59, 130, 246, 0.15);
        }
        
        .new-chat-btn, .send-btn {
            background: linear-gradient(135deg, #3b82f6, #60a5fa);
            box-shadow: 0 4px 15px rgba(59, 130, 246, 0.2);
        }
        
        .new-chat-btn:hover, .send-btn:hover {
            box-shadow: 0 6px 20px rgba(59, 130, 246, 0.3);
        }
        
        .model-name, .theme-toggle i {
            color: #3b82f6;
        }
        
        .header h1 {
            background: linear-gradient(90deg, #3b82f6, #60a5fa);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        
        .user-message {
            background: linear-gradient(135deg, #dbeafe, #eff6ff);
            border-left: 1px solid rgba(59, 130, 246, 0.2);
            border-top: 1px solid rgba(59, 130, 246, 0.1);
        }
        
        ::-webkit-scrollbar-thumb {
            background: #bfdbfe;
        }
        
        ::-webkit-scrollbar-thumb:hover {
            background: #3b82f6;
        }
        
        .welcome-message h2 {
            color: #3b82f6;
        }
        
        .welcome-message h2::after {
            background: linear-gradient(90deg, #3b82f6, transparent);
        }
    `;
    document.head.appendChild(blueThemeStyles);
});