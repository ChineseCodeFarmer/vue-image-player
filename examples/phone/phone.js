import Vue from 'vue'
import Phone from './phone.vue'
import ImagePlayer from '../../packages'

// 注册组件库
Vue.use(ImagePlayer)

Vue.config.productionTip = false

new Vue({
  render: function(h){return h(Phone)},
}).$mount('#test')
