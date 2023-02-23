import { createSlice } from '@reduxjs/toolkit';
import AlertManager from '../../alerts/alertManager';

const initialState = {
  visible: false,
  error: false,
  message: '',
  callbackKey: '',
  dialogType: '',
  promise: '',
  dialogTitle: '',
};

class ModalFunctionStore {
  constructor() {
    this.resolve = undefined;
    this.reject = undefined;
  }
}

export const modalFunctionStore = new ModalFunctionStore();

export const callbackDict = {};

export const modalSlice = createSlice({
  name: 'modal',
  initialState,
  reducers: {
    setDialogTitle: (state, action) => { state.dialogTitle = action.payload; },
    setDialogType: (state, action) => { state.dialogType = action.payload; },
    setMessage: (state, action) => { state.message = action.payload; },
    setVisible: (state, action) => { state.visible = action.payload; },
  },
});

export const
  {
    setVisible,
    setMessage,
    setDialogType,
    setDialogTitle,
  } = modalSlice.actions;

export async function buildModal(kwargs, state, dispatch) {
  const {
    alertKey,
    data,
    confirmCallback,
    denyCallback,
  } = kwargs;

  const alert = AlertManager.hasAlert(state, alertKey, data);

  const promise = new Promise((resolve, reject) => {
    modalFunctionStore.resolve = () => {
      dispatch(setMessage(''));
      dispatch(setDialogType(false));
      dispatch(setVisible(false));
      dispatch(setDialogTitle(''));
      resolve(confirmCallback);
    };
    modalFunctionStore.reject = () => {
      dispatch(setMessage(''));
      dispatch(setDialogType(false));
      dispatch(setDialogTitle(''));
      dispatch(setVisible(false));
      reject(denyCallback);
    };
  });

  if (alert) {
    dispatch(setMessage(alert.text));
    dispatch(setDialogType(alert.type));
    dispatch(setDialogTitle(alert.title));
    dispatch(setVisible(true));
  } else {
    modalFunctionStore.resolve();
  }
  return promise;
}

export default modalSlice.reducer;
