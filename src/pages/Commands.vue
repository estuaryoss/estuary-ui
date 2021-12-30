<template>
  <q-page class="q-pa-sm">
    <q-bar>
      <q-btn no-caps type="submit" color="primary" label="Get All Commands" @click="getCommands">
        <q-tooltip class="bg-accent">Refresh manually the commands from all Agents
        </q-tooltip>
      </q-btn>
      <q-btn no-caps type="submit" color="primary" label="Stop All Commands" @click="stopAllCommands">
        <q-tooltip class="bg-accent">Stop all commands on all Agents
        </q-tooltip>
      </q-btn>
      <q-btn no-caps type="submit" color="primary" label="Send Commands" @click="prepareAndShowDialog">
        <q-tooltip class="bg-accent">Send commands on a targeted Agent or on all Agents
        </q-tooltip>
      </q-btn>
    </q-bar>

    <q-dialog v-model="showCommandsDialog">
      <q-card style="width: 700px; max-width: 80vw;">

        <q-card-section>
          <div class="text-h6">Send commands</div>
        </q-card-section>

        <q-form
          @submit="onSubmit"
          @reset="onReset"
          class="q-gutter-md"
        >
          <div>
            <q-select
              filled
              v-model="selectModelMultiple"
              multiple
              :options="selectOptions"
              use-chips
              stack-label
              label="Selected Agent(s)"
              :rules="[selectedAgentsRule]"
            ></q-select>
          </div>

          <div>
            <q-input
              v-model="commandsSeparatedByNewLineCharacter"
              filled
              type="textarea"
              label="Commands"
              :rules="[val => !!val || 'Commands are required']"
            ></q-input>
          </div>

          <q-card-actions align="right">
            <q-btn flat label="Select All Agent(s)" color="secondary" @click="selectionAll"></q-btn>
            <q-btn flat label="Clear Agent(s)" color="secondary" @click="clearSelection"></q-btn>
          </q-card-actions>

          <div>
            <q-btn label="Submit" type="submit" color="primary"></q-btn>
            <q-btn label="Reset" type="reset" color="primary" flat class="q-ml-sm"></q-btn>
          </div>
        </q-form>
      </q-card>
    </q-dialog>

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
                 :rows="this.$store.state.commands.rows.value"
                 :loading="loading"
                 @filter="getFilterFromChild"
                 @apiResponseAgent="getAgentApiResponseFromChild"/>
  </q-page>
</template>


<script>
import axios from 'axios'
import {defineAsyncComponent, defineComponent, ref} from 'vue'
import _ from "lodash";

async function apiServiceGet(url) {
  return await axios.get(url, {
    auth: {
      username: process.env.SERVICE_USERNAME,
      password: process.env.SERVICE_PASSWORD
    }
  });
}

async function apiServicePostWithTimeout(url, body, headers) {
  return axios({
    method: 'POST',
    url: url,
    data: body,
    headers: headers,
    timeout: 5000,
    auth: {
      username: process.env.SERVICE_USERNAME,
      password: process.env.SERVICE_PASSWORD
    }
  }).then((response) => {
    return response.data.description;
  }).catch(function (error) {
    return error.response.data.description
  });
}

async function apiServiceDelete(url) {
  return await axios.delete(url, {
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
      showCommandsDialog: false,
      apiResponse: null,
      loading: false,
      selectModelMultiple: ref([]),
      selectOptions: ref([]),
      commandsSeparatedByNewLineCharacter: ''
    }
  },
  methods: {
    selectedAgentsRule(selectedAgents) {
      if (selectedAgents.length < 1) {
        return 'Please select at least one Agent !'
      }

      return true
    },
    onSubmit() {
      this.showCommandsDialog = false
      this.sendCommands()
    },
    onReset() {
      this.selectModelMultiple = []
      this.commandsSeparatedByNewLineCharacter = ''
    },
    selectionAll() {
      let appsList = this.getAppsByName("agent")
      appsList.forEach(app => {
        if (!_.includes(this.selectModelMultiple, app.homePageUrl)) {
          this.selectModelMultiple.push(app.homePageUrl)
        }
      })
    },
    clearSelection() {
      this.selectModelMultiple = ref([])
    },
    async sendCommands() {
      let discovery = this.getAppsByName("discovery")[0]
      let headers = {
        "Content-Type": "text/plain",
        "HomePageUrl": this.selectModelMultiple.join(",")
      }
      let body = this.commandsSeparatedByNewLineCharacter;
      await apiServicePostWithTimeout(discovery.homePageUrl + "/agents/commands", body, headers).then((response) => {
        return response.data.description;
      }).catch(function (error) {
        //timeout
      });
      await this.getCommands()
    },
    async getEurekaApps() {
      let discoveryList = process.env.SERVICE_BACKEND_URL.split(",")
      let activeEurekaApps = [];
      for (let i = 0; i < discoveryList.length; i++) {
        let eurekaAppsList = await apiServiceGet(discoveryList[i] + "/eureka/apps").then((response) => {
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
    },
    getAppsByName(name) {
      this.getEurekaApps()
      let eurekaApps = this.$store.state.eureka_apps.rows.value;
      let appsListByName = []
      eurekaApps.forEach(app => {
        if (app.app.includes(name)) {
          appsListByName.push(app)
        }
      })

      return appsListByName
    },
    async prepareAndShowDialog() {
      this.showCommandsDialog = true

      let appsList = this.getAppsByName("agent")
      appsList.forEach(app => {
        if (!_.includes(this.selectOptions, app.homePageUrl)) {
          this.selectOptions.push(app.homePageUrl)
        }
      })
    },
    async stopAllCommands() {
      let discovery = this.getAppsByName("discovery")[0]

      await apiServiceDelete(discovery.homePageUrl + "/agents/commands")
      await this.getCommands()
    },
    getDataObjectByKey(keyName) {
      let data = _(this.$store.state.commands.rows.value)
        .countBy(keyName)
        .map((value, name) => ({name, value}))
        .value();

      return data;
    },
    async getCommands() {
      this.loading = true;
      let discoveryList = process.env.SERVICE_BACKEND_URL.split(",")
      let commands = [];
      for (let i = 0; i < discoveryList.length; i++) {
        let agentResponses = await apiServiceGet(discoveryList[i] + "/agents/commands").then((response) => {
          return response.data.description;
        });
        agentResponses.forEach(agentResponse => {
          agentResponse.description.forEach(command => {
            command["homePageUrl"] = agentResponse.homePageUrl
            command["ip_port"] = agentResponse.ip_port
            command["discovery"] = discoveryList[i]

            commands.push(command)
          })
        });
      }

      let commandsSorted = _.sortBy(commands, 'id');
      this.$store.state.commands.rows.value = _.orderBy(commandsSorted, ['id'], ['desc']);

      this.loading = false;
    },
    getNextUpdate() {
      return this.countdownTimer / 1000
    },
    clearDataFromTheTable() {
      this.$store.state.commands.rows.value = [];
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
