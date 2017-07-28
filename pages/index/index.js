var util = require('../../utils/util.js')
var ls = require('../../utils/request.js')
var app = getApp()
Page({
  data: {
    telNum: "",
    inputTip: "输入手机号码后，可订购流量产品列表将自动刷新",
    province: "未知号码",
    userInfo: {},
    currentPayMode: 1,
    currentProduct: -1,
    isLocalProduct: 1,
    isLoading:0,
    productList: [],
    orderlist: []
  },
  showTip: function (event) {
    wx.showToast({
      title: '正在开发中，尽请期待!',
      duration: 2000,
      mask: true,
    })
  },

  showContact:function(event)
  {
    wx.showModal({
      title: '联系客户',
      content: '客户联系电话:XXXXXXX',
      showCancel:false,
      confirmText:"关闭"
    }) 
  },
  postPay:function(e)
  {
    var that=this;
    var event=e;

    if (that.data.currentProduct==-1)
    {
      wx.showToast({
        title: '未选择产品',
      })
      return 
    }


    wx.showModal({
      title: '请确认您提交的订单信息',
      content: '手机号=' + that.data.telNum + "  " + "号码归属=" + that.data.province+
      "  流量包大小=" + that.data.productList[that.data.currentProduct].flowsize+"M"+
      "  支付=" + that.data.productList[that.data.currentProduct].price/100+"元",
      success: function (res) {
        if (res.confirm) {
          that.prePay(that.event)
        }
      }
    })
  },

  prePay: function (e) {
    var that = this;
    if (that.data.isLoading==1)
    {
      console.log("请求中，重复点击");
      return ;
    }
    wx.showLoading({
      title: '请稍后',
    })
    if (that.data.currentProduct >= 0 && that.data.province != "未知号码" && that.data.telNum != "" && that.data.telNum.length == 11) {
      that.setData
        ({
          isLoading: 1
        })
      ls.login(that.loginSuccess2PrePay, that.loginFail);
    }
    else {
      wx.showToast({
        title: '订购信息错误!',
        duration: 2000,
        mask: true,
      })
    }
  },
  loginSuccess2PrePay: function (res) {
    var that = this;
    ls.createOrder(
      res.code,
      that.data.telNum,
      that.data.productList[that.data.currentProduct].productid,
      that.data.currentPayMode,
      that.createOrderOk,
      that.createOrderFail);
  },
  createOrderOk: function (prePayId) {
    //发起支付
    var that=this
    var timeStamp = util.getTimeStamp()
    var nonceStr = util.getNonceStr()
    wx.requestPayment({
      'timeStamp': timeStamp,
      'nonceStr': nonceStr,
      'package': prePayId,
      'signType': 'MD5',
      'paySign': util.sign(timeStamp, nonceStr, prePayId),
      'success': function (res) {
        console.log("支付成功" + res);
        wx.showToast({
          title: "支付成功",
          duration: 3000,
        })
        that.setData(
          {
            isLoading: 0
          }
        )
      },
      'fail': function (res) {
        console.log("支付失败:" + res.errMsg)
        wx.showToast({
          title: "支付失败",
          duration: 3000,
        })
        that.setData(
          {
            isLoading: 0
          }
        )
      },
    })
  },
  createOrderFail: function (errCode) {
    var that=this
    wx.showToast({
      title: "生成订单失败:" + errCode,
      duration: 3000,
    })
    that.setData(
      {
        isLoading:0
      }
    )
  },

  swichNav: function (e) {
    var that = this;
    if (that.data.isLocalProduct === e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        isLocalProduct: e.target.dataset.current
      })
    }
    if (that.data.province != "未知号码" && that.data.telNum != "" && that.data.telNum.length == 11) {
      ls.getProduct(
        that.setProduct,
        that.data.province,
        that.data.isLocalProduct);
    }
  },

  selectProduct: function (e) {
    var that = this;
    if (this.data.currentProduct === e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        currentProduct: e.target.dataset.current
      })
    }
  },


  closeRecord: function (e) {
    var that = this
    that.setData({
      isShowRecord: 0
    })
  },

  switch1Change: function (e) {
    var that = this;
    if (e.detail.value) {
      that.setData({
        currentPayMode: 1
      })
    } else {
      that.setData({
        currentPayMode: 0
      })
    }
  },


  lookCopy: function (e) {
    var that = this
    if (e.detail.value != that.data.telNum) {
      that.setData({
        telNum: e.detail.value,
      }
      )
      ls.getProvince(that.data.telNum, that.getMobileSuccess, that.getMobileFail);
    }
  },

  getMobileSuccess: function (res) {
    console.log("查询电话归属地成功" + res.data);
    var that = this
    that.setData({
      province: res.data.carrier,
      inputTip: res.data.carrier,
      currentProduct: -1
    }
    )
    ls.getProduct(
      that.setProduct,
      that.data.province,
      that.data.isLocalProduct);
  },
  getMobileFail: function () {
    var that = this
    that.setData({
      province: "未知号码",
      inputTip: "未知号码",
      currentProduct: -1
    }
    )
    that.setProduct([]);
  },



  //加载订单记录
  lookRecord: function (e) {
    var that = this;
    ls.login(that.loginSuccess2Record, that.loginFail);
  },
  getOrderSuccess: function (orders) {
    var that = this;
    that.setData({
      orderlist: orders
    })
  },
  getOrderFail: function () {
    var that = this;
    that.setData({
      orderlist: [{ ordernum: '加载您的订单失败', status: '', timestamp: '' }]
    })
  },


  //登录成功的回调
  loginSuccess2Record: function (res) {
    var that = this;
    that.setData(
      {
        isShowRecord: 1,
        orderlist: [{ ordernum: '正在加载您的订单', status: '', timestamp: '' }]
      }
    );
    ls.getOrders(res, that.getOrderSuccess, that.getOrderFail);
  },
  loginFail: function () {
    var that=this;
    wx.showToast({
      title: '登录失败',
      duration: 2000
    })
    that.setData(
      {
        isLoading: 0
      }
    )
  }
  ,
  setProduct: function (productLists) {
    var that = this;
    that.setData(
      {
        productList: productLists
      }
    )
  },
  onLoad: function () {
    var that = this
    app.getUserInfo(function (userInfo) {
      that.setData({
        userInfo: userInfo
      })
    })
    // ls.getProduct(
    //   that.setProduct,
    //   that.data.province,
    //   that.data.isLocalProduct);
  }
})
