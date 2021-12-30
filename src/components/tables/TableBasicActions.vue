<template>

  <q-dialog v-model="alert">
    <q-card>
      <q-card-section>
        <div class="text-h6">Details</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        {{ rowDetails }}
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="OK" color="primary" v-close-popup></q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>

  <div class="row q-col-gutter-sm">
    <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">
      <q-card class="text-grey-8">
        <q-card-section class="q-pa-none">
          <q-table class="no-shadow"
                   title="Table Results"
                   :rows="rows"
                   :columns="columns"
                   :loading="loading"
                   row-key="id"
                   :filter="this.$store.state.commands.filter"
                   v-model:pagination="pagination"
                   :pagination.sync="pagination"
          >

            <template v-slot:top-right>
              <q-input v-model="this.$store.state.commands.filter" borderless class="table-search-input" debounce="300"
                       dense
                       @update:model-value="val => { pagination.page = 1}" placeholder="Search">
                <template v-slot:append>
                  <q-icon name="search"/>
                </template>
              </q-input>

              <q-btn
                  color="primary"
                  icon-right="archive"
                  label="Export to csv"
                  no-caps
                  @click="exportTable"
              />
            </template>
            <template v-slot:body-cell-Action="props">
              <q-td slot="body-cell-action" slot-scope="props" :props="props">
                <q-btn size="xs" icon="eco" @click="goToViewRow(props.row)">
                  <q-tooltip class="bg-accent">Show Details</q-tooltip>
                </q-btn>
                <q-btn v-if="isCommandRunning(props.row)" size="xs" icon="navigation"
                       @click="stopCommandByPid(props.row)">
                  <q-tooltip class="bg-accent">Stop Command By Pid</q-tooltip>
                </q-btn>
              </q-td>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script>
import {defineComponent, ref} from 'vue'
import {exportFile} from 'quasar'
import axios from "axios";

function wrapCsvValue(val, formatFn) {
  let formatted = formatFn !== void 0
      ? formatFn(val)
      : val

  formatted = formatted === void 0 || formatted === null
      ? ''
      : String(formatted)

  formatted = formatted.split('"').join('""')
  /**
   * Excel accepts \n and \r in strings, but some other CSV parsers do not
   * Uncomment the next two lines to escape new lines
   */
  // .split('\n').join('\\n')
  // .split('\r').join('\\r')

  return `"${formatted}"`
}

async function apiServiceDelete(url, headers) {
  return await axios.delete(url, {
    auth: {
      username: process.env.SERVICE_USERNAME,
      password: process.env.SERVICE_PASSWORD
    },
    headers: headers
  }).then((response) => {
    return response.data;
  });
}

export default defineComponent({
  name: 'TableBasicActions',
  emits: ["apiResponse"],
  props: {
    rows: [],
    columns: [],
    loading: false
  },
  data() {
    return {
      alert: false,
      rowDetails: '',
      apiResponse: undefined
    }
  },
  methods: {
    sendAgentApiResponseToParent() {
      this.$emit('apiResponse', this.apiResponse)
    },
    goToViewRow(row) {
      this.alert = true;
      this.rowDetails = row;
    },
    isCommandRunning(row) {
      return row.status === "running"
    },
    async stopCommandByPid(row) {
      let headers = {
        "HomePageUrl": row.homePageUrl
      }

      this.apiResponse = await apiServiceDelete(row.discovery + `/agents/commands/` + row.pid, headers);
      this.sendAgentApiResponseToParent();
    },
    exportTable() {
      // naive encoding to csv format
      const content = [this.columns.slice(1).map(col => wrapCsvValue(col.label))].concat(
          this.rows.map(row => this.columns.slice(1).map(col => wrapCsvValue(
              typeof col.field === 'function'
                  ? col.field(row)
                  : row[col.field === void 0 ? col.name : col.field],
              col.format
          )).join(','))
      ).join('\r\n')

      const status = exportFile(
          'table-export.csv',
          content,
          'text/csv'
      )

      if (status !== true) {
        $q.notify({
          message: 'Browser denied file download...',
          color: 'negative',
          icon: 'warning'
        })
      }
    }
  },
  setup() {
    const show_filter = ref(false)
    let pagination = ref({
      sortBy: 'desc',
      descending: false,
      page: 1,
      rowsPerPage: 15
    })

    return {
      show_filter,
      pagination
    }
  },
})
</script>
