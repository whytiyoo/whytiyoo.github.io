# V1 学术经典版 · GitHub Pages 站点

这个目录就是用 `git` 推送的仓库内容：**根目录的 `index.html` 就是首页**，
站点地址为 https://whytiyoo.github.io/

- 修改内容：编辑本项目里的 `v1-scholar/`（本目录是执行 `node tools/build-site.mjs` 自动生成的，
  改了这里的内容请改回 `v1-scholar/`，再重新运行一次组装脚本）。
- 重新组装：`node tools/build-site.mjs --version v1-scholar`
- 首次推送：
  ```bash
  git add -A && git commit -m "更新站点内容"
  git push -u origin main
  ```
- 若使用自定义域名：在仓库 `Settings → Pages → Custom domain` 填写，并同步修改
  `index.html` 里的 `canonical` 与 `og:url`（或重新组装时用 `--url https://你的域名/`）。

---

以下是该模板的填写说明：

# V1 · 学术经典版（单栏 · 论文优先）

一套面向研究生的**单栏学术主页**模板。风格接近传统学术简历与论文排版：
衬线标题、大量留白、以「论文发表」为核心，并附带打印样式，可以直接导出成 PDF 当学术简历用。

- 纯静态：**零依赖**，双击 `index.html` 就能看效果，不需要 Node、构建工具或联网。
- 内容直接写在 HTML 里，改文字 = 改 HTML，所见即所得。
- 自带深色模式、论文分类筛选、BibTeX 一键复制、移动端适配、SEO 结构化数据。

> **本页当前状态**（吴怀宇的主页）：
> - 已填写的内容：姓名、身份、导师、研究方向、教育经历、GitHub 链接。
> - **刻意未放**：简历下载按钮、邮箱（页面无任何 `mailto:` 链接，结构化数据里也没有 email 字段）。
> - 尚未启用：最新动态、论文发表、科研与开源项目、教学与服务、荣誉奖励
>   —— 源码里以注释形式保留，取消注释即可启用。
> - 需要你补的只有两处：**头像照片**、**「关于我」第二段（在研工作）**。

---

## 一、目录结构

```
v1-scholar/
├── index.html                    ← 唯一需要改的页面文件（全部内容都在这里）
├── README.md                     ← 本文件
└── assets/
    ├── css/style.css             ← 样式（想换配色改最上面的「设计变量」）
    ├── js/main.js                ← 交互（主题、滚动高亮、筛选、复制引用）
    ├── img/
    │   ├── avatar.svg            ← 头像占位图，换成你自己的照片
    │   ├── favicon.svg           ← 浏览器标签页图标（当前是字母 W）
    │   └── og-cover.png          ← 社交分享封面（1200×630）
    └── cv/                       ← 预留目录：放简历用（当前为空，页面未引用）
```

---

## 二、三分钟上手

1. 双击 `index.html`，在浏览器里看效果。
2. 用 VS Code 打开整个 `v1-scholar` 文件夹，按 `Ctrl+F` 搜索 **`待替换`**，
   会依次定位到所有需要改的地方（头像、关于我第二段……）。
3. 换成自己的头像：把照片（建议正方形，≥ 400×400）放到 `assets/img/`，
   然后把 `index.html` 里的
   `<img class="hero__avatar" src="assets/img/avatar.svg" ...>` 改成你的文件名。
4. （可选）想加回「下载简历」按钮：把 PDF 放进 `assets/cv/CV.pdf`，
   再在首屏 `<ul class="hero__links">` 后面加一段按钮，例如：

   ```html
   <p class="hero__actions">
     <a class="btn btn--primary" href="assets/cv/CV.pdf">下载简历 (PDF)</a>
   </p>
   ```

> 想先看效果不想改代码？也可以直接改 `index.html` 里的文字，中文随便替换，结构不用动。

---

## 三、内容填写清单

| 位置 | 改什么 |
| --- | --- |
| `<head>` | 网页标题、`meta description`、`canonical`、Open Graph 里的网址与封面图 |
| `<script type="application/ld+json">` | 姓名、单位、主页、Google Scholar / ORCID / GitHub 链接（**搜索引擎与 AI 检索靠它**） |
| 首屏 `hero` | 姓名、英文名、身份（学校 + 学院 + 年级 + 导师）、一句话研究简介、社交链接 |
| 关于我 `#about` | 两三段自我介绍、研究方向标签、教育经历 |
| 最新动态 `#news` | 保留最近 5–8 条，最新的一条放最上面 |
| 论文发表 `#publications` | 每篇一个 `<li class="pub">`，见下文 |
| 科研与开源项目 `#projects` | 2–4 个项目，写「做什么 + 你负责什么 + 结果」 |
| 教学与服务 `#teaching` | 助教、审稿、志愿者等 |
| 荣誉奖励 `#awards` | 按年份倒序 |
| 联系我 `#contact` | GitHub、个人主页（本页按主人要求不放邮箱） |
| 页脚 | 版权年份、许可协议、最后更新日期 |

### 加一篇论文

复制任意一个 `<li class="pub">` 整块，粘贴到列表里，然后改这几处：

```html
<li class="pub" data-type="conference">   <!-- data-type: conference / journal / preprint，用于筛选 -->
  <div class="pub__body">
    <h3 class="pub__title"><a href="论文链接">论文标题</a></h3>
    <p class="pub__authors">
      某某, <strong class="me">你的名字</strong>, 某某   <!-- 自己的名字用 <strong class="me"> 包起来，会自动加粗加下划线 -->
    </p>
    <p class="pub__venue"><em>会议或期刊全称</em>（CCF-A 会议）</p>
    <p class="pub__links">
      <a href="...">PDF</a>
      <a href="...">arXiv</a>
      <button class="link-btn" type="button" data-bibtex-toggle>BibTeX</button>
      <button class="link-btn" type="button" data-bibtex-copy>复制引用</button>
    </p>
    <pre class="pub__bibtex" hidden>@inproceedings{...}</pre>  <!-- 从 Google Scholar 点「引用」直接粘贴 -->
  </div>
</li>
```

小提示：
- 没有的链接（比如还没挂 arXiv）就把对应的 `<a>` 整行删掉，页面不会留空。
- BibTeX 里如果出现 `&`、`<`、`>`，要写成 `&amp;`、`&lt;`、`&gt;`，否则 HTML 会解析出错。
- 想加分类（比如「综述」）：在筛选区加一个
  `<button class="chip" type="button" data-filter="survey">综述</button>`，
  再把论文的 `data-type="survey"` 即可。

---

## 四、改配色 / 改布局

打开 `assets/css/style.css`，最上面的 `:root` 是全部设计变量：

```css
--accent: #1a4d8f;   /* 主色，链接与标题下划线 */
--ink: #1c2024;      /* 正文颜色 */
--measure: 820px;    /* 内容最大宽度，喜欢更宽可以调到 960px */
--font-serif: ...;   /* 标题字体，想全用无衬线就把它改成 var(--font-sans) */
```

深色主题在 `html[data-theme="dark"]` 里，两套颜色各自独立，改完互不影响。

---

## 五、部署到 GitHub Pages（免费、带 HTTPS）

1. 注册/登录 GitHub，新建仓库，名字必须是 `你的用户名.github.io`。
2. 把 `v1-scholar` 里的**所有文件**（`index.html` 与 `assets/`）上传到仓库根目录。
3. 打开 `https://你的用户名.github.io/`，1–2 分钟后即可访问。
4. 想用自定义域名：在仓库 `Settings → Pages → Custom domain` 填写，并按提示在域名商处加一条 CNAME 记录。
   注意：`assets/` 这种目录名在 GitHub Pages（Jekyll）下是安全的，无需额外配置。

其他可选平台：Cloudflare Pages、Vercel、Netlify（上传文件夹即可，同样免费）。
若主要访问者在中国大陆，GitHub Pages 的访问速度不稳定，可考虑：
Gitee Pages + 国内 CDN，或把静态文件放到阿里云 OSS / 腾讯云 COS 并绑定已备案域名。

---

## 六、常见问题

**Q：打印/导出 PDF 当简历用？**
浏览器按 `Ctrl+P` → 目标选「另存为 PDF」。打印样式会自动隐藏导航、按钮与 BibTeX，
并把链接地址以括号形式附在文字后面，方便纸面阅读。

**Q：深色模式怎么默认打开？**
右上角按钮切换后会被记住（存在浏览器的 localStorage）。首次访问跟随系统设置。

**Q：手机上导航打不开？**
宽度 ≤ 720px 时导航自动折叠成汉堡按钮，点开、点链接、按 Esc 都会正常收起。

**Q：能放博客吗？**
本模板不含博客系统。若要写长文，建议论文/动态里挂外链，或另配 Hexo / Hugo 子目录。

**Q：为什么不用模板引擎（Jekyll / Hugo）？**
单页修改成本最低，且不受构建环境与版本升级影响。内容变多后再迁移到静态站点生成器也不冲突。
