var util = require('util.js')

var appId = 'wx6bd318aa259a7eea'
function getProduct(cb,cb2, province, isLocal) {
  wx.request({
    url: 'https://yngj.bkshare.cn/flow/mr/product',
    method: 'POST',
    header: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    data:
    {
      province:province,
      local:isLocal
    },
    success: function (res) {
      if(res.statusCode==200)
      {
      cb(res.data);
      console.log(res.data);
      console.log("加载产品成功");
      }
      else{
        cb2();
        console.log("服务端返回数据错误!");  
      }
    },
    fail: function (res) {
      cb2();
      console.log("服务端返回数据错误!");  
    }
  })
}
function getOrders(res, getSuccess, getFail) {
  wx.request({
    url: 'https://yngj.bkshare.cn/flow/mr/order/lookup',
    method: 'POST',
    header: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    data:
    {
      jsCode: res.code,
    },
    success: function (temp) {
      getSuccess(temp.data)
    },
    fail: function () {
      getFail();
    }
  })
}

function login(loginSuccess, loginFail) {
  wx.login({
    success: function (res) {
      if (res.code) {
        loginSuccess(res);
      }
      else {
        loginFail();
      }
    },
    fail: function () {
      loginFail();
    }
  })
}

function getProvince(mobile,success,fail)
{
  wx.request({
    url: 'https://yngj.bkshare.cn/flow/mr/tel/' + mobile,
    method: 'GET',
    success: function (res) {
      if (res.data.return_code == "SUCCESS")
      {
        success(res)
      }
      else
      {
        fail();
      }
    },
    fail: function () {
      fail();
    }
  })
}


function createOrder(jscode,tel,productId,fastpay, createOk, createFail) {

  wx.request({
    url: "https://yngj.bkshare.cn/flow/mr/order/prepay",

    method: 'POST',
    header: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    data:
    {
      jsCode: jscode,
      mobile: tel,
      product: productId,
      fastPay: fastpay
    },
    success: function (res) {
      console.log(res);
      if (res.data.return_code=="SUCCESS")
      {
        createOk(res.data.prepay_id);
      }
      else
      {
        createFail(res.data.return_msg);
      }
    },
    fail: function () {
      createFail("网络连接失败");
    }
  })
}
function getHeadImg(func1, func2)
{
  var nonce_Str = util.getNonceStr();
  console.log(nonce_Str);
  wx.request({
    url: 'https://yngj.bkshare.cn/manage/app/config',
    method: 'POST',
    header: {
      'content-type': 'application/json'
    },
    data:
    {
      appid: appId,
      nonce_str: nonce_Str,
      sign: util.setMd5(appId + nonce_Str)
    },
    success: function (res) {
      if (res.data.return_code == "SUCCESS") {
        func1(res)
      }
      else {
        func2();
      }
    },
    fail: function () {
      func2();
    }
  })
}

module.exports = {
  getProduct: getProduct,
  getOrders: getOrders,
  login: login,
  createOrder: createOrder,
  getProvince: getProvince,
  getHeadImg: getHeadImg,
}
