import { loadStateFromFile } from '../features/search/searchSlice'
import { store } from '../store'
import { buildModal } from '../features/modal/modalSlice'

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
