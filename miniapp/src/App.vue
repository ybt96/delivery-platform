<script>
import { useUserStore } from '@/store/modules/user'

export default {
  onLaunch() {
    console.log('App Launch - 乡里乡亲')
    this.checkLoginState()
  },
  onShow() {
    console.log('App Show')
  },
  onHide() {
    console.log('App Hide')
  },
  methods: {
    checkLoginState() {
      try {
        // pinia-plugin-persistedstate 会自动从 storage 恢复 store 状态
        // 此处只做 token 有效性校验兜底
        const userStore = useUserStore()
        if (userStore.token) {
          console.log('已登录用户：', userStore.userInfo.nickname || '未知')
          // TODO: 可在此处调用 refreshToken 或 getUserInfo 接口验证 token 有效性
        } else {
          console.log('未登录状态')
        }
      } catch (e) {
        console.error('初始化登录状态失败', e)
      }
    }
  }
}
</script>

<style lang="scss">
// ==================== 全局基础样式 ====================
page {
  background-color: $bg-color;
  font-size: $font-size-base;
  color: $text-primary;
  font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica,
    Segoe UI, Arial, Roboto, 'PingFang SC', 'miui', 'Hiragino Sans GB', 'Microsoft Yahei',
    sans-serif;
  line-height: 1.5;
  box-sizing: border-box;
  -webkit-font-smoothing: antialiased;
}

view, text, scroll-view, swiper, swiper-item, image, navigator, video, input, textarea, button {
  box-sizing: border-box;
}

button {
  margin: 0;
  padding: 0;
  background-color: transparent;
  &::after {
    border: none;
  }
}

image {
  width: 100%;
  height: 100%;
  vertical-align: bottom;
}

// ==================== 全局原子类 ====================
.text-primary { color: $text-primary; }
.text-regular { color: $text-regular; }
.text-secondary { color: $text-secondary; }
.color-primary { color: $primary-color; }
.color-error { color: $error-color; }
.color-success { color: $success-color; }
.color-warning { color: $warning-color; }
.color-price { color: $price-color; }

.bg-white { background-color: $bg-white; }
.bg-gray { background-color: $bg-gray; }
.bg-primary { background-color: $primary-color; }

.fs-xs { font-size: $font-size-xs; }
.fs-sm { font-size: $font-size-sm; }
.fs-base { font-size: $font-size-base; }
.fs-md { font-size: $font-size-md; }
.fs-lg { font-size: $font-size-lg; }
.fs-xl { font-size: $font-size-xl; }
.fs-xxl { font-size: $font-size-xxl; }

.fw-bold { font-weight: bold; }
.fw-500 { font-weight: 500; }

.mt-sm { margin-top: $spacing-sm; }
.mt-base { margin-top: $spacing-base; }
.mb-sm { margin-bottom: $spacing-sm; }
.mb-base { margin-bottom: $spacing-base; }
.ml-sm { margin-left: $spacing-sm; }
.ml-base { margin-left: $spacing-base; }
.mr-sm { margin-right: $spacing-sm; }
.mr-base { margin-right: $spacing-base; }

.p-sm { padding: $spacing-sm; }
.p-base { padding: $spacing-base; }
.px-base { padding-left: $spacing-base; padding-right: $spacing-base; }
.py-base { padding-top: $spacing-base; padding-bottom: $spacing-base; }

.flex { display: flex; }
.flex-column { @include flex-column; }
.flex-center { @include flex-center; }
.flex-between { @include flex-between; }
.flex-wrap { flex-wrap: wrap; }
.flex-1 { flex: 1; }
.align-center { align-items: center; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.justify-end { justify-content: flex-end; }

.text-center { text-align: center; }
.text-right { text-align: right; }
.text-left { text-align: left; }
.text-delete { text-decoration: line-through; }

.ellipsis { @include ellipsis(1); }
.ellipsis-2 { @include ellipsis(2); }

.radius-sm { border-radius: $radius-sm; }
.radius-base { border-radius: $radius-base; }
.radius-md { border-radius: $radius-md; }
.radius-round { border-radius: $radius-round; }

.shadow { box-shadow: $shadow-sm; }

.safe-bottom { @include safe-bottom; }
</style>
