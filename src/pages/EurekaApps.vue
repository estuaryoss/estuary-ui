<template>
  <q-page class="q-pa-sm">
    <q-bar>
      <q-btn no-caps type="submit" color="primary" label="Get EurekaApps" @click="getEurekaApps">
        <q-tooltip class="bg-accent">Refresh manually the Eureka Apps
        </q-tooltip>
      </q-btn>
    </q-bar>

    <table-basic :columns="this.$store.state.eureka_apps.columns"
                 :rows="this.$store.state.eureka_apps.rows.value"
                 :loading="loading"
                 @filter="getFilterFromChild"/>
  </q-page>
</template>


<script>
import axios from 'axios'
import _ from 'lodash'

import {defineAsyncComponent, defineComponent} from 'vue'


async function apiServiceGet(url) {
  return axios({
    method: 'GET',
    url: url,
    auth: {
      username: process.env.SERVICE_USERNAME,
      password: process.env.SERVICE_PASSWORD
    }
  });
}

export default defineComponent({
  name: 'EurekaApps',
  components: {
    TableBasic: defineAsyncComponent(() => import('components/tables/TableBasic'))
  },
  data() {
    return {
      intervalId: 0,
      refreshTimer: 30 * 1000,
      countdownTimer: 0,
      toggleButton: 'off',
      dialog: false,
      maximizedToggle: false,
      alert: false,
      apiResponse: null,
      loading: false
    }
  },
  methods: {
    async getEurekaApps() {
      this.loading = true;

      let discovery_list = process.env.SERVICE_BACKEND_URL.split(",")
      let activeEurekaApps = [];
      for (let i = 0; i < discovery_list.length; i++) {
        let eurekaAppsList = await apiServiceGet(discovery_list[i] + "/eureka/apps").then((response) => {
          if (undefined == response) {
            return {};
          }
          if (typeof response.data.description !== 'object') {
            return {};
          }
          return response.data.description;
        });
        let eureka_apps_keys = Object.keys(eurekaAppsList);
        for (let j = 0; j < eureka_apps_keys.length; j++) {
          for (let k = 0; k < eurekaAppsList[eureka_apps_keys[j]].length; k++) {
            activeEurekaApps.push(eurekaAppsList[eureka_apps_keys[j]][k]);
          }
        }
      }
      activeEurekaApps.map(el => el.metadata = JSON.stringify(el.metadata));
      let activeEurekaAppsSorted = _.sortBy(activeEurekaApps, 'app');
      this.$store.state.eureka_apps.rows.value = activeEurekaAppsSorted;

      this.loading = false
    },
    getNextUpdate() {
      return this.countdownTimer / 1000
    },
    clearDataFromTheTable() {
      this.$store.state.eureka_apps.rows.value = [];
    },
    showDialog() {
      this.dialog = true;
    },
    getFilterFromChild(filter) {
      this.$store.state.eureka_apps.filter = filter;
    },
    startTimer() {
      this.intervalId = setInterval(() => {
        this.countdownTimer = (this.countdownTimer / 1000 - 1) * 1000;
        if (this.countdownTimer / 1000 < 0) {
          this.countdownTimer = this.refreshTimer
          this.getEurekaApps()
        }
      }, 1000)
    }
  },
  beforeUnmount() {
    clearInterval(this.intervalId)
  },
  mounted() {
    this.countdownTimer = this.refreshTimer
    this.getEurekaApps()
    this.startTimer()
    this.$nextTick(() => {
    });
  },
  setup() {
    return {}
  },
})
</script>
