<template>
  <div class="com-container">
    <div class="com-chart" ref="hot_ref"></div>
    <i class="el-icon-arrow-left" @click="toLeft"></i>
    <i class="el-icon-arrow-right" @click="toRight"></i>
    <span class="cate_name" :style="dynamicStyle">{{ cateName }}</span>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  data() {
    return {
      chartInstance: null,
      allData: null,
      currentIndex: 0,
      titleFontSize: null,
    };
  },
  computed: {
    ...mapState(["theme"]),
    cateName() {
      if (!this.allData) {
        return "";
      }
      return this.allData[this.currentIndex].name;
    },
    dynamicStyle() {
      return {
        fontSize: this.titleFontSize + "px",
      };
    },
  },
  watch: {
    theme() {
      this.chartInstance.dispose();
      this.initChart();
      this.screenAdapter();
      this.updateChart();
    },
  },
  methods: {
    initChart() {
      this.chartInstance = this.$echarts.init(this.$refs.hot_ref, this.theme);
      const option = {
        title: {
          text: "丨热销商品销售金额占比统计",
          top: 20,
          left: 20,
        },
        legend: {
          top: "15%",
          icon: "circle",
        },
        tooltip: {
          formatter(params) {
            let retStr = "";
            params.data.children.forEach((item) => {
              retStr += `${item.name}:${
                Math.floor((item.value / params.value) * 100 * 100) / 100 + "%"
              }</br>`;
            });
            return retStr;
          },
        },
        toolbox: {
          feature: {
            restore: {},
          },
          top: 20,
          right: "10%",
        },
        series: [
          {
            type: "pie",
            label: {
              show: false,
            },
            selectedMode: "mutiple",
          },
        ],
      };
      this.chartInstance.setOption(option);
    },
    getData(ret) {
      this.allData = ret;
      this.updateChart();
    },
    updateChart() {
      const seriesData = this.allData[this.currentIndex].children.map(
        (item) => {
          return {
            name: item.name,
            value: item.value,
            children: item.children,
          };
        }
      );
      const option = {
        series: [
          {
            data: seriesData,
          },
        ],
      };
      this.chartInstance.setOption(option);
    },
    screenAdapter() {
      this.titleFontSize = (this.$refs.hot_ref.offsetWidth / 100) * 3.6;
      const option = {
        title: {
          textStyle: {
            fontSize: this.titleFontSize,
          },
        },
        legend: {
          itemWidth: this.titleFontSize,
          itemHeight: this.titleFontSize,
          itemGap: this.titleFontSize,
          textStyle: {
            fontSize: this.titleFontSize * 0.8,
          },
        },
        toolbox: {
          itemSize: this.titleFontSize * 0.8,
          itemGap: this.titleFontSize * 0.8,
        },
        series: [
          {
            radius: this.titleFontSize * 4.5,
            center: ["50%", "60%"],
          },
        ],
      };
      this.chartInstance.setOption(option);
      this.chartInstance.resize();
    },
    toLeft() {
      this.currentIndex--;
      if (this.currentIndex < 0) {
        this.currentIndex = this.allData.length - 1;
      }
      this.updateChart();
    },
    toRight() {
      this.currentIndex++;
      if (this.currentIndex > this.allData.length - 1) {
        this.currentIndex = 0;
      }
      this.updateChart();
    },
  },
  created() {
    this.$socket.registerCallback("hotData", this.getData);
  },
  mounted() {
    this.initChart();
    this.$socket.send({
      action: "getData",
      socketType: "hotData",
      chartName: "hotproduct",
    });
    window.addEventListener("resize", this.screenAdapter);
    this.screenAdapter();
  },
  beforeDestroy() {
    this.$socket.registerCallback("hotData");
  },
};
</script>

<style lang="less" scoped>
.el-icon-arrow-left,
.el-icon-arrow-right {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
}
.el-icon-arrow-left {
  left: 10%;
}
.el-icon-arrow-right {
  right: 10%;
}
.cate_name {
  position: absolute;
  left: 80%;
  bottom: 20px;
  font-weight: bold;
}
</style>