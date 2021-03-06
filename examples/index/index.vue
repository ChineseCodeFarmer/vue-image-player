<template>
  <div id="app" class="app">
    <image-player
      class="video"
      :imgList="imgList"
      :liveMode="liveMode"
      :liveUrl="liveUrl"
    />
    <button @click="changeMode">{{ mode }}</button>
  </div>
</template>

<script>
export default {
  name: "App",
  data() {
    return {
      imgList: [],
      liveMode: false,
      liveUrl: "",
      mode: "实时模式",
      preloadImg: "",
      liveInterval:0
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
    getQueryVariable(variable) {
      var query = window.location.search.substring(1);
      var vars = query.split("&");
      for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (pair[0] == variable) {
          return pair[1];
        }
      }
      return false;
    },
    changeMode() {
      if (this.liveMode) {
        this.liveMode = false;
        this.mode = "实时模式";
        clearInterval(this.liveInterval);
      } else {
        this.liveMode = true;
        this.mode = "回放模式";
        let i = 0;
       this.liveInterval = setInterval(() => {
          this.liveUrl = this.imgList[i++];
        }, 500);
      }
    },
  },
  created() {
    this.loadImg();
    console.log(this.getQueryVariable("url"));
  },
};
</script>

<style>
.video {
  width: 100%;
  height: calc(100% - 80px);
  margin: 0px auto;
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
