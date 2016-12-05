# aliyun-sdk

阿里云 CDN API SDK

## 初始化

```javascript

const co = require('co');
const SDK = require('ali-cdn-sdk);

const CONFIG = {
  accessKeyId: '在阿里云OSS申请的 accessKeyId',
  appSecret: '在阿里云OSS申请的 secretAccessKey',
  endpoint: 'https://cdn.aliyuncs.com',
  apiVersion: '2014-11-11',
};

co(function* () {
  const sdk = new SDK(CONFIG);
  const res = yield sdk.DescribeDomainHttpCodeData({
    DomainName: 'a.alipayobjects.com',
    StartTime: getUTCDate(25),  // 过去 20~25 分钟内的数据
    EndTime: getUTCDate(20),
  });
  expect(res.HttpCodeData).to.be.a.Object;
  expect(res.DataInterval).to.equal('300');
});

```

### 目前支持的 API

请查看 `lib/apis.js`, 如果有需要，可以提交 MR 新增


## 链接

- [CDN 接口文档](https://help.aliyun.com/document_detail/27148.html?spm=5176.doc27148.6.603.5Tehoi)
