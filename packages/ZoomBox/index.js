
// 导入组件，组件必须声明 name
import ZoomBox from './src/ZoomBox'
// 为组件提供 install 安装方法，供按需引入
ZoomBox.install = function (Vue) {
  Vue.component(ZoomBox.name, ZoomBox)
}

// 导出组件
export default ZoomBox
