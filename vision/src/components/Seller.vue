<template>
  <div class="com-container">
    <div class="com-chart" ref="seller_ref"></div>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  data() {
    return {
      chartInstance: null,
      allData: null,
      totalIndex: null,
      currentIndex: 1,
      timer: null,
    };
  },
  computed: {
    ...mapState(["theme"]),
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
      this.chartInstance = this.$echarts.init(this.$refs.seller_ref, this.theme);
      const option = {
        title: {
          text: "丨商品销量排行",
          top: 20,
          left: 20,
        },
        grid: {
          top: "20%",
          left: "3%",
          right: "6%",
          bottom: "3%",
          containLabel: true,
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "shadow",
          },
        },
        xAxis: {
          type: "value",
        },
        yAxis: {
          type: "category",
        },
        series: [
          {
            type: "bar",
            itemStyle: {
              color: new this.$echarts.graphic.LinearGradient(0, 0, 1, 0, [
                {
                  offset: 0,
                  color: "#5052EE",
                },
                {
                  offset: 1,
                  color: "#AB6EE5",
                },
              ]),
            },
          },
        ],
      };
      this.chartInstance.setOption(option);
      this.chartInstance.on("mouseover", () => {
        clearInterval(this.timer);
      });
      this.chartInstance.on("mouseout", () => {
        this.startInterval();
      });
    },
    getData(ret) {
      this.allData = ret;
      this.allData.sort((a, b) => a.value - b.value);
      this.totalIndex =
        this.allData.length % 5 === 0
          ? this.allData.length / 5
          : this.allData.length / 5 + 1;
      this.updateChart();
      this.startInterval();
    },
    updateChart() {
      const startVal = (this.currentIndex - 1) * 5;
      const endVal = this.currentIndex * 5;
      const showData = this.allData.slice(startVal, endVal);
      const sellerName = showData.map((item) => item.name);
      const sellerValue = showData.map((item) => item.value);
      const option = {
        yAxis: {
          data: sellerName,
        },
        series: [
          {
            data: sellerValue,
          },
        ],
      };
      this.chartInstance.setOption(option);
    },
    screenAdapter() {
      const titleFontSize = (this.$refs.seller_ref.offsetWidth / 100) * 3.6;
      const option = {
        title: {
          textStyle: {
            fontSize: titleFontSize,
          },
        },
        series: [
          {
            barWidth: titleFontSize * 1.15,
            itemStyle: {
              barBorderRadius: [0, titleFontSize * 0.8, titleFontSize * 0.8, 0],
            },
          },
        ],
      };
      this.chartInstance.setOption(option);
      this.chartInstance.resize();
    },
    startInterval() {
      this.timer && clearInterval(this.timer);
      this.timer = setInterval(() => {
        this.currentIndex++;
        if (this.currentIndex > this.totalIndex) {
          this.currentIndex = 1;
        }
        this.updateChart();
      }, 3000);
    },
  },
  created() {
    this.$socket.registerCallback("sellerData", this.getData);
  },
  mounted() {
    this.initChart();
    this.$socket.send({
      action: "getData",
      socketType: "sellerData",
      chartName: "seller",
    });
    window.addEventListener("resize", this.screenAdapter);
    this.screenAdapter();
  },
  beforeDestroy() {
    this.$socket.unRegisterCallback("sellerData");
    removeEventListener("resize", this.screenAdapter);
    clearInterval(this.timer);
  },
};
</script>

<style>
</style>