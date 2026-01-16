// 收藏页核心逻辑 - 基于localStorage(favIds)实现收藏列表/取消收藏/空状态
document.addEventListener('DOMContentLoaded', () => {
  // 核心配置（严格驼峰命名，消除格式提示）
  const FAV_KEY = 'favIds'; // 和gallery页约定的localStorage key
  const favoritesListEl = document.getElementById('favoritesList'); // 正确驼峰命名
  const emptyStateEl = document.getElementById('emptyState');

  // 1. 读取localStorage中的收藏ID数组（异常捕获+容错）
  function getFavoriteIds() {
    try {
      const favStr = localStorage.getItem(FAV_KEY);
      // 解析失败/无数据时返回空数组
      return favStr ? JSON.parse(favStr) : [];
    } catch (error) {
      console.error('读取收藏ID失败:', error);
      return [];
    }
  }

  // 2. 从data.js中筛选收藏的乐器数据
  function getFavoriteInstruments() {
    const favIds = getFavoriteIds();
    // 兼容data.js未加载/无数据的情况
    if (!window.instruments || !Array.isArray(window.instruments)) {
      console.warn('乐器数据源未加载');
      return [];
    }
    // 过滤出id在收藏列表中的乐器
    return window.instruments.filter(inst => favIds.includes(inst.id));
  }

  // 3. 渲染收藏列表（核心函数）
  function renderFavorites() {
    const favoriteInstruments = getFavoriteInstruments();

    // 空状态处理
    if (favoriteInstruments.length === 0) {
      favoritesListEl.style.display = 'none';
      emptyStateEl.style.display = 'block';
      updateNavFavCount(); // 更新导航栏收藏数
      return;
    }

    // 有收藏数据时渲染列表
    favoritesListEl.style.display = 'grid';
    emptyStateEl.style.display = 'none';
    favoritesListEl.innerHTML = ''; // 清空原有内容

    // 遍历生成收藏卡片
    favoriteInstruments.forEach(inst => {
      const card = document.createElement('div');
      card.className = 'favorite-card';
      card.innerHTML = `
        <img src="${inst.img}" alt="${inst.name}" class="card-img">
        <div class="card-content">
          <h3 class="card-name">${inst.name}</h3>
          <span class="card-category">${inst.category}</span>
          <p class="card-desc">${inst.desc}</p>
          <button class="unfav-btn" data-id="${inst.id}">取消收藏</button>
        </div>
      `;
      favoritesListEl.appendChild(card);
    });

    // 绑定取消收藏事件
    bindUnfavoriteEvents();
    // 更新导航栏收藏数
    updateNavFavCount();
  }

  // 4. 取消收藏逻辑（实时更新localStorage+列表）
  function bindUnfavoriteEvents() {
    const unfavBtns = document.querySelectorAll('.unfav-btn');
    unfavBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        const instId = parseInt(this.dataset.id);
        let favIds = getFavoriteIds();
        
        // 移除当前乐器ID
        favIds = favIds.filter(id => id !== instId);
        // 更新localStorage
        localStorage.setItem(FAV_KEY, JSON.stringify(favIds));
        
        // 重新渲染列表（实时更新）
        renderFavorites();
        // 轻量提示（产品化体验）
        showToast('已取消收藏');
      });
    });
  }

  // 5. 辅助：更新导航栏收藏数（和common.js联动）
  function updateNavFavCount() {
    if (typeof window.updateNavFavCount === 'function') {
      window.updateNavFavCount(); // 调用common.js的全局方法
    }
  }

  // 6. 辅助：轻量提示框（产品化亮点，无依赖）
  function showToast(text) {
    // 移除已有提示，避免重复
    const oldToast = document.querySelector('.toast-tip');
    if (oldToast) oldToast.remove();

    // 创建提示元素
    const toast = document.createElement('div');
    toast.className = 'toast-tip';
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      padding: 8px 20px;
      background: rgba(0,0,0,0.7);
      color: #fff;
      border-radius: 4px;
      font-size: 0.9rem;
      z-index: 9999;
      opacity: 0;
      transition: opacity 0.2s ease;
    `;
    toast.textContent = text;
    document.body.appendChild(toast);
    
    // 显示并自动消失
    setTimeout(() => toast.style.opacity = 1, 10);
    setTimeout(() => {
      toast.style.opacity = 0;
      setTimeout(() => toast.remove(), 200);
    }, 1500);
  }

  // 页面初始化：渲染收藏列表
  renderFavorites();
});
