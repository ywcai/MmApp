var util = require('../../utils/util.js')
var ls = require('../../utils/request.js')
var app = getApp()
Page({
  data: {
    telNum: "",
    inputTip: "输入手机号码后，自动刷新流量订购产品列表",
    province: "未知号码",
    userInfo: {},
    currentPayMode: 1,
    currentProduct: -1,
    isLocalProduct: 1,
    isLoading: 0,
    productList: [],
    orderlist: [],
    imgUrls: [
      'https://yngj.bkshare.cn/res/images/index_head_1.jpg',
      'https://yngj.bkshare.cn/res/images/index_head_2.jpg',
      'https://yngj.bkshare.cn/res/images/index_head_3.jpg'
    ]
  },
  showTip: function (event) {
    wx.showToast({
      image: '../../image/more.png',
      title: '正在开发中，尽请期待!',
      duration: 2000,
      mask: true,
    })
  },
  showFail: function (event) {
    wx.showToast({
      image: '../../image/error.png',
      title: event,
      duration: 2000,
      mask: true,
    })
  },

  showContact: function (event) {
    wx.showModal({
      title: '联系客户',
      content: '客户联系电话:XXXXXXX',
      showCancel: false,
      confirmText: "关闭"
    })
  },
  postPay: function (e) {
    var that = this;
    var event = e;

    if (that.data.currentProduct == -1) {
      that.showFail("未选择产品");
      return
    }
    wx.showModal({
      title: '请确认您提交的订单信息',
      content: '手机号=' + that.data.telNum + "  " + "号码归属=" + that.data.province +
      "  流量包大小=" + that.data.productList[that.data.currentProduct].des +
      "  支付=" + that.data.productList[that.data.currentProduct].price * that.data.productList[that.data.currentProduct].rate / 10000 + "元",
      success: function (res) {
        if (res.confirm) {
          that.prePay(that.event)
        }
      }
    })
  },

  prePay: function (e) {
    var that = this;
    if (that.data.isLoading == 1) {
      console.log("请求中，请勿重复点击");
      return;
    }
    wx.showLoading({
      title: '处理中',
      mask: true,
    })
    if (that.data.currentProduct >= 0 && that.data.province != "未知号码" && that.data.telNum != "" && that.data.telNum.length == 11) {
      that.setData
        ({
          isLoading: 1
        })
      ls.login(that.loginSuccess2PrePay, that.loginFail);
    }
    else {
      // wx.showToast({
      //   title: '订购信息错误!',
      //   duration: 2000,
      //   mask: true,
      // })
      that.showFail("订购信息错误");
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
    var that = this
    var timeStamp = util.getTimeStamp()
    var nonceStr = util.getNonceStr()
    wx.requestPayment({
      'timeStamp': timeStamp,
      'nonceStr': nonceStr,
      'package': "prepay_id=" + prePayId,
      'signType': 'MD5',
      'paySign': util.sign(timeStamp, nonceStr, "prepay_id=" + prePayId),
      'success': function (res) {
        console.log("支付成功" + res.errMsg);
        wx.showToast({
          title: "支付成功",
          duration: 3000,
          mask: true,
        })
        that.setData(
          {
            isLoading: 0
          }
        )
      },
      'fail': function (res) {
        console.log("支付失败:" + res.errMsg)
        // wx.showToast({
        //   title: res.errMsg,
        //   duration: 3000,
        //   mask: true,
        // })
        that.showFail("支付失败:" + res.errMsg);
        that.setData(
          {
            isLoading: 0
          }
        )
      },
    })
  },
  createOrderFail: function (errCode) {
    var that = this
    // wx.showToast({
    //   title: "生成订单失败:" + errCode,
    //   duration: 3000,
    //   mask: true,
    // })
    that.showFail("生成订单失败" + errCode);
    that.setData(
      {
        isLoading: 0
      }
    )
  },

  swichNav: function (e) {
    var that = this;
    if (that.data.isLocalProduct === e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        isLocalProduct: e.target.dataset.current,
        currentProduct: -1
      })
    }
    if (that.data.province != "未知号码" && that.data.telNum != "" && that.data.telNum.length == 11)    {
      ls.getProduct(
        that.setProduct,
        that.getProductFail,
        that.data.province,
        that.data.isLocalProduct);
    }
  },
  getProductFail:function()
  {
    var that = this;
    console.log("获取产品信息失");
    that.showFail("获取产品信息失败!")
    that.setProduct([]);
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
        telNum: e.detail.value
      });

      if (that.data.telNum === "") {
        that.setData({
          inputTip: "输入手机号码后，自动刷新流量订购产品列表"
        })
      }
      else if (that.data.telNum.length != 11) {
        that.getMobileFail();
      }
      else {
        ls.getProvince(that.data.telNum, that.getMobileSuccess, that.getMobileFail);
      }
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
      that.getProductFail,
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
        orderlist: [{ ordernum: '正在加载您的订单', status: '', totalfee: 0 }]
      }
    );
    ls.getOrders(res, that.getOrderSuccess, that.getOrderFail);
  },
  loginFail: function () {
    var that = this;
    // wx.showToast({
    //   title: '登录失败',
    //   duration: 2000,
    //   mask: true,
    // })
    that.showFail("登录失败");
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

  getHeadImgSuccess: function (res) {
    //设置网络图片
    var that = this;
    that.setData({
      imgUrls: [
        'https://yngj.bkshare.cn/res/images/index_head_1.jpg',
        'https://yngj.bkshare.cn/res/images/index_head_2.jpg',
        'https://yngj.bkshare.cn/res/images/index_head_3.jpg'
      ]
    })
  },
  getHeadImgFail: function () {
    //设置网络图片
    var that = this;
    that.setData({
      imgUrls: [
        '../../image/head.png',
      ]
    })
  },

  onLoad: function () {
    var that = this
    app.getUserInfo(function (userInfo) {
      that.setData({
        userInfo: userInfo
      })
    });
    // ls.getHeadImg(
    //   that.getHeadImgSuccess, that.getHeadImgSuccess
    // );
  }
  ,
  onPullDownRefresh: function () {
    // Do something when pull down.
    wx.stopPullDownRefresh();
  },
})
