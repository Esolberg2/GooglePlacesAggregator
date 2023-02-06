import { ModalBuilder } from '../features/modal/ModalBuilder'
import { searchPlaces, debounce } from '../features/search/searchSlice'
import { store } from '../store'
import { googlePlacesApiManager } from '../googleAPI/googlePlacesApiManager'


const synchronizedCall = () => new Promise((resolve, reject) => {
  store.dispatch(searchPlaces(resolve))
})

export function singleSearch() {
  let modalBuilder = new ModalBuilder()
  modalBuilder.alertKey = 'search'
  modalBuilder.callback = async () => {
    await synchronizedCall()
  }
  modalBuilder.errorback = (error) => {
    console.log("reject callback run")
    console.log(error)
    }
  modalBuilder.run()
}

export function debouncedSingleSearch() {
  console.log("debounce single search")
  store.dispatch(debounce(singleSearch))
}
