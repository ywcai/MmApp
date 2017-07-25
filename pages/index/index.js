var util = require('../../utils/util.js')
var app = getApp()
Page({
  data: {
    telNum: "",
    userInfo: {},
    currentPayMode: 0,
    currentProduct: 0,
    isLocalProduct: 1,
    productList: [{
      orderId: 1,
      flow: 10,
      price: 2.5
    }, {
      orderId: 2,
      flow: 20,
      price: 2.8
    }, {
      orderId: 3,
      flow: 30,
      price: 3.7
    }, {
      orderId: 4,
      flow: 40,
      price: 2.5
    }
    ]
  },
  showTip: function (event) {
    wx.showToast({
      title: "你点击了:" + event.target.dataset.title,
      icon: 'success',
      duration: 2500
    })
  },
  prePay: function (e) {
    var that = this;
    wx.showLoading({
      title: '正在请求生成订单',
    }),
      wx.login({
        success: function (res) {
          if (res.code) {
            wx.request({
              url: 'http://119.6.204.54:8080/flow/mr/order/prepay',
              method: 'POST',
              header: {
                'content-type': 'application/x-www-form-urlencoded'
              },
              data:
              {
                jsCode: res.code,
                mobile: e.detail.value.mobile,
                product: that.data.productList[that.data.currentProduct].orderId,
                owner: that.data.isLocalProduct,
                fastPay: that.data.currentPayMode,
              },
              success: function (res2) {
                console.log(res2)
                wx.hideLoading()
                var timeStamp = util.getTimeStamp()
                var nonceStr = util.getNonceStr()
                var returnCode = res2.data.return_code
                var prePayId = res2.data.prepay_id
                if(returnCode=="SUCCESS")
                {
                wx.requestPayment({
                  'timeStamp': timeStamp,
                  'nonceStr': nonceStr,
                  'package': prePayId,
                  'signType': 'MD5',
                  'paySign': util.sign(timeStamp, nonceStr, prePayId),
                  'success': function (res3) {
                    console.log("支付成功");
                    wx.showToast({
                      title: "支付成功",
                      duration: 3000,
                    })
                  },
                  'fail': function (res3) {
                    console.log("支付失败:"+res3.errMsg)
                    wx.showToast({
                      title: "支付失败",
                      duration: 3000,
                    })
                  },
                })
                }
                else
                {
                  wx.showToast({
                    title: "服务端校验签名失败",
                    duration: 2000,
                  })
                }
              },
              fail: function () {
                wx.hideLoading()
                wx.showToast({
                  title: "服务端异常",
                  duration: 2000,
                })
              }
            })
          }
        },
        fail: function (res) {
          wx.hideLoading()
          wx.showToast({
            title: '身份验证失败',
            icon: '',
            image: '',
            duration: 2000,
          })
        }
      })
  },
  swichNav: function (e) {
    var that = this;
    if (this.data.currentPayMode === e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        currentPayMode: e.target.dataset.current
      })
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
    console.log(e.target);
  },

  switch1Change: function (e) {
    var that = this;
    if (e.detail.value == false) {
      that.setData({
        isLocalProduct: 0
      })
    }
    else {
      that.setData({
        isLocalProduct: 1
      })
    }
  },
  lookCopy: function (e) {
    var that = this
    that.setData({
      telNum: e.detail.value
    }
    )
  },
  lookRecord:function(e)
  {
    var that = this;
    wx.showLoading({
      title: '正在处理请求',
    }),
    wx.login({
      success: function (res) {
        if (res.code) {
          wx.request({
            url: 'http://119.6.204.54:8080/flow/mr/order/lookup',
            method: 'POST',
            header: {
              'content-type': 'application/x-www-form-urlencoded'
            },
            data:
            {
              jsCode: res.code,
            },
            success: function (res2) {
              wx.hideLoading()
              //等待显示数据
              console.log(res2.data);
              wx.showToast({
                title: "查询订单成功",
                duration: 2000,
              })
            },
            fail: function () {
              wx.hideLoading()
              wx.showToast({
                title: '服务端异常',
                icon: '',
                image: '',
                duration: 2000,
              })
            }
          })
        }
      },
      fail: function (res) {
        wx.hideLoading()
        wx.showToast({
          title: '身份校验失败',
          icon: '',
          image: '',
          duration: 2000,
        })
      }
    })



  },
  onLoad: function () {
    var that = this
    app.getUserInfo(function (userInfo) {
      that.setData({
        userInfo: userInfo
      })
    })
  }
})
