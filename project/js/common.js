// js/common.js
(() => {
  const FAV_KEY = "favIds";

  // 读取收藏ID数组（保证返回数组）
  function getFavIds() {
    try {
      const raw = localStorage.getItem(FAV_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      return [];
    }
  }

  // 返回收藏数量
  function getFavCount() {
    return getFavIds().length;
  }

  // 写入 header
  function renderHeader() {
    const headerEl = document.getElementById("site-header");
    if (!headerEl) return;

    headerEl.innerHTML = `
      <header class="site-header">
        <nav class="navbar container" aria-label="主导航">
          <a class="brand" href="./index.html">听见古韵</a>

          <ul class="nav-links">
            <li><a class="nav-link" href="./index.html" data-page="index.html">首页</a></li>
            <li><a class="nav-link" href="./gallery.html" data-page="gallery.html">图鉴</a></li>
            <li><a class="nav-link" href="./quiz.html" data-page="quiz.html">听音测验</a></li>
            <li>
              <a class="nav-link" href="./favorites.html" data-page="favorites.html">
                收藏
                <span id="fav-badge" class="badge" aria-label="收藏数量">0</span>
              </a>
            </li>
          </ul>
        </nav>
      </header>
    `;

    setActiveNavLink();
    updateFavBadge();
  }

  // 写入 footer
  function renderFooter() {
    const footerEl = document.getElementById("site-footer");
    if (!footerEl) return;

    const year = new Date().getFullYear();
    footerEl.innerHTML = `
      <footer class="site-footer">
        <div class="container footer-inner">
          <span>© ${year} 听见古韵 · 前端学习项目</span>
          <span class="muted">数据与素材仅用于学习展示</span>
        </div>
      </footer>
    `;
  }

  // 高亮当前页导航
  function setActiveNavLink() {
    // 取当前文件名：/xxx/gallery.html -> gallery.html
    const current = location.pathname.split("/").pop() || "index.html";

    document.querySelectorAll(".nav-link").forEach((a) => {
      const page = a.dataset.page;
      if (page === current) {
        a.classList.add("active");
        a.setAttribute("aria-current", "page");
      } else {
        a.classList.remove("active");
        a.removeAttribute("aria-current");
      }
    });
  }

  // 更新收藏徽标数字
  function updateFavBadge() {
    const badge = document.getElementById("fav-badge");
    if (!badge) return;

    const count = getFavCount();
    badge.textContent = String(count);

    // 也可以让 0 的时候弱化显示
    badge.classList.toggle("badge--empty", count === 0);
  }

  // 对外暴露（让别的页面JS可以调用 window.updateFavBadge()）
  window.getFavIds = getFavIds;
  window.getFavCount = getFavCount;
  window.updateFavBadge = updateFavBadge;

  // 监听“收藏变化”事件：别的页面改了收藏，发事件即可更新徽标
  window.addEventListener("fav:changed", () => {
    updateFavBadge();
  });

  // DOM ready 后注入
  document.addEventListener("DOMContentLoaded", () => {
    renderHeader();
    renderFooter();
  });
})();
