import { ModalBuilder } from '../features/modal/ModalBuilder'
import { searchPlaces, bulkSearch as bulkSearchThunk, nearbySearch, debounce } from '../features/search/searchSlice'
import { store } from '../store'

const synchronizedCall = () => new Promise((resolve, reject) => {
  store.dispatch(searchPlaces(resolve))
})

function bulkSearch() {
  let modalBuilder = new ModalBuilder()
  modalBuilder.alertKey = 'bulkSearch'
  modalBuilder.callback = async () => {
    for (let i=0; i < store.getState().search.bulkSearchCount; i++) {
      await synchronizedCall()
    }
  }
  modalBuilder.errorback = (error) => {
      console.log("reject callback run")
      console.log(error)
    }
  modalBuilder.run()
}

export function debouncedBulkSearch() {
  bulkSearch()
}
