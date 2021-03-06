import Vue from 'vue'
import Index from './index.vue'
import {ImagePlayer,ZoomBox} from 'vue-image-player'


// 注册组件库
Vue.use(ImagePlayer)
Vue.use(ZoomBox)


Vue.config.productionTip = false

new Vue({
  render: function(h){return h(Index)},
}).$mount('#app')
