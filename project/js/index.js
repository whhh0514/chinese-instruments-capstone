// js/index.js - 首页功能脚本
(() => {
  // 音频控制状态变量
  let currentAudio = null
  let currentAudioBtn = null

  /**
   * 初始化页面
   */
  function initPage() {
    // 确保数据已加载
    if (!window.instruments || window.instruments.length === 0) {
      setTimeout(initPage, 100)
      return
    }
    
    // 初始化今日推荐
    initRecommendation()
    
    // 初始化分类统计
    initCategoryStats()
    
    // 绑定刷新推荐按钮事件
    const refreshButton = document.getElementById('refresh-recommend')
    if (refreshButton) {
      refreshButton.addEventListener('click', refreshRecommendation)
    }
  }

  /**
   * 初始化分类统计
   */
  function initCategoryStats() {
    // 检查数据是否可用
    if (!window.instruments || !Array.isArray(window.instruments)) {
      console.warn('乐器数据未加载')
      return
    }
    
    // 统计各分类数量
    const categoryCount = {
      '吹': 0,
      '拉': 0,
      '弹': 0,
      '打': 0
    }
    
    window.instruments.forEach(function(instrument) {
      if (categoryCount.hasOwnProperty(instrument.category)) {
        categoryCount[instrument.category]++
      }
    })
    
    // 更新显示
    updateCategoryCount('blow', categoryCount['吹'])
    updateCategoryCount('pull', categoryCount['拉'])
    updateCategoryCount('pluck', categoryCount['弹'])
    updateCategoryCount('hit', categoryCount['打'])
  }

  /**
   * 更新分类数量显示
   * @param {string} categoryId - 分类ID
   * @param {number} count - 数量
   */
  function updateCategoryCount(categoryId, count) {
    const element = document.getElementById(categoryId + '-count')
    if (element) {
      element.textContent = count + ' 件'
    }
  }

  /**
   * 初始化今日推荐
   */
  function initRecommendation() {
    refreshRecommendation()
  }

  /**
   * 刷新推荐乐器
   */
  function refreshRecommendation() {
    const recommendCard = document.getElementById('recommend-card')
    if (!recommendCard || !window.instruments || window.instruments.length === 0) {
      return
    }
    
    // 随机选择一个乐器
    const randomIndex = Math.floor(Math.random() * window.instruments.length)
    const instrument = window.instruments[randomIndex]
    
    // 获取收藏状态
    const favIds = window.getFavIds ? window.getFavIds() : []
    const isFavorited = favIds.includes(instrument.id)
    
    // 生成推荐卡片HTML（使用与gallery.js相同的占位图）
    const recommendHtml = `
      <div class="recommend-content">
        <img src="${instrument.img}" alt="${instrument.name}" class="recommend-img" onerror="this.src='./assets/img/placeholder.jpg'">
        <div class="recommend-info">
          <h3 class="recommend-name">${instrument.name}</h3>
          <span class="recommend-category">${getCategoryName(instrument.category)}</span>
          <p class="recommend-dynasty">${instrument.dynasty}</p>
          <p class="recommend-desc">${instrument.desc.substring(0, 100)}...</p>
          <div class="recommend-actions">
            <button class="recommend-button button-detail" onclick="window.showInstrumentDetail(${instrument.id})">查看详情</button>
            <button class="recommend-button button-listen" onclick="window.playInstrumentAudio('${instrument.audio}', '${instrument.name}', this)">试听音频</button>
            <button class="recommend-button button-favorite ${isFavorited ? 'active' : ''}" 
                    onclick="window.toggleFavorite(${instrument.id}, this)">
              ${isFavorited ? '已收藏' : '收藏'}
            </button>
          </div>
        </div>
      </div>
    `
    
    recommendCard.innerHTML = recommendHtml
  }

  /**
   * 获取分类完整名称
   * @param {string} category - 分类代码
   * @returns {string} 分类名称
   */
  function getCategoryName(category) {
    const categoryMap = {
      '吹': '吹奏乐器',
      '拉': '拉弦乐器',
      '弹': '弹拨乐器',
      '打': '打击乐器'
    }
    return categoryMap[category] || category
  }

  /**
   * 显示乐器详情
   * @param {number} instrumentId - 乐器ID
   */
  function showInstrumentDetail(instrumentId) {
    // 跳转到图鉴页并高亮显示指定乐器
    window.location.href = `gallery.html?highlight=${instrumentId}`
  }

  /**
   * 播放乐器音频（与gallery.js保持一致）
   * @param {string} audioPath - 音频路径
   * @param {string} instrumentName - 乐器名称
   * @param {HTMLElement} buttonElement - 按钮元素
   */
  function playInstrumentAudio(audioPath, instrumentName, buttonElement = null) {
    // 如果点击的是当前正在播放的音频
    if (currentAudio && currentAudioBtn === buttonElement) {
      if (!currentAudio.paused) {
        // 正在播放 -> 暂停
        currentAudio.pause()
        if (buttonElement) buttonElement.textContent = '继续播放'
      } else {
        // 已暂停 -> 继续播放
        currentAudio.play()
        if (buttonElement) buttonElement.textContent = '播放中...'
      }
      return
    }
    
    // 如果正在播放其他音频，先停止
    if (currentAudio && !currentAudio.paused) {
      currentAudio.pause()
      currentAudio.currentTime = 0
      if (currentAudioBtn) currentAudioBtn.textContent = '试听音频'
    }
    
    // 播放新音频
    const audio = new Audio(audioPath)
    currentAudio = audio
    currentAudioBtn = buttonElement
    
    if (buttonElement) buttonElement.textContent = '播放中...'
    
    audio.play().catch(() => {
      if (buttonElement) buttonElement.textContent = '试听音频'
      resetAudio()
    })
    
    audio.addEventListener('ended', () => {
      if (buttonElement) buttonElement.textContent = '试听音频'
      resetAudio()
    })
  }

  /**
   * 重置音频状态（与gallery.js保持一致）
   */
  function resetAudio() {
    currentAudio = null
    currentAudioBtn = null
  }

  /**
   * 收藏/取消收藏功能（与gallery.js保持一致）
   * @param {number} instrumentId - 乐器ID
   * @param {HTMLElement} buttonElement - 按钮元素
   */
  function toggleFavorite(instrumentId, buttonElement = null) {
    let favIds = getFavIds()
    const isCurrentlyFavorited = favIds.includes(instrumentId)

    if (isCurrentlyFavorited) {
      // 取消收藏
      favIds = favIds.filter(id => id !== instrumentId)
      if (buttonElement) {
        buttonElement.textContent = '收藏'
        buttonElement.classList.remove('active')
      }
    } else {
      // 加入收藏
      favIds.push(instrumentId)
      if (buttonElement) {
        buttonElement.textContent = '已收藏'
        buttonElement.classList.add('active')
      }
    }
    
    // 更新本地存储
    localStorage.setItem('favIds', JSON.stringify(favIds))
    
    // 触发收藏变化事件（更新导航栏徽标）
    window.dispatchEvent(new CustomEvent('fav:changed'))
  }

  /**
   * 获取收藏ID数组（与gallery.js保持一致）
   */
  function getFavIds() {
    try {
      return JSON.parse(localStorage.getItem('favIds') || '[]')
    } catch {
      return []
    }
  }

  /**
   * 更新卡片上的收藏按钮（与gallery.js保持一致）
   * @param {number} instrumentId - 乐器ID
   * @param {boolean} isFavorited - 是否已收藏
   */
  function updateCardFavoriteButton(instrumentId, isFavorited) {
    const cardButtons = document.querySelectorAll(`.fav-btn[onclick*="${instrumentId}"]`)
    cardButtons.forEach(btn => {
      btn.textContent = isFavorited ? '已收藏' : '收藏'
      btn.classList.toggle('active', isFavorited)
    })
  }

  // 对外暴露函数（供其他脚本或HTML事件调用）
  window.refreshRecommendation = refreshRecommendation
  window.showInstrumentDetail = showInstrumentDetail
  window.playInstrumentAudio = playInstrumentAudio
  window.toggleFavorite = toggleFavorite
  window.getCategoryName = getCategoryName
  window.getFavIds = getFavIds
  window.updateCardFavoriteButton = updateCardFavoriteButton

  // DOM加载完成后初始化页面
  document.addEventListener('DOMContentLoaded', initPage)
})()
