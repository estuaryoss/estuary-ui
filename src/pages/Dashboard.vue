<template>
  <q-dialog v-model="alert">
    <q-card>
      <q-card-section>
        <div class="text-h6">Api Error</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        {{ apiResponse }}
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="OK" color="primary" v-close-popup></q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>

  <q-page class="q-pa-sm">
    <card-social icon_position="right"/>

    <q-card class="q-mt-sm">
      <q-card-section class="text-h6 q-pb-none">
        <q-item>
          <q-item-section avatar class="">
            <q-icon color="blue" name="fas fa-chart-line" size="44px"/>
          </q-item-section>

          <q-item-section>
            <div class="text-h6">Stack Stats</div>
          </q-item-section>
        </q-item>
      </q-card-section>
      <q-card-section class="row">
        <q-tooltip class="bg-accent">
          Refresh timer: '{{ refreshTimer / 1000 }}' s. Next update in: '{{ this.getNextUpdate() }}' s
        </q-tooltip>
        <div class="col-lg-9 col-sm-12 col-xs-12 col-md-9">
          <div class="row">
            <div class="col-lg-3 col-md-3 col-xs-6 col-sm-6">
              <q-item>
                <q-item-section top avatar>
                  <q-avatar color="grey-8" text-color="white"/>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-h6 text-blue text-bold">
                    {{ this.$store.state.dashboard.totalRunningCommands }}
                  </q-item-label>
                  <q-item-label caption>Total Commands (running)</q-item-label>
                </q-item-section>
              </q-item>
            </div>
            <div class="col-lg-3 col-md-3 col-xs-6 col-sm-6">
              <q-item>
                <q-item-section top avatar>
                  <q-avatar color="grey-8" text-color="white"/>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-h6 text-grey-8 text-bold">
                    {{ this.$store.state.dashboard.totalFinishedCommands }}
                  </q-item-label>
                  <q-item-label caption>Total Commands (finished)</q-item-label>
                </q-item-section>
              </q-item>
            </div>

            <div class="col-lg-3 col-md-3 col-xs-6 col-sm-6">
              <q-item>
                <q-item-section top avatar>
                  <q-avatar color="green" text-color="white"/>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-h6 text-grey-8 text-bold">
                    {{ this.$store.state.dashboard.finishedCommandsSuccess }}
                  </q-item-label>
                  <q-item-label caption>Commands Success (finished)</q-item-label>
                </q-item-section>
              </q-item>
            </div>

            <div class="col-lg-3 col-md-3 col-xs-6 col-sm-6">
              <q-item>
                <q-item-section top avatar>
                  <q-avatar color="red" text-color="white"/>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-h6 text-grey-8 text-bold">
                    {{ this.$store.state.dashboard.finishedCommandsFailure }}
                  </q-item-label>
                  <q-item-label caption>Commands Failed (finished)</q-item-label>
                </q-item-section>
              </q-item>
            </div>
            <div class="col-lg-3 col-md-3 col-xs-6 col-sm-6">
              <q-item>
                <q-item-section top avatar>
                  <q-avatar color="grey-8" text-color="white"/>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-h6 text-green-6 text-bold">
                    {{ this.$store.state.dashboard.totalFileTransfers }}
                  </q-item-label>
                  <q-item-label caption>Total File Transfers</q-item-label>
                </q-item-section>
              </q-item>
            </div>

            <div class="col-lg-3 col-md-3 col-xs-6 col-sm-6">
              <q-item>
                <q-item-section top avatar>
                  <q-avatar color="orange-4" text-color="white"/>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-h6 text-green-6 text-bold">
                    {{ this.$store.state.dashboard.fileTransfersDownloads }}
                  </q-item-label>
                  <q-item-label caption>File Transfers (downloads)</q-item-label>
                </q-item-section>
              </q-item>
            </div>

            <div class="col-lg-3 col-md-3 col-xs-6 col-sm-6">
              <q-item>
                <q-item-section top avatar>
                  <q-avatar color="orange-4" text-color="white"/>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-h6 text-green-6 text-bold">
                    {{ this.$store.state.dashboard.fileTransfersUploads }}
                  </q-item-label>
                  <q-item-label caption>File Transfers (uploads)</q-item-label>
                </q-item-section>
              </q-item>
            </div>

          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import {defineAsyncComponent, defineComponent} from 'vue'

import axios from 'axios'
import _ from 'lodash'


async function apiServiceGet(url) {
  return axios({
    method: 'get',
    url: url,
    auth: {
      username: process.env.SERVICE_USERNAME,
      password: process.env.SERVICE_PASSWORD
    }
  });
}

export default defineComponent({
  name: "Dashboard",
  components: {
    CardSocial: defineAsyncComponent(() => import("components/cards/CardSocial"))
  },
  setup() {
    return {
      intervalId: 0,
      refreshTimer: 30 * 1000,
      countdownTimer: 0,
      dialog: false,
      alert: false,
      apiResponse: null
    }
  },
  mounted() {
    this.countdownTimer = this.refreshTimer
    this.startTimer();
    this.init();
  },
  beforeUnmount() {
    clearInterval(this.intervalId)
  },
  methods: {
    setCardDetails() {
      this.$store.state.dashboard.cardDetails = [
        {
          title: "Eureka App (s)",
          icon: "fas fa-chart-bar",
          value: this.$store.state.dashboard.eurekaApps.length,
          color1: "#3a9688",
          color2: "#3e51b5"
        },
        {
          title: "Agents (s)",
          icon: "fas fa-chart-bar",
          value: this.loadAppsByType("agent").length,
          color1: "#3a9688",
          color2: "#3e51b5"
        },
        {
          title: "Discovery (s)",
          icon: "fas fa-chart-bar",
          value: this.loadAppsByType("discovery").length,
          color1: "#3a9688",
          color2: "#3e51b5"
        }
      ]
    },
    loadAppsByType(appName) {
      let apps = [];
      for (let i = 0; i < this.$store.state.dashboard.eurekaApps.length; i++) {
        if (this.$store.state.dashboard.eurekaApps[i].app.includes(appName)) {
          apps.push(this.$store.state.dashboard.eurekaApps[i]);
        }
      }

      return apps;
    },
    async getEurekaApps() {
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
      this.$store.state.dashboard.eurekaApps = activeEurekaAppsSorted;
    },
    async setTotalFileTransfers() {
      let discovery_list = process.env.SERVICE_BACKEND_URL.split(",")
      let totalFileTransfers = 0;
      let fileTransfersDownloads = 0;
      let fileTransfersUploads = 0;
      for (let i = 0; i < discovery_list.length; i++) {
        let agentResponses = await apiServiceGet(discovery_list[i] + "/agents/files").then((response) => {
          return response.data.description;
        });
        for (let j = 0; j < agentResponses.length; j++) {
          totalFileTransfers = totalFileTransfers + agentResponses[j].description.length;
          fileTransfersDownloads = fileTransfersDownloads + agentResponses[j].description.filter(el => el.type === 'download').length
          fileTransfersUploads = fileTransfersUploads + agentResponses[j].description.filter(el => el.type === 'upload').length
        }
      }
      this.$store.state.dashboard.totalFileTransfers = totalFileTransfers;
      this.$store.state.dashboard.fileTransfersDownloads = fileTransfersDownloads;
      this.$store.state.dashboard.fileTransfersUploads = fileTransfersUploads;
    },

    async setTotalRunningCommands() {
      let discovery_list = process.env.SERVICE_BACKEND_URL.split(",")
      let totalCommands = 0;
      for (let i = 0; i < discovery_list.length; i++) {
        let agentResponses = await apiServiceGet(discovery_list[i] + "/agents/commands/running").then((response) => {
          return response.data.description;
        });
        for (let j = 0; j < agentResponses.length; j++) {
          totalCommands = totalCommands + agentResponses[j].description.length;
        }
      }
      this.$store.state.dashboard.totalRunningCommands = totalCommands;
    },

    async setTotalFinishedCommands() {
      let discovery_list = process.env.SERVICE_BACKEND_URL.split(",")
      let totalCommands = 0;
      let finishedCommandsSuccess = 0;
      let finishedCommandsFailure = 0;
      for (let i = 0; i < discovery_list.length; i++) {
        let agentResponses = await apiServiceGet(discovery_list[i] + "/agents/commands/finished").then((response) => {
          return response.data.description;
        });
        for (let j = 0; j < agentResponses.length; j++) {
          totalCommands = totalCommands + agentResponses[j].description.length;
          finishedCommandsSuccess = finishedCommandsSuccess + agentResponses[j].description.filter(el => el.code == 0).length
          finishedCommandsFailure = finishedCommandsFailure + agentResponses[j].description.filter(el => el.code != 0).length
        }
      }
      this.$store.state.dashboard.totalFinishedCommands = totalCommands;
      this.$store.state.dashboard.finishedCommandsSuccess = finishedCommandsSuccess;
      this.$store.state.dashboard.finishedCommandsFailure = finishedCommandsFailure;
    },
    getNextUpdate() {
      return this.countdownTimer / 1000
    },
    startTimer() {
      this.intervalId = setInterval(() => {
        this.countdownTimer = (this.countdownTimer / 1000 - 1) * 1000;
        if (this.countdownTimer / 1000 < 0) {
          this.countdownTimer = this.refreshTimer
          this.init();
        }
      }, 1000)
    },
    async init() {
      await this.getEurekaApps();
      this.setCardDetails();
      await this.setTotalFileTransfers();
      await this.setTotalRunningCommands();
      await this.setTotalFinishedCommands();
    }
  }
})
</script>

<style scoped></style>
