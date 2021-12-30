import {ref} from 'vue'

export default function () {
  return {
    filter: ref(''),
    loading: false,
    rows: ref([]),
    columns: [
      {name: 'Action', label: 'Action', field: 'Action', sortable: false, align: 'left'},
      {name: 'IpAddr', field: 'ipAddr', label: 'IpAddr', sortable: false},
      {name: 'Port', align: 'left', field: "port", label: 'Port', sortable: true},
      {name: 'SecurePort', align: 'left', field: "securePort", label: 'SecurePort', sortable: true},
      {name: 'App', align: 'left', field: "app", label: 'AppName', sortable: true},
      {name: 'Metadata', align: 'left', field: "metadata", label: 'Metadata', sortable: true},
      {name: 'HomePageUrl', align: 'left', field: "homePageUrl", label: 'HomePageUrl', sortable: true},
      {name: 'HealthCheckUrl', align: 'left', field: "healthCheckUrl", label: 'HealthCheckUrl', sortable: true},
      {name: 'StatusPageUrl', align: 'left', field: "statusPageUrl", label: 'StatusPageUrl', sortable: true},
    ]
  }
}

