
const translations = {
  "en": {
    // Panel
    "hello": "Hello",
    "can_help": "Can I help you today?",
    "new_chat": "New Chat",
    "context": "Context",
    "selection": "Selection",
    "settings": "Settings",
    "language": "Language",
    "send_to_n8n": "Activate n8n Function",
    "use_context": "Use full page context",
    "input_placeholder": "Type a message...",
    "provider_label": "Provider",
    "other": "Other",
    "model_placeholder": "Model Name",
    "n8n_label": "n8n",
    "webhook_label": "Select Workflow",
    "remove_selection": "Remove selection",
    "close": "Close",
    "history_title": "History",
    "back_to_chat": "Back to Chat",
    "no_history": "No history records",
    "copy": "Copy",
    "copied": "Copied!",
    "copy_failed": "Copy failed",
    "send_msg_to_n8n": "Send to n8n",
    "activate_n8n_first": "Please click the lightning icon above the input box to activate n8n features first",
    "sent_to_n8n": "Sent to n8n",
    
    // Panel JS
    "error_no_webhook": "Error: No valid n8n Webhook selected. Please add one in Settings.",
    "n8n_failure": "N8N Request Failed:",
    "n8n_no_response": "n8n returned no content",
    "error_prefix": "Error: ",
    "assistant_role": "Assistant",
    "user_role": "User",
    "system_role": "System",
    
    // Options HTML
    "options_title": "Settings",
    "tagline": "Connect web content with your AI workflows",
    "intro_text": "This extension simplifies interaction between your browser and n8n automation workflows. One-click capture of page content or selection, combined with custom prompts sent to n8n Webhooks.",
    "feature_trigger": "One-click Trigger",
    "feature_llm": "Multi-LLM Support",
    "feature_n8n": "Flexible n8n Integration",
    "llm_providers": "LLM Providers",
    "llm_desc": "Configure OpenAI, GLM, etc. for direct chat within the extension.",
    "default_model": "Default Model (Global)",
    "model_placeholder_desc": "e.g. gpt-4o (Auto-saved)",
    "provider_name_placeholder": "Name, e.g. OpenAI",
    "api_key_placeholder": "API Key",
    "base_url_placeholder": "Custom Base URL (Optional)",
    "add_btn": "Add",
    "update_btn": "Update",
    "cancel_btn": "Cancel",
    "confirm_overwrite": "Name already exists. Overwrite?",
    "n8n_webhooks": "n8n Webhooks",
    "config_management": "Configuration Management",
    "config_desc": "Export or import your settings (LLM Providers and n8n Webhooks).",
    "export_config": "Export Config",
    "import_config": "Import Config",
    "import_success": "Configuration imported successfully!",
    "import_error": "Invalid configuration file.",
    "n8n_desc": "Configure n8n Webhook URLs to send content to your workflows.",
    "webhook_name_placeholder": "Name",
    "webhook_url_placeholder": "Webhook URL",
    "field_name_placeholder": "Input Field Name (Optional, default: chatInput)",
    "username_placeholder": "Username (Optional)",
    "password_placeholder": "Password (Optional)",
    
    // Options JS
    "current_default": "Current Default",
    "set_default": "Set as Default",
    "edit": "Edit",
    "delete": "Delete",
    "confirm_delete": "Are you sure you want to delete this item?",
    "saved": "Saved",
    "error_required": "Name and URL are required",
    "error_llm_required": "LLM Provider Name and Type are required",
    "error_apikey_required": "API Key is required",
    "confirm_delete_webhook": "Are you sure you want to delete this Webhook?",
    "error_no_provider": "No provider selected",
    "error_no_model": "Model name required",
    "selection_prefix": "Selection: ",
    "context_prefix": "Page Context: ",
    "security_alert": "Security Alert: ",
    
    // Common
    "toggle_lang_label": "Language"
  },
  "zh": {
    // Panel
    "hello": "你好",
    "can_help": "今天有什么可以帮你？",
    "new_chat": "新对话",
    "context": "上下文",
    "selection": "选中",
    "settings": "设置",
    "language": "语言",
    "send_to_n8n": "激活 n8n 功能",
    "use_context": "引用网页全文",
    "input_placeholder": "输入消息...",
    "provider_label": "模型厂商",
    "other": "其他",
    "model_placeholder": "模型名称",
    "n8n_label": "n8n",
    "webhook_label": "选择工作流",
    "remove_selection": "移除选中",
    "close": "关闭",
    "history_title": "历史记录",
    "back_to_chat": "返回对话",
    "no_history": "暂无历史记录",
    "copy": "复制",
    "copied": "已复制",
    "copy_failed": "复制失败",
    "send_msg_to_n8n": "发送到 n8n",
    "activate_n8n_first": "请先激活 n8n 发送功能",
    "sent_to_n8n": "已发送",
    "send_failed": "发送失败",
    
    // Panel JS
    "error_no_webhook": "错误: 未选择有效的 n8n Webhook。请在设置中添加并选择一个 Webhook。",
    "n8n_failure": "N8N 请求失败:",
    "n8n_no_response": "n8n 未返回任何内容",
    "error_prefix": "错误: ",
    "assistant_role": "助手",
    "user_role": "用户",
    "system_role": "系统",
    
    // Options HTML
    "options_title": "设置",
    "tagline": "连接网页内容与您的 AI 工作流",
    "intro_text": "本插件旨在简化浏览器与 n8n 自动化工作流的交互。您可以一键抓取网页正文、选中文本，并结合自定义 Prompt 发送到 n8n Webhook 进行处理。",
    "feature_trigger": "一键触发自动化",
    "feature_llm": "集成多种 LLM",
    "feature_n8n": "灵活对接 n8n",
    "llm_providers": "LLM 提供商",
    "llm_desc": "配置 OpenAI、GLM 等大模型服务，用于插件内的直接对话功能。",
    "default_model": "默认模型 (全局生效)",
    "model_placeholder_desc": "如 gpt-4o (设置后自动保存)",
    "provider_name_placeholder": "名称，如 OpenAI",
    "api_key_placeholder": "API Key",
    "base_url_placeholder": "自定义 Base URL，可留空",
    "add_btn": "添加",
    "update_btn": "更新",
    "cancel_btn": "取消",
    "confirm_overwrite": "名称已存在，是否覆盖？",
    "n8n_webhooks": "n8n Webhooks",
    "config_management": "配置管理",
    "config_desc": "导出或导入您的配置（LLM 提供商和 n8n Webhooks）。",
    "export_config": "导出配置",
    "import_config": "导入配置",
    "import_success": "配置导入成功！",
    "import_error": "无效的配置文件。",
    "n8n_desc": "配置 n8n 的 Webhook 地址，将网页内容发送到您的工作流。",
    "webhook_name_placeholder": "名称",
    "webhook_url_placeholder": "Webhook URL",
    "field_name_placeholder": "Input Field Name (可选，默认 chatInput)",
    "username_placeholder": "Username (可选)",
    "password_placeholder": "Password (可选)",
    "misc_settings": "其他设置",
    "hide_floating_btn": "隐藏页面上的悬浮按钮",
    "show_floating_btn": "显示悬浮按钮",
    
    // Options JS
    "current_default": "当前默认",
    "set_default": "设为默认",
    "edit": "编辑",
    "delete": "删除",
    "confirm_delete": "确定要删除此项吗？",
    "saved": "已保存",
    "error_required": "名称和 URL 不能为空",
    "error_llm_required": "LLM 提供商 名称和类型不能为空",
    "error_apikey_required": "API Key 不能为空",
    "confirm_delete_webhook": "确定要删除此 Webhook 吗？",
    "error_no_provider": "未选择提供商",
    "error_no_model": "未填写模型",
    "selection_prefix": "选中内容: ",
    "context_prefix": "页面上下文: ",
    "security_alert": "安全警告: ",
    "context_open_chat": "打开侧边聊天",
    "context_chat_selection": "用选中内容聊天",
    "context_send_n8n": "将选中内容发送到 n8n",
    "sec_ignore_instructions": "潜在提示注入: 'Ignore previous instructions'",
    "sec_system_prompt": "潜在提示注入: 访问 'system prompt'",
    "sec_redacted_key": "[已移除 API KEY]",
    "context_loaded": "网页上下文已加载",
    "restricted_page_error": "无法访问此页面，请在普通网页上重试。",
    "connection_error": "连接失败，请刷新网页后重试。",

    // Common
    "toggle_lang_label": "语言"
  }
};

class I18n {
  constructor() {
    this.lang = 'zh'; // Default
    this.listeners = [];
  }

  async init() {
    const data = await chrome.storage.local.get(['language']);
    if (data.language) {
      this.lang = data.language;
    } else {
      // Auto-detect or default to zh
      let browserLang = 'zh';
      if (typeof navigator !== 'undefined' && (navigator.language || navigator.userLanguage)) {
        browserLang = navigator.language || navigator.userLanguage;
      }
      this.lang = browserLang.startsWith('zh') ? 'zh' : 'en';
    }
    this.apply();
  }

  async setLang(lang) {
    this.lang = lang;
    await chrome.storage.local.set({ language: lang });
    this.apply();
    this.notify();
  }

  toggle() {
    const newLang = this.lang === 'zh' ? 'en' : 'zh';
    this.setLang(newLang);
    return newLang;
  }

  t(key) {
    return translations[this.lang][key] || key;
  }

  apply() {
    try {
      if (typeof document === 'undefined') return;
      // Select all elements that have any i18n attribute
      const elements = document.querySelectorAll('[data-i18n], [data-i18n-tooltip], [data-i18n-placeholder]');
      elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (key) {
          // Handle placeholders for inputs
          if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            if (el.hasAttribute('placeholder')) {
               el.setAttribute('placeholder', this.t(key));
            }
          } else if (el.tagName === 'OPTGROUP') {
               el.setAttribute('label', this.t(key));
          } else {
               // For text content, but be careful with child elements (like icons)
               // If element has only text, replace it. 
               // If it has children, maybe we should use a specific target or data-i18n-target
               // Simple approach: if data-i18n is present, replace textContent if it has no element children,
               // or look for a specific span if needed. 
               // However, to keep it robust, we might expect the element to be just text container.
               // Or use data-i18n-html to innerHTML.
               // Let's use textContent for safety.
               el.textContent = this.t(key);
          }
        }
        
        const tooltipKey = el.getAttribute('data-i18n-tooltip');
        if (tooltipKey) {
          el.setAttribute('title', this.t(tooltipKey));
          // Also handle custom aria-label or data-tooltip if used
          el.setAttribute('aria-label', this.t(tooltipKey));
          if (el.hasAttribute('data-tooltip')) {
              el.setAttribute('data-tooltip', this.t(tooltipKey));
          }
        }
        
        const placeholderKey = el.getAttribute('data-i18n-placeholder');
        if (placeholderKey) {
          el.setAttribute('placeholder', this.t(placeholderKey));
        }
      });
    } catch (e) {
      console.warn('i18n.apply skipped:', e);
    }
  }
  
  onChange(callback) {
    this.listeners.push(callback);
  }
  
  notify() {
    this.listeners.forEach(cb => cb(this.lang));
  }
}

const i18n = new I18n();
if (typeof window !== 'undefined') {
  window.i18n = i18n;
}
export default i18n;
