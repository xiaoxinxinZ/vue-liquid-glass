<script setup>
import MyTabbar from './views/myTabbar.vue'
import LandingPage from './views/LandingPage.vue'
import MyLiquidBox from './views/myLiquidBox.vue'
</script>

<template>
  <!-- 假数据官网（超过一屏，可滚动），内容真实，验证导航折射任意划过内容的效果 -->
  <LandingPage />

  <!-- 空玻璃容器示例（GlassBox）：点击有弹簧缩放、里面放各种内容 -->
  <MyLiquidBox />

  <!-- 固定的液态玻璃导航：浮在官网内容之上，按住/滚动时折射下方真实元素 -->
  <MyTabbar />
</template>
