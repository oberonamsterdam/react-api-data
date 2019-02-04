// @flow

export interface PurgeApiDataAction {
  type: 'PURGE_API_DATA';
}

export var purgeApiData: () => PurgeApiDataAction;
