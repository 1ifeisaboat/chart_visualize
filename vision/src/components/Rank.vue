<template>
  <div class="com-container">
    <div class="com-chart" ref="rank_ref"></div>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  data() {
    return {
      chartInstance: null,
      allData: null,
      startValue: 0,
      endValue: 9,
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
      this.chartInstance = this.$echarts.init(this.$refs.rank_ref, this.theme);
      const colorArr = [
        ["#0BA82C", "#4FF778"],
        ["#2E72BF", "#23E5E5"],
        ["#5052EE", "#AB6EE5"],
      ];
      const option = {
        title: {
          text: "丨地区销量趋势",
          left: 20,
          top: 20,
        },
        grid: {
          top: "40%",
          left: "5%",
          right: "5%",
          bottom: "5%",
          containLabel: true,
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "shadow",
          },
        },
        xAxis: {
          type: "category",
        },
        yAxis: {
          type: "value",
          name: "销售金额（万）",
        },
        series: [
          {
            type: "bar",
            itemStyle: {
              color: (arg) => {
                let targetColor = null;
                if (arg.data > 300) {
                  targetColor = colorArr[0];
                } else if (arg.data > 200) {
                  targetColor = colorArr[1];
                } else {
                  targetColor = colorArr[2];
                }
                return new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  {
                    offset: 0,
                    color: targetColor[0],
                  },
                  {
                    offset: 1,
                    color: targetColor[1],
                  },
                ]);
              },
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
      this.allData.sort((a, b) => b.value - a.value);
      this.updateChart();
      this.startInterval();
    },
    updateChart() {
      const provinceName = this.allData.map((item) => item.name);
      const rankValue = this.allData.map((item) => item.value);
      const option = {
        xAxis: {
          data: provinceName,
        },
        dataZoom: {
          show: false,
          startValue: this.startValue,
          endValue: this.endValue,
        },
        series: [
          {
            data: rankValue,
          },
        ],
      };
      this.chartInstance.setOption(option);
    },
    screenAdapter() {
      const titleFontSize = (this.$refs.rank_ref.offsetWidth / 100) * 3.6;
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
              barBorderRadius: [titleFontSize * 0.8, titleFontSize * 0.8, 0, 0],
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
        this.startValue++;
        this.endValue++;
        if (this.endValue >= this.allData.length) {
          this.startValue = 0;
          this.endValue = 9;
        }
        this.updateChart();
      }, 3000);
    },
  },
  created() {
    this.$socket.registerCallback("rankData", this.getData);
  },
  mounted() {
    this.initChart();
    this.$socket.send({
      action: "getData",
      socketType: "rankData",
      chartName: "rank",
    });
    window.addEventListener("resize", this.screenAdapter);
    this.screenAdapter();
  },
  beforeDestroy() {
    this.$socket.registerCallback("rankData");
    clearInterval(this.timer);
  },
};
</script>

<style>
</style>