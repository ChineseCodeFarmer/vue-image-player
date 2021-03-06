
// 导入组件，组件必须声明 name
import ImagePlayer from './src/ImagePlayer'
// 为组件提供 install 安装方法，供按需引入
ImagePlayer.install = function (Vue) {
  Vue.component(ImagePlayer.name, ImagePlayer)
}

// 导出组件
export default ImagePlayer
