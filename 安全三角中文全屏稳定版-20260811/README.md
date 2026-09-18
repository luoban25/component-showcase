# Safe Triangle Aim Guard

一个使用 Vue 3、TypeScript 和 SVG 实现的全屏多级菜单鼠标意图守卫演示。
当前交付版本只保留中文经典三级菜单，使用纯白全屏画布。

Windows 用户可以直接双击 `打开网页.bat`，它会启动本地服务并打开浏览器。

## 运行

```bash
pnpm install
pnpm dev
```

生产构建：

```bash
pnpm build
```

## 实现结构

- 菜单、按钮和滚动区域使用标准 DOM。
- 每一级子菜单维护独立的安全三角形和状态。
- 子菜单由悬停即时驱动；安全三角形只在指针朝下一层移动时保护当前路径。
- 进入子菜单后确认当前守卫，离开保护方向时立即允许兄弟项切换。
- SVG 覆盖层只负责显示安全三角，不参与指针命中。
- 蓝色表示当前追踪路径，绿色表示已进入下一层的确认路径。

核心实现位于 `src/components/CascadingMenu.vue`，视觉覆盖层位于
`src/components/GuardOverlay.vue`。
