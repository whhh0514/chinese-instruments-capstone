/**
 * 首页交互逻辑
 * 兼容data.js和common.js
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('首页交互模块加载完成');
    
    // ===== 全局变量 =====
    let currentInstrumentIndex = 0;
    let isPlaying = false;
    let audioPlayer = null;
    let recommendedInstruments = [];
    
    // ===== DOM元素缓存 =====
    const elements = {
        // 按钮
        exploreBtn: document.getElementById('exploreBtn'),
        listenBtn: document.getElementById('listenBtn'),
        playBtn: document.getElementById('playBtn'),
        detailBtn: document.getElementById('detailBtn'),
        refreshBtn: document.getElementById('refreshBtn'),
        prevBtn: document.getElementById('prevBtn'),
        nextBtn: document.getElementById('nextBtn'),
        musicToggle: document.getElementById('musicToggle'),
        
        // 推荐内容
        recImage: document.getElementById('recImage'),
        recName: document.getElementById('recName'),
        recCategory: document.getElementById('recCategory'),
        recDynasty: document.getElementById('recDynasty'),
        recDescription: document.getElementById('recDescription'),
        recQuote: document.getElementById('recQuote'),
        audioTime: document.getElementById('audioTime'),
        
        // 播放控制
        playIcon: document.getElementById('playIcon'),
        playText: document.getElementById('playText'),
        progressFill: document.getElementById('progressFill'),
        currentTime: document.getElementById('currentTime'),
        totalTime: document.getElementById('totalTime'),
        
        // 容器
        categoriesGrid: document.querySelector('.categories-grid'),
        navDots: document.getElementById('navDots'),
        
        // 音频播放器
        audioPlayer: document.getElementById('audioPlayer')
    };
    
    // ===== 初始化函数 =====
    function init() {
        console.log('初始化首页');
        
        // 等待common.js加载完成
        setTimeout(() => {
            setupAudioPlayer();
            loadRecommendedInstruments();
            setupCategories();
            setupEventListeners();
            setupScrollAnimations();
            
            // 更新推荐内容
            updateRecommendation();
            
            console.log('首页初始化完成');
        }, 100);
    }
    
    // ===== 音频播放器设置 =====
    function setupAudioPlayer() {
        audioPlayer = elements.audioPlayer;
        
        if (!audioPlayer) {
            console.error('音频播放器元素未找到');
            return;
        }
        
        // 监听音频事件
        audioPlayer.addEventListener('timeupdate', updateAudioProgress);
        audioPlayer.addEventListener('loadedmetadata', updateAudioDuration);
        audioPlayer.addEventListener('ended', handleAudioEnded);
        audioPlayer.addEventListener('error', handleAudioError);
    }
    
    // ===== 加载推荐乐器 =====
    function loadRecommendedInstruments() {
        // 使用data.js中的乐器数据
        if (typeof instruments !== 'undefined' && Array.isArray(instruments)) {
            // 随机选择4个乐器作为推荐
            recommendedInstruments = getRandomInstruments(instruments, 4);
            
            // 确保每个乐器都有必要的字段
            recommendedInstruments = recommendedInstruments.map(instrument => {
                return {
                    id: instrument.id || 0,
                    name: instrument.name || '未知乐器',
                    category: instrument.category || '未知分类',
                    dynasty: instrument.dynasty || '未知朝代',
                    description: instrument.description || '暂无描述',
                    quote: instrument.quote || getRandomQuote(),
                    image: instrument.image || 'assets/images/default.jpg',
                    audio: instrument.audio || 'assets/audio/default.mp3',
                    duration: instrument.duration || '0:30'
                };
            });
            
            console.log(`加载了 ${recommendedInstruments.length} 个推荐乐器`);
        } else {
            // 如果没有data.js，使用默认数据
            console.warn('未找到乐器数据，使用默认推荐数据');
            recommendedInstruments = getDefaultInstruments();
        }
        
        // 更新导航点
        updateNavigationDots();
    }
    
    // ===== 设置分类卡片 =====
    function setupCategories() {
        if (!elements.categoriesGrid) return;
        
        // 清空现有内容
        elements.categoriesGrid.innerHTML = '';
        
        const categories = [
            {
                id: 'wind',
                name: '吹奏乐器',
                description: '笛、箫、笙、埙等',
                icon: 'fas fa-wind',
                tag: '以气振声',
                backText: '以口吹气，使空气振动而发声的乐器。音色悠扬，如风过竹林。',
                examples: '代表：笛、箫、笙、埙'
            },
            {
                id: 'bowed',
                name: '拉弦乐器',
                description: '二胡、板胡、京胡等',
                icon: 'fas fa-guitar',
                tag: '以弓摩弦',
                backText: '用弓摩擦琴弦而发声的乐器。音色婉转，如泣如诉。',
                examples: '代表：二胡、板胡、京胡'
            },
            {
                id: 'plucked',
                name: '弹拨乐器',
                description: '古琴、琵琶、筝、阮等',
                icon: 'fas fa-music',
                tag: '以指拨弦',
                backText: '用手指或拨子弹拨琴弦而发声的乐器。音色清脆，如珠落玉盘。',
                examples: '代表：古琴、琵琶、筝、阮'
            },
            {
                id: 'percussion',
                name: '打击乐器',
                description: '编钟、鼓、磬、锣等',
                icon: 'fas fa-drum',
                tag: '以槌击打',
                backText: '通过敲击、摇动或摩擦等方式使乐器本体振动而发声的乐器。音色铿锵，气势磅礴。',
                examples: '代表：编钟、鼓、磬、锣'
            }
        ];
        
        // 创建分类卡片
        categories.forEach(category => {
            const cardHTML = `
                <div class="category-card" data-category="${category.id}">
                    <div class="card-inner">
                        <div class="card-front">
                            <div class="card-icon">
                                <i class="${category.icon}"></i>
                            </div>
                            <h3>${category.name}</h3>
                            <p>${category.description}</p>
                            <div class="card-tag">${category.tag}</div>
                        </div>
                        <div class="card-back">
                            <h4>${category.name}</h4>
                            <p>${category.backText}</p>
                            <div class="card-examples">
                                <span>${category.examples}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            elements.categoriesGrid.innerHTML += cardHTML;
        });
    }
    
    // ===== 事件监听器设置 =====
    function setupEventListeners() {
        // Hero按钮
        if (elements.exploreBtn) {
            elements.exploreBtn.addEventListener('click', function() {
                scrollToSection('#categories');
            });
        }
        
        if (elements.listenBtn) {
            elements.listenBtn.addEventListener('click', playRandomInstrument);
        }
        
        // 分类卡片（事件委托）
        if (elements.categoriesGrid) {
            elements.categoriesGrid.addEventListener('click', function(event) {
                const card = event.target.closest('.category-card');
                if (card) {
                    const category = card.dataset.category;
                    navigateToGallery(category);
                }
            });
        }
        
        // 音频控制
        if (elements.playBtn) {
            elements.playBtn.addEventListener('click', toggleAudioPlayback);
        }
        
        // 推荐导航
        if (elements.prevBtn) {
            elements.prevBtn.addEventListener('click', showPreviousInstrument);
        }
        
        if (elements.nextBtn) {
            elements.nextBtn.addEventListener('click', showNextInstrument);
        }
        
        if (elements.refreshBtn) {
            elements.refreshBtn.addEventListener('click', refreshRecommendation);
        }
        
        if (elements.detailBtn) {
            elements.detailBtn.addEventListener('click', showInstrumentDetails);
        }
        
        // 背景音乐控制
        if (elements.musicToggle) {
            elements.musicToggle.addEventListener('click', toggleBackgroundMusic);
        }
        
        // 键盘快捷键
        document.addEventListener('keydown', function(e) {
            // 空格键控制音频播放
            if (e.code === 'Space' && !e.target.matches('input, textarea')) {
                e.preventDefault();
                toggleAudioPlayback();
            }
            
            // 左右箭头切换推荐
            if (e.code === 'ArrowLeft') {
                showPreviousInstrument();
            } else if (e.code === 'ArrowRight') {
                showNextInstrument();
            }
        });
        
        // 窗口大小调整
        window.addEventListener('resize', debounce(handleResize, 250));
    }
    
    // ===== 推荐内容更新 =====
    function updateRecommendation() {
        if (recommendedInstruments.length === 0) {
            console.warn('没有可用的推荐乐器');
            return;
        }
        
        const instrument = recommendedInstruments[currentInstrumentIndex];
        
        // 更新DOM元素
        if (elements.recImage) {
            elements.recImage.src = instrument.image;
            elements.recImage.alt = instrument.name;
        }
        
        if (elements.recName) {
            elements.recName.textContent = instrument.name;
        }
        
        if (elements.recCategory) {
            elements.recCategory.textContent = instrument.category;
        }
        
        if (elements.recDynasty) {
            elements.recDynasty.textContent = instrument.dynasty;
        }
        
        if (elements.recDescription) {
            elements.recDescription.textContent = instrument.description;
        }
        
        if (elements.recQuote) {
            elements.recQuote.textContent = instrument.quote;
        }
        
        if (elements.audioTime) {
            elements.audioTime.textContent = `(${instrument.duration})`;
        }
        
        // 更新音频源
        if (audioPlayer) {
            audioPlayer.src = instrument.audio;
            
            // 如果之前正在播放，继续播放新音频
            if (isPlaying) {
                playAudio();
            }
        }
        
        // 更新导航点
        updateActiveDot();
        
        // 重置进度条
        resetProgressBar();
    }
    
    // ===== 音频控制函数 =====
    function toggleAudioPlayback() {
        if (isPlaying) {
            pauseAudio();
        } else {
            playAudio();
        }
    }
    
    function playAudio() {
        if (!audioPlayer || !audioPlayer.src) {
            console.warn('没有可播放的音频');
            return;
        }
        
        const playPromise = audioPlayer.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                isPlaying = true;
                updatePlayButtonState();
            }).catch(error => {
                console.error('音频播放失败:', error);
                alert('音频播放失败，请检查音频文件或浏览器设置。');
            });
        }
    }
    
    function pauseAudio() {
        if (audioPlayer) {
            audioPlayer.pause();
            isPlaying = false;
            updatePlayButtonState();
        }
    }
    
    function updatePlayButtonState() {
        if (!elements.playIcon || !elements.playText) return;
        
        if (isPlaying) {
            elements.playIcon.className = 'fas fa-pause';
            elements.playText.textContent = '暂停播放';
        } else {
            elements.playIcon.className = 'fas fa-play';
            elements.playText.textContent = '继续播放';
        }
    }
    
    function updateAudioProgress() {
        if (!audioPlayer || !elements.progressFill || !elements.currentTime) return;
        
        const current = audioPlayer.currentTime;
        const duration = audioPlayer.duration || 1;
        const progress = (current / duration) * 100;
        
        elements.progressFill.style.width = `${progress}%`;
        elements.currentTime.textContent = formatTime(current);
    }
    
    function updateAudioDuration() {
        if (!audioPlayer || !elements.totalTime) return;
        
        const duration = audioPlayer.duration;
        if (duration) {
            elements.totalTime.textContent = formatTime(duration);
        }
    }
    
    function handleAudioEnded() {
        isPlaying = false;
        updatePlayButtonState();
        
        // 延迟重置进度条，让用户看到播放完成
        setTimeout(() => {
            resetProgressBar();
        }, 500);
    }
    
    function handleAudioError() {
        console.error('音频加载错误');
        isPlaying = false;
        updatePlayButtonState();
        
        if (elements.playText) {
            elements.playText.textContent = '播放失败';
        }
    }
    
    function resetProgressBar() {
        if (elements.progressFill) {
            elements.progressFill.style.width = '0%';
        }
        
        if (elements.currentTime) {
            elements.currentTime.textContent = '0:00';
        }
    }
    
    // ===== 推荐导航函数 =====
    function showPreviousInstrument() {
        currentInstrumentIndex--;
        if (currentInstrumentIndex < 0) {
            currentInstrumentIndex = recommendedInstruments.length - 1;
        }
        updateRecommendation();
    }
    
    function showNextInstrument() {
        currentInstrumentIndex++;
        if (currentInstrumentIndex >= recommendedInstruments.length) {
            currentInstrumentIndex = 0;
        }
        updateRecommendation();
    }
    
    function refreshRecommendation() {
        if (recommendedInstruments.length === 0) return;
        
        // 随机选择一个不同的乐器
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * recommendedInstruments.length);
        } while (newIndex === currentInstrumentIndex && recommendedInstruments.length > 1);
        
        currentInstrumentIndex = newIndex;
        updateRecommendation();
        
        // 添加刷新动画
        if (elements.refreshBtn) {
            elements.refreshBtn.style.animation = 'none';
            setTimeout(() => {
                elements.refreshBtn.style.animation = 'spin 0.5s ease';
            }, 10);
        }
    }
    
    // ===== 导航点更新 =====
    function updateNavigationDots() {
        if (!elements.navDots) return;
        
        elements.navDots.innerHTML = '';
        
        for (let i = 0; i < recommendedInstruments.length; i++) {
            const dot = document.createElement('span');
            dot.className = 'dot';
            if (i === currentInstrumentIndex) {
                dot.classList.add('active');
            }
            
            dot.addEventListener('click', () => {
                currentInstrumentIndex = i;
                updateRecommendation();
            });
            
            elements.navDots.appendChild(dot);
        }
    }
    
    function updateActiveDot() {
        if (!elements.navDots) return;
        
        const dots = elements.navDots.querySelectorAll('.dot');
        dots.forEach((dot, index) => {
            if (index === currentInstrumentIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }
    
    // ===== 导航功能 =====
    function navigateToGallery(category) {
        // 添加点击效果
        const card = document.querySelector(`[data-category="${category}"]`);
        if (card) {
            card.style.transform = 'scale(0.95)';
            setTimeout(() => {
                card.style.transform = '';
            }, 150);
        }
        
        // 跳转到图鉴页
        setTimeout(() => {
            window.location.href = `gallery.html?category=${category}`;
        }, 300);
    }
    
    function showInstrumentDetails() {
        if (recommendedInstruments.length === 0) return;
        
        const instrument = recommendedInstruments[currentInstrumentIndex];
        
        // 在实际项目中，这里应该跳转到详情页
        // 暂时用alert演示
        alert(`即将查看 ${instrument.name} 的详细信息\n\n分类：${instrument.category}\n朝代：${instrument.dynasty}`);
        
        // 实际跳转代码：
        // window.location.href = `detail.html?id=${instrument.id}`;
    }
    
    // ===== 背景音乐控制 =====
    function toggleBackgroundMusic() {
        const icon = elements.musicToggle.querySelector('i');
        const isMuted = icon.classList.contains('fa-volume-mute');
        
        if (isMuted) {
            // 开启背景音乐
            icon.className = 'fas fa-volume-up';
            console.log('背景音乐已开启');
            // 这里可以添加实际的背景音乐播放逻辑
        } else {
            // 关闭背景音乐
            icon.className = 'fas fa-volume-mute';
            console.log('背景音乐已关闭');
            // 这里可以添加实际的背景音乐暂停逻辑
        }
        
        // 添加点击反馈
        elements.musicToggle.style.transform = 'scale(0.9)';
        setTimeout(() => {
            elements.musicToggle.style.transform = '';
        }, 200);
    }
    
    // ===== 工具函数 =====
    function getRandomInstruments(array, count) {
        if (!Array.isArray(array) || array.length === 0) {
            return [];
        }
        
        if (array.length <= count) {
            return [...array];
        }
        
        const shuffled = [...array].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }
    
    function getDefaultInstruments() {
        return [
            {
                id: 1,
                name: '古琴',
                category: '弹拨乐器',
                dynasty: '唐代',
                description: '古琴，又称瑶琴、玉琴、七弦琴，是中国传统拨弦乐器，有三千年以上历史，属于八音中的丝。古琴音域宽广，音色深沉，余音悠远。',
                quote: '"七弦为益友，两耳是知音。心静声即淡，其间无古今。"',
                image: 'assets/images/instruments/guqin.jpg',
                audio: 'assets/audio/guqin.mp3',
                duration: '0:30'
            },
            {
                id: 2,
                name: '编钟',
                category: '打击乐器',
                dynasty: '战国',
                description: '编钟是中国古代重要的打击乐器，由大小不同的青铜钟按照音调高低依次悬挂在钟架上组成。音色清脆悠扬，气势恢宏。',
                quote: '"黄钟大吕，金石丝竹。八音克谐，无相夺伦。"',
                image: 'assets/images/instruments/bianzhong.jpg',
                audio: 'assets/audio/bianzhong.mp3',
                duration: '0:25'
            },
            {
                id: 3,
                name: '琵琶',
                category: '弹拨乐器',
                dynasty: '唐代',
                description: '琵琶是弹拨乐器首座，拨弦类弦鸣乐器。木制，音箱呈半梨形，上装四弦，颈与面板上设用以确定音位的"相"和"品"。',
                quote: '"大弦嘈嘈如急雨，小弦切切如私语。嘈嘈切切错杂弹，大珠小珠落玉盘。"',
                image: 'assets/images/instruments/pipa.jpg',
                audio: 'assets/audio/pipa.mp3',
                duration: '0:28'
            },
            {
                id: 4,
                name: '笛',
                category: '吹奏乐器',
                dynasty: '汉代',
                description: '笛是中国传统吹奏乐器，通常由竹子制成。音色清脆明亮，表现力丰富，既能演奏悠长高亢的旋律，又能表现辽阔宽广的情调。',
                quote: '"谁家玉笛暗飞声，散入春风满洛城。此夜曲中闻折柳，何人不起故园情。"',
                image: 'assets/images/instruments/di.jpg',
                audio: 'assets/audio/di.mp3',
                duration: '0:32'
            }
        ];
    }
    
    function getRandomQuote() {
        const quotes = [
            '"音乐是灵魂的语言。"',
            '"乐器是音乐的载体，音乐是心灵的表达。"',
            '"传统乐器，千年传承，音韵悠长。"',
            '"聆听古韵，感受历史的回响。"'
        ];
        
        return quotes[Math.floor(Math.random() * quotes.length)];
    }
    
    function formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    function playRandomInstrument() {
        // 先暂停当前音频
        if (isPlaying) {
            pauseAudio();
        }
        
        // 随机选择一个乐器
        refreshRecommendation();
        
        // 延迟播放，确保音频已加载
        setTimeout(() => {
            playAudio();
        }, 500);
    }
    
    function scrollToSection(selector) {
        const section = document.querySelector(selector);
        if (section) {
            section.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
    
    function setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                }
            });
        }, observerOptions);
        
        // 观察需要动画的元素
        document.querySelectorAll('.category-card, .feature-card, .recommendation-card').forEach(el => {
            observer.observe(el);
        });
    }
    
    function handleResize() {
        // 在窗口大小调整时重新计算布局
        updateNavigationDots();
    }
    
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // ===== CSS动画定义 =====
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        
        .category-card, .feature-card, .recommendation-card {
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.6s ease, transform 0.6s ease;
        }
        
        .category-card.animated, .feature-card.animated, .recommendation-card.animated {
            opacity: 1;
            transform: translateY(0);
        }
    `;
    document.head.appendChild(style);
    
    // ===== 初始化执行 =====
    init();
    
    // ===== 全局导出（如果需要） =====
    window.homePage = {
        refreshRecommendation,
        playRandomInstrument,
        toggleAudioPlayback
    };
});
