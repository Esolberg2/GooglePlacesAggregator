import { ModalBuilder } from '../features/modal/ModalBuilder'
import { setBulkSearchRunning, searchPlaces, bulkSearch as bulkSearchThunk, nearbySearch, debounce } from '../features/search/searchSlice'
import { store } from '../store'
import { singleSearch } from './singleSearch'

const synchronizedCall = () => new Promise((resolve, reject) => {
  store.dispatch(bulkSearchThunk(resolve))
})

function bulkSearch() {
  let modalBuilder = new ModalBuilder()
  modalBuilder.alertKey = 'bulkSearch'

  modalBuilder.callback = async () => {
    await store.dispatch(bulkSearchThunk())
  }
  modalBuilder.errorback = (error) => {
      console.log("reject callback run")
      console.log(error)
    }
  let data = modalBuilder.run()
  console.log(data)
  return data
}

export async function debouncedBulkSearch() {
  console.log(store.getState().search.bulkSearchRunning)
  if (store.getState().search.bulkSearchRunning) {
    console.log("abort bulk search")
  }
  else {
    bulkSearch()
}
}
