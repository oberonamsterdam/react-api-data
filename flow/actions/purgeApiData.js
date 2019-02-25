// @flow

export interface PurgeApiDataAction {
  type: 'PURGE_API_DATA';
}

declare export var purgeApiData: () => PurgeApiDataAction;
