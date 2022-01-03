import {ref} from 'vue'

export default function () {
  return {
    filter: ref(''),
    rows: ref([]),
    loading: false,
    columns: [
      {name: 'Action', label: 'Action', field: 'Action', sortable: false, align: 'left'},
      {name: 'Env', align: 'left', field: "env", label: 'Env', sortable: true},
      {name: 'HomePageUrl', align: 'left', field: "homePageUrl", label: 'HomePageUrl', sortable: true},
      {name: 'IpPort', align: 'left', field: "ip_port", label: 'IpPort', sortable: true},
      {name: 'Discovery', align: 'left', field: "discovery", label: 'Discovery', sortable: true},
    ]
  }
}
