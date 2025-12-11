# n8n TTtrigger

n8n TTtrigger is a powerful Chrome Extension that integrates a sidebar chat interface directly into your browser. It bridges the gap between your web browsing, Large Language Models (LLMs), and n8n automation workflows, allowing for seamless context-aware interactions.

## Features

- **Sidebar Interface**: A non-intrusive, collapsible sidebar that works on any webpage.
- **Multi-LLM Support**: Configure and switch between multiple LLM providers:
  - OpenAI
  - OpenRouter
  - GLM (ZhipuAI)
- **n8n Integration**: Trigger n8n workflows directly from your browser.
  - Send user input, selected text, and page context to your n8n webhooks.
  - Support for Basic Authentication and Custom Headers.
  - Render n8n responses (text, JSON, or images) directly in the chat.
- **Context Awareness**:
  - **Selection**: Instantly chat about or process selected text on the page.
  - **Full Page Context**: Optionally include the full text of the current webpage in your prompts or workflows.
- **Productivity Tools**:
  - **Right-Click Menu**: Quick actions to "Open Chat", "Chat with selection", or "Send selection to n8n".
  - **Markdown Rendering**: Rich text formatting for AI and n8n responses.
  - **History**: Chat history persists locally (until cleared).

## Installation

1. Clone or download this repository to your local machine.
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** in the top right corner.
4. Click **Load unpacked**.
5. Select the directory where you downloaded/cloned this project (`n8n Trigger`).

## Configuration

After installation, click the extension icon and select the "Settings" (gear) icon, or right-click the extension icon and choose **Options**.

### 1. LLM Providers
Configure your AI model providers:
- **Name**: A display name (e.g., "My OpenAI").
- **Type**: Select `openai`, `openrouter`, or `glm`.
- **API Key**: Your API key from the provider.
- **Base URL**: (Optional) Custom endpoint URL if you are using a proxy or compatible service.

### 2. n8n Webhooks
Set up connections to your n8n workflows:
- **Name**: Display name for the workflow.
- **Webhook URL**: The full URL of your n8n Webhook node (use `POST` method).
- **Input Field**: (Optional) The specific field name your workflow expects (defaults to `text`, `chatInput`, `message`).
- **Auth**: (Optional) Username and Password if your webhook is protected by Basic Auth.

### 3. Defaults
- **Default Model**: Set the global default model name (e.g., `gpt-4o`, `glm-4`).

## Usage

### Basic Chat
1. Click the extension icon or use the right-click menu to open the sidebar.
2. Select your LLM provider from the dropdown.
3. Type your message and hit Enter.

### Using Context
- **Selected Text**: Highlight text on any webpage. It will appear in the "Selection Preview" area above the chat input. Sending a message will include this text as context.
- **Page Context**: Toggle the "Quote Page" icon (document icon) to include the entire page's text content in your message.

### Triggering n8n Workflows
1. In the sidebar, check the **n8n** toggle (or select an n8n workflow from the dropdown).
2. Type your input or select text on the page.
3. Click Send. The extension will send a JSON payload to your n8n webhook containing:
   - `input`: Your typed message.
   - `selection`: Currently selected text.
   - `context`: Full page text (if enabled).
   - `page`: URL and Title of the current page.
   - `history`: Recent chat conversation.

## Privacy & Security

- **Local Storage**: API keys and configuration are stored in your browser's local storage (`chrome.storage.local`). This ensures that your sensitive data never leaves your device and is not synced across devices via your Google account, adhering to a "zero cloudization" policy for keys.
- **Data Transmission**: Data is only sent to the API endpoints you configure (LLM providers or your own n8n instance).
- **Permissions**: The extension requires access to "all urls" to inject the sidebar and read page content for context features.

## Development

- **Manifest V3**: Built using the latest Chrome Extension standards.
- **Tech Stack**: Vanilla JavaScript, HTML, CSS (no build step required).
- **Structure**:
  - `panel.html/js/css`: The main sidebar interface.
  - `contentScript.js`: Handles iframe injection and page interaction.
  - `background.js`: Manages context menus and extension events.
  - `options.html/js`: Configuration page.

## License

[MIT License](LICENSE)
