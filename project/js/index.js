// js/index.js
(() => {
  // 等待 DOM 加载完成
  document.addEventListener('DOMContentLoaded', function() {
    // 确保数据已加载
    if (window.instruments && window.instruments.length > 0) {
      initPage()
    } else {
      // 如果数据还没加载，稍等再初始化
      setTimeout(initPage, 100)
    }
  })

  /**
   * 初始化页面
   * @desc 初始化首页所有功能模块
   */
  function initPage() {
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
   * @desc 统计各分类乐器数量并显示
   */
  function initCategoryStats() {
    // 检查数据是否可用
    if (!window.instruments || !Array.isArray(window.instruments)) {
      console.warn('乐器数据未加载，将重试...')
      setTimeout(initCategoryStats, 200)
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
   * @desc 加载并显示随机推荐的乐器
   */
  function initRecommendation() {
    // 确保数据已加载
    if (!window.instruments || window.instruments.length === 0) {
      setTimeout(initRecommendation, 100)
      return
    }
    
    refreshRecommendation()
  }

  /**
   * 刷新推荐乐器
   * @desc 随机选择一个乐器并显示在推荐卡片中
   */
  function refreshRecommendation() {
    const recommendCard = document.getElementById('recommend-card')
    if (!recommendCard || !window.instruments || window.instruments.length === 0) {
      console.warn('无法刷新推荐：数据未加载或元素不存在')
      return
    }
    
    // 随机选择一个乐器
    const randomIndex = Math.floor(Math.random() * window.instruments.length)
    const instrument = window.instruments[randomIndex]
    
    // 获取收藏状态
    const isFavorite = window.getFavIds ? window.getFavIds().includes(instrument.id) : false
    
    // 生成推荐卡片HTML
    const recommendHtml = `
      <div class="recommend-content">
        <img src="${instrument.img}" alt="${instrument.name}" class="recommend-img" onerror="this.src='assets/img/default.jpg'">
        <div class="recommend-info">
          <h3 class="recommend-name">${instrument.name}</h3>
          <span class="recommend-category">${getCategoryName(instrument.category)}乐器</span>
          <p class="recommend-dynasty">${instrument.dynasty}</p>
          <p class="recommend-desc">${instrument.desc.substring(0, 100)}...</p>
          <div class="recommend-actions">
            <button class="recommend-button button-detail" data-instrument-id="${instrument.id}">查看详情</button>
            <button class="recommend-button button-listen" data-instrument-id="${instrument.id}">试听音频</button>
            <button class="recommend-button button-favorite" data-instrument-id="${instrument.id}" data-favorite="${isFavorite}">
              ${isFavorite ? '❤️ 已收藏' : '🤍 收藏'}
            </button>
          </div>
        </div>
      </div>
    `
    
    recommendCard.innerHTML = recommendHtml
    
    // 重新绑定事件
    bindRecommendationEvents()
  }

  /**
   * 绑定推荐卡片事件
   * @desc 为推荐卡片的按钮绑定点击事件
   */
  function bindRecommendationEvents() {
    // 绑定详情按钮
    const detailButtons = document.querySelectorAll('.button-detail')
    detailButtons.forEach(button => {
      button.addEventListener('click', function() {
        const instrumentId = parseInt(this.getAttribute('data-instrument-id'))
        showInstrumentDetail(instrumentId)
      })
    })
    
    // 绑定试听按钮
    const listenButtons = document.querySelectorAll('.button-listen')
    listenButtons.forEach(button => {
      button.addEventListener('click', function() {
        const instrumentId = parseInt(this.getAttribute('data-instrument-id'))
        playInstrumentAudio(instrumentId)
      })
    })
    
    // 绑定收藏按钮
    const favoriteButtons = document.querySelectorAll('.button-favorite')
    favoriteButtons.forEach(button => {
      button.addEventListener('click', function() {
        const instrumentId = parseInt(this.getAttribute('data-instrument-id'))
        const isFavorite = this.getAttribute('data-favorite') === 'true'
        toggleFavorite(instrumentId, this)
      })
    })
  }

  /**
   * 切换收藏状态
   * @param {number} instrumentId - 乐器ID
   * @param {HTMLElement} buttonElement - 按钮元素
   */
  function toggleFavorite(instrumentId, buttonElement) {
    if (!window.getFavIds || !window.updateFavBadge) {
      alert('收藏功能暂不可用')
      return
    }
    
    const favIds = window.getFavIds()
    const isFavorite = favIds.includes(instrumentId)
    
    if (isFavorite) {
      // 取消收藏
      const newFavIds = favIds.filter(id => id !== instrumentId)
      localStorage.setItem('favIds', JSON.stringify(newFavIds))
      buttonElement.innerHTML = '🤍 收藏'
      buttonElement.setAttribute('data-favorite', 'false')
    } else {
      // 添加收藏
      favIds.push(instrumentId)
      localStorage.setItem('favIds', JSON.stringify(favIds))
      buttonElement.innerHTML = '❤️ 已收藏'
      buttonElement.setAttribute('data-favorite', 'true')
    }
    
    // 更新收藏徽章
    window.updateFavBadge()
    
    // 触发收藏变化事件
    window.dispatchEvent(new Event('fav:changed'))
  }

  /**
   * 获取分类完整名称
   * @param {string} category - 分类代码
   * @returns {string} 分类名称
   */
  function getCategoryName(category) {
    const categoryMap = {
      '吹': '吹奏',
      '拉': '拉弦',
      '弹': '弹拨',
      '打': '打击'
    }
    
    return categoryMap[category] || category
  }

  /**
   * 显示乐器详情
   * @param {number} instrumentId - 乐器ID
   * @desc 跳转到图鉴页并显示指定乐器的详情
   */
  function showInstrumentDetail(instrumentId) {
    // 跳转到图鉴页并显示详情
    window.location.href = `gallery.html?detail=${instrumentId}`
  }

  /**
   * 播放乐器音频
   * @param {number} instrumentId - 乐器ID
   */
  function playInstrumentAudio(instrumentId) {
    const instrument = window.instruments.find(function(item) {
      return item.id === instrumentId
    })
    
    if (!instrument) {
      alert('未找到该乐器信息')
      return
    }
    
    if (!instrument.audio) {
      alert('该乐器暂无音频')
      return
    }
    
    // 创建音频元素并播放
    const audio = new Audio(instrument.audio)
    
    // 设置音频播放事件
    audio.addEventListener('canplaythrough', function() {
      audio.play().catch(function(error) {
        console.error('音频播放失败:', error)
        alert('音频播放失败，请检查音频文件路径')
      })
    })
    
    audio.addEventListener('error', function() {
      alert('音频加载失败，请检查音频文件')
    })
    
    // 预加载音频
    audio.load()
    
    // 播放结束后的清理
    audio.addEventListener('ended', function() {
      audio.remove()
    })
    
    // 超时处理
    setTimeout(function() {
      if (audio.readyState < 2) {
        alert('音频加载超时，请稍后再试')
      }
    }, 5000)
  }

  /**
   * 模拟加载数据（备用方案）
   * @desc 如果data.js没有加载，使用这个函数创建模拟数据
   */
  function loadMockData() {
    if (!window.instruments) {
      window.instruments = [
        {
          id: 1,
          name: "古琴",
          category: "弹",
          dynasty: "先秦",
          desc: "古琴是中国最古老的弹拨乐器之一，已有三千多年历史。",
          img: "assets/img/guqin.jpg",
          audio: "assets/audio/guqin.mp3"
        },
        {
          id: 2,
          name: "笛",
          category: "吹",
          dynasty: "新石器时代",
          desc: "笛子是中国传统音乐中常用的横吹木管乐器之一。",
          img: "assets/img/di.jpg",
          audio: "assets/audio/di.mp3"
        }
      ]
      console.log('使用模拟数据')
    }
  }

  // 如果数据未加载，尝试加载模拟数据
  if (!window.instruments) {
    loadMockData()
  }

  // 对外暴露函数（供其他脚本或HTML事件调用）
  window.refreshRecommendation = refreshRecommendation
  window.showInstrumentDetail = showInstrumentDetail
  window.playInstrumentAudio = playInstrumentAudio
})()
