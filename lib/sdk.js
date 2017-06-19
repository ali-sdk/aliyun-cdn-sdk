'use strict';

const crypto = require('crypto');
const urllib = require('urllib');

const APIS = require('./apis');
const errors = require('./errors');

class CDN {

  /**
   * Creates an instance of CDN.
   *
   * @param {Object} opts - sdk 参数
   * @param {String} opts.accessKeyId - accessKeyId
   * @param {String} opts.appSecret - appSecret
   * @param {String} opts.endpoint - endpoint
   * @param {String} opts.apiVersion - apiVersion
   *
   */
  constructor(opts) {
    this.validate(opts);
    this.opts = opts;
    this.init();
  }

  init() {
    const opts = this.opts;
    this.commonParams = {
      Format: 'JSON',
      Version: opts.apiVersion,
      AccessKeyId: opts.accessKeyId,
      SignatureMethod: 'HMAC-SHA1',
      SignatureVersion: '1.0',
    };
    APIS.forEach(api => {
      const action = api.action;
      this[action] = args => {
        this.validateMethod(api, args);
        return this.actionInvoke(action, api.method, args);
      };
    });
  }

  actionInvoke(action, method, args) {
    const url = this.getUrl(action, method, args);

    return urllib.request(url, {
      rejectUnauthorized: false,
      dataType: 'json',
      timeout: 10 * 1000,
    }).then(response => {
      let message = '';
      if (response.status === 400) {
        message = `invalid arguments: ${response.data && response.data.Message}`;
        throw new errors.ValidationError(message, response.status);
      }
      if (response.status !== 200) {
        message = `unexpect error: ${response.data && response.data.Message}`;
        throw new errors.CdnError(message, response.status);
      }

      return response.data;
    }).catch(e => {
      throw e;
    });
  }

  getUrl(action, method, args) {
    const params = sortObjectKeys(Object.assign({}, this.commonParams, args, {
      Action: action,
      TimeStamp: (new Date().toISOString()).replace(/\.\d{3}/, ''),
      SignatureNonce: Math.round(Math.random() * 10000),
    }));

    let headerString = '';
    // eslint-disable-next-line no-return-assign
    Object.keys(params).forEach(key => headerString += `${key}=${encodeURIComponent(params[key])}&`);
    headerString = headerString.slice(0, -1);

    const stringToSign = method.toUpperCase() + '&%2F&' + encodeURIComponent(headerString);
    const sign = crypto.createHmac('sha1', this.opts.appSecret + '&').update(stringToSign).digest('base64');
    // eslint-disable-next-line no-useless-concat
    return this.opts.endpoint + '?' + 'Signature=' + encodeURIComponent(sign) + '&' + headerString;
  }

  validate(opts) {
    [ 'accessKeyId', 'appSecret', 'endpoint', 'apiVersion' ].forEach(key => {
      if (!opts[key]) {
        throw new errors.ValidationError(`${key} is required`);
      }
    });
  }

  validateMethod(config, args) {
    const params = config.params || [];
    params.forEach(param => {
      if (param.required && !args[param.name]) {
        throw new errors.ValidationError(`${param.name} is required`);
      }
    });
  }

}

module.exports = CDN;

function sortObjectKeys(obj) {
  const res = {};
  Object
    .keys(obj || {}).sort((a, b) => { return a < b ? -1 : 1; })
    .forEach(key => { res[key] = obj[key]; });
  return res;
}
