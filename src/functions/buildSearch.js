import { initializeSearch } from '../features/search/searchSlice'
import { store } from '../store'
import { buildModal } from '../features/modal/modalSlice'

export async function debouncedBuildSearch() {
  if (store.getState().search.loading || store.getState().search.searchActive) {
    return
  } else {
    let selectedAction = await buildModal({
      "alertKey": 'buildSearch',
      "data": null,
      "confirmCallback": () => {
        store.dispatch(initializeSearch())
      },
      "denyCallback": (error) => {
        console.log(error)
        }
    })
    selectedAction()
  }
}
