<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          @click="toggleLeftDrawer"
          icon="menu"
          aria-label="Menu"
        />
        <q-toolbar-title>
          {{ getAppName }} v{{ getAppVersion }}
        </q-toolbar-title>
        <q-space/>
        <div class="q-gutter-sm row items-center no-wrap">
          <q-btn no-caps label="Backend info">
            <q-tooltip class="bg-accent" anchor="bottom middle" self="top middle" :offset="[10, 10]">
              {{ backendInfo.name }}, <strong>v{{ backendInfo.version }}</strong>
            </q-tooltip>
          </q-btn>
          <q-btn round dense flat color="white" :icon="$q.fullscreen.isActive ? 'fullscreen_exit' : 'fullscreen'"
                 @click="$q.fullscreen.toggle()"
                 v-if="$q.screen.gt.sm">
          </q-btn>
          <q-btn round dense flat color="white" icon="fab fa-github" type="a"
                 href="https://github.com/estuaryoss" target="_blank">
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      class="bg-primary text-white"
    >
      <q-list>
        <q-item to="/" active-class="q-item-no-link-highlighting">
          <q-item-section avatar>
            <q-icon name="dashboard"/>
          </q-item-section>
          <q-item-section>
            <q-item-label>Dashboard</q-item-label>
          </q-item-section>
        </q-item>
        <q-item to="/commands" active-class="q-item-no-link-highlighting">
          <q-item-section avatar>
            <q-icon name="table_chart"/>
          </q-item-section>
          <q-item-section>
            <q-item-label>Commands</q-item-label>
          </q-item-section>
        </q-item>
        <q-item to="/file/transfers" active-class="q-item-no-link-highlighting">
          <q-item-section avatar>
            <q-icon name="table_chart"/>
          </q-item-section>
          <q-item-section>
            <q-item-label>File Transfers</q-item-label>
          </q-item-section>
        </q-item>
        <q-item active-class="q-item-no-link-highlighting" to="/env">
          <q-item-section avatar>
            <q-icon name="table_chart"/>
          </q-item-section>
          <q-item-section>
            <q-item-label>Environment</q-item-label>
          </q-item-section>
        </q-item>
        <q-item active-class="q-item-no-link-highlighting" to="/eureka/apps">
          <q-item-section avatar>
            <q-icon name="table_chart"/>
          </q-item-section>
          <q-item-section>
            <q-item-label>Eureka Apps</q-item-label>
          </q-item-section>
        </q-item>
        <q-item to="/contacts" active-class="q-item-no-link-highlighting">
          <q-item-section avatar>
            <q-icon name="person"/>
          </q-item-section>
          <q-item-section>
            <q-item-label>Contact</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container class="bg-grey-2">
      <router-view/>
    </q-page-container>
  </q-layout>
</template>

<script>

import axios from 'axios'
import {defineComponent, ref} from 'vue'

const api = axios.create({baseURL: process.env.SERVICE_BACKEND_URL})

async function getAboutBackend(url) {
  return await api.get(url, {
    auth: {
      username: process.env.SERVICE_USERNAME,
      password: process.env.SERVICE_PASSWORD
    }
  });
}

const packageJson = require('../../package.json');

export default defineComponent({
  name: 'MainLayout',

  components: {},
  data() {
    return {
      backendInfo: {
        name: "NA",
        version: "NA"
      }
    }
  },
  mounted() {
    this.$nextTick(async () => {
      this.backendInfo = await getAboutBackend("/about").then((response) => {
        return response.data;
      }).catch(function (error) {
        return error.response.data || "NA"
      });
    });
  },

  computed: {
    getAppVersion() {
      return packageJson.version
    },
    getAppName() {
      return packageJson.name
    }
  },
  setup() {
    const leftDrawerOpen = ref(false)

    return {
      leftDrawerOpen,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value
      }
    }
  }
})
</script>
