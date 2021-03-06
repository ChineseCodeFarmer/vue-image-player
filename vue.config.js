const path = require('path')
module.exports = {
  pages: {
    index: {
      entry: 'examples/index/index.js',
      template: 'example/index/index.html',
      filename: 'index.html',
    },
    phone: {
      entry: 'examples/phone/phone.js',
      template: 'examples/phone/phone.html',
      filename: 'phone.html'
    }
  },
  css: { extract: false },
//   // 扩展 webpack 配置，使 packages 加入编译
//   // 扩展 webpack 配置
//   chainWebpack: config => {
//     // @ 默认指向 src 目录，这里要改成 examples
//     // 另外也可以新增一个 ~ 指向 packages
//     config.resolve.alias
//       .set('@', path.resolve('examples'))
//       .set('~', path.resolve('packages'))
//     // 把 packages 和 examples 加入编译，因为新增的文件默认是不被 webpack 处理的
//     config.module
//       .rule('js')
//       .include.add(/packages/)//这里一定要加不然babel-loader不会处理我们的es6代码
//       .end()
//       .include.add(/examples/)
//       .end()
//       .use('babel')
//       .loader('babel-loader')
//       .tap(options => {
//         // 修改它的选项...
//         return options
//       })
//   }
}
