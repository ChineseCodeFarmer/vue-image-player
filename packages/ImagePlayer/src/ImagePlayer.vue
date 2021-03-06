<template>
  <div>
    <div
      class="player"
      ref="player"
      @mousemove="palyerMouseMoved"
      @touchenter="palyerMouseMoved"
      @touchmove="palyerMouseMoved"
    >
      <zoom-box
        ref="zoomBox"
        :class="{ 'player-list': true, 'full-screen': isFullScreen }"
      >
        <div @dblclick="playerDoubleClick">
          <!-- 实时模式 -->
          <i
            class="play-img"
            v-if="liveMode && isIE"
            :style="{
              'background-image': 'url(' + liveUrl + ')',
            }"
          />
          <img v-if="liveMode && !isIE && liveUrl" class="play-img" :src="liveUrl" />
          <!-- 回放模式 -->
          <i
            v-if="isIE && !liveMode"
            class="play-img"
            :style="{
              'background-image': 'url(' + currentImage + ')',
            }"
          />
          <div v-if="!isIE && !liveMode" class="not-ie-img-container">
            <img
              v-for="(item, i) in playingImgItems"
              :key="i"
              class="play-img"
              :src="item.src"
              :style="{
                display: lastIndex + playingIndex == i ? 'block' : 'none',
              }"
            />
          </div>

          <i
            class="play-img"
            v-show="previewVisible && previewImg && !liveMode"
            :style="{
              'background-image': 'url(' + previewImg + ')',
            }"
          />
          <div class="loader" v-show="loading">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
          </div>
        </div>
      </zoom-box>

      <div
        :class="{ control: true, 'full-screen': isFullScreen }"
        :style="{ bottom: controlBarBottom }"
      >
        <div class="jsvp-control-bar" >
          <a
            href="javascript:;"
            class="jsvp-control-pause"
            title="Pause"
            v-show="playState == 1 && !liveMode"
            @click="pause"
          ></a
          ><a
            href="javascript:;"
            class="jsvp-control-play"
            title="Play"
            v-show="(playState == 0 || playState == 3) && !liveMode"
            @click="play"
          ></a
          ><input
            v-show="!liveMode"
            type="text"
            class="jsvp-control-currentTime"
            :value="currentTime | dateFormat"
            readonly="readonly"
          />
          <div class="jsvp-control-player-bar" ref="playerBar" :style="{visibility:liveMode?'hidden':'visible'}">
            <div
              ref="progressBar"
              v-pbDown
              id="slider-sliderWrapper_0"
              class="jsvp-player-slider ui-slider ui-slider-horizontal ui-widget ui-widget-content ui-corner-all"
            >
              <div
                class="ui-slider-range ui-widget-header ui-corner-all ui-slider-range-min"
                :style="{ width: progress + '%' }"
              ></div>
              <span
                v-drag
                class="ui-slider-handle ui-state-default ui-corner-all"
                tabindex="0"
                :style="{ left: progress + '%' }"
              ></span>
            </div>
          </div>
          <input
          v-show="!liveMode"
            type="text"
            class="jsvp-control-totalTime"
            :value="totalTime | dateFormat"
            readonly="readonly"
          />
          <!-- <div class="jsvp-control-volume-bar">
            <div id="slider-volume_0" class="jsvp-volume-slider"></div>
          </div> -->
          <!-- <a
            href="javascript:;"
            class="jsvp-control-title"
            title="Show/Hide Title"
            style="display: none"
          ></a> -->
          <a
            @click="fullScreen()"
            href="javascript:;"
            class="jsvp-control-full-screen"
            title="Full Screen"
            style="display: block"
          ></a>
        </div>
      </div>
    </div>
    <!-- <img v-for="(item,i) in imgList" :key="i" :src="item"/> -->
  </div>
</template>

<script>
var that;
// 格式化事件的插件moment
import moment from "moment";
import ZoomBox from "../../ZoomBox/src/ZoomBox.vue";
export default {
  name: "image-player",
  components: {
    ZoomBox,
  },
  data() {
    return {
      progress: 0,
      playState: 3, //0 暂停 1 播放 2 加载 3 IDE
      playIntervalIndex: -1, //播放计时器索引
      lastIndex: -1, //播放数组的起始位置
      playingIndex: 0, //正在播放的索引
      bufferedSuccess: false, //缓冲成功
      dragging: false, //正在拖拽
      loadingPercent: "100%",
      loading: false, //缓冲中
      preloadInProgress: false, //预加载执行中
      preloadImageObjs: [], //用于预加载的图片元素
      preloadImages: [], //预加载的图片对象
      playingImgItems: [],
      previewVisible: true,
      isFullScreen: false,
      hideControlTimeout: 0, //隐藏控制条定时器
      controlBarBottom: 0,
      isIE: false,
    };
  },
  props: {
    liveMode: Boolean, //实时模式
    liveUrl: String, //实时模式图片地址
    frameRate: {
      default: 2, //每秒2张图片
    },
    imgList: {
      type: Array,
      default: () => [],
    },
    bufferSize: {
      default: 10, //缓冲区图片张数
    },
    preview: String, //预览图
  },
  filters: {
    dateFormat(dataStr, pattern = "mm:ss") {
      return moment(dataStr).format(pattern);
    },
  },
  watch: {
    imgList() {
      this.generateImageItems();
    },
  },
  created() {
    that = this;
    this.generateImageItems();
    document.addEventListener("fullscreenchange", function (e) {
      that.onFullScreenChanged(e);
    });
    document.addEventListener("webkitfullscreenchange", function (e) {
      that.onFullScreenChanged(e);
    });
    document.addEventListener("mozfullscreenchange", function (e) {
      that.onFullScreenChanged(e);
    });
    document.addEventListener("MSFullscreenChange", function (e) {
      that.onFullScreenChanged(e);
    });
    this.isIE = this.browerType() == "IE";
  },
  computed: {
    //总时间
    totalTime() {
      return (1000 * this.imgList.length) / this.frameRate;
    },
    currentTime() {
      return (1000 * (this.lastIndex + this.playingIndex + 1)) / this.frameRate;
    },
    noData() {
      return !this.imgList || this.imgList.length == 0;
    },
    previewImg() {
      return this.preview || (this.imgList && this.imgList[0]);
    },
    currentImage() {
      return (
        (this.imgList && this.imgList[this.lastIndex + this.playingIndex]) || ""
      );
    },
  },
  methods: {
    playerDoubleClick() {
      this.fullScreen();
    },
    browerType() {
      var userAgent = navigator.userAgent.toLowerCase(); //取得浏览器的userAgent字符串
      var isOpera = userAgent.indexOf("opera") > -1;
      if (isOpera) {
        //判断是否Opera浏览器
        return "Opera";
      }
      if (userAgent.indexOf("firefox") > -1) {
        //判断是否Firefox浏览器
        return "FF";
      }
      if (userAgent.indexOf("chrome") > -1) {
        //判断是否Chrome浏览器
        return "Chrome";
      }
      if (userAgent.indexOf("safari") > -1) {
        //判断是否Safari浏览器
        return "Safari";
      }
      if (
        userAgent.indexOf("msie") > -1 ||
        userAgent.indexOf("trident/") > -1
      ) {
        //判断是否IE浏览器
        return "IE";
      }
    },
    //生成图片对象
    generateImageItems() {
      this.playingImgItems = [];
      if (this.imgList) {
        for (let i = 0; i < this.imgList.length; i++) {
          this.playingImgItems.push({
            src: "",
            display: "collapse",
          });
        }
      }
    },
    palyerMouseMoved() {
      if (this.isFullScreen) {
        this.controlBarBottom = "0";
        this.startHideControlTimer();
      }
      return true;
    },
    onFullScreenChanged() {
      this.isFullScreen =
        document.fullScreen ||
        document.mozFullScreen ||
        document.webkitIsFullScreen ||
        document.msFullscreenElement != null;
      this.controlBarBottom = "0";
      this.startHideControlTimer();
      this.$refs.zoomBox.reset();
    },
    startHideControlTimer() {
      clearTimeout(this.hideControlTimeout);
      this.hideControlTimeout = setTimeout(() => {
        this.controlBarBottom = "-42px";
      }, 2000);
    },
    progressBarTouchStart(e) {
      if (this.noData) {
        return;
      }
      let barRect = that.$refs.playerBar.getBoundingClientRect();
      //用鼠标的位置减去鼠标相对元素的位置，得到元素的位置
      let progress =
        ((e.touches[0].pageX - barRect.left) / barRect.width) * 100;
      //越界判断
      if (progress > 100) {
        progress = 100;
      } else if (progress < 0) {
        progress = 0;
      }
      this.progress = progress;
      this.changePlayIndex();
      e.stopPropagation();
    },
    progressBarMouseDown(e) {
      if (this.noData) {
        return;
      }
      let barRect = that.$refs.playerBar.getBoundingClientRect();
      //用鼠标的位置减去鼠标相对元素的位置，得到元素的位置
      let progress = ((e.pageX - barRect.left) / barRect.width) * 100;
      //越界判断
      if (progress > 100) {
        progress = 100;
      } else if (progress < 0) {
        progress = 0;
      }
      this.progress = progress;
      this.changePlayIndex();
    },
    fullScreen() {
      let element = this.$refs.player;
      let isFullScreen =
        document.fullScreen ||
        document.mozFullScreen ||
        document.webkitIsFullScreen ||
        document.msFullscreenElement != null;
      if (isFullScreen) {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
      } else {
        if (element.requestFullscreen) {
          element.requestFullscreen();
        } else if (element.msRequestFullscreen) {
          element.msRequestFullscreen();
        } else if (element.mozRequestFullScreen) {
          element.mozRequestFullScreen();
        } else if (element.webkitRequestFullscreen) {
          element.webkitRequestFullscreen();
        }
      }
    },
    //播放
    play() {
      if (this.noData) {
        return;
      }
      if (that.playState == 3) {
        this.loading = true;
        this.preload(0);
      }
      this.playState = 1;
      this.playIntervalIndex = setInterval(() => {
        //播放结束
        if (that.lastIndex + that.playingIndex >= that.imgList.length - 1) {
          that.pause();
          that.playState = 3;
          that.progress = 100;
        } else {
          if (that.playingIndex == that.bufferSize - 1) {
            //如果播放到最后一张并且预加载没好
            if (!that.bufferedSuccess) {
              //显示加载中
              that.loading = true;
            } else {
              //已预加载完成

              that.bufferedSuccess = false;
              that.playingIndex = 0;
              that.lastIndex += that.bufferSize;
              for (let i = 0; i < this.preloadImages.length; i++) {
                const img = this.preloadImages[i];
                this.playingImgItems[this.lastIndex + i].src = img;
              }
            }
          } else if (!that.loading) {
            ++that.playingIndex;
          }

          //判断预加载
          if (
            !that.bufferedSuccess &&
            !that.preloadInProgress &&
            that.lastIndex + that.bufferSize < that.imgList.length
          ) {
            that.preload(that.lastIndex + that.bufferSize);
          }
          //改变进度条
          if (!that.dragging && !that.loading) {
            that.progress =
              ((that.lastIndex + that.playingIndex) /
                (that.imgList.length - 1)) *
              100;
          }
        }
      }, 1000 / that.frameRate);
    },

    //暂停
    pause() {
      this.playState = 0;
      if (this.playIntervalIndex != -1) {
        clearInterval(this.playIntervalIndex);
      }
    },
    //停止
    stop() {
      this.playState = 3;
      //清除计时器
      clearInterval(this.playIntervalIndex);

      //清除预加载相关内容
      this.cancelPreload(this.preloadImageObjs);
      this.preloadImageObjs = [];
      this.bufferedSuccess = false;
      this.loading = false;
      this.preloadInProgress = false;
      this.preloadImages = [];
      this.preloadImageItems = [];
      this.previewVisible = true;

      //重置播放位置
      this.progress = 0;
      this.lastIndex = -1;
      this.playingIndex = 0;
      this.dragging = false;
    },
    preloadEnd(index) {
      this.preloadInProgress = false;
      this.previewVisible = false;
      this.bufferedSuccess = true;
      this.preloadImageObjs = [];
      for (let i = 0; i < this.preloadImages.length; i++) {
        const img = this.preloadImages[i];
        this.playingImgItems[index + i].src = img;
      }
      //如果正在等在加载
      if (this.loading) {
        this.lastIndex = index;

        this.bufferedSuccess = false;
        this.playingIndex = 0;
        this.loading = false;
      }
    },

    //改变播放索引位置
    changePlayIndex() {
      //如果播放结束将播放状态改为暂停
      if (this.playState == 3) {
        this.playState = 0;
      }
      //鼠标弹起来的时候不再移动
      let temp = Math.ceil((this.progress * (this.imgList.length - 1)) / 100);
      // this.playingIndex = 0;
      this.cancelPreload(this.preloadImageObjs);
      this.loading = true;
      this.preload(temp);
    },
    //预加载
    preload(startIndex) {
      this.preloadInProgress = true;
      if (startIndex >= this.imgList.length) {
        return;
      }
      let imgs = this.imgList.slice(startIndex, startIndex + this.bufferSize);
      let count = 0;
      this.preloadImageObjs = [];
      for (let i = 0; i < imgs.length; i++) {
        let image = new Image();
        this.preloadImageObjs.push(image);
      }

      for (let i = 0; i < imgs.length; i++) {
        let image = this.preloadImageObjs[i];
        let img = imgs[i];
        image.onload = () => {
          count++;
          // 计算图片加载的百分数，绑定到percent变量
          let percentNum = Math.floor((this.count / this.bufferSize) * 100);
          this.loadingPercent = `${percentNum}%`;
          if (count == imgs.length) {
            this.preloadImages = imgs;
            this.preloadEnd(startIndex);
          }
        };
        //加载失败
        image.onerror = () => {
          setTimeout(() => {
            image.src = img;
          }, 2000);
        };
        image.src = img;
      }
    },
    //取消预加载
    cancelPreload(imageObjs) {
      for (let image of imageObjs) {
        image.onload = null;
        image.onerror = null;
      }
    },
  },

  directives: {
    pbDown: {
      bind: function (el) {
        if ("ontouchstart" in el) {
          el.ontouchstart = that.progressBarTouchStart;
        } else {
          el.onmousedown = that.progressBarMouseDown;
        }
      },
    },
    drag: {
      bind: function (el) {
        let dragBox = el; //获取当前元素
        if ("ontouchstart" in dragBox) {
          dragBox.ontouchstart = (e) => {
            if (that.noData) {
              return;
            }
            e.stopPropagation();
            that.dragging = true;
            //禁用拖拽
            el.ontouchmove = (e) => {
              let barRect = that.$refs.playerBar.getBoundingClientRect();
              //用鼠标的位置减去鼠标相对元素的位置，得到元素的位置
              let progress =
                ((e.touches[0].pageX - barRect.left) / barRect.width) * 100;
              //越界判断
              if (progress > 100) {
                progress = 100;
              } else if (progress < 0) {
                progress = 0;
              }
              that.progress = progress;

              //禁用框选
              // e.returnValue = false;
              // e.stopPropagation();
              return false;
            };
            el.ontouchend = () => {
              el.ontouchmove = null;
              //预防鼠标弹起来后还会循环（即预防鼠标放上去的时候还会移动）
              el.ontouchend = null;
              that.dragging = false;
              that.changePlayIndex();
            };
          };
        } else {
          dragBox.onmousedown = (e) => {
            if (that.noData) {
              return;
            }
              e.preventDefault();
              e.stopPropagation();
            that.dragging = true;
            //禁用拖拽
            document.onmousemove = (e) => {
              let barRect = that.$refs.playerBar.getBoundingClientRect();
              //用鼠标的位置减去鼠标相对元素的位置，得到元素的位置
              let progress = ((e.pageX - barRect.left) / barRect.width) * 100;
              //越界判断
              if (progress > 100) {
                progress = 100;
              } else if (progress < 0) {
                progress = 0;
              }
              that.progress = progress;
              // el.style.left = progress + "%"
            };
            document.onmouseup = () => {
              document.onmousemove = null;
              //预防鼠标弹起来后还会循环（即预防鼠标放上去的时候还会移动）
              document.onmouseup = null;
              that.dragging = false;
              that.changePlayIndex();
            };
          };
        }
      },
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.not-ie-img-container {
  width: 100%;
  height: 100%;
}

.loader {
  background: #00000055;

  position: absolute;
  top: 50%;
  left: 50%;
  /* margin-left: 10%; */
  transform: translate3d(-50%, -50%, 0);
  padding: 10px;
  border-radius: 5px;
}
.dot {
  width: 12px;
  height: 12px;
  background: #3ac;
  border-radius: 100%;
  display: inline-block;
  animation: slide 1s infinite;
}
.dot:nth-child(1) {
  animation-delay: 0.1s;
  background: #32aacc;
}
.dot:nth-child(2) {
  animation-delay: 0.2s;
  background: #64aacc;
}
.dot:nth-child(3) {
  animation-delay: 0.3s;
  background: #96aacc;
}
.dot:nth-child(4) {
  animation-delay: 0.4s;
  background: #c8aacc;
}
.dot:nth-child(5) {
  animation-delay: 0.5s;
  background: #faaacc;
}
@-moz-keyframes slide {
  0% {
    transform: scale(1);
  }
  50% {
    opacity: 0.3;
    transform: scale(2);
  }
  100% {
    transform: scale(1);
  }
}
@-webkit-keyframes slide {
  0% {
    transform: scale(1);
  }
  50% {
    opacity: 0.3;
    transform: scale(2);
  }
  100% {
    transform: scale(1);
  }
}
@-o-keyframes slide {
  0% {
    transform: scale(1);
  }
  50% {
    opacity: 0.3;
    transform: scale(2);
  }
  100% {
    transform: scale(1);
  }
}
@keyframes slide {
  0% {
    transform: scale(1);
  }
  50% {
    opacity: 0.3;
    transform: scale(2);
  }
  100% {
    transform: scale(1);
  }
}

.play-img {
  left: 0;
  top: 0;
  position: absolute;
  width: 100%;
  height: 100%;
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;
  background-origin: content-box;
  object-fit: contain;
}
.player {
  width: 100%;
  height: 100%;
  background-color: black;
  /* border-radius: 5px; */
}

/* .zoom-box {
  width: 100%;
  height: 100%;
} */

/* .zoom-box  */
.player-list {
  position: relative;
  height: calc(100% - 42px);
}
.player-list.full-screen {
  height: 100%;
}

:focus {
  outline: none;
}
input,
input:focus {
  border: none;
  outline: none;
}
.control {
  width: 100%;
  transition: bottom 200ms;
}
.control.full-screen {
  position: absolute;
  bottom: 0;
}

/* .jsvp-control-bar,
.jsvp-control-bar .ui-slider,
.jsvp-control-bar .ui-slider-range,
.jsvp-wrapper {

} */
.jsvp-control-bar .ui-slider-range,
.jsvp-control-bar .ui-slider {
  border-radius: 4px;
}

/* .jsvp-wrapper {
  width: 900px;
  height: 385px;
  display: block;
  margin: 30px auto;
  overflow: hidden;
} */
.jsvp-control-bar {
  height: 42px;
  display: flex;
  align-items: center;
  background: url(../assets/player-icons-bg.png) repeat-x 0 0;
}

.jsvp-wrapper .jsvp-ul {
  background: #d3d3d3;
}
.jsvp-wrapper .jsvp-ul,
.jsvp-wrapper .jsvp-ul li {
  width: 750px;
}
.jsvp-control-player-bar {
  flex: 1;
}

.jsvp-control-volume-bar,
.jsvp-control-volume-bar .ui-slider {
  width: 44px;
}
.jsvp-control-currentTime,
.jsvp-control-totalTime {
  width: 44px;
  float: left;
  height: 43px;
  text-align: center;
  color: #333;
  background: transparent;
}
.jsvp-wrapper .jsvp-ul,
.jsvp-wrapper .jsvp-ul li {
  height: 500px;
}

.jsvp-wrapper .jsvp-ul {
  display: block;
  margin: 0 auto;
  position: relative;
  overflow: hidden;
  border: 0px #41434f solid;
}
.jsvp-wrapper .jsvp-ul li {
  position: absolute;
  display: none;
  overflow: hidden;
}
.jsvp-wrapper .jsvp-ul li .jsvp-title {
  position: absolute;
  bottom: 0px;
  left: 0;
  text-align: center;
  display: block;
  width: 100%;
  padding: 10px 0;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  font-size: 13px;
  font-weight: bold;
}

.jsvp-control-bar a {
  width: 50px;
  background-color: #41434f;
  display: block;
  float: left;
  font-weight: bold;
  font-size: 12px;
  color: #000;
  text-align: center;
}
.jsvp-control-bar .jsvp-control-play {
  background: url(../assets/player-icons-sprite.png) no-repeat -88px top;
  width: 44px;
  height: 43px;
  float: left;
  display: block;
}
.jsvp-control-bar .jsvp-control-play:hover,
.jsvp-control-bar .jsvp-control-play.sel {
  background-position: -88px bottom;
}
.jsvp-control-bar .jsvp-control-pause {
  background: url(../assets/player-icons-sprite.png) no-repeat -44px top;
  width: 44px;
  height: 43px;
  float: left;
  display: block;
}
.jsvp-control-bar .jsvp-control-pause:hover,
.jsvp-control-bar .jsvp-control-pause.sel {
  background-position: -44px bottom;
}
.jsvp-control-bar .jsvp-control-title {
  background: url(../assets/player-icons-sprite.png) no-repeat -132px top;
  width: 44px;
  height: 43px;
  float: left;
  display: block;
}

.jsvp-control-bar .jsvp-control-full-screen {
  background: url(../assets/player-icons-sprite.png) no-repeat -264px top;
  width: 44px;
  height: 43px;
  background-position-y: -2px;
  float: left;
  display: block;
}
.jsvp-control-bar .jsvp-control-title:hover,
.jsvp-control-bar .jsvp-control-title.sel {
  background-position: -132px bottom;
}
.jsvp-control-bar .jsvp-control-volume {
  background: url(../assets/player-icons-sprite.png) no-repeat -176px top;
  width: 44px;
  height: 43px;
  float: left;
  display: block;
}
.jsvp-control-bar .jsvp-control-volume:hover,
.jsvp-control-bar .jsvp-control-volume.sel {
  background-position: -176px bottom;
}

.jsvp-control-bar .ui-slider .ui-slider-range {
  position: absolute;
  z-index: 1;
}
.jsvp-player-slider {
  margin: 0 5px;
}

.jsvp-control-bar .jsvp-control-player-bar .ui-widget-header {
  height: 12px;
  width: 624px;
  display: block;
  background: #41434f;
}
.jsvp-control-bar .jsvp-control-player-bar .ui-slider {
  position: relative;
  text-align: left;
  background: #f1f1f1;
  height: 8px;
}

.jsvp-control-bar .jsvp-control-player-bar .ui-slider .ui-slider-handle {
  position: absolute;
  z-index: 2;
  cursor: default;
  top: -6px;
  margin-left: -10px;
}
.jsvp-control-bar
  .jsvp-control-player-bar
  .ui-slider-horizontal
  .ui-slider-range {
  top: 0;
  height: 100%;
}

.jsvp-control-volume-bar {
  display: none;
  float: left;
}
.jsvp-control-volume-bar .ui-widget-header {
  height: 50px;
  width: 8px;
  display: block;
  background: #41434f;
}
.jsvp-control-volume-bar .ui-slider {
  position: relative;
  text-align: left;
  background: #f1f1f1;
  height: 50px;
}
.jsvp-control-volume-bar .ui-slider-vertical {
  width: 8px;
}
.jsvp-control-volume-bar .ui-slider .ui-slider-handle {
  position: absolute;
  z-index: 2;
  cursor: default;
  bottom: -6px;
  margin-left: -6px;
  margin-bottom: -6px;
}
.jsvp-control-volume-bar .ui-slider-vertical .ui-slider-range {
  bottom: 0;
  height: 100%;
}

.jsvp-control-bar .jsvp-control-player-bar .ui-widget-content .ui-state-default,
.jsvp-control-volume-bar .ui-widget-content .ui-state-default {
  background: url(../assets/player-icons-sprite.png) no-repeat -232px -12px;
  width: 20px;
  height: 20px;
}
.jsvp-wrapper .jsvp-hidden {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 99;
  width: 1px;
  height: 1px;
  z-index: -999;
  display: block;
  overflow: hidden; /**/
}

.jsvp-hidden .jsvp-audio-player-wrapper {
  border: 1px red solid;
  position: absolute;
  top: 250px;
  z-index: 999;
  height: 50px;
}
.jsvp-wrapper .jsvp-ul,
.jsvp-wrapper .jsvp-ul li {
  width: 100%;
  height: 340px;
}
/*.jsvp-wrapper .jsvp-ul, .jsvp-wrapper .jsvp-ul li{width:100%; height:100%;}*/

.time {
  height: 16px;
  width: 300px;
  float: right;
  border: 0px red solid;
  margin: 30px 0 20px 0;
}
.time input {
  background-color: transparent;
  border: 0;
  height: 16px;
  width: 150px;
  float: right;
}
</style>
