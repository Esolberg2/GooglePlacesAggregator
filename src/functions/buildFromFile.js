// import { ModalBuilder } from '../features/modal/ModalBuilder'
import { loadStateFromFile } from '../features/search/searchSlice'
import { store } from '../store'
import { buildModal } from '../features/modal/modalSlice'

// export function buildFromFile() {
//   let fileData = store.getState().loadFile.fileData
//   let modalBuilder = new ModalBuilder()
//   modalBuilder.alertKey = 'loadFile'
//   modalBuilder.callback = (result) => {
//       store.dispatch(loadStateFromFile(fileData))
//     }
//   modalBuilder.errorback = (error) => {
//       console.log("reject callback run")
//       console.log(error)
//     }
//   modalBuilder.run()
// }


export async function buildFromFile() {
  let fileData = store.getState().loadFile.fileData
  let selectedAction = await buildModal({
    "alertKey": 'loadFile',
    "data": null,
    "confirmCallback": () => {
      store.dispatch(loadStateFromFile(fileData))
    },
    "denyCallback": (error) => {
      console.log(error)
      }
  })
  selectedAction()
}
