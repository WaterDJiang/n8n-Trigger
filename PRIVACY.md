# Privacy Policy

## 1. Local Storage Mechanism: Zero Cloud for Keys
- **Storage Location**: API keys are stored solely on your local device using the browser's built-in storage mechanism (`chrome.storage.local`). They are **never** uploaded to any "Nanobrowser" server or third-party service.
- **Isolation**: Leveraging the browser extension sandbox, key storage is isolated from the extension's runtime environment. Only authorized extension code can access these keys, preventing unauthorized access by external scripts or malicious programs.

## 2. User Autonomous Management
- **Visibility Control**: You have full control over the visibility of your keys. The interface provides toggle buttons to show or hide sensitive information (API keys, passwords) to prevent visual eavesdropping.
- **Responsibility**: While we ensure secure storage, you are responsible for following best practices for key management, such as regular rotation and least-privilege configuration. We do not manage the lifecycle of your keys.

## 3. Coding Standards: Leak Prevention
- **Commit Protection**: Sensitive configuration files are excluded from version control.
- **No Logging**: Our coding standards strictly prohibit logging sensitive keys to the console or including them in error stacks.

## 4. Active Security Mechanisms
- **Content Sanitization**: The extension includes active guardrails to detect and prevent the accidental inclusion of API keys in chat messages or prompt payloads.
- **Prompt Safety**: System prompts are designed to ignore attempts to extract or manipulate sensitive key information.
