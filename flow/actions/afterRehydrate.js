// @flow

export interface ApiDataAfterRehydrateAction {
  type: 'API_DATA_AFTER_REHYDRATE';
}

export var afterRehydrate: () => ApiDataAfterRehydrateAction;
