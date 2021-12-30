<template>
  <q-page class="q-pa-sm">

    <table-basic :columns="this.$store.state.file_transfers.columns"
                 :rows="this.$store.state.file_transfers.rows.value"
                 :loading="loading"
                 @filter="getFilterFromChild"/>
  </q-page>
</template>


<script>
import axios from 'axios'
import _ from "lodash";
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
  name: 'FileTransfers',
  components: {
    TableBasic: defineAsyncComponent(() => import('components/tables/TableBasic'))
  },
  data() {
    return {
      intervalId: 0,
      refreshTimer: 50 * 1000,
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
    async getFileTransfers() {
      this.loading = true;
      let discoveryList = process.env.SERVICE_BACKEND_URL.split(",")
      let fileTransfers = [];
      for (let i = 0; i < discoveryList.length; i++) {
        let agentResponses = await apiServiceGet(discoveryList[i] + "/agents/files").then((response) => {
          return response.data.description;
        });

        agentResponses.forEach(agentResponse => {
          agentResponse.description.forEach(fileTransfer => {
            fileTransfer["homePageUrl"] = agentResponse.homePageUrl
            fileTransfer["ip_port"] = agentResponse.ip_port
            fileTransfer["discovery"] = discoveryList[i]

            fileTransfers.push(fileTransfer)
          })
        });
      }

      let activeFileTransfersSorted = _.sortBy(fileTransfers, 'id');
      this.$store.state.file_transfers.rows.value = activeFileTransfersSorted;
      this.loading = false;
    },
    getNextUpdate() {
      return this.countdownTimer / 1000
    },
    clearDataFromTheTable() {
      this.$store.state.file_transfers.rows.value = [];
    },
    showDialog() {
      this.dialog = true;
    },
    getFilterFromChild(filter) {
      this.$store.state.file_transfers.filter = filter;
    },
    startTimer() {
      this.intervalId = setInterval(() => {
        this.countdownTimer = (this.countdownTimer / 1000 - 1) * 1000;
        if (this.countdownTimer / 1000 < 0) {
          this.countdownTimer = this.refreshTimer
          this.getFileTransfers()
        }
      }, 1000)
    }
  },
  beforeUnmount() {
    clearInterval(this.intervalId)
  },
  mounted() {
    this.countdownTimer = this.refreshTimer
    this.getFileTransfers()
    this.startTimer()
    this.$nextTick(() => {
    });
  },
  setup() {
    return {}
  },
})
</script>
