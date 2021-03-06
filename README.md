# image-player

## 安装
```
npm install vue-image-player --save
```
## 使用
### 在main.js中加入
``` JavaScript
//全局引用
import ImagePlayer from 'vue-image-player'

Vue.use(ImagePlayer)

//按需引用
import {ImagePlayer,ZoomBox} from 'vue-image-player'
Vue.use(ImagePlayer)
Vue.use(ZoomBox)
```

### 加入元素节点
``` html
<!--图片播放器 -->
<!-- 回放模式 -->
<image-player :imgList="图片地址数组" />
<!-- 实时模式 -->
<image-player :liveMode="true" liveUrl="图片地址">

<!--元素缩放控件-->
<div class="zoom-box-container">
    <zoom-box>
        ...放入需要缩放的元素
    </zoom-box>
</div>

```

## 属性(Attributes)
### ImagePlayer
参数|说明|类型|默认
--|--|--|--
imgList|待播放的图片地址集合|array|[ ]
frameRate|帧数|number|2
preview|预览图|string|-
bufferSize|缓冲图片张数|number|10
liveMode|启用实时模式,前几个属性自动失效|boolean|false
liveUrl|实时模式播放的图片,仅当liveMode为true时有效|string|-

## 方法(Method)
### ImagePlayer
方法名|说明|参数
--|--|--
play|开始播放|-
pause|暂停播放|-
stop|停止播放(复位)|-

### ZoomBox
方法名|说明|参数
--|--|--
reset|回复原始缩放比例和位置|-

## Slot
ZoomBox包含缩放对象slot

## 事件(Event)
比较懒没加



