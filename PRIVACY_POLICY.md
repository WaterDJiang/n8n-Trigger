# Privacy Policy / 隐私政策

**Effective Date / 生效日期:** 2024-05-20

## English Version

### 1. Introduction
Thank you for using **n8n Trigger** ("we," "us," or "our"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, and store your information when you use our Chrome Extension.

### 2. Information Collection and Use

**2.1. No Personal Data Collection**
We do not collect, store, or transmit any personally identifiable information (PII) to our own servers. We do not track your browsing history, IP address, or usage patterns.

**2.2. Local Storage**
The following information is stored strictly on your local device using Chrome's `chrome.storage.local` API:
- **API Keys:** Keys for LLM providers (e.g., OpenAI, ZhipuAI) that you manually enter.
- **Configuration:** Settings for n8n webhooks and extension preferences.
- **Chat History:** Text logs of your conversations with the AI.

**2.3. Data Transmission**
Your data is transmitted only when you explicitly perform an action (e.g., sending a message or triggering a workflow).
- **To LLM Providers:** When you chat, your message and context are sent directly to the LLM provider you selected (e.g., OpenAI API).
- **To n8n Workflows:** When you trigger a workflow, your selected text and context are sent directly to the n8n Webhook URL you configured.
- **Direct Connection:** All network requests are made directly from your browser to the destination. We do not proxy traffic through our servers.

### 3. Third-Party Services
This extension interacts with third-party services configured by you. We are not responsible for the privacy practices of these third parties. We encourage you to review their privacy policies:
- OpenAI Privacy Policy
- ZhipuAI (GLM) Privacy Policy
- Your self-hosted or cloud-hosted n8n instance

### 4. Permissions
We request the following permissions for functionality only:
- **Storage:** To save your settings locally.
- **ActiveTab / All URLs:** To access the content of the page you are viewing *only when* you explicitly request to use it as context for AI analysis.
- **Context Menus:** To provide right-click menu shortcuts.

### 5. Changes to This Privacy Policy
We may update this privacy policy from time to time. The updated version will be indicated by an updated "Effective Date".

### 6. Contact Us
If you have questions about this privacy policy, please contact us via the support section on our Chrome Web Store listing or our GitHub repository.

---

## 中文版本

### 1. 简介
感谢您使用 **n8n Trigger**（以下简称“我们”）。我们致力于保护您的个人信息和隐私权利。本隐私政策说明了您在使用我们的 Chrome 扩展程序时，我们如何收集、使用和存储您的信息。

### 2. 信息收集与使用

**2.1. 不收集个人数据**
我们不会收集、存储或传输任何个人身份信息 (PII) 到我们自己的服务器。我们不会追踪您的浏览历史、IP 地址或使用模式。

**2.2. 本地存储**
以下信息仅通过 Chrome 的 `chrome.storage.local` API 存储在您的本地设备上：
- **API 密钥**：您手动输入的 LLM 提供商密钥（如 OpenAI、智谱 AI）。
- **配置信息**：n8n Webhook 设置和扩展程序偏好设置。
- **聊天记录**：您与 AI 的对话文本记录。

**2.3. 数据传输**
仅当您明确执行操作（例如发送消息或触发工作流）时，您的数据才会被传输。
- **至 LLM 提供商**：当您聊天时，您的消息和上下文会直接发送给您选择的 LLM 提供商（例如 OpenAI API）。
- **至 n8n 工作流**：当您触发工作流时，您选中的文本和上下文会直接发送给您配置的 n8n Webhook URL。
- **直接连接**：所有网络请求均直接从您的浏览器发起至目标地址。我们不会通过我们的服务器代理流量。

### 3. 第三方服务
本扩展程序会与您配置的第三方服务进行交互。我们要不对这些第三方的隐私惯例负责。建议您阅读他们的隐私政策：
- OpenAI 隐私政策
- 智谱 AI (GLM) 隐私政策
- 您自托管或云托管的 n8n 实例

### 4. 权限说明
我们申请以下权限仅用于实现功能：
- **Storage (存储)**：用于在本地保存您的设置。
- **ActiveTab / All URLs**：仅在您明确请求将当前页面内容作为 AI 分析的上下文时，才访问您正在浏览的页面内容。
- **Context Menus (上下文菜单)**：用于提供右键快捷菜单。

### 5. 隐私政策的变更
我们可能会不时更新本隐私政策。更新后的版本将标有新的“生效日期”。

### 6. 联系我们
如果您对本隐私政策有任何疑问，请通过 Chrome 应用商店的详情页或我们的 GitHub 仓库的支持部分与我们联系。
