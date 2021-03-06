<template>
  <div id="app" class="app">
    <image-player
      ref="video"
      class="video"
      :imgList="imgList"
      :liveMode="false"
      :liveUrl="liveUrl"
      :frameRate="2"
    />
  </div>
</template>

<script>
export default {
  name: "App",

  data() {
    return {
      imgList: [],
      liveUrl: "",
      preloadImg: "",
    };
  },
  methods: {
    loadImg() {
      let imgList = [];
      for (let i = 0; i < 75; i++) {
        imgList.push(require("../imgs/" + (i + 1) + ".jpg"));
      }
      this.imgList = imgList;
    },
  },
  created() {
    this.loadImg();
  },
};
</script>

<style>
.video {
  width: 100%;
  height: 100%;
  margin: 0px auto;
  overflow: hidden;
}
.app {
  width: 100%;
  height: 100%;
}
html,
body {
  margin: 0;
  height: 100%;
  width: 100%;
}
</style>
