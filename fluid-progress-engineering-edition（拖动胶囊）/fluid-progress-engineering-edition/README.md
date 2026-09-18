# Fluid Progress Card 工程版

这是一个零依赖、零构建、可直接双击运行的 WebGL 液态胶囊进度组件。当前组件版本为 `1.3.1`。

## 买家拿到后怎么使用

1. 解压 ZIP。
2. 双击 `index.html` 查看演示。
3. 打开 `examples/minimal.html` 查看最简接入。
4. 将 `assets` 文件夹复制到自己的网站项目中。

不需要安装 Node.js，不需要运行 npm，不需要部署到服务器，也不依赖任何 CDN。

## 工程结构

```text
fluid-progress-engineering-edition/
├── index.html                         # 双击即用的主题切换演示
├── assets/
│   ├── css/fluid-progress.css         # 组件样式
│   └── js/
│       ├── fluid-progress-themes.js   # 6 套配色配置
│       └── fluid-progress.js          # WebGL、Canvas、拖动与物理逻辑
├── examples/
│   ├── minimal.html                   # 最简接入示例
│   └── all-themes.html                # 6 套主题展示
├── tests/
│   └── smoke.html                     # 无依赖浏览器冒烟测试
├── standalone/                        # 历史单文件版本（非主维护源）
├── README_FIRST.txt                   # 首次使用说明
├── README.md                          # 本文档
└── LICENSE.txt                        # 授权模板
```

## 最简单的接入方法

在页面 `<head>` 中引用 CSS：

```html
<link rel="stylesheet" href="assets/css/fluid-progress.css" />
```

添加组件容器：

```html
<div id="progressCard"
  data-fluid-progress
  data-theme="blue-white-cyan"
  data-progress="64"
  data-title="NEURAL SYNC"
  data-subtitle="ADAPTIVE INFERENCE STREAM"
  data-step="1"
  data-aria-label="同步进度"
  data-stir="0.68"
  data-delay="0.55"
  data-echo="0.42"
  data-spark="0.76"
  data-draggable="true"></div>
```

在 `</body>` 前引用脚本：

```html
<script src="assets/js/fluid-progress-themes.js"></script>
<script src="assets/js/fluid-progress.js"></script>
```

页面加载后会自动初始化。

## 六套主题名称

```text
coral-magenta
blue-purple
green-yellow
blue-white-cyan
purple-navy
orange-yellowgreen
```

## JavaScript API

```js
const card = FluidProgress.get("#progressCard");

card.setProgress(80);                // 弹簧动画到 80%
card.setProgress(30, true);          // 立即跳到 30%
card.setTheme("purple-navy");       // 切换主题
card.setText("LOADING", "SYNCING");
card.setDraggable(false);            // 关闭拖动
card.getProgress();                  // 当前渲染值
card.getTargetProgress();            // 目标值
card.setEffects({                    // 可选液体实验效果，范围 0–1
  stir: 0.68,
  delay: 0.55,
  echo: 0.42,
  spark: 0.76
});
```

也可以手动创建：

```js
const card = FluidProgress.create("#progressCard", {
  theme: "blue-purple",
  progress: 64,
  title: "NEURAL SYNC",
  subtitle: "ADAPTIVE INFERENCE STREAM",
  draggable: true
});
```

非法进度值会被忽略，合法值会自动限制在 `0–100`。未提供 `data-progress` 时默认使用 `64`。

### 搅动、延迟与回声

- `stir`：拖动附近的局部湍流强度。
- `delay`：两层延迟边界的跟随黏性。
- `echo`：延迟边界的发光回声强度。
- `spark`：液体边界运动时出现的 CSS 粒子火花强度。
- 四个参数范围均为 `0–1`，默认值为 `0`，不会改变旧项目视觉。
- 调用 `card.setEffects({ stir: 0, delay: 0, echo: 0, spark: 0 })` 即可完整关闭实验效果。

## 组件事件

组件通过根元素发送三个可冒泡的自定义事件：

```js
const element = document.querySelector("#progressCard");

element.addEventListener("fluidprogressinput", (event) => {
  console.log(event.detail.value, event.detail.source);
});

element.addEventListener("fluidprogresschange", (event) => {
  console.log("用户已提交", event.detail.value);
});

element.addEventListener("fluidprogresssettled", (event) => {
  console.log("动画已稳定", event.detail.renderedValue);
});
```

`detail.source` 可能是 `pointer`、`keyboard`、`animation` 或 `reduced-motion`。

## 键盘与无障碍

- 可拖动卡片使用标准 `role="slider"` 语义。
- `←` / `↓` 减少一个步长，`→` / `↑` 增加一个步长。
- `Page Up` / `Page Down` 调整十个步长。
- `Home` 跳到 0，`End` 跳到 100。
- `data-step` 控制键盘步长，默认为 1。
- `data-aria-label` 用于提供业务语义名称；未设置时使用标题。
- 关闭拖动后，组件自动改为 `role="progressbar"`。

## 浏览器支持

推荐 Chrome、Edge、Firefox、Safari 的现代版本。

组件优先使用 WebGL。WebGL 创建失败或 Shader 不兼容时，会自动切换为 Canvas 动画版本。

页面隐藏或组件离开视口后会暂停动画；重新可见时自动恢复。系统启用“减少动态效果”后，组件使用静态帧并立即更新进度。WebGL 上下文丢失时会暂时切换到 Canvas，恢复后尝试重新启用 WebGL。

## 关于透明背景

页面背景可以保持透明，组件本体仍然是深色圆角卡片。`examples/minimal.html` 就是透明页面背景示例。

## 二次开发位置

- 改颜色：`assets/js/fluid-progress-themes.js`
- 改尺寸与字体：`assets/css/fluid-progress.css`
- 改物理速度：`assets/js/fluid-progress.js` 中的 `stiffness` 和 `damping`
- 改 Shader：`assets/js/fluid-progress.js` 中的 `fragmentSource`

## 维护约定

`assets/` 是工程版的唯一主维护源。`standalone/` 保存的是历史单文件交付稿，不保证自动继承核心修复；新增功能和问题修复应首先进入 `assets/`。正式长期维护时，建议将 standalone 改为由构建脚本生成，避免重复实现发生漂移。
