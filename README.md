# 《玄城夜行：九幽录》 v1.0

国风水墨重彩 · 类《恶魔城：月下夜想曲 / 晓月圆舞曲》横版探索动作 ARPG（支持 Web 即开即玩与 Capacitor 原生 Android / iOS App 封装）。

## 一、 快速运行与体验

```bash
cd /home/better/IdeaProjects/zgf
npm run dev
```

启动后在浏览器访问终端输出的地址（默认 `http://localhost:5175`；同局域网手机可直接用局域网 IP 打开全屏横屏触屏游玩）。

## 二、 打包原生 Android / iOS App

工程已内置 [`capacitor.config.json`](./capacitor.config.json) 与 [`NativeAppBridge.ts`](./src/platform/NativeAppBridge.ts)（支持沉浸式隐藏状态栏、强制横屏锁定、原生线性马达震动反馈与 Android 物理返回键呼出菜单）：

```bash
# 首次联网安装 Capacitor 原生依赖并生成 Android 工程
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/haptics @capacitor/status-bar @capacitor/screen-orientation @capacitor/app
npm run build
npx cap add android
npx cap sync

# 用 Android Studio 打开或命令行编译 APK
npx cap open android
```

## 三、 核心玩法与出招一览

- **男主角**：**李逸承**（18岁，镇妖司少年斩妖人）
- **五大差异化主武器**：
  1. **轻剑**（高速三连斩 + 空中 `↓+斩` 斜下劈借力弹跳）
  2. **重刃/陌刀**（`240°` 过头顶巨弧劈砍，无视盾兵防御并可击破暗墙）
  3. **长枪**（超远直线贯穿 + 枪尖寸劲暴击 + `↑+斩` 斜上护空挑刺）
  4. **双刺**（零前摇狂风乱舞 + 空中滞空 + 绕背必定暴击）
  5. **软鞭**（八向远距抽击 + 鞭梢雷音震退）
- **手搓古武绝技（方向轨迹紧接【斩】键）**：
  - `↓ ↘ → + 斩`：**朔风破空斩**（依当前武器形态激发穿透剑气/烈焰刀波/苍龙枪芒）
  - `← → + 斩`：**瞬影一闪**（水墨残影无敌穿身三连爆斩）
  - `↓ ↑ + 斩`：**惊鸿升龙破**（无敌腾空纵斩）
  - `↓ ↙ ← + 斩`：**太极震气诀**（震碎弹幕并眩晕周围妖魔）
  - `← ↙ ↓ ↘ → + 斩`：**九幽噬魂引**（全屏暗墨锁魂打击并吸取气血！）
- **银河城能力锁递进 & 隐藏里城**：
  - 依次击败区域妖王解锁 **【踏云步（二段跳）】➔【千斤坠（空中↓+跳碎裂砖）】➔【缩地化雾符（穿玄铁栅栏与毒瘴）】➔【飞燕钩锁（红灯笼摆荡）】➔【壁虎游墙功（蹬墙连跳）】**。
  - 集齐藏书阁顶层 **【破妄古镜】** 与水牢秘窟 **【完整玄鸟合璧佩】** 后登上凌霄祭天坛，斩碎恩师裴无极头顶的 **【九幽蚀心蛊】** 即可开启 180° 翻转的 **【九幽倒悬里城】**（总探索率最高达 `200.0%`），通关真结局解锁 **【萧断水模式】** 与 **【百鬼试炼塔 Boss Rush】**！
