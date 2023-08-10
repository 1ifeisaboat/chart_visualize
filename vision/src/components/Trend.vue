<template>
  <div class="com-container">
    <div class="menu">
      <el-dropdown
        trigger="click"
        v-show="!status"
        size="mini"
        placement="right"
      >
        <span class="el-dropdown-link" :style="dynamicStyle">
          {{ "丨" + selectedTitle
          }}<i class="el-icon-arrow-right el-icon--right"></i>
        </span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item
            v-for="item in selectTypes"
            :key="item.key"
            @click.native="handleSelect(item.key)"
            >{{ item.text }}</el-dropdown-item
          >
        </el-dropdown-menu>
      </el-dropdown>
      <el-dropdown trigger="click" v-show="status" placement="right">
        <span class="el-dropdown-link" :style="dynamicStyle">
          {{ "丨" + selectedTitle
          }}<i class="el-icon-arrow-right el-icon--right"></i>
        </span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item
            v-for="item in selectTypes"
            :key="item.key"
            @click.native="handleSelect(item.key)"
            >{{ item.text }}</el-dropdown-item
          >
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <div class="com-chart" ref="trend_ref"></div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import getTheme from "../utils/theme_choice";
export default {
  props: ["status"],
  data() {
    return {
      chartInstance: null,
      allData: null,
      currentType: "commodity",
      titleFontSize: null,
    };
  },
  computed: {
    ...mapState(["theme"]),
    selectTypes() {
      if (!this.allData || !this.allData.type) {
        return "";
      }
      return this.allData.type.filter((item) => item.key !== this.currentType);
    },
    selectedTitle() {
      if (!this.allData || !this.allData.type) {
        return "";
      }
      return this.allData[this.currentType].title;
    },
    dynamicStyle() {
      return {
        fontSize: this.titleFontSize + "px",
        color: getTheme(this.theme).color,
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
      this.chartInstance = this.$echarts.init(this.$refs.trend_ref, this.theme);
      const option = {
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross",
          },
        },
        grid: {
          top: "30%",
          left: "3%",
          right: "4%",
          bottom: "1%",
          containLabel: true,
        },
        legend: {
          top: "15%",
          left: 30,
          icon: "circle",
        },
        toolbox: {
          feature: {
            magicType: { type: ["tiled", "stack"] },
          },
          top: 20,
          right: "10%",
        },
        xAxis: {
          type: "category",
          boundaryGap: false,
        },
        yAxis: {
          type: "value",
          name: "单位：万",
        },
      };
      this.chartInstance.setOption(option);
    },
    getData(ret) {
      this.allData = ret;
      this.updateChart();
    },
    updateChart() {
      const colorArr1 = [
        "rgba(11, 168, 44, 0.5)",
        "rgba(44, 110, 255, 0.5)",
        "rgba(22, 242, 217, 0.5)",
        "rgba(254, 33, 30, 0.5)",
        "rgba(250, 105, 0, 0.5)",
      ];
      const colorArr2 = [
        "rgba(11, 168, 44, 0)",
        "rgba(44, 110, 255, 0)",
        "rgba(22, 242, 217, 0)",
        "rgba(254, 33, 30, 0)",
        "rgba(250, 105, 0, 0)",
      ];
      const monthData = this.allData.common.month;
      const seriesArr = this.allData[this.currentType].data.map(
        (item, index) => {
          return {
            type: "line",
            name: item.name,
            data: item.data,
            stack: this.currentType,
            areaStyle: {
              color: new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: colorArr1[index],
                },
                {
                  offset: 1,
                  color: colorArr2[index],
                },
              ]),
            },
          };
        }
      );
      const option = {
        xAxis: {
          data: monthData,
        },
        series: seriesArr,
      };
      this.chartInstance.setOption(option);
    },
    screenAdapter() {
      this.titleFontSize = (this.$refs.trend_ref.offsetWidth / 100) * 3.6;
      const option = {
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
      };
      this.chartInstance.setOption(option);
      this.chartInstance.resize();
    },
    handleSelect(key) {
      this.currentType = key;
      this.updateChart();
    },
  },
  created() {
    this.$socket.registerCallback("trendData", this.getData);
  },
  mounted() {
    this.initChart();
    this.$socket.send({
      action: "getData",
      socketType: "trendData",
      chartName: "trend",
    });

    window.addEventListener("resize", this.screenAdapter);
    this.screenAdapter();
  },
  beforeDestroy() {
    this.$socket.registerCallback("trendData");
  },
};
</script>

<style lang="less" scoped>
.menu {
  position: absolute;
  top: 20px;
  left: 25px;
  z-index: 1;
  font-weight: bolder;
}
.el-dropdown-link {
  cursor: pointer;
  color: #fff;
}
</style>