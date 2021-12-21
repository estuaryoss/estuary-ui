<template>
  <q-page class="q-pa-sm">

    <table-basic ref="results" :columns="this.$store.state.commands.columns"
                 :rows="this.$store.state.commands.rows"
                 :loading="loading"
                 @filter="getFilterFromChild"/>
  </q-page>
</template>


<script>
import axios from 'axios'
import {defineAsyncComponent, defineComponent} from 'vue'
import _ from "lodash";


const api = axios.create({baseURL: process.env.SERVICE_BACKEND_URL})

async function apiServiceGet(url) {
  return await api.get(url, {
    auth: {
      username: process.env.SERVICE_USERNAME,
      password: process.env.SERVICE_PASSWORD
    }
  });
}

export default defineComponent({
  name: 'Commands',
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
    async getCommands() {
      let discovery_list = process.env.SERVICE_BACKEND_URL.split(",")
      let commands = [];
      for (let i = 0; i < discovery_list.length; i++) {
        let agentResponses = await apiServiceGet(discovery_list[i] + "/agents/commands").then((response) => {
          return response.data.description;
        });
        commands = commands.concat(agentResponses[i].description)
      }

      let commandsSorted = _.sortBy(commands, 'id');
      this.$store.state.commands.rows = commandsSorted;
    },
    getNextUpdate() {
      return this.countdownTimer / 1000
    },
    clearDataFromTheTable() {
      this.$store.state.commands.rows = [];
    },
    showDialog() {
      this.dialog = true;
    },
    getFilterFromChild(filter) {
      this.$store.state.commands.filter = filter;
    },
    startTimer() {
      this.intervalId = setInterval(() => {
        this.countdownTimer = (this.countdownTimer / 1000 - 1) * 1000;
        if (this.countdownTimer / 1000 < 0) {
          this.countdownTimer = this.refreshTimer
          this.getCommands()
        }
      }, 1000)
    }
  },
  beforeUnmount() {
    clearInterval(this.intervalId)
  },
  mounted() {
    this.countdownTimer = this.refreshTimer
    this.getCommands()
    this.startTimer()
    this.$nextTick(() => {
    });
  },
  setup() {
    return {}
  },
})
</script>
