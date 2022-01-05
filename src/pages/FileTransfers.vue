<template>
  <q-page class="q-pa-sm">

    <q-dialog v-model="showDialog">
      <q-card style="width: 1400px; max-width: 80vw;">

        <q-card-section>
          <div class="text-h6">Upload file(s)</div>
        </q-card-section>

        <q-form
          class="q-gutter-md"
          @reset="onReset"
          @submit="onSubmit"
        >
          <div>
            <q-select
              v-model="selectModelMultiple"
              :options="selectOptions"
              :rules="[selectedAgentsRule]"
              filled
              label="Selected Agent(s)"
              multiple
              stack-label
              use-chips
            ></q-select>
          </div>

          <q-file v-model="fileModel"
                  :rules="[val => !!val || 'Select at least one file']"
                  bottom-slots
                  counter
                  filled
                  label="File(s)"
                  multiple>
            <template v-slot:prepend>
              <q-icon name="cloud_upload" @click.stop/>
            </template>
            <template v-slot:append>
              <q-icon class="cursor-pointer" name="close" @click.stop="fileModel = null"/>
            </template>

            <template v-slot:hint>
              Any file type can be uploaded
            </template>
          </q-file>

          <q-input v-model="folderPath" filled hint="The folder path to where the files will be stored"
                   label="Folder path"
          >
            <q-tooltip class="bg-accent">Not required. The files will be stored in the default folder location on the
              Agent.
            </q-tooltip>
          </q-input>

          <q-card-actions align="right">
            <q-btn color="secondary" flat label="Select All Agent(s)" @click="selectionAll"></q-btn>
            <q-btn color="secondary" flat label="Clear Agent(s)" @click="clearSelection"></q-btn>
          </q-card-actions>

          <div>
            <q-btn color="primary" label="Submit" type="submit"></q-btn>
            <q-btn class="q-ml-sm" color="primary" flat label="Reset" type="reset"></q-btn>
            <q-btn v-close-popup color="secondary" flat label="Close"></q-btn>
          </div>
        </q-form>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showDialogDownloads">
      <q-card style="width: 1400px; max-width: 80vw;">

        <q-card-section>
          <div class="text-h6">Download file(s)</div>
        </q-card-section>

        <q-form
          class="q-gutter-md"
          @reset="onReset"
          @submit="onSubmitFileDownloads"
        >
          <div>
            <q-select
              v-model="selectModelMultiple"
              :options="selectOptions"
              :rules="[selectedAgentsRule]"
              filled
              label="Selected Agent(s)"
              multiple
              stack-label
              use-chips
            ></q-select>
          </div>

          <q-input v-model="filePath"
                   :rules="[val => !!val || 'Insert the file path']"
                   filled
                   hint="The file path on the disk"
                   label="File path"
          >
            <q-tooltip class="bg-accent">Required. The file path is required to know which file/folder to download on
              each
              Agent
            </q-tooltip>
          </q-input>

          <q-card-actions align="right">
            <q-btn color="secondary" flat label="Select All Agent(s)" @click="selectionAll"></q-btn>
            <q-btn color="secondary" flat label="Clear Agent(s)" @click="clearSelection"></q-btn>
          </q-card-actions>

          <div>
            <q-btn color="primary" label="Submit" type="submit"></q-btn>
            <q-btn class="q-ml-sm" color="primary" flat label="Reset" type="reset"></q-btn>
            <q-btn v-close-popup color="secondary" flat label="Close"></q-btn>
          </div>
        </q-form>
      </q-card>
    </q-dialog>


    <q-bar>
      <q-btn color="primary" label="Get All Transfers" no-caps type="submit" @click="getFileTransfers">
        <q-tooltip class="bg-accent">Refresh manually the File Transfers across all Agents
        </q-tooltip>
      </q-btn>
      <q-btn color="primary" label="Upload file(s)" no-caps type="submit" @click="prepareAndShowDialogForUploads">
        <q-tooltip class="bg-accent">Upload a file to a targeted Agent or on all Agents
        </q-tooltip>
      </q-btn>

      <q-btn color="primary" label="Download file(s)" no-caps type="submit" @click="prepareAndShowDialogForDownloads">
        <q-tooltip class="bg-accent">Download a file from a targeted Agent or from all Agents
        </q-tooltip>
      </q-btn>

    </q-bar>
    <table-basic :columns="this.$store.state.file_transfers.columns"
                 :rows="this.$store.state.file_transfers.rows.value"
                 :loading="loading"
                 @filter="getFilterFromChild"/>
  </q-page>
</template>


<script>
import axios from 'axios'
import _ from "lodash";
import {defineAsyncComponent, defineComponent, ref} from 'vue'
import {Loading} from "quasar";


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

async function apiServiceGetRawData(url, headers) {
  return axios.get(url, {
    method: 'GET',
    url: url,
    headers: headers,
    responseType: 'blob',
    auth: {
      username: process.env.SERVICE_USERNAME,
      password: process.env.SERVICE_PASSWORD
    }
  });
}

async function apiServicePost(url, data) {
  return axios({
    method: 'POST',
    url: url,
    data: data,
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
      refreshTimer: 30 * 1000,
      countdownTimer: 0,
      toggleButton: 'off',
      dialog: false,
      maximizedToggle: false,
      alert: false,
      apiResponse: null,
      loading: false,
      selectModelMultiple: ref([]),
      selectOptions: ref([]),
      folderPath: '',
      filePath: '',
      showDialog: false,
      showDialogDownloads: false,
      fileModel: [],
    }
  },
  methods: {
    selectedAgentsRule(selectedAgents) {
      if (selectedAgents.length < 1) {
        return 'Please select at least one Agent !'
      }

      return true
    },
    async prepareAndShowDialogForUploads() {
      this.showDialog = true

      let appsList = this.getAppsByName("agent")
      appsList.forEach(app => {
        if (!_.includes(this.selectOptions, app.homePageUrl)) {
          this.selectOptions.push(app.homePageUrl)
        }
      })
    },
    async prepareAndShowDialogForDownloads() {
      this.showDialogDownloads = true

      let appsList = this.getAppsByName("agent")
      appsList.forEach(app => {
        if (!_.includes(this.selectOptions, app.homePageUrl)) {
          this.selectOptions.push(app.homePageUrl)
        }
      })
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
    onSubmit() {
      this.showDialog = false
      this.uploadFiles()
    },
    onSubmitFileDownloads() {
      this.showDialogDownloads = false
      let headers = {
        "HomePageUrl": this.selectModelMultiple.join(","),
        "File-Path": this.filePath
      }
      this.downloadFiles("/agents/file/download", headers)
    },
    onSubmitFolderDownloads() {
      this.showDialogDownloads = false
      let headers = {
        "HomePageUrl": this.selectModelMultiple.join(","),
        "Folder-Path": this.filePath
      }
      this.downloadFiles("/agents/folder", headers)
    },
    async uploadFiles() {
      Loading.show({message: "Uploading files. \n This might take a while ..."});

      let discoveryList = process.env.SERVICE_BACKEND_URL.split(",")
      let headers = {
        "Content-Type": "multipart/form-data",
        "HomePageUrl": this.selectModelMultiple.join(",")
      }
      let formData = new FormData();
      this.fileModel.forEach(file => {
        formData.append('files', file);
      })

      for (const discovery of discoveryList) {
        this.apiResponse = await apiServicePost(discovery + "/agents/files", formData, headers).then((response) => {
          return response.data.description;
        }).catch(function (error) {
          return error.response.data.description
        });
      }
      console.log(this.apiResponse)
      await this.getFileTransfers()
      Loading.hide();
    },
    async downloadFiles(uri, headers) {
      let discoveryList = process.env.SERVICE_BACKEND_URL.split(",")

      for (const discovery of discoveryList) {
        let response = await apiServiceGetRawData(discovery + uri, headers).then((response) => {
          return response.data;
        }).catch(function (error) {
          return error.response.data
        });

        const downloadUrl = window.URL.createObjectURL(new Blob([response]));
        const fileLink = document.createElement('a');
        fileLink.href = downloadUrl;
        fileLink.setAttribute('download', "response.zip");
        document.body.appendChild(fileLink);
        fileLink.click();
      }

      await this.getFileTransfers()
    },
    onReset() {
      this.selectModelMultiple = []
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

      let activeFileTransfersSorted = _.sortBy(fileTransfers, 'id')
      this.$store.state.file_transfers.rows.value = _.orderBy(activeFileTransfersSorted, ['id'], ['desc'])

      this.loading = false
    },
    getNextUpdate() {
      return this.countdownTimer / 1000
    },
    clearDataFromTheTable() {
      this.$store.state.file_transfers.rows.value = [];
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
