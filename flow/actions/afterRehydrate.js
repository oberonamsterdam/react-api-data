// @flow

export interface ApiDataAfterRehydrateAction {
  type: 'API_DATA_AFTER_REHYDRATE';
}

declare export var afterRehydrate: () => ApiDataAfterRehydrateAction;
