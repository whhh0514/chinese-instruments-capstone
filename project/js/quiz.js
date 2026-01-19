(() => {
  // 测验配置常量
  const QUIZ_CONFIG = {
    questionCount: 5,
    optionsPerQuestion: 3,
    audioDuration: 10000 // 音频播放时长限制（毫秒）
  }

  // 当前测验状态
  let currentQuiz = {
    questions: [],
    currentIndex: 0,
    score: 0,
    isAudioPlaying: false
  }

  // 音频相关
  let questionAudio = null
  let playButton = null

  /**
   * 初始化测验页面
   * @desc DOM加载完成后绑定事件监听器
   */
  function initQuiz() {
    // 确保数据已加载
    if (typeof window.instruments === 'undefined') {
      console.warn('乐器数据未加载，尝试延迟初始化')
      setTimeout(initQuiz, 100)
      return
    }

    // 缓存DOM元素
    questionAudio = document.getElementById('questionAudio')
    playButton = document.getElementById('playAudioBtn')

    // 绑定事件监听器
    document.getElementById('startBtn').addEventListener('click', startQuiz)
    document.getElementById('restartBtn').addEventListener('click', resetQuiz)
    
    // 音频播放结束监听
    questionAudio.addEventListener('ended', onAudioEnded)
    questionAudio.addEventListener('error', onAudioError)
  }

  /**
   * 开始测验
   * @desc 生成题目并切换到答题界面
   */
  function startQuiz() {
    // 生成随机题目
    currentQuiz.questions = generateQuestions()
    currentQuiz.currentIndex = 0
    currentQuiz.score = 0
    
    // 显示答题界面
    showScreen('quizQuestion')
    loadQuestion()
  }

  /**
   * 生成测验题目
   * @returns {Array} 题目数组
   */
  function generateQuestions() {
    // 打乱乐器顺序并取前N个作为正确答案
    const shuffledInstruments = [...window.instruments].sort(() => Math.random() - 0.5)
    const correctInstruments = shuffledInstruments.slice(0, QUIZ_CONFIG.questionCount)
    
    return correctInstruments.map(instrument => {
      // 获取干扰选项（其他乐器）
      const distractors = window.instruments
        .filter(item => item.id !== instrument.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, QUIZ_CONFIG.optionsPerQuestion - 1)
      
      // 合并正确选项和干扰项并打乱
      const options = [instrument, ...distractors].sort(() => Math.random() - 0.5)
      
      return {
        correctInstrument: instrument,
        options: options,
        userAnswer: null,
        isCorrect: false
      }
    })
  }

  /**
   * 加载当前题目
   * @desc 更新界面显示当前题目内容
   */
  function loadQuestion() {
    const question = currentQuiz.questions[currentQuiz.currentIndex]
    
    // 重置音频状态
    resetAudioState()
    
    // 设置音频源
    questionAudio.src = question.correctInstrument.audio
    
    // 更新进度条
    updateProgress()
    
    // 渲染选项按钮
    renderOptions(question.options)
    
    // 隐藏反馈区域
    hideFeedback()
  }

  /**
   * 渲染选项按钮
   * @param {Array} options - 选项乐器数组
   */
  function renderOptions(options) {
    const container = document.getElementById('optionsArea')
    container.innerHTML = ''
    
    options.forEach(option => {
      const button = document.createElement('button')
      button.className = 'option-btn'
      button.textContent = option.name
      button.dataset.instrumentId = option.id
      button.addEventListener('click', () => selectAnswer(option.id))
      container.appendChild(button)
    })
  }

  /**
   * 处理选项点击
   * @param {Number} selectedId - 用户选择的乐器ID
   */
  function selectAnswer(selectedId) {
    const question = currentQuiz.questions[currentQuiz.currentIndex]
    const correctId = question.correctInstrument.id
    
    // 记录答案
    question.userAnswer = selectedId
    question.isCorrect = selectedId === correctId
    
    if (question.isCorrect) {
      currentQuiz.score++
    }
    
    // 显示反馈
    showFeedback(question)
    
    // 禁用选项按钮
    disableOptions()
    
    // 停止音频
    if (window.currentAudio && !window.currentAudio.paused) {
      window.currentAudio.pause()
    }
  }

  /**
   * 显示答题反馈
   * @param {Object} question - 当前题目对象
   */
  function showFeedback(question) {
    const feedbackText = document.getElementById('feedbackText')
    const nextBtn = document.getElementById('nextBtn')
    
    // 构建反馈文本
    let feedbackHtml = ''
    if (question.isCorrect) {
      feedbackHtml = `<span class="feedback-correct">✓ 回答正确！</span> ${question.correctInstrument.name}：${question.correctInstrument.desc.substring(0, 80)}...`
    } else {
      const userInstrument = window.instruments.find(item => item.id === question.userAnswer)
      feedbackHtml = `<span class="feedback-wrong">✗ 回答错误</span> 这是<span class="correct-answer">${question.correctInstrument.name}</span>，不是${userInstrument.name}。${question.correctInstrument.name}：${question.correctInstrument.desc.substring(0, 60)}...`
    }
    
    feedbackText.innerHTML = feedbackHtml
    
    // 显示反馈区域
    document.getElementById('feedbackArea').classList.remove('hidden')
    
    // 设置下一题按钮
    const isLastQuestion = currentQuiz.currentIndex >= QUIZ_CONFIG.questionCount - 1
    nextBtn.textContent = isLastQuestion ? '查看结果' : '下一题'
    nextBtn.onclick = isLastQuestion ? showResult : nextQuestion
  }

  /**
   * 切换到下一题
   */
  function nextQuestion() {
    currentQuiz.currentIndex++
    loadQuestion()
    
    // 滚动到顶部
    document.querySelector('.quiz-container').scrollIntoView({ behavior: 'smooth' })
  }

  /**
   * 显示测验结果
   */
  function showResult() {
    showScreen('quizResult')
    
    // 更新得分显示
    document.getElementById('resultScore').textContent = `得分：${currentQuiz.score} / ${QUIZ_CONFIG.questionCount}`
    
    // 计算得分率并显示评价
    const percentage = (currentQuiz.score / QUIZ_CONFIG.questionCount) * 100
    let desc = ''
    if (percentage >= 80) {
      desc = '太棒了！你对古代乐器了如指掌，堪称音乐大师！'
    } else if (percentage >= 60) {
      desc = '不错！你对中国传统乐器有一定了解，继续加油！'
    } else {
      desc = '还需努力！建议多去图鉴页听听各种乐器的声音。'
    }
    document.getElementById('resultDesc').textContent = desc
  }

  /**
   * 重置测验
   */
  function resetQuiz() {
    currentQuiz = {
      questions: [],
      currentIndex: 0,
      score: 0,
      isAudioPlaying: false
    }
    
    resetAudioState()
    showScreen('quizStart')
  }

  /**
   * 播放题目音频
   * @desc 控制音频播放和按钮状态
   */
  function playQuestionAudio() {
    // 如果正在播放其他音频，先停止
    if (window.currentAudio && !window.currentAudio.paused) {
      window.currentAudio.pause()
      window.currentAudio.currentTime = 0
    }
    
    // 播放当前音频
    questionAudio.play().catch(() => {
      playButton.innerHTML = '<i class="fas fa-play"></i> 播放失败'
    })
    
    // 更新按钮状态
    playButton.innerHTML = '<i class="fas fa-pause"></i> 播放中...'
    currentQuiz.isAudioPlaying = true
    
    // 存储到全局，方便其他页面访问
    window.currentAudio = questionAudio
  }

  /**
   * 音频播放结束回调
   */
  function onAudioEnded() {
    playButton.innerHTML = '<i class="fas fa-play"></i> 重新播放'
    currentQuiz.isAudioPlaying = false
  }

  /**
   * 音频加载失败回调
   */
  function onAudioError() {
    playButton.innerHTML = '<i class="fas fa-play"></i> 加载失败'
    currentQuiz.isAudioPlaying = false
  }

  /**
   * 重置音频状态
   */
  function resetAudioState() {
    if (questionAudio) {
      questionAudio.pause()
      questionAudio.currentTime = 0
    }
    
    if (playButton) {
      playButton.innerHTML = '<i class="fas fa-play"></i> 播放音频'
      playButton.onclick = playQuestionAudio
    }
    
    currentQuiz.isAudioPlaying = false
  }

  /**
   * 禁用选项按钮并标记答案
   */
  function disableOptions() {
    const optionBtns = document.querySelectorAll('.option-btn')
    const question = currentQuiz.questions[currentQuiz.currentIndex]
    
    optionBtns.forEach(btn => {
      btn.disabled = true
      const instrumentId = parseInt(btn.dataset.instrumentId)
      
      // 标记正确和错误答案
      if (instrumentId === question.correctInstrument.id) {
        btn.classList.add('correct')
      } else if (instrumentId === question.userAnswer && !question.isCorrect) {
        btn.classList.add('wrong')
      }
    })
  }

  /**
   * 隐藏反馈区域
   */
  function hideFeedback() {
    document.getElementById('feedbackArea').classList.add('hidden')
  }

  /**
   * 更新进度条
   */
  function updateProgress() {
    const progressFill = document.getElementById('progressFill')
    const progressText = document.getElementById('progressText')
    
    const percentage = ((currentQuiz.currentIndex + 1) / QUIZ_CONFIG.questionCount) * 100
    progressFill.style.width = `${percentage}%`
    progressText.textContent = `第 ${currentQuiz.currentIndex + 1} / ${QUIZ_CONFIG.questionCount} 题`
  }

  /**
   * 切换显示界面
   * @param {String} screenId - 要显示的界面ID
   */
  function showScreen(screenId) {
    // 隐藏所有界面
    document.getElementById('quizStart').classList.add('hidden')
    document.getElementById('quizQuestion').classList.add('hidden')
    document.getElementById('quizResult').classList.add('hidden')
    
    // 显示指定界面
    document.getElementById(screenId).classList.remove('hidden')
  }

  // DOM加载完成后初始化
  document.addEventListener('DOMContentLoaded', initQuiz)
  
  // 对外暴露函数（供调试使用）
  window.resetQuiz = resetQuiz
})()
