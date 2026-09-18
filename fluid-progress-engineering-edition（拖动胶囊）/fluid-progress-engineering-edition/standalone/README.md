# Standalone 历史版本

本目录保存六套原始单文件交付稿，用于回溯和兼容旧项目。

它们包含各自独立的样式、拖动逻辑、Canvas/WebGL 渲染与 Shader，不是工程版的主维护源，也不会自动获得 `assets/` 中的修复。

维护规则：

1. 新项目优先使用 `assets/css/fluid-progress.css`、`assets/js/fluid-progress-themes.js` 和 `assets/js/fluid-progress.js`。
2. 功能、性能、无障碍和兼容性修复只在 `assets/` 中维护。
3. 不要手工向六个单文件重复移植新功能。
4. 如果仍需长期交付单文件版本，应增加生成脚本，从主维护源自动生成本目录内容。

