document.addEventListener('DOMContentLoaded', function() {
    console.log('首页加载完成');
    
    // ===== 全局变量 =====
    let currentInstrumentIndex = 0;
    let isPlaying = false;
    let audioPlayer = null;
    let recommendedInstruments = [];
    
    // ===== 配置数据 =====
    const defaultInstruments = [
        {
            id: 1,
            name: '古琴',
            category: '弹拨乐器',
            dynasty: '唐代',
            description: '古琴，又称瑶琴、玉琴、七弦琴，是中国传统拨弦乐器，有三千年以上历史，属于八音中的丝。古琴音域宽广，音色深沉，余音悠远。',
            image: 'assets/images/instruments/guqin.jpg',
            audio: 'assets/audio/guqin.mp3'
        },
        {
            id: 2,
            name: '编钟',
            category: '打击乐器',
            dynasty: '战国',
            description: '编钟是中国古代重要的打击乐器，由大小不同的青铜钟按照音调高低依次悬挂在钟架上组成。音色清脆悠扬，气势恢宏。',
            image: 'assets/images/instruments/bianzhong.jpg',
            audio: 'assets/audio/bianzhong.mp3'
        },
        {
            id: 3,
            name: '琵琶',
            category: '弹拨乐器',
            dynasty: '唐代',
            description: '琵琶是弹拨乐器首座，拨弦类弦鸣乐器。木制，音箱呈半梨形，上装四弦，颈与面板上设用以确定音位的"相"和"品"。',
            image: 'assets/images/instruments/pipa.jpg',
            audio: 'assets/audio/pipa.mp3'
        },
        {
            id: 4,
            name: '笛',
            category: '吹奏乐器',
            dynasty: '汉代',
            description: '笛是中国传统吹奏乐器，通常由竹子制成。音色清脆明亮，表现力丰富，既能演奏悠长高亢的旋律，又能表现辽阔宽广的情调。',
            image: 'assets/images/instruments/di.jpg',
            audio: 'assets/audio/di.mp3'
        }
    ];
    
    // ===== 元素获取 =====
    const elements = {
        exploreBtn: document.getElementById('exploreBtn'),
        listenBtn: document.getElementById('listenBtn'),
        playBtn: document.getElementById('playBtn'),
        detailBtn: document.getElementById('detailBtn'),
        prevBtn: document.getElementById('prevBtn'),
        nextBtn: document.getElementById('nextBtn'),
        recImage: document.getElementById('recImage'),
        recName: document.getElementById('recName'),
        recCategory: document.getElementById('recCategory'),
        recDynasty: document.getElementById('recDynasty'),
        recDescription: document.getElementById('recDescription'),
        playIcon: document.getElementById('playIcon'),
        playText: document.getElementById('playText'),
        audioPlayer: document.getElementById('audioPlayer'),
        categoriesGrid: document.querySelector('.categories-grid'),
        navDots: document.getElementById('navDots')
    };
    
    // ===== 初始化函数 =====
    function init() {
        console.log('初始化首页');
        
        // 设置图片错误处理
        setupImageHandling();
        
        // 加载乐器数据
        loadInstruments();
        
        // 设置分类卡片
        setupCategories();
        
        // 设置事件监听器
        setupEventListeners();
        
        // 更新推荐内容
        updateRecommendation();
    }
    
    // ===== 图片处理 =====
    function setupImageHandling() {
        if (elements.recImage) {
            // 图片加载失败时显示占位符
            elements.recImage.onerror = function() {
                console.error('图片加载失败:', this.src);
                this.classList.add('error');
                this.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="250"><rect width="100%" height="100%" fill="#f5f5f5"/><text x="50%" y="50%" font-family="Arial" font-size="14" fill="#999" text-anchor="middle" dy=".3em">图片加载失败</text></svg>';
            };
            
            // 图片加载成功时移除错误状态
            elements.recImage.onload = function() {
                this.classList.remove('error');
                console.log('图片加载成功:', this.src);
            };
        }
    }
    
    // ===== 加载乐器数据 =====
    function loadInstruments() {
        // 尝试从data.js加载数据
        if (typeof instruments !== 'undefined' && Array.isArray(instruments) && instruments.length > 0) {
            console.log('从data.js加载乐器数据:', instruments.length, '个乐器');
            
            // 检查每个乐器的图片路径
            recommendedInstruments = instruments.map(instrument => {
                // 确保图片路径正确
                if (instrument.image && !instrument.image.startsWith('assets/') && !instrument.image.startsWith('http')) {
                    instrument.image = 'assets/images/instruments/' + instrument.image;
                }
                
                return {
                    id: instrument.id || 0,
                    name: instrument.name || '未知乐器',
                    category: instrument.category || '未知分类',
                    dynasty: instrument.dynasty || '未知朝代',
                    description: instrument.description || '暂无描述',
                    image: instrument.image || 'assets/images/default.jpg',
                    audio: instrument.audio || ''
                };
            });
        } else {
            // 使用默认数据
            console.warn('使用默认乐器数据');
            recommendedInstruments = defaultInstruments;
        }
        
        console.log('加载的乐器:', recommendedInstruments);
        updateNavigationDots();
    }
    
    // ===== 设置分类卡片 =====
    function setupCategories() {
        if (!elements.categoriesGrid) return;
        
        const categories = [
            { id: 'wind', name: '吹奏乐器', desc: '笛、箫、笙、埙等', icon: 'fas fa-wind' },
            { id: 'bowed', name: '拉弦乐器', desc: '二胡、板胡、京胡等', icon: 'fas fa-guitar' },
            { id: 'plucked', name: '弹拨乐器', desc: '古琴、琵琶、筝、阮等', icon: 'fas fa-music' },
            { id: 'percussion', name: '打击乐器', desc: '编钟、鼓、磬、锣等', icon: 'fas fa-drum' }
        ];
        
        elements.categoriesGrid.innerHTML = categories.map(category => `
            <div class="category-card" data-category="${category.id}">
                <div class="card-icon">
                    <i class="${category.icon}"></i>
                </div>
                <h3>${category.name}</h3>
                <p>${category.desc}</p>
                <div class="card-tag">点击查看</div>
            </div>
        `).join('');
    }
    
    // ===== 设置事件监听器 =====
    function setupEventListeners() {
        // 导航按钮
        if (elements.exploreBtn) {
            elements.exploreBtn.addEventListener('click', function() {
                document.querySelector('#categories').scrollIntoView({ 
                    behavior: 'smooth' 
                });
            });
        }
        
        if (elements.listenBtn) {
            elements.listenBtn.addEventListener('click', function() {
                playRandomInstrument();
            });
        }
        
        // 分类卡片
        if (elements.categoriesGrid) {
            elements.categoriesGrid.addEventListener('click', function(e) {
                const card = e.target.closest('.category-card');
                if (card) {
                    const category = card.dataset.category;
                    window.location.href = `gallery.html?category=${category}`;
                }
            });
        }
        
        // 音频控制
        if (elements.playBtn) {
            elements.playBtn.addEventListener('click', toggleAudio);
        }
        
        // 推荐导航
        if (elements.prevBtn) {
            elements.prevBtn.addEventListener('click', showPrevious);
        }
        
        if (elements.nextBtn) {
            elements.nextBtn.addEventListener('click', showNext);
        }
        
        if (elements.detailBtn) {
            elements.detailBtn.addEventListener('click', showDetail);
        }
        
        // 音频事件
        if (elements.audioPlayer) {
            audioPlayer = elements.audioPlayer;
            audioPlayer.addEventListener('ended', function() {
                isPlaying = false;
                updatePlayButton();
            });
        }
        
        // 键盘快捷键
        document.addEventListener('keydown', function(e) {
            if (e.key === ' ') {
                e.preventDefault();
                toggleAudio();
            } else if (e.key === 'ArrowLeft') {
                showPrevious();
            } else if (e.key === 'ArrowRight') {
                showNext();
            }
        });
    }
    
    // ===== 更新推荐内容 =====
    function updateRecommendation() {
        if (recommendedInstruments.length === 0) {
            console.warn('没有可用的乐器数据');
            return;
        }
        
        const instrument = recommendedInstruments[currentInstrumentIndex];
        console.log('显示乐器:', instrument);
        
        // 更新DOM
        if (elements.recName) elements.recName.textContent = instrument.name;
        if (elements.recCategory) elements.recCategory.textContent = instrument.category;
        if (elements.recDynasty) elements.recDynasty.textContent = instrument.dynasty;
        if (elements.recDescription) elements.recDescription.textContent = instrument.description;
        
        // 更新图片
        if (elements.recImage && instrument.image) {
            console.log('设置图片路径:', instrument.image);
            elements.recImage.src = instrument.image;
            elements.recImage.alt = instrument.name;
        }
        
        // 更新音频
        if (audioPlayer && instrument.audio) {
            audioPlayer.src = instrument.audio;
        }
        
        // 更新导航点
        updateActiveDot();
        
        // 重置播放状态
        if (isPlaying) {
            audioPlayer.pause();
            isPlaying = false;
            updatePlayButton();
        }
    }
    
    // ===== 音频控制 =====
    function toggleAudio() {
        if (!audioPlayer || !audioPlayer.src) {
            console.warn('没有可播放的音频');
            return;
        }
        
        if (isPlaying) {
            audioPlayer.pause();
            isPlaying = false;
        } else {
            audioPlayer.play().then(() => {
                isPlaying = true;
            }).catch(error => {
                console.error('播放失败:', error);
                alert('音频播放失败，请检查音频文件');
            });
        }
        
        updatePlayButton();
    }
    
    function updatePlayButton() {
        if (elements.playIcon && elements.playText) {
            if (isPlaying) {
                elements.playIcon.className = 'fas fa-pause';
                elements.playText.textContent = '暂停播放';
            } else {
                elements.playIcon.className = 'fas fa-play';
                elements.playText.textContent = '试听音色';
            }
        }
    }
    
    function playRandomInstrument() {
        // 随机选择一个乐器
        const newIndex = Math.floor(Math.random() * recommendedInstruments.length);
        currentInstrumentIndex = newIndex;
        updateRecommendation();
        
        // 播放音频
        setTimeout(() => {
            if (audioPlayer && audioPlayer.src) {
                audioPlayer.play().then(() => {
                    isPlaying = true;
                    updatePlayButton();
                });
            }
        }, 300);
    }
    
    // ===== 导航功能 =====
    function showPrevious() {
        currentInstrumentIndex--;
        if (currentInstrumentIndex < 0) {
            currentInstrumentIndex = recommendedInstruments.length - 1;
        }
        updateRecommendation();
    }
    
    function showNext() {
        currentInstrumentIndex++;
        if (currentInstrumentIndex >= recommendedInstruments.length) {
            currentInstrumentIndex = 0;
        }
        updateRecommendation();
    }
    
    function showDetail() {
        if (recommendedInstruments.length === 0) return;
        
        const instrument = recommendedInstruments[currentInstrumentIndex];
        alert(`乐器名称：${instrument.name}\n分类：${instrument.category}\n朝代：${instrument.dynasty}\n\n${instrument.description}`);
    }
    
    // ===== 导航点功能 =====
    function updateNavigationDots() {
        if (!elements.navDots || recommendedInstruments.length === 0) return;
        
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
    
    // ===== 图片路径检查函数 =====
    function checkImagePaths() {
        console.log('检查图片路径...');
        
        recommendedInstruments.forEach((instrument, index) => {
            console.log(`乐器 ${index + 1} (${instrument.name}): ${instrument.image}`);
            
            // 测试图片是否可访问
            const testImage = new Image();
            testImage.onload = function() {
                console.log(`✅ 图片可访问: ${instrument.image}`);
            };
            testImage.onerror = function() {
                console.error(`❌ 图片无法访问: ${instrument.image}`);
                
                // 尝试修复路径
                if (!instrument.image.includes('assets/')) {
                    const newPath = 'assets/images/instruments/' + instrument.name + '.jpg';
                    console.log(`尝试使用路径: ${newPath}`);
                    instrument.image = newPath;
                }
            };
            testImage.src = instrument.image;
        });
    }
    
    // ===== 初始化 =====
    init();
    
    // 开发调试工具
    window.debugHomePage = function() {
        console.log('=== 首页调试信息 ===');
        console.log('当前乐器索引:', currentInstrumentIndex);
        console.log('总乐器数:', recommendedInstruments.length);
        console.log('当前乐器:', recommendedInstruments[currentInstrumentIndex]);
        console.log('图片元素:', elements.recImage);
        console.log('当前图片路径:', elements.recImage ? elements.recImage.src : '无');
        console.log('音频播放器:', audioPlayer);
        console.log('音频源:', audioPlayer ? audioPlayer.src : '无');
        console.log('===================');
        
        // 检查图片路径
        checkImagePaths();
    };
});
