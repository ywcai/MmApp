var md5 = require('md5.js')
var appId = 'wxd678efh567hg6787'
var appKey = '小程序API接口密钥，非用户的sessionKey'
function getProduct(cb, province, isLocal) {
  wx.request({
    url: 'https://yngj.bkshare.cn:8080/flow/mr/product',
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
        console.log("服务端返回数据错误!");  
      }
    },
    fail: function (res) {
      console.log("服务端返回数据错误!");  
    }
  })
}
function getOrders(res, getSuccess, getFail) {
  wx.request({
    url: 'https://yngj.bkshare.cn:8080/flow/mr/order/lookup',
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
    url: 'https://yngj.bkshare.cn:8080/flow/mr/tel/' + mobile,
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
    url: "https://yngj.bkshare.cn:8080/flow/mr/order/prepay",

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




module.exports = {
  getProduct: getProduct,
  getOrders: getOrders,
  login: login,
  createOrder: createOrder,
  getProvince: getProvince
}
