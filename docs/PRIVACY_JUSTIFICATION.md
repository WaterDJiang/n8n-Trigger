# Chrome 应用商店 - 隐私权与权限说明

以下内容是针对 Chrome 开发者后台“隐私权”选项卡的填写指南。请直接复制对应内容填入后台表单。

---

## 1. 单一用途 (Single Purpose)

**中文说明：**
本扩展程序旨在为用户提供一个集成的浏览器侧边栏助手，主要用于连接大语言模型（LLM）和 n8n 自动化工作流。其核心单一用途是**利用当前网页的上下文（如选中文本或全文）来增强 AI 对话和自动化任务处理**。用户可以在浏览网页时直接调用 AI 进行总结、翻译，或将数据发送到 n8n 进行后续处理，而无需在不同标签页间切换。

**English Version (If needed):**
The single purpose of this extension is to serve as an integrated browser sidebar assistant that bridges web browsing context with Large Language Models (LLMs) and n8n automation workflows. It allows users to leverage the current webpage's context (selected text or full content) to enhance AI interactions and trigger automation tasks directly from the sidebar, eliminating the need to switch tabs.

---

## 2. 需请求权限的理由 (Permission Justifications)

请根据后台显示的具体权限条目填写以下理由：

### storage
**理由：**
需要此权限在用户本地保存用户的个性化配置，包括 API 密钥（LLM 提供商）、n8n Webhook URL 以及最近的聊天历史记录。所有数据仅存储在本地浏览器中，不会上传到我们的服务器。
(Used to store user configurations locally, including API keys, n8n Webhook URLs, and recent chat history. All data remains on the user's device.)

### activeTab
**理由：**
需要此权限以获取当前用户正在浏览的标签页的标题和 URL。当用户选择将“页面上下文”发送给 AI 或 n8n 工作流时，这些元数据将作为上下文的一部分，帮助用户更好地管理和识别数据来源。
(Used to access the title and URL of the current active tab. This metadata is included as context when the user explicitly chooses to send page content to AI or n8n workflows.)



### contextMenus
**理由：**
需要此权限在浏览器的右键菜单中添加快捷操作（如“打开聊天”、“发送选中内容到 n8n”）。这为用户提供了一种快速触发扩展功能的方式，特别是在处理网页上的选中文本时。
(Used to add quick actions to the browser's context menu (e.g., "Open Chat", "Send selection to n8n"), providing users with a convenient way to trigger extension features directly from selected text.)



### 主机权限 (Host Permissions) - <all_urls>
**理由：**
本扩展程序被设计为通用生产力工具，适用于用户浏览的任何网页。我们需要访问所有 URL 的权限，以便在用户访问的任何页面上注入侧边栏助手，并允许用户读取该页面的内容（仅在用户主动操作时）作为 AI 分析的上下文。
(Required to inject the sidebar assistant on any webpage the user visits, as this is a general-purpose productivity tool. It allows the extension to read page content for AI analysis context only when explicitly triggered by the user.)
