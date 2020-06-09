// @flow

export interface PurgeAction {
  type: 'PURGE_API_DATA';
}

declare export var purge: () => PurgeAction;
