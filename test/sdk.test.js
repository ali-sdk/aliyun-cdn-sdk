'use strict';

const moment = require('moment');
const assert = require('assert');

const SDK = require('../');

const cdnConfig = {
  accessKeyId: '',
  appSecret: '',
  endpoint: 'https://cdn.aliyuncs.com',
  apiVersion: '2014-11-11',
};

describe('cdn.test.js', function() {

  const sdk = new SDK({
    accessKeyId: cdnConfig.accessKeyId,
    appSecret: cdnConfig.appSecret,
    endpoint: cdnConfig.endpoint,
    apiVersion: cdnConfig.apiVersion,
  });

  it('DescribeDomainHttpCodeData', function* () {
    const res = yield sdk.DescribeDomainHttpCodeData({
      DomainName: 'a.alipayobjects.com',
      StartTime: getUTCDate(25), // 过去 20~25 分钟内的数据
      EndTime: getUTCDate(20),
    });
    assert.ok(res.HttpCodeData);
    assert.strictEqual(res.DataInterval, '300');
  });

  it('DescribeDomainTopUrlVisit', function* () {
    const res = yield sdk.DescribeDomainTopUrlVisit({
      DomainName: 'a.alipayobjects.com',
      StartTime: getUTCDate(60 * 12),
    });

    assert.ok(Array.isArray(res.Url400List.UrlList));
    assert.ok(Array.isArray(res.Url500List.UrlList));
  });

  it('DescribeDomainPvData', function* () {
    const res = yield sdk.DescribeDomainPvData({
      DomainName: 'a.alipayobjects.com',
      StartTime: getUTCDate(60 * 12),
      EndTime: getUTCDate(60 * 11),
    });

    assert.ok(res.PvDataInterval.UsageData);
  });

  it('DescribeDomainReqHitRateData', function* () {
    const res = yield sdk.DescribeDomainReqHitRateData({
      DomainName: 'a.alipayobjects.com',
      StartTime: getUTCDate(25),
      EndTime: getUTCDate(20),
    });
    assert.ok(res.ReqHitRateInterval.DataModule);
  });

  it('DescribeDomainSrcFlowData', function* () {
    const res = yield sdk.DescribeDomainSrcFlowData({
      DomainName: 'a.alipayobjects.com,as.alipayobjects.com,os.alipayobjects.com,zos.alipayobjects.com',
      StartTime: getUTCDate(25),
      EndTime: getUTCDate(20),
    });

    assert.ok(Array.isArray(res.SrcFlowDataPerInterval.DataModule));
  });

  it('DescribeDomainQpsData', function* () {
    const res = yield sdk.DescribeDomainQpsData({
      DomainName: 'a.alipayobjects.com,as.alipayobjects.com,os.alipayobjects.com,zos.alipayobjects.com',
      StartTime: getUTCDate(25),
      EndTime: getUTCDate(25),
    });

    assert.ok(Array.isArray(res.QpsDataInterval.DataModule));
  });

  it('DescribeCdnDomainLogs', function* () {
    const res = yield sdk.DescribeCdnDomainLogs({
      DomainName: 'a.alipayobjects.com',
      LogDay: '2016-12-27',
      PageSize: 1000,
      PageNumber: 1,
    });

    assert.ok(res.DomainLogModel.DomainLogDetails);
  });

  it('DescribeCdnDomainDetail', function* () {
    const res = yield sdk.DescribeCdnDomainDetail({
      DomainName: 'a.alipayobjects.com',
    });

    assert.strictEqual(res.GetDomainDetailModel.DomainName, 'a.alipayobjects.com');
  });

  it('should throw error', function* () {
    try {
      yield sdk.DescribeDomainQpsData({
        DomainName: 'a.alipayobjects.com,as.alipayobjects.com,os.alipayobjects.com,zos.alipayobjects.com',
        StartTime: 'errorTime',
        EndTime: 'errorTime',
      });
    } catch (e) {
      assert.strictEqual(e.message, 'invalid arguments: Specified StartTime is malformed.');
    }
  });

  it('should throw cdn error with status', function* () {
    try {
      yield sdk.DescribeCdnDomainDetail({
        DomainName: 'alipayobjects.alipayobjects.alipayobjects.alipayobjects.com',
      });
    } catch (e) {
      assert.strictEqual(e.name, 'CdnError');
      assert.strictEqual(e.status, 404);
    }
  });

  it('PushObjectCache', function* () {
    const ObjectPath = 'http://design.koubei.com/docs/alipay';
    const res = yield sdk.PushObjectCache({
      ObjectPath,
    });
    assert.ok(res.PushTaskId);
    assert.ok(res.RequestId);
  });
});

/**
 * 得到 n 分钟前的 ISO string
 * @param {Number} n - 前 n 分钟
 * @return {String} iso string
 */
function getUTCDate(n) {
  const m = moment();
  const o = m.subtract(n, 'minute').toISOString();
  return o.slice(0, -8) + 'Z';
}
