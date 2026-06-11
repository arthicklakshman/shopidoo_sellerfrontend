import api from '../services/api';

let _cache = null;
let _promise = null;

export const fetchSettingsOnce = () => {
  if (_cache) return Promise.resolve(_cache);
  if (_promise) return _promise;
  _promise = api.get('/settings')
    .then(res => {
      _cache = res.data?.dataValues || res.data?.data || res.data;
      return _cache;
    })
    .finally(() => { _promise = null; });
  return _promise;
};