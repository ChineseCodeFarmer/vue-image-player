<template>
  <div class="zoom-container" ref="zoomContainer" v-action>
    <div
      class="zoom-block"
      :style="{
        transform: transform,
        transformOrigin: '0 0',
      }"
    >
      <slot></slot>
    </div>
  </div>
</template>
<script>
import {VelocityTracker} from "./fling.js"
var _this;
export default {
  name: "zoom-box",
  data() {
    return {
      scaleFactor: 1, //缩放比例
      offsetX: 0, //横向偏移
      offsetY: 0, //纵向偏移
    };
  },
  created() {
    _this = this;
  },
  methods: {
    reset() {
      this.scaleFactor = 1;
      this.offsetX = this.offsetY = 0;
    },
    mouseWheeled(e) {
      e.preventDefault();

      let changedFactor = e.wheelDelta / 1200;
      let targetScaleFactor = this.scaleFactor + changedFactor;
      //限制缩放边界
      if (targetScaleFactor < 1) {
        targetScaleFactor = 1;
      } else if (targetScaleFactor > 5) {
        targetScaleFactor = 5;
      }
      let containerRect = this.$refs.zoomContainer.getBoundingClientRect();
      let mouseX = e.pageX - containerRect.left;
      let mouseY = e.pageY - containerRect.top;
      //计算当前鼠标位置相对于原始图片的位置
      let mouseXForOrigin = mouseX / this.scaleFactor - this.offsetX;
      let mouseYForOrigin = mouseY / this.scaleFactor - this.offsetY;
      let offsetX =
        -(mouseXForOrigin * targetScaleFactor - mouseX) / targetScaleFactor;
      let offsetY =
        -(mouseYForOrigin * targetScaleFactor - mouseY) / targetScaleFactor;

      //缩小时判断边界
      if (changedFactor < 0) {
        offsetX = this.checkBoundary(
          offsetX,
          containerRect.width,
          targetScaleFactor
        );
        offsetY = this.checkBoundary(
          offsetY,
          containerRect.height,
          targetScaleFactor
        );
      }
      this.offsetX = offsetX;
      this.offsetY = offsetY;
      this.scaleFactor = targetScaleFactor;
    },

    checkBoundary(offset, length, scaleFactor) {
      if (offset > 0) {
        offset = 0;
      } else if ((offset + length) * scaleFactor < length) {
        offset = length / scaleFactor - length;
      }
      return offset;
    },
    getTouchCenter(touches) {
      let sumX = 0;
      let sumY = 0;
      for (let i = 0; i < touches.length; i++) {
        const touch = touches[i];
        sumX += touch.pageX;
        sumY += touch.pageY;
      }
      return { x: sumX / touches.length, y: sumY / touches.length };
    },
    getTouchDistance(touches) {
      if (touches.length >= 2) {
        return Math.sqrt(
          Math.pow(touches[1].pageX - touches[0].pageX, 2) +
            Math.pow(touches[1].pageY - touches[0].pageY, 2)
        );
      }
      return 0;
    },
  },
  computed: {
    transform() {
      return (
        "scale(" +
        this.scaleFactor +
        ") translate(" +
        this.offsetX +
        "px," +
        this.offsetY +
        "px)"
      );
    },
  },
  directives: {
    action: {
      bind: (el) => {
        el.onmousewheel = _this.mouseWheeled;

        if ("ontouchstart" in el) {
          let lastTouchCenter = 0;
          let doScale = false;
          let lastDistance = 0;
          //处理touchEvent
          el.ontouchstart = (e) => {
            let volTracker = new VelocityTracker();
            lastTouchCenter = _this.getTouchCenter(e.touches);
            doScale = e.touches.length >= 2;
            if (doScale) {
              lastDistance = _this.getTouchDistance(e.touches);
            }
            el.ontouchmove = (e) => {
              volTracker.addMotionEvent(e);
              let currentTouchCenter = _this.getTouchCenter(e.touches);
              if (doScale) {
                let currentDistance = _this.getTouchDistance(e.touches);
                let changedFactor = (currentDistance - lastDistance) / lastDistance;
                let targetScaleFactor = currentDistance * _this.scaleFactor/lastDistance;
                lastDistance = currentDistance;
                //限制缩放边界
                if (targetScaleFactor < 1) {
                  targetScaleFactor = 1;
                } else if (targetScaleFactor > 5) {
                  targetScaleFactor = 5;
                }
                let containerRect = _this.$refs.zoomContainer.getBoundingClientRect();
                let mouseX = lastTouchCenter.x - containerRect.left;
                let mouseY = lastTouchCenter.y - containerRect.top;
                //计算当前鼠标位置相对于原始图片的位置
                let mouseXForOrigin = mouseX / _this.scaleFactor - _this.offsetX;
                let mouseYForOrigin = mouseY / _this.scaleFactor - _this.offsetY;
                let offsetX =
                  -(mouseXForOrigin * targetScaleFactor - mouseX) /
                  targetScaleFactor;
                let offsetY =
                  -(mouseYForOrigin * targetScaleFactor - mouseY) /
                  targetScaleFactor;

                //缩小时判断边界
                if (changedFactor < 0) {
                  offsetX = _this.checkBoundary(
                    offsetX,
                    containerRect.width,
                    targetScaleFactor
                  );
                  offsetY = _this.checkBoundary(
                    offsetY,
                    containerRect.height,
                    targetScaleFactor
                  );
                }
                _this.offsetX = offsetX;
                _this.offsetY = offsetY;
                _this.scaleFactor = targetScaleFactor;
              }
              let offsetX =
                _this.offsetX +
                (currentTouchCenter.x - lastTouchCenter.x) / _this.scaleFactor;
              let offsetY =
                _this.offsetY +
                (currentTouchCenter.y - lastTouchCenter.y) / _this.scaleFactor;
              lastTouchCenter = currentTouchCenter;
              let containerRect = _this.$refs.zoomContainer.getBoundingClientRect();

              _this.offsetX = _this.checkBoundary(
                offsetX,
                containerRect.width,
                _this.scaleFactor
              );
              _this.offsetY = _this.checkBoundary(
                offsetY,
                containerRect.height,
                _this.scaleFactor
              );
              return false;
            };
            el.ontouchend = (e) => {
              if (e.touches.length == 0) {
                el.ontouchmove = null;
                el.ontouchend = null;
                console.log(volTracker.getVelocityX());
              } else {
                lastTouchCenter = _this.getTouchCenter(e.touches);
                doScale = e.touches.length > 2;
                if (doScale) {
                  lastDistance = _this.getTouchDistance(e.touches);
                }
              }
            };
          };
        } else {
          //处理mouseEvent
          let lastMouseX = 0;
          let lastMouseY = 0;
          el.onmousedown = (e) => {
            e.stopPropagation();
            e.preventDefault();
            lastMouseX = e.pageX;
            lastMouseY = e.pageY;
            document.onmousemove = (e) => {
              const currentMouseX = e.pageX;
              const currentMouseY = e.pageY;

              let offsetX = _this.offsetX + (currentMouseX - lastMouseX) / _this.scaleFactor;
              let offsetY = _this.offsetY + (currentMouseY - lastMouseY) / _this.scaleFactor;
              lastMouseX = currentMouseX;
              lastMouseY = currentMouseY;
              let containerRect = _this.$refs.zoomContainer.getBoundingClientRect();

              _this.offsetX = _this.checkBoundary(
                offsetX,
                containerRect.width,
                _this.scaleFactor
              );
              _this.offsetY = _this.checkBoundary(
                offsetY,
                containerRect.height,
                _this.scaleFactor
              );
            };
            document.onmouseup = () => {
              document.onmousemove = null;
              document.onmouseup = null;
            };
          };
        }
      },
    },
  },
};
</script>
<style scoped>
.zoom-container {
  overflow: hidden;
  width: 100%;
  height: 100%;
}
.zoom-block {
  overflow: hidden;
  width: 100%;
  height: 100%;
}
</style>