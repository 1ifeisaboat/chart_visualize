<template>
  <div class="com-container">
    <div class="com-chart" ref="stock_ref"></div>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  data() {
    return {
      chartInstance: null,
      allData: null,
      currentIndex: 1,
      totalIndex: null,
      timer: null,
    };
  },
  computed: {
    ...mapState(["theme"]),
    dynamicColor() {
      return this.theme === "chalk" ? "#333843" : "#ccc";
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
      this.chartInstance = this.$echarts.init(this.$refs.stock_ref, this.theme);
      const option = {
        title: {
          text: "丨库存销售量",
          top: 20,
          left: 20,
        },
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
      this.totalIndex =
        this.allData.length % 5 === 0
          ? this.allData.length / 5
          : this.allData.length / 5 + 1;
      this.updateChart();
      this.startInterval();
    },
    updateChart() {
      const centerPointers = [
        ["18%", "40%"],
        ["50%", "40%"],
        ["82%", "40%"],
        ["34%", "75%"],
        ["66%", "75%"],
      ];
      const colorArrs = [
        ["#4FF778", "#0BA82C"],
        ["#E5DD45", "#E8B11C"],
        ["#E8821C", "#E55445"],
        ["#AB6EE5", "#5052EE"],
        ["#23E5E5", "#2E72BF"],
      ];
      const startVal = (this.currentIndex - 1) * 5;
      const endVal = this.currentIndex * 5;
      const showData = this.allData.slice(startVal, endVal);
      const seriesArr = showData.map((item, index) => {
        return {
          center: centerPointers[index],
          hoverAnimation: false,
          label: {
            position: "center",
            fontWeight: "bold",
            color:
              this.theme === "chalk"
                ? colorArrs[index][0]
                : colorArrs[index][1],
          },
          data: [
            {
              name: item.name + "\n\n" + item.sales,
              value: item.stock,
              itemStyle: {
                color: new this.$echarts.graphic.LinearGradient(0, 1, 0, 0, [
                  {
                    offset: 0,
                    color: colorArrs[index][0],
                  },
                  {
                    offset: 1,
                    color: colorArrs[index][1],
                  },
                ]),
              },
            },
            {
              value: item.sales,
              itemStyle: {
                color: this.dynamicColor,
              },
            },
          ],
        };
      });
      const option = {
        series: seriesArr,
      };
      this.chartInstance.setOption(option);
    },
    screenAdapter() {
      const titleFontSize = (this.$refs.stock_ref.offsetWidth / 100) * 3.6;
      const innerRadius = titleFontSize * 2.5;
      const outerRadius = innerRadius * 1.25;
      const seriesObj = {
        type: "pie",
        radius: [outerRadius, innerRadius],
        label: {
          fontSize: titleFontSize * 0.7,
        },
      };
      const option = {
        title: {
          textStyle: {
            fontSize: titleFontSize,
          },
        },
        series: [seriesObj, seriesObj, seriesObj, seriesObj, seriesObj],
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
    this.$socket.registerCallback("stockData", this.getData);
  },
  mounted() {
    this.initChart();
    this.$socket.send({
      action: "getData",
      socketType: "stockData",
      chartName: "stock",
    });
    window.addEventListener("resize", this.screenAdapter);
    this.screenAdapter();
  },
  beforeDestroy() {
    this.$socket.registerCallback("stockData");
    clearInterval(this.timer);
  },
};
</script>

<style>
</style>