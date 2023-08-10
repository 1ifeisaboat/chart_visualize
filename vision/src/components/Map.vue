<template>
  <div class="com-container" @dblclick="revertMap">
    <div class="com-chart" ref="map_ref"></div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { getProvinceMapInfo } from "../utils/map_utils";
export default {
  data() {
    return {
      chartInstance: null,
      allData: null,
      mapList: {},
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
    async initChart() {
      this.chartInstance = this.$echarts.init(this.$refs.map_ref, this.theme);
      try {
        const { data: ret } = await this.$http.get(
          "http://localhost:9002/static/map/china.json"
        );
        this.$echarts.registerMap("china", ret);
        const option = {
          title: {
            text: "丨商家分布",
            top: 20,
            left: 20,
          },
          geo: {
            type: "map",
            map: "china",
            top: "5%",
            bottom: "5%",
            itemStyle: {
              areaColor: "#2E72BF",
              borderColor: "#333",
            },
          },
          legend: {
            left: "5%",
            bottom: "5%",
            orient: "vertical",
          },
          tooltip: {
            formatter: "{b0}: {c0}",
          },
        };
        this.chartInstance.setOption(option);
      } catch (error) {
        console.error(new Error(error));
      }
      this.chartInstance.on("click", async (arg) => {
        const { key, path } = getProvinceMapInfo(arg.name);
        if (!key) return;
        try {
          if (!this.mapList[key]) {
            const { data } = await this.$http.get(
              "http://localhost:9002" + path
            );
            this.mapList[key] = data;
            this.$echarts.registerMap(key, data);
          }
          const option = {
            geo: {
              map: key,
            },
          };
          this.chartInstance.setOption(option);
        } catch (error) {
          console.error(new Error(error));
        }
      });
    },
    getData(ret) {
      this.allData = ret;
      this.updateChart();
    },
    updateChart() {
      const legendName = this.allData.map((item) => item.name);
      const seriesArr = this.allData.map((item) => {
        return {
          type: "effectScatter",
          coordinateSystem: "geo",
          rippleEffect: {
            scale: 5,
            brushType: "stroke",
          },
          name: item.name,
          data: item.children,
        };
      });
      const option = {
        legend: {
          data: legendName,
        },
        series: seriesArr,
      };
      this.chartInstance.setOption(option);
    },
    screenAdapter() {
      this.titleFontSize = (this.$refs.map_ref.offsetWidth / 100) * 3.6;
      const option = {};
      this.chartInstance.setOption(option);
      this.chartInstance.resize();
    },
    revertMap() {
      const option = {
        geo: {
          map: "china",
        },
      };
      this.chartInstance.setOption(option);
    },
  },
  created() {
    this.$socket.registerCallback("mapData", this.getData);
  },
  mounted() {
    this.initChart();
    this.$socket.send({
      action: "getData",
      socketType: "mapData",
      chartName: "map",
    });
    window.addEventListener("resize", this.screenAdapter);
    this.screenAdapter();
  },
  beforeDestroy() {
    this.$socket.registerCallback("mapData");
  },
};
</script>

<style>
</style>