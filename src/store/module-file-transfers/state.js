import {ref} from 'vue'

export default function () {
  return {
    filter: ref(''),
    rows: ref([]),
    loading: false,
    columns: [
      {name: 'Action', label: 'Action', field: 'Action', sortable: false, align: 'left'},
      {name: 'Id', field: 'id', label: 'Id', sortable: false},
      {name: 'Type', align: 'left', field: "type", label: 'Type', sortable: true},
      {name: 'SourceFileName', align: 'left', field: "sourceFileName", label: 'SourceFileName', sortable: true},
      {name: 'SourceFilePath', align: 'left', field: "sourceFilePath", label: 'SourceFilePath', sortable: true},
      {name: 'DateTime', align: 'left', field: "dateTime", label: 'DateTime', sortable: true},
      {name: 'TargetFileName', align: 'left', field: "targetFileName", label: 'TargetFileName', sortable: true},
      {name: 'TargetFilePath', align: 'left', field: "targetFilePath", label: 'TargetFilePath', sortable: true},
      {name: 'TargetFolder', align: 'left', field: "targetFolder", label: 'TargetFolder', sortable: true},
      {name: 'FileSize', align: 'left', field: "fileSize", label: 'FileSize', sortable: true},
      {name: 'HomePageUrl', align: 'left', field: "homePageUrl", label: 'HomePageUrl', sortable: true},
      {name: 'IpPort', align: 'left', field: "ip_port", label: 'IpPort', sortable: true},
      {name: 'Discovery', align: 'left', field: "discovery", label: 'Discovery', sortable: true},
    ]
  }
}


