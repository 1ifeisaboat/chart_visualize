<template>
  <el-container :style="dynamicStyle">
    <el-header>
      <div>
        <img :src="headerBorderSrc" alt="" />
      </div>
      <span class="logo">
        <img :src="logoSrc" alt="" />
      </span>
      <span class="title">电商平台实时监控系统</span>
      <div class="title-right">
        <img :src="switchSrc" class="switch" @click="handleReverseTheme" />
        <span class="datetime">{{ nowTime }}</span>
      </div>
    </el-header>
    <el-main>
      <el-row :gutter="20">
        <el-col :span="7">
          <div
            id="left-top"
            :class="[fullScreenStatus.trend ? 'fullscreen' : '']"
          >
            <trend-vue ref="trend" :status="fullScreenStatus.trend"></trend-vue>
            <i class="el-icon-full-screen" @click="handleResize('trend')"></i>
          </div>
          <div
            id="left-bottom"
            :class="[fullScreenStatus.seller ? 'fullscreen' : '']"
          >
            <seller-vue ref="seller"></seller-vue>
            <i class="el-icon-full-screen" @click="handleResize('seller')"></i>
          </div>
        </el-col>
        <el-col :span="10">
          <div
            id="middle-top"
            :class="[fullScreenStatus.map ? 'fullscreen' : '']"
          >
            <map-vue ref="map"></map-vue>
            <i class="el-icon-full-screen" @click="handleResize('map')"></i>
          </div>
          <div
            id="middle-bottom"
            :class="[fullScreenStatus.rank ? 'fullscreen' : '']"
          >
            <rank-vue ref="rank"></rank-vue>
            <i class="el-icon-full-screen" @click="handleResize('rank')"></i>
          </div>
        </el-col>
        <el-col :span="7">
          <div
            id="right-top"
            :class="[fullScreenStatus.hot ? 'fullscreen' : '']"
          >
            <hot-vue ref="hot"></hot-vue>
            <i class="el-icon-full-screen" @click="handleResize('hot')"></i>
          </div>
          <div
            id="right-bottom"
            :class="[fullScreenStatus.stock ? 'fullscreen' : '']"
          >
            <stock-vue ref="stock"></stock-vue>
            <i class="el-icon-full-screen" @click="handleResize('stock')"></i>
          </div>
        </el-col>
      </el-row>
    </el-main>
  </el-container>
</template>

<script>
import moment from "moment";
import { mapState } from "vuex";
import getTheme from "../utils/theme_choice";

import SellerVue from "../components/Seller.vue";
import TrendVue from "../components/Trend.vue";
import MapVue from "../components/Map.vue";
import RankVue from "../components/Rank.vue";
import HotVue from "../components/Hot.vue";
import StockVue from "../components/Stock.vue";

export default {
  components: {
    SellerVue,
    TrendVue,
    MapVue,
    RankVue,
    HotVue,
    StockVue,
  },
  data() {
    return {
      nowTime: null,
      timer: null,
      fullScreenStatus: {
        trend: false,
        seller: false,
        map: false,
        rank: false,
        hot: false,
        stock: false,
      },
    };
  },
  computed: {
    ...mapState(["theme"]),
    logoSrc() {
      return "/static/img/" + getTheme(this.theme).logoSrc;
    },
    switchSrc() {
      return "/static/img/" + getTheme(this.theme).switchSrc;
    },
    headerBorderSrc() {
      return "/static/img/" + getTheme(this.theme).headerBorderSrc;
    },
    dynamicStyle() {
      return {
        backgroundColor: getTheme(this.theme).backgroundColor,
        color: getTheme(this.theme).color,
      };
    },
  },
  methods: {
    startInterval() {
      this.timer && clearInterval(this.timer);
      this.timer = setInterval(() => {
        this.nowTime = moment().format("YYYY-MM-DD HH:mm:ss");
      }, 1000);
    },
    handleResize(chartName) {
      this.$socket.send({
        action: "fullScreen",
        socketType: "fullScreen",
        chartName,
        value: !this.fullScreenStatus[chartName],
      });
    },
    recvResize(ret) {
      Object.keys(this.fullScreenStatus).forEach((item) => {
        this.fullScreenStatus[item] = false;
      });
      this.fullScreenStatus[ret.chartName] = ret.value;
      Object.keys(this.fullScreenStatus).forEach((item) => {
        this.$nextTick(() => {
          this.$refs[item].screenAdapter();
        });
      });
    },
    handleReverseTheme() {
      this.$socket.send({
        action: "themeChange",
        socketType: "themeChange",
      });
    },
    recvReverseTheme() {
      this.$store.commit("reverseTheme");
    },
  },
  created() {
    this.$socket.registerCallback("fullScreen", this.recvResize);
    this.$socket.registerCallback("themeChange", this.recvReverseTheme);
  },
  mounted() {
    this.startInterval();
  },
  beforeDestroy() {
    this.$socket.registerCallback("fullScreen");
    this.$socket.registerCallback("themeChange");
  },
};
</script>

<style lang="less" scoped>
.fullscreen {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
  margin: 0 !important;
  z-index: 100;
}
.el-container {
  width: 100%;
  height: 100%;
  padding: 0 20px;
  background-color: #161522;
  color: #fff;
  box-sizing: border-box;
}
.el-header {
  width: 100%;
  height: 64px;
  padding: 0;
  font-size: 20px;
  position: relative;
  > div {
    img {
      width: 100%;
    }
  }
  .title {
    position: absolute;
    left: 50%;
    top: 50%;
    font-size: 20px;
    transform: translate(-50%, -50%);
  }
  .title-right {
    display: flex;
    align-items: center;
    position: absolute;
    right: 0px;
    top: 50%;
    transform: translateY(-80%);
  }
  .switch {
    width: 28px;
    height: 21px;
    cursor: pointer;
  }
  .datetime {
    font-size: 15px;
    margin-left: 10px;
  }
  .logo {
    position: absolute;
    left: 0px;
    top: 50%;
    transform: translateY(-60%);
    img {
      height: 35px;
      width: 128px;
    }
  }
}
.el-main {
  width: 100%;
  height: 100%;
  padding: 5px 0 0;
  margin-top: 10px;
  overflow: hidden;
}
.el-row {
  height: 100%;
}
.el-col {
  height: 100%;
}
#left-top {
  height: 58%;
  position: relative;
}
#left-bottom {
  height: 36%;
  margin-top: 25px;
  position: relative;
}
#middle-top {
  height: 61%;
  position: relative;
}
#middle-bottom {
  height: 33%;
  margin-top: 25px;
  position: relative;
}
#right-top {
  height: 51%;
  position: relative;
}
#right-bottom {
  height: 43%;
  margin-top: 25px;
  position: relative;
}
.el-icon-full-screen {
  position: absolute;
  top: 20px;
  right: 20px;
  cursor: pointer;
}
</style>