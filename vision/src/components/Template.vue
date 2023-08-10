<template>
  <div class="com-container">
    <div class="com-chart" ref="_ref"></div>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  data() {
    return {
      chartInstance: null,
      allData: null,
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
      this.chartInstance = this.$echarts.init(this.$refs._ref, this.theme);
      const option = {};
      this.chartInstance.setOption(option);
    },
    getData(ret) {
      this.allData = ret;
      this.updateChart();
    },
    updateChart() {
      const option = {};
      this.chartInstance.setOption(option);
    },
    screenAdapter() {
      const titleFontSize = (this.$refs._ref.offsetWidth / 100) * 3.6;
      const option = {};
      this.chartInstance.setOption(option);
      this.chartInstance.resize();
    },
  },
  created() {
    this.$socket.registerCallback("Data", this.getData);
  },
  mounted() {
    this.initChart();
    this.$socket.send({
      action: "getData",
      socketType: "Data",
      chartName: "",
    });
    window.addEventListener("resize", this.screenAdapter);
    this.screenAdapter();
  },
  beforeDestroy() {
    this.$socket.registerCallback("Data");
  },
};
</script>

<style>
</style>