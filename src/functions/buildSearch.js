import { initializeSearch } from '../features/search/searchSlice';
import store from '../store';
import { buildModal } from '../features/modal/modalSlice';

async function debouncedBuildSearch() {
  if (!store.getState().search.loading && !store.getState().search.searchActive) {
    const selectedAction = await buildModal({
      alertKey: 'buildSearch',
      data: null,
      confirmCallback: () => {
        store.dispatch(initializeSearch());
      },
      denyCallback: (error) => {
        throw new Error(error);
      },
    });
    selectedAction();
  }
}

export default debouncedBuildSearch;
