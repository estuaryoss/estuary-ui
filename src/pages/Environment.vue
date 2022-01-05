<template>
  <q-page class="q-pa-sm">
    <q-bar>
      <q-btn no-caps type="submit" color="primary" label="Get All Envs" @click="getEnv">
        <q-tooltip class="bg-accent">Refresh manually the environment from all Agents
        </q-tooltip>
      </q-btn>
      <q-btn no-caps type="submit" color="primary" label="Delete Virtual Env" @click="deleteVirtualEnv">
        <q-tooltip class="bg-accent">Delete virtual environment from all Agents
        </q-tooltip>
      </q-btn>
      <q-btn no-caps type="submit" color="primary" label="Set env vars" @click="prepareAndShowDialog">
        <q-tooltip class="bg-accent">Set virtual environment vars on a targeted Agent or on all Agents
        </q-tooltip>
      </q-btn>
    </q-bar>

    <q-dialog v-model="showDialog">
      <q-card style="width: 700px; max-width: 80vw;">

        <q-card-section>
          <div class="text-h6">Set virtual env vars</div>
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
              v-model="envVarsAsJson"
              filled
              type="textarea"
              label="Env vars"
              :rules="[val => !!val || 'Env vars are required']"
            ></q-input>
          </div>

          <q-card-actions align="right">
            <q-btn flat label="Select All Agent(s)" color="secondary" @click="selectionAll"></q-btn>
            <q-btn flat label="Clear Agent(s)" color="secondary" @click="clearSelection"></q-btn>
          </q-card-actions>

          <div>
            <q-btn label="Submit" type="submit" color="primary"></q-btn>
            <q-btn label="Reset" type="reset" color="primary" flat class="q-ml-sm"></q-btn>
            <q-btn v-close-popup color="secondary" flat label="Close"></q-btn>
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

    <table-basic :columns="this.$store.state.env.columns"
                 :rows="this.$store.state.env.rows.value"
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

async function apiServicePost(url, body, headers) {
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
  name: 'Environment',
  components: {
    TableBasic: defineAsyncComponent(() => import('components/tables/TableBasic'))
  },
  data() {
    return {
      intervalId: 0,
      refreshTimer: 30 * 1000,
      countdownTimer: 0,
      toggleButton: 'off',
      maximizedToggle: false,
      alert: false,
      showDialog: false,
      apiResponse: null,
      loading: false,
      selectModelMultiple: ref([]),
      selectOptions: ref([]),
      envVarsAsJson: '{"FOO": "BAR"}'
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
      this.showDialog = false
      this.sendEnvVars()
    },
    onReset() {
      this.selectModelMultiple = []
      this.envVarsAsJson = '{"FOO": "BAR"}'
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
    async sendEnvVars() {
      let discoveryList = process.env.SERVICE_BACKEND_URL.split(",")
      let headers = {
        "Content-Type": "text/plain",
        "HomePageUrl": this.selectModelMultiple.join(",")
      }
      let body = this.envVarsAsJson;
      for (const discovery of discoveryList) {
        await apiServicePost(discovery + "/agents/env", body, headers).then((response) => {
          return response.data.description;
        }).catch(function (error) {
          return error.response.data.description
        });
      }

      await this.getEnv()
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
      this.showDialog = true

      let appsList = this.getAppsByName("agent")
      appsList.forEach(app => {
        if (!_.includes(this.selectOptions, app.homePageUrl)) {
          this.selectOptions.push(app.homePageUrl)
        }
      })
    },
    async getEnv() {
      this.loading = true;
      let discoveryList = process.env.SERVICE_BACKEND_URL.split(",")
      let envs = [];
      for (let i = 0; i < discoveryList.length; i++) {
        let agentResponses = await apiServiceGet(discoveryList[i] + "/agents/env").then((response) => {
          return response.data.description;
        });
        agentResponses.forEach(agentResponse => {
          let env = {}
          env["homePageUrl"] = agentResponse.homePageUrl
          env["ip_port"] = agentResponse.ip_port
          env["discovery"] = discoveryList[i]
          env["env"] = JSON.stringify(agentResponse.description)
          envs.push(env)
        });
      }
      this.$store.state.env.rows.value = envs
      this.loading = false;
    },
    async deleteVirtualEnv() {
      this.loading = true;
      let discoveryList = process.env.SERVICE_BACKEND_URL.split(",")
      for (let i = 0; i < discoveryList.length; i++) {
        let agentResponses = await apiServiceDelete(discoveryList[i] + "/agents/env").then((response) => {
          return response.data.description;
        });
      }
      await this.getEnv()
      this.loading = false;
    },
    getNextUpdate() {
      return this.countdownTimer / 1000
    },
    clearDataFromTheTable() {
      this.$store.state.env.rows.value = [];
    },
    getFilterFromChild(filter) {
      this.$store.state.env.filter = filter;
    },
    getAgentApiResponseFromChild(apiResponseAgent) {
      this.apiResponse = apiResponseAgent.description[0];

      this.getEnv();
      this.alert = true;
    },
    startTimer() {
      this.intervalId = setInterval(() => {
        this.countdownTimer = (this.countdownTimer / 1000 - 1) * 1000;
        if (this.countdownTimer / 1000 < 0) {
          this.countdownTimer = this.refreshTimer
          this.getEnv()
        }
      }, 1000)
    }
  },
  beforeUnmount() {
    clearInterval(this.intervalId)
  },
  mounted() {
    this.countdownTimer = this.refreshTimer
    this.getEnv()
    this.startTimer()
    this.$nextTick(() => {
    });
  },
  setup() {
    return {}
  },
})
</script>
