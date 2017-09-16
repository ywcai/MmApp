var md5 = require('md5.js')
var appId = 'wx6bd318aa259a7eea'
// var appKey='这里用的是商户密钥，非用户的sessionKey'


function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()
  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()
  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}
function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}
function getTimeStamp() {
  var date=new Date().getTime();
  return date+"" ;
}
function getNonceStr() {
 var noncestr = md5.MD5(Math.random()).toUpperCase();
 return noncestr+"";
}
function sign(timeStamp, nonceStr, prepay_id,key) 
{
  var src="appId="+appId
  src += "&nonceStr="+nonceStr
  src += "&package="+prepay_id
  src += "&signType=MD5"
  src += "&timeStamp="+timeStamp
  src += "&key="+appKey
  console.log("src:" + src)
  src = md5.MD5(src).toUpperCase()
  console.log("md5:" + src)
  return src;
}
function setMd5(src_str)
{
  var str=src_str+"ywcai";
  str = md5.MD5(str);
  return str
}
module.exports = {
  formatTime: formatTime,
  getTimeStamp: getTimeStamp,
  getNonceStr: getNonceStr,
  sign: sign,
  setMd5: setMd5
}
