// 图鉴页功能
document.addEventListener('DOMContentLoaded', () => {
  // 确保数据已加载
  if (typeof window.instruments === 'undefined') {
    console.error('乐器数据未加载！');
    return;
  }
  // 初始化页面
  initGallery();
});

// 初始化图鉴页
function initGallery() {
  // 填充朝代筛选选项
  populateDynastyFilter();
  
  // 渲染乐器列表
  renderInstrumentGrid();
  
  // 绑定筛选事件
  bindFilterEvents();
  
  // 绑定弹窗事件
  bindModalEvents();
  
  // 处理URL参数（从首页分类跳转）
  handleUrlParams();
}

// 填充朝代筛选选项
function populateDynastyFilter() {
  const dynastyFilter = document.getElementById('dynasty-filter');
  if (!dynastyFilter) return;

  // 获取所有不重复的朝代
  const dynasties = [...new Set(window.instruments.map(instrument => instrument.dynasty))];
  
  dynasties.forEach(dynasty => {
    const option = document.createElement('option');
    option.value = dynasty;
    option.textContent = dynasty;
    dynastyFilter.appendChild(option);
  });
}

// 渲染乐器网格
function renderInstrumentGrid(filteredInstruments = null) {
  const grid = document.getElementById('instrument-grid');
  const countInfo = document.getElementById('instrument-count');
  const emptyState = document.getElementById('empty-state');
  
  if (!grid || !countInfo) return;

  const instruments = filteredInstruments || window.instruments;
  const favIds = getFavIds();

  // 更新数量信息
  countInfo.textContent = `共找到 ${instruments.length} 件乐器`;

  // 清空现有内容
  grid.innerHTML = '';

  if (instruments.length === 0) {
    emptyState.classList.remove('hidden');
    grid.classList.add('hidden');
    return;
  }

  emptyState.classList.add('hidden');
  grid.classList.remove('hidden');

  // 渲染乐器卡片
  instruments.forEach(instrument => {
    const isFavorited = favIds.includes(instrument.id);
    
    const card = document.createElement('div');
    card.className = 'instrument-card';
    card.innerHTML = `
      <img src="${instrument.img}" alt="${instrument.name}" class="card-image" onerror="this.src='./assets/img/placeholder.jpg'">
      <div class="card-content">
        <div class="card-badges">
          <span class="category-badge">${getCategoryName(instrument.category)}</span>
          <span class="dynasty-badge">${instrument.dynasty}</span>
        </div>
        <h3 class="card-title">${instrument.name}</h3>
        <p class="card-desc">${instrument.desc}</p>
         <div class="card-actions">
    <button class="detail-btn" onclick="openDetailModal(${instrument.id})">详情</button>
    <button class="audio-btn" onclick="playInstrumentAudio('${instrument.audio}', '${instrument.name}', this)">
      试听音频
    </button>
    <button class="fav-btn ${isFavorited ? 'active' : ''}" 
            onclick="toggleFavorite(${instrument.id}, this)">
      ${isFavorited ? '已收藏' : '收藏'}
    </button>
  </div>
      </div>
    `;
    
    grid.appendChild(card);
  });
}

// 获取分类中文名
function getCategoryName(category) {
  const categoryMap = {
    '吹': '吹奏乐器',
    '拉': '拉弦乐器', 
    '弹': '弹拨乐器',
    '打': '打击乐器'
  };
  return categoryMap[category] || category;
}

// 绑定筛选事件
function bindFilterEvents() {
  const categoryFilter = document.getElementById('category-filter');
  const dynastyFilter = document.getElementById('dynasty-filter');
  const searchInput = document.getElementById('search-input');
  const resetBtn = document.getElementById('reset-filters');

  if (categoryFilter) categoryFilter.addEventListener('change', applyFilters);
  if (dynastyFilter) dynastyFilter.addEventListener('change', applyFilters);
  if (searchInput) searchInput.addEventListener('input', applyFilters);
  if (resetBtn) resetBtn.addEventListener('click', resetFilters);
}

// 应用筛选条件
function applyFilters() {
  const category = document.getElementById('category-filter').value;
  const dynasty = document.getElementById('dynasty-filter').value;
  const search = document.getElementById('search-input').value.toLowerCase();

  let filtered = window.instruments.filter(instrument => {
    // 分类筛选
    if (category !== 'all' && instrument.category !== category) {
      return false;
    }
    
    // 朝代筛选
    if (dynasty !== 'all' && instrument.dynasty !== dynasty) {
      return false;
    }
    
    // 关键词搜索
    if (search && !instrument.name.toLowerCase().includes(search) && 
        !instrument.desc.toLowerCase().includes(search)) {
      return false;
    }
    
    return true;
  });

  renderInstrumentGrid(filtered);
}

// 重置筛选
function resetFilters() {
  document.getElementById('category-filter').value = 'all';
  document.getElementById('dynasty-filter').value = 'all';
  document.getElementById('search-input').value = '';
  
  renderInstrumentGrid();
}

// 处理URL参数（从首页跳转）
function handleUrlParams() {
  const urlParams = new URLSearchParams(window.location.search);
  const category = urlParams.get('cat');
  const highlightId = urlParams.get('highlight');

  if (category) {
    document.getElementById('category-filter').value = category;
    applyFilters();
  }

  if (highlightId) {
    // 可以高亮显示特定乐器
    setTimeout(() => {
      openDetailModal(parseInt(highlightId));
    }, 500);
  }
}

// 打开详情弹窗
function openDetailModal(instrumentId) {
  const instrument = window.instruments.find(item => item.id === instrumentId);
  if (!instrument) return;

  const modal = document.getElementById('detail-modal');
  const favIds = getFavIds();
  const isFavorited = favIds.includes(instrumentId);

  // 填充弹窗内容
  document.getElementById('modal-title').textContent = instrument.name;
  document.getElementById('modal-img').src = instrument.img;
  document.getElementById('modal-img').alt = instrument.name;
  document.getElementById('modal-category').textContent = getCategoryName(instrument.category);
  document.getElementById('modal-dynasty').textContent = instrument.dynasty;
  document.getElementById('modal-name').textContent = instrument.name;
  document.getElementById('modal-desc').textContent = instrument.desc;
  
  // 设置收藏按钮状态
  const favBtn = document.getElementById('modal-fav-btn');
  favBtn.textContent = isFavorited ? '取消收藏' : '加入收藏';
  favBtn.className = isFavorited ? 'fav-btn active' : 'fav-btn';
  favBtn.onclick = () => toggleFavorite(instrumentId, favBtn);

// 设置弹窗音频按钮
const audioBtn = document.getElementById('modal-audio-btn');
audioBtn.onclick = () => playInstrumentAudio(instrument.audio, instrument.name, audioBtn);

  // 显示弹窗
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  
}

// 绑定弹窗事件
function bindModalEvents() {
  const modal = document.getElementById('detail-modal');
  const closeBtn = document.getElementById('modal-close');
  const overlay = document.querySelector('.modal-overlay');

  if (closeBtn) {
    closeBtn.addEventListener('click', closeDetailModal);
  }

  if (overlay) {
    overlay.addEventListener('click', closeDetailModal);
  }

  // ESC键关闭
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
      closeDetailModal();
    }
  });
}

// 关闭详情弹窗
function closeDetailModal() {
  const modal = document.getElementById('detail-modal');
  modal.classList.add('hidden');
  document.body.style.overflow = '';
}


let currentAudio = null;      // 当前播放的音频对象
let currentAudioBtn = null;   // 当前播放的按钮
// 播放乐器音频
function playInstrumentAudio(audioPath, instrumentName, buttonElement = null) {
  // 如果点击的是当前正在播放的音频
  if (currentAudio && currentAudioBtn === buttonElement) {
    if (!currentAudio.paused) {
      // 正在播放 -> 暂停
      currentAudio.pause();
      if (buttonElement) buttonElement.textContent = '继续播放';
    } else {
      // 已暂停 -> 继续播放
      currentAudio.play();
      if (buttonElement) buttonElement.textContent = '播放中...';
    }
    return;
  }
  
  // 如果正在播放其他音频，先停止
  if (currentAudio && !currentAudio.paused) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    if (currentAudioBtn) currentAudioBtn.textContent = '试听音频';
  }
  
  // 播放新音频
  const audio = new Audio(audioPath);
  currentAudio = audio;
  currentAudioBtn = buttonElement;
  
  if (buttonElement) buttonElement.textContent = '播放中...';
  
  audio.play().catch(() => {
    if (buttonElement) buttonElement.textContent = '试听音频';
    resetAudio();
  });
  
  audio.addEventListener('ended', () => {
    if (buttonElement) buttonElement.textContent = '试听音频';
    resetAudio();
  });
}

function resetAudio() {
  currentAudio = null;
  currentAudioBtn = null;
}

// 收藏/取消收藏功能
function toggleFavorite(instrumentId, buttonElement = null) {
  let favIds = getFavIds();
  const isCurrentlyFavorited = favIds.includes(instrumentId);

  if (isCurrentlyFavorited) {
    // 取消收藏
    favIds = favIds.filter(id => id !== instrumentId);
    if (buttonElement) {
      buttonElement.textContent = '收藏';
      buttonElement.classList.remove('active');
    }
  } else {
    // 加入收藏
    favIds.push(instrumentId);
    if (buttonElement) {
      buttonElement.textContent = '已收藏';
      buttonElement.classList.add('active');
    }
  }
  // 更新本地存储
  localStorage.setItem('favIds', JSON.stringify(favIds));
  // 触发收藏变化事件（更新导航栏徽标）
  window.dispatchEvent(new CustomEvent('fav:changed'));
  // 如果是在弹窗中操作，也更新卡片上的按钮
  updateCardFavoriteButton(instrumentId, !isCurrentlyFavorited);
}
// 更新卡片上的收藏按钮
function updateCardFavoriteButton(instrumentId, isFavorited) {
  const cardButtons = document.querySelectorAll(`.fav-btn[onclick*="${instrumentId}"]`);
  cardButtons.forEach(btn => {
    btn.textContent = isFavorited ? '已收藏' : '收藏';
    btn.classList.toggle('active', isFavorited);
  });
}
// 获取收藏ID数组（需要common.js提供）
function getFavIds() {
  try {
    return JSON.parse(localStorage.getItem('favIds') || '[]');
  } catch {
    return [];
  }
}
// 页面加载完成后的初始化
window.addEventListener('load', () => {
  console.log('图鉴页加载完成');
});