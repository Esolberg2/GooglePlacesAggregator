import { loadStateFromFile } from '../features/search/searchSlice';
import store from '../store';
import { buildModal } from '../features/modal/modalSlice';

async function buildFromFile() {
  const { fileData } = store.getState().loadFile;
  const selectedAction = await buildModal({
    alertKey: 'loadFile',
    data: null,
    confirmCallback: () => {
      store.dispatch(loadStateFromFile(fileData));
    },
    denyCallback: () => {},
  });
  selectedAction();
}

export default buildFromFile;
