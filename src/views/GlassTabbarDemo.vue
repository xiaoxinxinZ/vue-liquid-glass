<script setup>
/**
 * GlassTabbarDemo —— 封装好的液态玻璃导航的使用示例
 *
 * 这是给开发者的「最小用法案例」：只填业务数据，其余都由 GlassNav 组件内部处理。
 * 要在项目里复用，改下面几个参数即可：
 *   1. navItems  每个 tab 的文字 + 两张 PNG 图标
 *   2. tab       默认选中的 value
 *   3. frost     透明 / 磨砂（唯一需要调的外观旋钮，0 透明 ~ 1 磨砂）
 */
import { ref } from 'vue'
import { GlassNav } from '../components/glass'

/* ---- 1. 图标（PNG：常态版黑图 + 选中版彩色图） ---- */
import imgHome from '../assets/home.png'
import imgSearch from '../assets/search.png'
import imgLibrary from '../assets/library.png'
import imgMy from '../assets/my.png'
import imgActiveHome from '../assets/activeHome.png'
import imgActiveSearch from '../assets/activeSearch.png'
import imgActiveLibrary from '../assets/activeLibrary.png'
import imgActiveMy from '../assets/activeMy.png'

/* ---- 2. tab 数据 ---- */
const navItems = [
  //       label         value         未选中图           选中图
  { label: 'Home',     value: 'home',     normalImg: imgHome,     activeImg: imgActiveHome },
  { label: 'Discover', value: 'discover', normalImg: imgSearch,   activeImg: imgActiveSearch },
  { label: 'Library',  value: 'library',  normalImg: imgLibrary,  activeImg: imgActiveLibrary },
  { label: 'Profile',  value: 'profile',  normalImg: imgMy,       activeImg: imgActiveMy },
]

/* ---- 3. 默认选中值（v-model 绑 value，不是索引） ---- */
const tab = ref('home')

/* ---- 4. frost：透明/磨砂旋钮（唯一外观参数，0 透明 ~ 1 磨砂） ---- */
const frost = 0.6

/* ---- 5. 事件（按需使用，可以只留你需要的） ---- */
// 点谁都触发（包括当前已选中的那一项）
function onNavClick({ item, index, value }) {
  console.log('[GlassTabbarDemo] click →', item.label, value, index)
}
// 只有选中项真的变了才触发
function onNavChange(item, value, index) {
  console.log('[GlassTabbarDemo] change →', item.label, value, index)
}
</script>

<template>
  <!-- 外层 wrapper 负责 fixed 定位（不能把 position:fixed 直接加到 GlassNav 根上：
       会给 <nav> 覆盖掉组件内部的 position:relative，玻璃画布定位就会错乱 -->
  <div class="navbar-wrap">
    <GlassNav
      v-model="tab"
      :items="navItems"
      :frost="frost"
      @click="onNavClick"
      @change="onNavChange"
    />
  </div>
</template>

<style scoped>
/* 定位交给使用方：这里用外层 wrapper 做 fixed 定位和居中，避免干扰玻璃画布 */
.navbar-wrap {
  position: fixed;
  top: 25vh;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center; /* 居中：不用 transform，避免玻璃画布定位漂移 */
  z-index: 10;
  pointer-events: none; /* 让点击穿透到内部导航，导航自带交互 */
}
.navbar-wrap :deep(.glass-nav) {
  pointer-events: auto;
}
</style>
