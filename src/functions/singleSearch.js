import { ModalBuilder } from '../features/modal/ModalBuilder'
import { searchPlaces, debounce } from '../features/search/searchSlice'
import { store } from '../store'
import { googlePlacesApiManager } from '../googleAPI/googlePlacesApiManager'

export function singleSearch() {
  let modalBuilder = new ModalBuilder()
  modalBuilder.alertKey = 'search'
  modalBuilder.callback = () => {store.dispatch(searchPlaces())}
  modalBuilder.errorback = (error) => {
    console.log("reject callback run")
    console.log(error)
    }
  modalBuilder.run()
}

export function debouncedSingleSearch() {
  store.dispatch(debounce(singleSearch))
}
