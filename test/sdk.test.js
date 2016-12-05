'use strict';

const co = require('co');
const moment = require('moment');
const expect = require('chai').expect;

const SDK = require('../');

const cdnConfig = {
  accessKeyId: '',
  appSecret: '',
  endpoint: 'https://cdn.aliyuncs.com',
  apiVersion: '2014-11-11',
};

describe('cdn.test.js', function() {
  this.timeout(100000);

  const sdk = new SDK({
    accessKeyId: cdnConfig.accessKeyId,
    appSecret: cdnConfig.appSecret,
    endpoint: cdnConfig.endpoint,
    apiVersion: cdnConfig.apiVersion,
  });

  it('DescribeDomainHttpCodeData', done => {
    co(function* () {
      const res = yield sdk.DescribeDomainHttpCodeData({
        DomainName: 'a.alipayobjects.com',
        StartTime: getUTCDate(25),  // 过去 20~25 分钟内的数据
        EndTime: getUTCDate(20),
      });
      expect(res.HttpCodeData).to.be.a.Object;
      expect(res.DataInterval).to.equal('300');
      done();
    });
  });

  it('DescribeDomainTopUrlVisit', done => {
    co(function* () {
      const res = yield sdk.DescribeDomainTopUrlVisit({
        DomainName: 'a.alipayobjects.com',
        StartTime: getUTCDate(60 * 12),
      });

      expect(res.Url400List.UrlList).to.be.a.Array;
      expect(res.Url500List.UrlList).to.be.a.Array;
      done();
    });

  });

  it('DescribeDomainPvData', done => {
    co(function* () {
      const res = yield sdk.DescribeDomainPvData({
        DomainName: 'a.alipayobjects.com',
        StartTime: getUTCDate(60 * 12),
        EndTime: getUTCDate(60 * 11),
      });

      expect(res.PvDataInterval.UsageData).to.be.a.Object;
      done();
    });
  });

  it('DescribeDomainReqHitRateData', done => {
    co(function* () {
      const res = yield sdk.DescribeDomainReqHitRateData({
        DomainName: 'a.alipayobjects.com',
        StartTime: getUTCDate(25),
        EndTime: getUTCDate(20),
      });
      expect(res.ReqHitRateInterval.DataModule).to.be.a.Object;
      done();
    });
  });

  it('DescribeDomainSrcFlowData', done => {
    co(function* () {
      const res = yield sdk.DescribeDomainSrcFlowData({
        DomainName: 'a.alipayobjects.com,as.alipayobjects.com,os.alipayobjects.com,zos.alipayobjects.com',
        StartTime: getUTCDate(25),
        EndTime: getUTCDate(20),
      });

      expect(res.SrcFlowDataPerInterval.DataModule).to.be.a.Array;
      done();
    });
  });

  it('DescribeDomainQpsData', done => {
    co(function* () {
      const res = yield sdk.DescribeDomainQpsData({
        DomainName: 'a.alipayobjects.com,as.alipayobjects.com,os.alipayobjects.com,zos.alipayobjects.com',
        StartTime: getUTCDate(25),
        EndTime: getUTCDate(25),
      });

      expect(res.QpsDataInterval.DataModule).to.be.a.Array;
      done();
    });
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
