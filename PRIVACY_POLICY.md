# Privacy Policy for "n8n Trigger" Chrome Extension

**Effective Date:** December 11, 2025
**Website:** `https://github.com/WaterDJiang/n8n-trigger`

---

## English Version

### 1. Overview

The **n8n Trigger** Chrome Extension values your privacy and is designed to be as secure and transparent as possible. This Privacy Policy outlines what data is collected, how it’s used, and what permissions the extension requests.

### 2. Data Collection

The extension **does not collect, transmit, or store any personal data** on external servers owned by the extension developers.

All configuration data — such as API keys (OpenAI, ZhipuAI), webhook URLs, and chat history — is:

- Stored **locally** on your device using `chrome.storage.local`.
- **Never uploaded** to our servers.
- **Never synchronized** via Google Cloud (Zero Cloud policy for keys).

Data is only transmitted to the specific third-party services you explicitly configure (e.g., OpenAI API or your own n8n instance).

### 3. Permissions Used

The extension requires the following permissions to function:

- `storage`: To securely save your API keys, webhook URLs, and chat history locally.
- `activeTab`: To access the current tab’s URL and title for context-aware features.
- `scripting`: To inject the sidebar interface and handle text selection on webpages.
- `contextMenus`: To add right-click options like "Chat with selection" or "Send to n8n".
- `tabs`: To manage the connection between the sidebar and your open tabs.
- `<all_urls>`: To allow the sidebar assistant to work on any webpage you visit.

**Network Requests:** The extension makes direct connections from your browser to:
1. The LLM providers you configure (e.g., `api.openai.com`).
2. The n8n Webhook URLs you provide.

### 4. What Happens When You Use the Extension

- **Chatting with AI:** When you send a message, the text and any selected context are sent directly to your chosen LLM provider (e.g., OpenAI).
- **Triggering n8n Workflows:** When you click "Send" or use the context menu:
  - A `POST` request is sent to the webhook URL you provided.
  - The request contains data from the current page, selected content, and your input.
  - This only happens **when you initiate it**.

### 5. No Tracking or Analytics

This extension:

- Does **not track your activity**.
- Does **not use any analytics tools**.
- Does **not log** or monitor your browsing behavior.

### 6. Open Source Transparency

This extension is **Open Source**. You can review the full code to verify our privacy claims.

### 7. Contact

If you have questions about privacy or the extension in general, please contact us via our GitHub repository or the Chrome Web Store support page.

### 8. Changes to this Policy

If this Privacy Policy changes in the future, updates will be reflected in the Chrome Web Store listing. No silent changes will be made.

---

## 中文版本 (Chinese Version)

### 1. 概述

**n8n Trigger** Chrome 扩展程序高度重视您的隐私，并致力于提供最安全、透明的服务。本隐私政策概述了我们收集哪些数据、如何使用这些数据以及扩展程序请求哪些权限。

### 2. 数据收集

本扩展程序 **不会** 在开发者的外部服务器上 **收集、传输或存储任何个人数据**。

所有配置数据——例如 API 密钥（OpenAI, 智谱 AI）、Webhook URL 和聊天记录——均：

- 使用 `chrome.storage.local` **仅存储在您的本地设备上**。
- **绝不上传** 到我们的服务器。
- **绝不** 通过 Google 云端同步（密钥零云端策略）。

数据仅会发送到您明确配置的特定第三方服务（例如 OpenAI API 或您自己的 n8n 实例）。

### 3. 权限使用说明

本扩展程序需要以下权限才能运行：

- `storage`：用于在本地安全地保存您的 API 密钥、Webhook URL 和聊天记录。
- `activeTab`：用于获取当前标签页的 URL 和标题，以实现上下文感知功能。
- `scripting`：用于在网页中注入侧边栏界面并处理文本选择。
- `contextMenus`：用于添加右键菜单选项，如“与选中内容聊天”或“发送到 n8n”。
- `tabs`：用于管理侧边栏与您打开的标签页之间的连接。
- `<all_urls>`：允许侧边栏助手在您访问的任何网页上工作。

**网络请求：** 扩展程序会从您的浏览器直接发起连接至：
1. 您配置的 LLM 提供商（如 `api.openai.com`）。
2. 您提供的 n8n Webhook URL。

### 4. 当您使用扩展程序时会发生什么

- **与 AI 聊天**：当您发送消息时，文本和任何选中的上下文会直接发送给您选择的 LLM 提供商（例如 OpenAI）。
- **触发 n8n 工作流**：当您点击“发送”或使用右键菜单时：
  - 系统会向您提供的 Webhook URL 发送一个 `POST` 请求。
  - 请求包含来自当前页面的数据、选中的内容和您的输入。
  - 这仅在 **您主动发起时** 发生。

### 5. 无追踪或分析

本扩展程序：

- **不追踪您的活动**。
- **不使用任何分析工具**。
- **不记录** 或监控您的浏览行为。

### 6. 开源透明

本扩展程序是 **开源** 的。您可以查看完整代码以验证我们的隐私声明。

### 7. 联系方式

如果您对隐私或本扩展程序有任何疑问，请通过我们的 GitHub 仓库或 Chrome 应用商店支持页面与我们联系。

### 8. 政策变更

如果未来本隐私政策发生变化，更新内容将反映在 Chrome 应用商店的详情页中。我们不会进行任何悄无声息的更改。
