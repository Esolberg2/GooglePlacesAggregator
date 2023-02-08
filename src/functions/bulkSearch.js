import { ModalBuilder } from '../features/modal/ModalBuilder'
import { searchPlaces, bulkSearch as bulkSearchThunk, nearbySearch, debounce } from '../features/search/searchSlice'
import { store } from '../store'

const synchronizedCall = () => new Promise((resolve, reject) => {
  store.dispatch(bulkSearchThunk(resolve))
})

function bulkSearch() {
  let modalBuilder = new ModalBuilder()
  modalBuilder.alertKey = 'bulkSearch'

  modalBuilder.callback = () => {
    store.dispatch(bulkSearchThunk())
  }
  modalBuilder.errorback = (error) => {
      console.log("reject callback run")
      console.log(error)
    }
  modalBuilder.run()
}

export function debouncedBulkSearch() {
  if (store.getState().search.bulkSearchRunning) {
    console.log("abort bulk search")
  } else {
    bulkSearch()
  }
  // store.dispatch(debounce(bulkSearch()))
}
