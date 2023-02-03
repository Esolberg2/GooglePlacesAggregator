import { ModalBuilder } from '../features/modal/ModalBuilder'
import { loadStateFromFile } from '../features/search/searchSlice'
import { store } from '../store'

export function buildFromFile() {
  let fileData = store.getState().loadFile.fileData
  let modalBuilder = new ModalBuilder()
  modalBuilder.alertKey = 'loadFile'
  modalBuilder.callback = (result) => {
      store.dispatch(loadStateFromFile(fileData))
    }
  modalBuilder.errorback = (error) => {
      console.log("reject callback run")
      console.log(error)
    }
  modalBuilder.run()
}
