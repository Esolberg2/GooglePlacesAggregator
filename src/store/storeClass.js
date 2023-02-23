import store from '../store';

class StoreClass {
  static getState() {
    return store.getState;
  }

  static dispatch() {
    return store.dispatch;
  }
}

export default StoreClass;
