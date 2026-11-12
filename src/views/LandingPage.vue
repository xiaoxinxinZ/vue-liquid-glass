<script setup>
/**
 * LandingPage —— 一个「假数据」的漂亮官网演示页
 *
 * 用途：验证液态玻璃导航的「折射」效果 —— 这里没有任何地球背景图，
 * 页面里全是真实的文字 / 渐变块 / 卡片 / 图片元素，导航固定悬浮在它们之上，
 * 滚动、按住导航时，玻璃会折射它正下方划过的真实内容。
 *
 * 纯静态假数据，仅用于展示，不接任何后端。
 */
import { ref } from 'vue'

/* ---- 假数据 ---- */
const stats = [
  { num: '99.99%', label: '服务可用性' },
  { num: '120M+', label: '全球用户' },
  { num: '190+', label: '覆盖国家' },
  { num: '4.9/5', label: '用户评分' },
]

const features = [
  { title: '极速响应', desc: '边缘节点全球部署，毫秒级延迟，无论在哪都快。', icon: '⚡' },
  { title: '安全可靠', desc: '端到端加密，多重备份，数据永不丢失。', icon: '🛡' },
  { title: '智能分析', desc: '实时洞察你的数据趋势，决策快人一步。', icon: '📊' },
  { title: '无缝协作', desc: '多人实时协同，团队效率翻倍。', icon: '🤝' },
]

const plans = [
  { name: 'Starter', price: '¥0', desc: '个人尝鲜', hot: false },
  { name: 'Pro', price: '¥99', desc: '专业人士首选', hot: true },
  { name: 'Enterprise', price: '定制', desc: '企业级方案', hot: false },
]

// 底部滚动 logo 墙：真实 <img>，划过导航下方时会被折射
const logos = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']

// 图片墙的渐变色：真实 <div> 背景（真实元素，导航 auto 折射源会重画进去）
const gallery = [
  'linear-gradient(135deg, #f6d365, #fda085)',
  'linear-gradient(135deg, #5ee7df, #b490ca)',
  'linear-gradient(135deg, #c471f5, #fa71cd)',
  'linear-gradient(135deg, #48c6ef, #6f86d6)',
  'linear-gradient(135deg, #11998e, #38ef7d)',
  'linear-gradient(135deg, #fc5c7d, #6a82fb)',
  'linear-gradient(135deg, #f7971e, #ffd200)',
  'linear-gradient(135deg, #ee9ca7, #ffdde1)',
]

const hover = ref(-1)
</script>

<template>
  <div class="page">
    <!-- Hero：首屏大标题 + 渐变光斑 -->
    <section class="hero">
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
      <div class="orb orb-3"></div>

      <p class="eyebrow">NEXT-GEN PLATFORM</p>
      <h1 class="title">
        让产品<span class="grad">更快</span>、<span class="grad">更美</span>、
        <span class="grad">更智能</span>
      </h1>
      <p class="subtitle">
        一套面向未来的全栈平台，把设计、开发、部署、运维，融进一个丝滑的体验里。
      </p>

      <div class="cta">
        <button class="btn-primary">立即开始</button>
        <button class="btn-ghost">观看演示 →</button>
      </div>

      <div class="stats">
        <div v-for="s in stats" :key="s.label" class="stat">
          <div class="stat-num">{{ s.num }}</div>
          <div class="stat-label">{{ s.label }}</div>
        </div>
      </div>
    </section>

    <!-- 特性卡片：真实卡片内容，滚动划过导航时会被折射 -->
    <section class="features" @mouseleave="hover = -1">
      <h2 class="sec-title">为什么选择我们</h2>
      <div class="grid">
        <div
          v-for="(f, i) in features"
          :key="f.title"
          class="card"
          :class="{ hovered: hover === i }"
          @mouseenter="hover = i"
        >
          <div class="card-icon">{{ f.icon }}</div>
          <h3>{{ f.title }}</h3>
          <p>{{ f.desc }}</p>
        </div>
      </div>
    </section>

    <!-- 横向滚动图片墙：真实 <img>，验证图片内容的折射 -->
    <section class="gallery">
      <h2 class="sec-title">多彩世界</h2>
      <div class="strip">
        <div v-for="(c, i) in gallery" :key="i" class="photo" :style="{ background: c }">
          <span class="photo-tag">0{{ i + 1 }}</span>
        </div>
      </div>
    </section>

    <!-- 定价：真实卡片，滚动划过导航 -->
    <section class="pricing">
      <h2 class="sec-title">定价方案</h2>
      <div class="plans">
        <div v-for="p in plans" :key="p.name" class="plan" :class="{ hot: p.hot }">
          <div v-if="p.hot" class="badge">最受欢迎</div>
          <h3>{{ p.name }}</h3>
          <div class="price">{{ p.price }}</div>
          <p class="plan-desc">{{ p.desc }}</p>
          <button class="plan-btn" :class="{ 'is-hot': p.hot }">选择方案</button>
        </div>
      </div>
    </section>

    <!-- 大段文字 + Logo 墙，把页面拉高，方便来回滚动看折射 -->
    <section class="long">
      <h2 class="sec-title">我们的故事</h2>
      <p class="para">
        从一个想法的种子，到服务全球数百万团队的平台，我们始终相信：好的技术，应该让复杂变简单、让遥不可及变触手可及。
      </p>
      <div class="logo-wall">
        <span v-for="l in logos" :key="l" class="logo-chip">{{ l }}</span>
      </div>

      <div class="big-gradient-block"></div>
      <p class="para para-2">
        滚动这个页面，把导航保持在这样的高度 —— 你会看到玻璃折射它正下方划过的每一个真实元素：
        渐变色块、卡片、文字、乃至彩色的图片。没有任何固定背景图，一切都是真实内容。
      </p>
    </section>

    <footer class="foot">© 2026 Aurora Studio · 本页为演示用的假数据官网</footer>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  color: #1a1a2e;
  overflow-x: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  background: #f6f7fb;
}

/* ---------- Hero ---------- */
.hero {
  position: relative;
  min-height: 92vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 0 24px;
  overflow: hidden;
}
.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.55;
  pointer-events: none;
}
.orb-1 { width: 460px; height: 460px; background: #ff9a9e; top: -80px; left: -60px; }
.orb-2 { width: 520px; height: 520px; background: #a18cd1; bottom: -120px; right: -80px; }
.orb-3 { width: 360px; height: 360px; background: #48c6ef; top: 40%; left: 55%; }

.eyebrow {
  font-size: 13px;
  letter-spacing: 0.3em;
  color: #8c8ca8;
  font-weight: 600;
  margin: 0 0 18px;
}
.title {
  font-size: clamp(34px, 6vw, 72px);
  font-weight: 800;
  line-height: 1.1;
  margin: 0 0 22px;
  letter-spacing: -0.02em;
  color: #111129;
}
.grad {
  background: linear-gradient(120deg, #6a5cff, #c471f5, #48c6ef);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.subtitle {
  font-size: clamp(15px, 1.6vw, 19px);
  color: #5a5a72;
  max-width: 560px;
  line-height: 1.7;
  margin: 0 0 34px;
}
.cta {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  justify-content: center;
  margin-bottom: 56px;
}
.btn-primary {
  background: #111129;
  color: #fff;
  border: none;
  padding: 14px 30px;
  border-radius: 999px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 12px 30px rgba(17, 17, 41, 0.25);
}
.btn-ghost {
  background: #fff;
  color: #111129;
  border: 1px solid #e3e3ee;
  padding: 14px 30px;
  border-radius: 999px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}
.stats {
  display: flex;
  gap: clamp(24px, 5vw, 64px);
  flex-wrap: wrap;
  justify-content: center;
}
.stat-num {
  font-size: clamp(24px, 3.2vw, 40px);
  font-weight: 800;
  color: #111129;
}
.stat-label {
  font-size: 13px;
  color: #8c8ca8;
  margin-top: 4px;
}

/* ---------- 通用区块 ---------- */
.sec-title {
  font-size: clamp(22px, 3vw, 34px);
  font-weight: 700;
  text-align: center;
  color: #111129;
  margin: 0 0 44px;
}
.features, .gallery, .pricing, .long {
  padding: 80px 24px;
  max-width: 1080px;
  margin: 0 auto;
}

/* ---------- 特性卡片 ---------- */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 24px;
}
.card {
  background: #fff;
  border-radius: 22px;
  padding: 30px 26px;
  box-shadow: 0 6px 24px rgba(17, 17, 41, 0.06);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  border: 1px solid #f0f0f6;
}
.card.hovered {
  transform: translateY(-6px);
  box-shadow: 0 16px 40px rgba(17, 17, 41, 0.12);
}
.card-icon {
  font-size: 34px;
  margin-bottom: 16px;
}
.card h3 {
  margin: 0 0 10px;
  font-size: 19px;
  color: #111129;
}
.card p {
  margin: 0;
  font-size: 14px;
  color: #6b6b82;
  line-height: 1.6;
}

/* ---------- 图片墙 ---------- */
.strip {
  display: flex;
  gap: 18px;
  overflow-x: auto;
  padding-bottom: 12px;
}
.photo {
  flex: none;
  width: 200px;
  height: 140px;
  border-radius: 18px;
  position: relative;
  display: grid;
  place-items: center;
  box-shadow: 0 8px 24px rgba(17, 17, 41, 0.12);
}
.photo-tag {
  color: #fff;
  font-weight: 700;
  font-size: 20px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

/* ---------- 定价 ---------- */
.plans {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
}
.plan {
  position: relative;
  background: #fff;
  border-radius: 24px;
  padding: 36px 30px;
  text-align: center;
  border: 1px solid #f0f0f6;
}
.plan.hot {
  border: 2px solid #6a5cff;
  box-shadow: 0 16px 40px rgba(106, 92, 255, 0.15);
}
.badge {
  position: absolute;
  top: -13px;
  left: 50%;
  transform: translateX(-50%);
  background: #6a5cff;
  color: #fff;
  font-size: 12px;
  padding: 4px 14px;
  border-radius: 999px;
}
.plan h3 { margin: 0 0 12px; font-size: 18px; color: #111129; }
.price { font-size: 38px; font-weight: 800; color: #111129; margin-bottom: 8px; }
.plan-desc { font-size: 13px; color: #8c8ca8; margin: 0 0 24px; }
.plan-btn {
  width: 100%;
  padding: 12px;
  border-radius: 999px;
  border: 1px solid #e3e3ee;
  background: #fff;
  color: #111129;
  font-weight: 600;
  cursor: pointer;
}
.plan-btn.is-hot {
  background: #111129;
  color: #fff;
  border-color: #111129;
}

/* ---------- 长文 + Logo 墙 ---------- */
.para {
  max-width: 720px;
  margin: 0 auto 40px;
  font-size: 17px;
  line-height: 1.9;
  color: #55556c;
  text-align: center;
}
.logo-wall {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  justify-content: center;
  margin-bottom: 60px;
}
.logo-chip {
  width: 64px;
  height: 64px;
  border-radius: 18px;
  background: #fff;
  display: grid;
  place-items: center;
  font-weight: 700;
  font-size: 22px;
  color: #111129;
  border: 1px solid #f0f0f6;
  box-shadow: 0 4px 12px rgba(17, 17, 41, 0.06);
}
.big-gradient-block {
  height: 260px;
  border-radius: 28px;
  background: linear-gradient(120deg, #6a5cff, #c471f5, #48c6ef);
  margin-bottom: 60px;
}
.para-2 {
  margin-bottom: 20px;
}

/* ---------- footer ---------- */
.foot {
  text-align: center;
  padding: 40px 24px;
  color: #9a9ab0;
  font-size: 13px;
}
</style>
