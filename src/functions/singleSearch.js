import { ModalBuilder } from '../features/modal/ModalBuilder'
import { nearbySearch, debounce } from '../features/search/searchSlice'
import { store } from '../store'

function singleSearch() {
  let modalBuilder = new ModalBuilder()
  modalBuilder.alertKey = 'search'
  modalBuilder.callback = () => {store.dispatch(nearbySearch())}
  modalBuilder.errorback = (error) => {
      console.log("reject callback run")
      console.log(error)
    }
  modalBuilder.run()
}

export function debouncedSingleSearch() {
  store.dispatch(debounce(singleSearch))
}
