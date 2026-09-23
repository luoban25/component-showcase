================================================================
机器人眼球 TabBar · 交付包
打包日期：2026-09-18
工程类型：uni-app x（UVue / UTS）
状态：未开源（私有存档，勿外发）
================================================================


【一、这个包是什么】

手机端底部导航（tabbar），4 个入口。每个入口的图标是一个机器人头：
黑屏脸 + 两只眼睛 + 顶部天线 + 左右耳。

选中某个 tab 时，那个图标的眼睛会绕黑屏中心转满一整圈（660ms，
easeOutCubic）；转完进入静止态：眼睛 ±9° 慢速摆动、每 3.2 秒眨一次眼、
头部轻微上浮。未选中的图标完全静止并压暗。

入口数量是数据驱动的，不是写死 4 个 —— 加一个对象就多一个入口。


【二、怎么看】

  双击 index.html       H5 预览件（自包含，不需要服务器）
  双击 启动预览.bat     同上，用默认浏览器打开

预览件里跑的就是组件本身：模板、脚本、样式、动效数学全部由
src/build-preview.cjs 从 .uvue 源码生成，不存在第二份实现。


【三、怎么改】

  改 tab 数量    src/pages/index/index.uvue 里的 tabs 数组
  改眼睛形状     variant 字段：home 圆点 / explore 横条 / ai 竖条 / mine 圆环
  改动效时长     src/components/robot-eye-motion.uts 里的 SPIN_MS
  改配色         src/App.uvue 的 .rtb-theme 变量块

改完源码后重新生成 H5 预览：在工程目录执行  node build-preview.cjs


【四、目录说明】

  index.html               H5 预览件（成果）
  vendor/vue.global.js     H5 预览用的 Vue 运行时（HBuilderX 自带，已拷入）
  启动预览.bat             打开 index.html
  README.txt               本文件
  技术栈.txt               技术栈清单
  src/                     uni-app x 工程源码（可直接用 HBuilderX 打开）
  历史版本/                留空，后续版本往这里放

  src/components/RobotTabIcon.uvue     单个图标：机器人头
  src/components/RobotTabBar.uvue      底栏：数据驱动
  src/components/robot-eye-motion.uts  动效数学（纯函数）
  src/pages/index/index.uvue           演示页
  src/build-preview.cjs                生成 H5 预览
  src/App.uvue · main.uts · pages.json · manifest.json · index.html   工程骨架


【五、验证记录（都是真跑出来的）】

  HBuilderX 编译   通过（uni-app x，VDOM 模式，v5.24）
  H5 渲染          4 个图标 + 4 个文字全部渲染，控制台零报错
  动效             按 120/260/420/700ms 截同一图标区域做像素差分，
                   逐帧都在变 -> 确实在动，不是静态图
  点击切换         程序化点第 2 个 tab，标题与选中态都切到「探索」，
                   选中指示条只有 1 个


【六、已知边界】

  1. HBuilderX 5.24 的 launch web 通道不会转换 .uts/.uvue（浏览器报
     MIME 为空 -> 白屏），所以 H5 预览走 build-preview.cjs 生成，
     不走那个 dev server。
  2. hover-class 是 App 端按压态；H5 预览里用 :active 近似。
  3. App 端 transition/animation/@keyframes 不可靠，动效全部是脚本按帧
     算 + 写 :style 的 transform 字符串（16ms 一帧）。
  4. 预览件是 H5 近似还原，最终以 App 真机渲染为准。
================================================================