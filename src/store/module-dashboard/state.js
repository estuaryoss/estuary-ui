import {ref} from "vue";

export default function () {
  return {
    cardDetails: ref([]),
    totalRunningCommands: 0,
    totalFinishedCommands: 0,
    finishedCommandsSuccess: 0,
    finishedCommandsFailure: 0,
    totalFileTransfers: 0,
    fileTransfersDownloads: 0,
    fileTransfersUploads: 0,
  }
}


