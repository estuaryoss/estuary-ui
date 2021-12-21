import {ref} from 'vue'

export default function () {
  return {
    filter: ref(''),
    rows: [],
    loading: false,
    columns: [
      {name: 'Id', field: 'id', label: 'Id', sortable: false},
      {name: 'Command', align: 'left', field: "command", label: 'Command', sortable: true},
      {name: 'Status', align: 'left', field: "status", label: 'Status', sortable: true},
      {name: 'Code', align: 'left', field: "code", label: 'Code', sortable: true},
      {name: 'StartedAt', align: 'left', field: "startedAt", label: 'StartedAt', sortable: true},
      {name: 'FinishedAt', align: 'left', field: "finishedAt", label: 'FinishedAt', sortable: true},
      {name: 'Duration', align: 'left', field: "duration", label: 'Duration', sortable: true},
      {name: 'Pid', align: 'left', field: "pid", label: 'Pid', sortable: true},
      {name: 'Args', align: 'left', field: "args", label: 'Args', sortable: true},
      {name: 'Err', align: 'left', field: "err", label: 'Err', sortable: true},
      {name: 'Out', align: 'left', field: "out", label: 'Out', sortable: true},
    ]
  }
}
