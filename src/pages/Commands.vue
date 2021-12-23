<template>
  <q-page class="q-pa-sm">

    <q-dialog v-model="alert">
      <q-card>
        <q-card-section>
          <div class="text-h6">Api Response</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          {{ apiResponse }}
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="OK" color="primary" v-close-popup></q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <table-basic :columns="this.$store.state.commands.columns"
                 :rows="this.$store.state.commands.rows"
                 :loading="loading"
                 @filter="getFilterFromChild"
                 @apiResponseAgent="getAgentApiResponseFromChild"/>
  </q-page>
</template>


<script>
import axios from 'axios'
import {defineAsyncComponent, defineComponent} from 'vue'
import _ from "lodash";

async function apiServiceGet(url) {
  return await axios.get(url, {
    auth: {
      username: process.env.SERVICE_USERNAME,
      password: process.env.SERVICE_PASSWORD
    }
  });
}

export default defineComponent({
  name: 'Commands',
  components: {
    TableBasic: defineAsyncComponent(() => import('components/tables/TableBasicCommands'))
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
    async getCommands() {
      this.loading = true;
      let discovery_list = process.env.SERVICE_BACKEND_URL.split(",")
      let commands = [];
      for (let i = 0; i < discovery_list.length; i++) {
        let agentResponses = await apiServiceGet(discovery_list[i] + "/agents/commands").then((response) => {
          return response.data.description;
        });
        agentResponses.forEach(agentResponse => {
          agentResponse.description.forEach(command => {
            command["homePageUrl"] = agentResponse.homePageUrl
            command["ip_port"] = agentResponse.ip_port
            command["discovery"] = discovery_list[i]
          })
        });

        commands = commands.concat(agentResponses[i].description)
      }

      let commandsSorted = _.sortBy(commands, 'id');

      this.$store.state.commands.rows = commandsSorted;
      this.loading = false;
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
    getAgentApiResponseFromChild(apiResponseAgent) {
      this.apiResponse = apiResponseAgent.description[0];
      this.getCommands();
      this.alert = true;
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
