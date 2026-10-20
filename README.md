# GooseEgg Studio 主页与鸣谢

Vue 3 + TypeScript + Vite 的响应式纯前端 SPA，包含简洁的工作室主页与完整鸣谢名单。主页展示工作室名称、《Simple》作品简介、平台图标与鸣谢入口，不挂 slogan。视觉依据 Simple 游戏内界面重写：灰白底、大圆弧、青绿色功能色与细线。页头显示「鸣谢 / Credits」，主创区域以「主创 / Creator」为主标题；没有分类导航。分组标题和说明以中文为主、英文小字辅助，成员只显示原始主要名字。页面统一使用浅色界面，桌面端保留圆弧底景；手机端为纯白背景，不显示圆弧和背景装饰。页面没有分类器、搜索框或回到顶部按钮。

两个页面共用页眉，「首页 / Home」和「鸣谢 / Credits」导航紧邻左侧 Logo，并标出当前页面。页眉在顶部保留完整 Logo 和原始高度，向下滚动超过 24px 后收小并保持在顶部，回到顶部恢复完整状态。页眉外保留固定占位，因此切换状态不会改变正文位置。桌面端高度从 92px 缩为 60px，手机端从 76–80px 缩为 52px；手机端继续使用白底，直接显示两个导航链接。

## 页面入口

- `#/`：工作室主页；空地址默认进入主页。
- `#/credits`：鸣谢页，兼容旧的 `#credits` 链接。
- 点击页眉 Logo 返回主页；鸣谢页页脚也有返回主页的链接。
- 页面切换支持浏览器前进、后退，保持静态 SPA，无需新增服务器或依赖。

页面使用轻量入场、切换与图标悬停动效；开启系统「减少动态效果」时自动关闭。长名单入场动画结束后释放动画图层。

网站图标使用原 Logo 左侧的蛋形符号，保留倾斜轮廓与高光缺口，不放工作室文字。`favicon.svg` 按原图透明通道提取轮廓，随系统深浅色主题切换；`favicon.ico` 包含 16、24、32、48、64、128、256 像素版本；`apple-touch-icon.png` 为 180 像素白底图标。图标链接附带版本参数以更新浏览器缓存。

## 平台链接

平台地址也维护在 `public/credits.json` 的 `links` 中，字段依次为 `taptap`、`appStore`、`bilibili`、`x`、`googlePlay`。五个平台均已接入提供的地址，其中 App Store 使用香港区链接 `https://apps.apple.com/hk/app/id1662361303`。如果某个平台地址设为空字符串，对应图标自动灰显；填入完整 HTTPS 地址后自动变为可点击链接。图标均为本地 SVG，无图标字体或第三方运行时请求。所有链接在新窗口打开。

TapTap 使用[官方品牌资源](https://www.taptap.cn/about-us/brand-resources)中的「Tap」字形，以单色 SVG 显示，不带应用图标底块。`src/assets/taptap-mark.svg` 提取自[官方资源包](https://assets.tapimg.com/tap-assets/projects/brand-resources/02_TapTap_Logo_App.zip)的 `02_TapTap_Logo_App/TapTap_Logo_App_Mobile/SVG/TapTap_Logo_Mobile_Rounded.svg`（2026-10-20），三个字形路径保持原样；移除彩色底块和渐变定义，收紧透明留白，通过 CSS 遮罩使用当前文字颜色，随悬停状态变化。其他平台保留现有单色图标。

## 维护名单：只编辑一个文件

**`public/credits.json`** 保存所有分组、署名、工作室文案与排列规则。已接入提供的正式 CSV 名单：147 条署名，包含 1 条主创署名和 17 个职位分组的 146 条署名。跨职位署名保留，因此对应 145 个不同名字。最新名单同时补齐早期贡献者的运营、谱面设计和美工。

`creators` 单独保存主创名单，页面在各组名单上方展示「主创」。目前为 `Section_Square`，已从 PV 组移出。主创可使用昵称字符串，也可用带英文昵称或职责的对象；数组为空或省略此字段时，主创区域自动隐藏。需要同时在职位名单署名时，可另外添加到对应分组。

每组的 `members` 第一项为组长，固定排在该组第一位。组长和其他成员使用完全相同的列表与样式，没有徽标或独立区域。

增加成员：在对应组的 `members` 中添加一个字符串；删除或改名：修改对应字符串。更换组长：将新的组长移动到数组第一项。增加职位分组：在 `groups` 中添加一个对象，并使用唯一的 `id`。`section` 对应原表「分组」，`title` 对应原表「职位」，`members` 对应「名称」。展示名称改为「制作成员」「乐曲鸣谢」「早期贡献者」，早期贡献者放在最后。同一部分的职位相邻放置，页面会显示一次标题；不填写 `section` 时直接展示职位标题。职位标题直接使用「策划」「程序」「运营」「文案」「音频」「美工」「PV」等名称，不加「组」字。`sectionEn` 保存对应分区的英文标题，`en` 保存职位英文标题；同一分区的 `sectionEn` 保持一致。结束语英文保存在 `studio.closingEn`。成员不添加翻译或第二行别名。

```json
{
  "schemaVersion": 2,
  "studio": {
    "name": "GooseEgg Studio",
    "intro": "感谢每一位创作者。",
    "closing": "因为有你，每一份热爱都有了回响。",
    "closingEn": "Because of you, every passion finds its echo.",
    "demo": false
  },
  "creators": ["Section_Square"],
  "memberOrder": "input",
  "groups": [
    {
      "id": "current-programming",
      "section": "制作成员",
      "sectionEn": "Production Credits",
      "title": "程序",
      "en": "Programming",
      "members": ["组长昵称", "成员 A", "成员 B", "成员 C"]
    }
  ]
}
```

仍兼容对象写法：`{"name": "署名", "alias": "Alias", "contribution": "开发"}`。页面仅呈现 `name`；其余字段可留在 JSON 中，不显示第二行。

普通成员同等展示，排名不分先后。`memberOrder` 控制各组首位以外的成员：

- `shuffle`：可选，每次加载随机排列。
- `input`：按文件中的顺序（默认）。
- `name`：按昵称排序。

主创名单全员遵循上述排列配置，不固定首位；各组名单在三种模式下均固定每组首位。空组、只有组长的组均可正常处理。分组顺序使用文件顺序。目前制作成员依次为策划、程序、运营、文案、音频、谱面设计、UI ＆ 平面设计、美工、外部联络、PV；组内署名保留原表顺序。

## 开发与部署

使用 Node.js 22.12+（GitHub Actions 使用 Node.js 24）：`npm ci`，`npm run dev`。

`npm test` 检查排序与名单校验。`npm run build` 进行类型检查并输出 `dist/`。

静态托管设置：构建命令 `npm run build`，输出目录 `dist`。适合 Serverless / 静态部署，不需要常驻服务器或数据库。

修改 `public/credits.json` 后重新构建、部署。若直接维护静态构建产物，则修改 `dist/credits.json` 后上传产物即可。名单读取使用同源请求，无远程字体、追踪或第三方运行时请求。

### GitHub Pages

已提供 `.github/workflows/deploy.yml`，通过 GitHub 官方 Actions 自动检查、构建并发布 `dist/`。推送到仓库默认分支时自动运行，也可以手动触发。无需填写仓库名或配置额外密钥。

1. 解压源码，将项目内容上传到 GitHub 仓库的根目录。`package.json` 和 `.github/` 应直接位于仓库根目录，不要把整个 ZIP 或多套一层的项目文件夹上传。确认 `.github/workflows/deploy.yml` 和 `package-lock.json` 已上传。
2. 打开仓库 **Settings → Pages → Build and deployment → Source**，选择 **GitHub Actions**。
3. 第一次设置完成后，在 **Actions → Deploy GitHub Pages → Run workflow** 手动运行一次，并选择仓库默认分支。成功后可从该次运行的部署链接访问网站。

以后提交名单或页面修改到默认分支，就会自动重新发布。不要在 Source 中选择分支方式发布未构建的源码。

Vite 的 `base` 已设为 `./`，脚本、样式、网站图标、Logo 和名单请求均使用相对部署路径。同一份构建支持 `https://用户名.github.io/`、`https://用户名.github.io/仓库名/` 和自定义域名，无需修改 `base` 或写死仓库名。鸣谢地址为站点地址后加 `#/credits`；Hash 路由不依赖服务器重写。`public/.nojekyll` 会复制到构建目录。

参考：[GitHub Pages 自定义工作流](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)、[Vite 相对资源路径](https://vite.dev/guide/build.html#relative-base)。

## 文件结构

- `public/credits.json`：唯一的名单配置文件，按展示顺序组织分组，保留 CSV 的组内成员顺序，主创按确认的信息单独展示。
- `public/gooseegg-logo.png`：提供的工作室 Logo 原图；页面通过 SVG 视框避开透明留白，并以深色显示。
- `public/favicon.svg`、`public/favicon.ico`、`public/apple-touch-icon.png`：从工作室 Logo 蛋形符号制作的网站图标。
- `src/credits.ts`：类型、校验、排序与筛选逻辑。
- `src/App.vue`：SPA 页面切换、共用页眉与鸣谢页面。
- `src/HeaderNav.vue`：双语页眉导航与当前页面标记。
- `src/dividers.ts`：圆弧分隔线几何计算、位置缓存与可见线段更新。
- `src/HomePage.vue`：工作室主页内容。
- `src/PlatformLinks.vue`、`src/PlatformIcon.vue`：平台入口与图标。
- `src/assets/taptap-mark.svg`：提取自 TapTap 官方 SVG 的「Tap」字形，无底块、路径未重绘。
- `src/MemberNames.vue`：主创与普通成员共用的署名列表组件。
- `src/style.css`：游戏风格几何装饰、响应式布局与浅色配色。
- `.github/workflows/deploy.yml`：GitHub Pages 的自动检查、构建与部署。
- `public/.nojekyll`：静态发布标记。

正式名单的 `studio.demo` 已设为 `false`，不会显示演示标记。

分隔线按背景圆弧的实际椭圆边界裁切。分组位置在名单、路由或窗口变化时测量并缓存；滚动时使用缓存位置，仅更新当前屏幕内的分隔线，直接更新独立线元素，不在每一帧读取全部分组布局或给整组成员写入样式。进入页脚后没有可见分隔线时不写入样式。手机端完全跳过这套 JavaScript 计算，由 CSS 显示全宽分隔线。背景与正文使用独立的明确层级。
