import { ModalBuilder } from '../features/modal/ModalBuilder'
import { searchPlaces, singleSearch as singleSearchThunk } from '../features/search/searchSlice'
import { store } from '../store'
import { googlePlacesApiManager } from '../googleAPI/googlePlacesApiManager'


const synchronizedCall = () => new Promise((resolve, reject) => {
  store.dispatch(searchPlaces(resolve))
})

export function singleSearch() {
  let modalBuilder = new ModalBuilder()
  modalBuilder.alertKey = 'search'
  modalBuilder.callback = () => {
    store.dispatch(singleSearchThunk())
  }
  modalBuilder.errorback = (error) => {
    console.log("reject callback run")
    console.log(error)
    }
  modalBuilder.run()
}

export function debouncedSingleSearch() {
  if (store.getState().search.loading) {
    console.log("abort single search")
  } else {
    store.dispatch(singleSearch())
  }
}
