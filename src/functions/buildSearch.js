import { ModalBuilder } from '../features/modal/ModalBuilder'
import { initializeSearch } from '../features/search/searchSlice'
import { store } from '../store'


function buildSearch() {
  let modalBuilder = new ModalBuilder()
  modalBuilder.alertKey = 'buildSearch'
  modalBuilder.callback = () => {store.dispatch(initializeSearch())}
  modalBuilder.errorback = (error) => {
      console.log("reject callback run")
      console.log(error)
    }
  modalBuilder.run()
}

export function debouncedBuildSearch() {
  if (store.getState().search.loading) {
    console.log("abort build search")
  } else {
    store.dispatch(buildSearch)
  }
}
