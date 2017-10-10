
/**
 * 依赖的js库文件
 * /js/lib/algo/md5.js
 * /js/lib/jquery/plugin/jquery.cookie.js
 * /js/lib/surejs/v2/sureAjax.js
 * /js/lib/surejs/v2/sureMsg.js
 */


(function($) {
	'use strict';

    window.LoginUtil=function(option){
	
	var me = this;
	
	if(typeof(ACTION_URL) == 'undefined')
		ACTION_URL = {};
	
	var cOption = option || new Object();
	
	 /**  
     * @cfg {String}   应用ID
     */ 
	this.appId = cOption.appId;
	
	 /**  
     * @cfg {Number}   验证码的长度，默认为4
     */ 
	this.authcodeLength = cOption.authcodeLength || 4;
	
	/**  
     * @cfg {String}   验证码请求url
     */ 
	this.authcodeurl = cOption.authcodeurl || ACTION_URL.AUTHCODE_URL || "/suresecurity/authcode";
	
	/**  
     * @cfg {String}   登陆/注销的基础url，需要在后面加登陆名
     */ 
	this.loginurl = cOption.loginurl || ACTION_URL.LOGIN_URL || "/suresecurity/login";
	
	/**  
	 * 判断验证码是否正确
     * @param authcode 	{String} 需要验证的验证码   
     * @param fn 		{Function} 验证完成的回调函数，需要一个参数{Boolean}判断是否成功 
     */ 
	this.validateAuthcode = function(authcode, fn) {
		SureAjax.ajax({
			url : me.authcodeurl,
			type : 'POST',
			parseError : false,//屏蔽sureajax 默认错误处理
			data : {
				authcode : authcode,
				clientId : browserClientId
			},
			success : function(){
				fn(true);
			},
			error : function(){
				fn(false);
			}
		});
	};
	
	/**  
	 * 对验证码相关的浏览器对象进行标准事件绑定
     * @param imgId 	{String} 验证码图片ID   
     * @param inputId 	{String} 输入验证码的文本框ID 
     * @param statusId	{String} 显示验证码状态的图片ID  
     */ 
	this.bindAuthcodeInputEvent = function(imgId, inputId, statusId){
		var random_number = parseInt(Math.random() * 10);
		var imgEl = $("#" + imgId);
		var inputEl = $("#" + inputId);
		var statusEl = $("#" + statusId);
		if (imgEl)
			imgEl.attr("src", me.authcodeurl + "?clientId=" + SureClientId + "&_r=" + random_number);
		if (inputEl) {
			var maxLength = inputEl.attr("maxLength");
			inputEl.attr("maxLength", me.authcodeLength);
			inputEl.keyup(function(){
				var value = inputEl.val();
				if (value.length == me.authcodeLength) {
					me.validateAuthcode(value, function(isOk){
						if (isOk) {
							statusEl.attr("src", "/img/icon22/onCorrect.gif");
							statusEl.attr("codestatus", true);
						} else  {
							statusEl.attr("src", "/img/icon22/onError.gif");
							statusEl.attr("codestatus", false);
						}
					});  
				} else if (value.length < me.authcodeLength){
					statusEl.attr("src", "/img/icon22/onFocus.gif");
					statusEl.attr("codestatus", false);
				}
			});
			inputEl.focus(function(){
				statusEl.attr("src", "/img/icon22/onFocus.gif");
			});
			inputEl.blur(function(){
				var value = inputEl.val();
				if (value.length < me.authcodeLength){
					statusEl.attr("src", "/img/icon22/onError.gif");
					statusEl.attr("codestatus", false);
				}
			});
		}
	};

	this.login = function(name, passwd, authcode, fn) {
		var me = this;
		SureMsg.showLoadBar("登陆中");
		passwd = calcMD5(passwd);
		SureAjax.ajax({
			url : me.loginurl + "/" + name,
			type : 'POST',
			headers : {
				Accept : 'application/json',
			},
			data : {
				appId : me.appId,
				password : passwd,
				authcode : authcode,
				clientId : SureClientId
			},
			success : function(res) {
				SureMsg.hideLoadBar();
				var loginInfo = res;
				SureAuthInfo.saveLoginName(loginInfo.userName);
				SureAuthInfo.saveAccessKeyID(loginInfo.accessKeyId);
				SureAuthInfo.saveSecretAccessKeyID(loginInfo.secretAccessKeyId);
				SureMsg.msg(LABEL.login, LABEL.success);
				if (fn)
					fn(loginInfo);
			},
			error : function(res) {
			//	SureMsg.hideLoadBar();
			//	SureMsg.parseResponse(res);
			}
		});
	};

	this.logout = function(callback) {
		SureAjax.ajax({
			url : me.loginurl + "/" + SureAuthInfo.getLoginName(), // 请求的地址
			params : {
				userName : SureAuthInfo.getLoginName()
			},
			//method : 'DELETE',
			type:'DELETE',
			success : function(response, option) {
				SureAuthInfo.clearLoginInfo();
				SureMsg.msg(LABEL.logout, LABEL.success);
				if (typeof(callback) === "function") {
					callback();
				} else {
					window.location.replace("/");
				}
			},
			failure : function() {
				SureAuthInfo.clearLoginInfo();
				if (typeof(callback) === "function") {
					callback();
				} else {
					window.location.replace("/");
				}
			}
		});

	};

	// 登录处理
	this.onLogin = function(button, e, eOpts) {
		var me = this, f = button.up('form').getForm(), lw = button
				.up("window");

		if (f.isValid()) {
			var isRememberMe = lw.rememberMe.getValue();
			if (isRememberMe) {
				localStorage.setItem("Soul.rememberMe",
						f.getFieldValues().userName);
			} else {
				localStorage.removeItem("Soul.rememberMe");
			}
			me.login(f.getFieldValues().userName, f.getFieldValues().password,
					f.getFieldValues().authcode);
		}
	};

	// 改变记住用户名状态，取消记录直接删除记录状态
	this.changeRememberMe = function(checkbox, newValue, oldValue, eOpts) {
		if (!newValue) {
			localStorage.removeItem("Soul.rememberMe");
		}
	};

	// 是否开启自动登录
	/**  
	 * 是否开启自动登录
     * @param checkbox 	{Object} checkbox   
     * @param newValue 	{boolean} 是否开启 
     * @param oldValue	{boolean} checkbox过去的选中值  
     */ 
	this.changeAvoidLogin = function(checkbox, newValue, oldValue, eOpts) {
		SureAuthInfo.changeAutoLogin(newValue);
		SureAuthInfo.changeSaki(newValue);
	};

};

}(jQuery));