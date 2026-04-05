<script setup>
import { ref, watch, nextTick } from 'vue'

const showJoinMenu = ref(false)
const showChallenge = ref(false)
const isVerified = ref(false)
const turnstileContainer = ref(null)
const imageUrl = ref('') // 新增：用来存放带动态 Token 的图片链接

// 提示 Toast 逻辑
const showToast = ref(false)
const toastMsg = ref('')
const handleDevClick = (moduleName) => {
  toastMsg.value = `${moduleName} 模块正在开发中...`
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 2000)
}

// 若生成的单次有效图片被禁止访问/加载失败，重新回到验证模式
const handleImageError = () => {
  if (window.turnstile && turnstileContainer.value) {
    window.turnstile.reset(turnstileContainer.value)
  }
  isVerified.value = false
  imageUrl.value = ''
}

// 监听弹窗关闭，重置内部状态
watch(showJoinMenu, (newVal) => {
  if (!newVal) {
    setTimeout(() => {
      showChallenge.value = false
      isVerified.value = false
    }, 400) // 等待退出动画完成
  }
})

// 当点击立即申请打开左侧区域时，挂载 5 秒盾
watch(showChallenge, async (newVal) => {
  if (newVal && !isVerified.value) {
    await nextTick() // 等待 DOM 渲染出 turnstileContainer
    const config = useRuntimeConfig()
    const verifyApiUrl = config.public.turnstileApiUrl // 从注入环境拿到 CF Worker 网址

    if (window.turnstile && turnstileContainer.value) {
      try {
        window.turnstile.render(turnstileContainer.value, {
          sitekey: '0x4AAAAAAC1AdJn72KZUnav-', // 前端真实 Sitekey
          callback: (token) => {
            // 直接将带有临时 Token 的链接分配给图片地址
            // 图片的 GET 请求会导致 Worker 去向 CF 认证这个由前端提交的 Token
            imageUrl.value = `${verifyApiUrl}/img?token=${token}`
            isVerified.value = true
          }
        })
      } catch(e) { } 
    } else {
      const timer = setInterval(() => {
        if (window.turnstile && turnstileContainer.value) {
          clearInterval(timer)
          window.turnstile.render(turnstileContainer.value, {
             sitekey: '0x4AAAAAAC1AdJn72KZUnav-', 
             callback: (token) => {
               imageUrl.value = `${verifyApiUrl}/img?token=${token}`
               isVerified.value = true
             } 
          })
        }
      }, 500)
    }
  }
})
</script>

<template>
  <div>
    <div class="blur-overlay">
      <div class="hero-content">
        <h1 class="hero-title" aria-label="HLEO">
          <svg viewBox="0 0 500 120" style="width: 100%; height: auto;">
            <text x="0" y="100" class="hero-text-svg">HLEO</text>
          </svg>
        </h1>
        <div class="hero-buttons">
          <button class="hero-btn btn-primary" @click="showJoinMenu = true">加入我们</button>
          <button class="hero-btn btn-secondary" @click="handleDevClick('新闻')">新闻</button>
          <button class="hero-btn btn-secondary" @click="handleDevClick('关于')">关于</button>
        </div>
      </div>
    </div>
    <NuxtRouteAnnouncer />

    <!-- 顶端/底部的正在开发 Toast 提示 -->
    <Transition name="fade">
      <div v-if="showToast" class="dev-toast">
        <svg viewBox="0 0 24 24" fill="none" class="dev-toast-icon">
          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M12 8V12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M12 16H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>{{ toastMsg }}</span>
      </div>
    </Transition>

    <!-- 弹出的拟物玻璃风菜单 -->
    <Transition name="fade">
      <div v-if="showJoinMenu" class="modal-overlay" @click="showJoinMenu = false">
        <div class="modal-content" @click.stop>
          <button class="modal-close" @click="showJoinMenu = false">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          <div class="modal-body" :class="{ 'is-challenging': showChallenge }">
            <!-- 左侧：挑战/图片区域 -->
            <div class="modal-left">
              <!-- 验证盾区域 -->
              <div v-show="!isVerified" class="cf-wrapper">
                <div ref="turnstileContainer"></div>
              </div>
              
              <!-- 验证通过后可见的正方形图片 -->
              <!-- 安全机制：一旦图片加载 403 失败，重置验证盾 -->
              <div v-if="isVerified" class="join-image-container">
                <img :src="imageUrl" alt="加入我们宣传图" class="join-image" @error="handleImageError" />
              </div>
            </div>

            <!-- 右侧：文字信息区域 -->
            <div class="modal-right">
              <div class="join-text-content">
                <h2 class="join-title">👋欢迎来到 HLEO</h2>
                <p class="join-desc">
                  首先，在您提交申请前请先确保您已完整阅读且知晓 HLEO 是什么<br/><br/>
                  若您的申请不符合我们的前提条件，我们会将您的信息归类为骚扰信息，不会进行任何回复<br/><br/>
                </p>
                <button v-if="!showChallenge" class="join-action-btn" @click="showChallenge = true">立即申请！</button>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </Transition>
  </div>
</template>

<style>
body {
  background-image: url('https://img.alicdn.com/imgextra/i4/O1CN01vfGUbY2DSyrXneyuh_!!2215249208609-49-fleamarket.webp');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  margin: 0;
  min-height: 100vh;
  font-family: "LXGW WenKai", sans-serif;
}

.blur-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.2); /* 加上一点白底 */
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  clip-path: polygon(0 0, 66.66% 0, 33.33% 100%, 0 100%);
  z-index: 10;
  animation: slideInLeft 1.2s cubic-bezier(0, 1, 0.1, 1) 0.5s both; /* 添加0.5s延迟，使用both确保在延迟期间保持隐藏的初始状态 */
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-left: 10vw;
}

.hero-content {
  max-width: 600px;
  margin-top: -10vh; /* 将整体内容向上移动 */
}

.hero-title {
  font-family: 'Mojang', sans-serif;
  font-weight: bold;
  font-size: 6rem;
  margin: 0 0 2rem 0;
  position: relative;
  top: calc(-15vh - 5px); /* 将标题单独往上移，下面按钮原来位置不变 */
  color: #222;
  letter-spacing: 25px; /* 减小字母间距 */
  margin-right: -25px; /* 补偿因为 letter-spacing 导致的最右侧多出的空白，保持整体居中/对齐一致 */
  animation: slideInLeft 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.08) 0.8s both; /* 适中的回弹效果，不夸张又足够明显 */
  /* 去除原始文字占位，转给 SVG 处理高度 */
  height: 120px;
}

.hero-text-svg {
  fill: transparent;
  stroke: #222;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 1500;
  stroke-dashoffset: 1500;
  /* 第一步画线，修改为 1.7s 开始（等待底部毛玻璃进场完毕），第二步填色也对应向后顺延到 4.2s */
  animation: 
    draw-hero-title 2.5s ease-in-out 1.7s forwards, 
    fill-hero-title 0.6s ease-in 3.1s forwards;
}

@keyframes draw-hero-title {
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes fill-hero-title {
  to {
    fill: #222;
  }
}

.hero-buttons {
  display: flex;
  flex-direction: row; 
  gap: 1rem;
}

.hero-btn {
  font-family: "LXGW WenKai", sans-serif;
  font-size: 1.1rem;
  padding: 0.7rem 1.8rem; 
  border-radius: 999px; /* iOS经典药丸圆角 */
  cursor: pointer;
  transition: all 0.6s cubic-bezier(0.1, 0.9, 0.2, 1); /* 延长动画时间，保持起手快、后段平滑衰减 */
  transform: perspective(500px) rotateX(0deg) rotateY(0deg) scale(1) translateY(0); /* 统一设定所有按钮的3D基准 */
  text-align: center;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.btn-primary {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.15) 100%);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-top: 1px solid rgba(255, 255, 255, 0.8);
  border-left: 1px solid rgba(255, 255, 255, 0.6);
  color: #111;
  font-weight: 600;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.12), 
    0 0 0px rgba(255, 255, 255, 0), /* 外部边缘高亮发光的透明占位，用于平滑过渡 */
    inset 0 4px 6px -2px rgba(255, 255, 255, 0.9), 
    inset 0 -4px 6px -2px rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(24px) saturate(150%);
  -webkit-backdrop-filter: blur(24px) saturate(150%);
}

.btn-secondary {
  background-color: rgba(255, 255, 255, 0.05); /* 极薄透明底色 */
  border: 1px solid rgba(255, 255, 255, 0.8);
  color: #222;
}

.hero-btn:nth-child(1) {
  animation: slideInLeft 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.08) 0.8s backwards; /* 最左边：最慢 */
}

.hero-btn:nth-child(2) {
  animation: slideInLeft 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.08) 0.8s backwards; /* 中间：居中速度 */
}

.hero-btn:nth-child(3) {
  animation: slideInLeft 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.08) 0.8s backwards; /* 最右边：最快 */
}

.btn-primary:hover {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.35) 100%);
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-top: 1px solid rgba(255, 255, 255, 1);
  border-left: 1px solid rgba(255, 255, 255, 1);
  transform: perspective(500px) rotateX(12deg) rotateY(-8deg) scale(1.04) translateY(-2px);
  box-shadow: 
    0 15px 40px rgba(0, 0, 0, 0.2),
    0 0 20px rgba(255, 255, 255, 0.6), /* 外部边缘高亮发光 */
    inset 0 0 15px rgba(255, 255, 255, 0.9), /* 内部边缘强化反射 */
    inset 0 -4px 6px -2px rgba(0, 0, 0, 0.05);
}

.btn-secondary:hover {
  background-color: rgba(255, 255, 255, 0.2);
  transform: perspective(500px) rotateX(12deg) rotateY(-8deg) scale(1.04) translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

@keyframes slideInLeft {
  from {
    transform: translateX(-100vw);
  }
  to {
    transform: translateX(0);
  }
}

/* --- 弹窗样式 (iOS 26 拟物玻璃风) --- */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.modal-content {
  position: relative;
  width: 80vw;
  max-width: 1000px;
  height: 70vh;
  max-height: 650px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.2) 100%);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-top: 1px solid rgba(255, 255, 255, 0.8);
  border-left: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 28px;
  padding: 30px;
  box-shadow: 
    0 24px 64px rgba(0, 0, 0, 0.3),
    inset 0 0 20px rgba(255, 255, 255, 0.8),
    inset 0 -4px 10px rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(40px) saturate(150%);
  -webkit-backdrop-filter: blur(40px) saturate(150%);
  transform: perspective(1000px) rotateX(0deg);
  transition: all 0.4s cubic-bezier(0.1, 0.9, 0.2, 1);
  display: flex;
  overflow: hidden; /* 防止内部圆角内容溢出 */
}

.modal-body {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
  gap: 0;
  transition: gap 0.6s cubic-bezier(0.1, 0.9, 0.2, 1);
  align-items: center;
  justify-content: center;
}

.modal-body.is-challenging {
  gap: 40px;
}

.modal-left {
  flex: 0;
  width: 0;
  opacity: 0;
  visibility: hidden;
  transform: translateX(-30px) scale(0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.6s cubic-bezier(0.1, 0.9, 0.2, 1);
}

.modal-body.is-challenging .modal-left {
  flex: 1;
  width: auto;
  opacity: 1;
  visibility: visible;
  transform: translateX(0) scale(1);
}

.modal-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px 40px;
  text-align: center;
  transition: all 0.6s cubic-bezier(0.1, 0.9, 0.2, 1);
}

.modal-body.is-challenging .modal-right {
  flex: 1.2;
  align-items: flex-start;
  text-align: left;
  padding: 20px 40px 20px 0;
}

.join-text-content {
  display: flex;
  flex-direction: column;
  align-items: inherit;
}

.modal-close {
  position: absolute;
  top: 18px;
  right: 18px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.8);
  color: #333;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.1, 0.9, 0.2, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: scale(1.1) rotate(90deg);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.cf-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}

.join-image-container {
  width: 100%;
  max-width: 350px;
  aspect-ratio: 1 / 1; /* 正方形容器 */
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.3); /* 若无图片时的毛玻璃占位符 */
  border-radius: 24px; /* 内部预留的大圆角 */
  border: 1px dashed rgba(255, 255, 255, 0.6);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.join-image {
  width: 100%; 
  height: 100%;
  object-fit: cover; /* 保证图片填满正方形时不被拉伸 */
}

.join-title {
  font-family: "LXGW WenKai", sans-serif;
  font-size: 2.8rem;
  font-weight: 700;
  color: #111;
  margin: 0 0 1.5rem 0;
  text-shadow: 0 2px 10px rgba(255, 255, 255, 0.8);
}

.join-desc {
  font-size: 1.2rem;
  line-height: 1.8;
  color: #333;
  margin-bottom: 2rem;
}

.join-action-btn {
  align-self: flex-start;
  padding: 0.8rem 2.2rem;
  font-family: inherit;
  font-size: 1.2rem;
  font-weight: bold;
  color: #fff;
  background: #111;
  border: none;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.1, 0.9, 0.2, 1);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.join-action-btn:hover {
  transform: scale(1.05) translateY(-2px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.25);
}

/* 弹窗呼出时的入场退出动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}

.fade-enter-active .modal-content,
.fade-leave-active .modal-content {
  transition: transform 0.5s cubic-bezier(0.1, 0.9, 0.2, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-from .modal-content {
  transform: perspective(1000px) rotateX(15deg) translateY(30px) scale(0.95);
}

.fade-leave-to .modal-content {
  transform: perspective(1000px) rotateX(-10deg) translateY(-20px) scale(0.95);
}

/* Toast 组件样式 (iOS拟物风) */
.dev-toast {
  position: fixed;
  top: 40px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-top: 1px solid rgba(255, 255, 255, 0.8);
  padding: 12px 24px;
  border-radius: 999px;
  color: #111;
  font-weight: 600;
  font-size: 1.05rem;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.1),
    inset 0 2px 4px rgba(255, 255, 255, 0.6);
  z-index: 10000;
  pointer-events: none;
  display: flex;
  align-items: center;
  gap: 8px;
}

.dev-toast-icon {
  width: 20px;
  height: 20px;
  stroke: #ff9500; /* iOS 警告橙色 */
}
</style>
