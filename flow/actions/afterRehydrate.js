// @flow

export interface AfterRehydrateAction {
  type: 'API_DATA_AFTER_REHYDRATE';
}

declare export var afterRehydrate: () => AfterRehydrateAction;
