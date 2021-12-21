<template>
  <div>
    <q-card>
      <q-card-section>
        <div ref="piechart" :id="divId" style="height: 300px;"></div>
      </q-card-section>
      <q-resize-observer @resize="onResize"/>
    </q-card>
  </div>
</template>

<script>
import {ref} from 'vue'

export default {
  name: "PieChart",
  props: {
    pieData: [],
    divId: ref('')
  },
  data() {
    return {
      model: false,
      options: {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          top: 'bottom',
          bottom: '5%',
          left: 'center'
        },
        series: [
          {
            name: 'Count',
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['50%', '35%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '40',
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: this.pieData
          }
        ]
      },
      pie_chart: null
    }
  },
  mounted() {
    this.init();
  },
  watch: {
    '$q.dark.isActive': function () {
      this.init();
    }
  },
  methods: {
    init() {
      let pieChart = document.getElementById(this.divId);
      echarts.dispose(pieChart);
      let theme = this.model ? 'dark' : 'light';
      this.pie_chart = echarts.init(pieChart, theme);
      this.pie_chart.setOption(this.options)
    },
    onResize() {
      if (this.pie_chart) {
        this.pie_chart.resize();
      }
    }
  }
}
</script>

<style scoped>
</style>
