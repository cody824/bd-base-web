/**
 * 依赖的js库文件
 * /js/lib/surejs/sureAuth.js
 * /js/lib/surejs/sureMsg.js
 * /js/lib/jquery/jquery.form.js
 * 
 * ajax调用
 */
(function($) {
	'use strict';
	
	$(document).ajaxComplete(function(event,xhr,options){
		if (!SureAjax.autoLogin)
			return;
		var httpCode = xhr.status;
		var needLoad = false;
		
		if (httpCode == '401') {
			needLoad = true;
		} else {
			 var me = this, errorJson = null;
             var errorMsg = xhr.responseText;
             if (xhr.hasOwnProperty("responseJSON")) {
                 errorJson = xhr.responseJSON;
             } else {
                 try {
                     errorJson = eval("(" + errorMsg + ")");
                 } catch (error) {
                 }
             }
             if (errorJson != null && errorJson.errorNum === 401) {
            	 needLoad = true;
             } 
		}
		if (needLoad) {
			if (SureAjax.redirect401)
				window.location.href = SureAjax.redirect401;
			else
				window.location.reload();
		}
	});

	function isIE() {
		//return !!window.ActiveXObject;
		return $.os.trident;
	}

	
	function processUrl(url, params) {
		if (url.indexOf("?") < 0) {
			url = url + "?";
		} else {
			url = url + "&";
		}
		if (typeof(params) != 'undefined') {
			for(var key in params)  {
				var temp = key + "=" + params[key];
				url = url + temp + "&";
			}
		}

		if (isIE()) {
			url += ("__ul=" + new Date().getTime());
		}

		return url;
	}

	window.SureAjax = {
	                   
			autoLogin : true,
			
			redirect401 : null,
			
			hiddenHttpMethod : true,
			
			
			/**
			 * 初始化请求参数
			 * @param options
			 * 			jquery ajax函数参数
			 * 			loadMask 是否显示loadMask, 默认不显示
			 * 			parseError 是否解析错误，并显示 默认为true
			 * 			checkXSS 	是否检查xss攻击，默认false
			 * 						如果为true，会自动替换<,>,",'进行转码
			 */
			initOptions : function(options){
				options = options || new Object();
				var loadMask = options.loadMask || false;
				var parseError = true;
				
				if (options.hasOwnProperty("parseError")) {
					parseError = options.parseError;
				}
				
				options.checkXSS = options.checkXSS || false; 
				
				var successFunc = options.success;
				var errorFunc = options.error;
				
				options.headers = options.headers || {};
				options.headers.Accept = options.headers.Accept || "application/json";

				if (parseError && options.dataType != 'jsonp') {
		        	 options.error = function(xhr, b, c){
						 if (loadMask) {
							 SureMsg.hideLoadBar();
						 }
		 	        	SureMsg.parseResponse(xhr,function(){
		 	 	        	if (typeof (errorFunc) == "function")
		 	 	        		errorFunc(xhr);
		 	        	});

		 	        };
		        } 
		        
		        options.success = function(xhr){
					if (loadMask) {
						SureMsg.hideLoadBar();
					}
		        	if (typeof (successFunc) == "function") {
		        		if (xhr && xhr.hasOwnProperty('errorNum') && xhr.hasOwnProperty('errorMsg')) {
		        			if (parseError && options.dataType != 'jsonp') {
		        				SureMsg.showErrorInfo("执行出错", SureError.parseErrorMsg(xhr), function(){
		        					if (typeof (errorFunc) == "function")
				 	 	        		errorFunc(xhr);
		        				});
		        			} else {
		        				if (typeof (errorFunc) == "function")
			 	 	        		errorFunc(xhr);
		        			}
		        		
		        		} else {
		        			if (options.msg && options.msg.length > 0)
				        		SureMsg.msg(options.msg);
		        			successFunc(xhr);
		        		}
		        	}
		        };
		        

				if (loadMask) {
					var showMsg = typeof loadMask == "string" ? loadMask : "执行中";
					SureMsg.showLoadBar(showMsg);
				}
				return options;
			        
			},
				
			ajax : function(options){
				options = SureAjax.initOptions(options);
		        if (options.checkXSS) {
		        	if (options.data) {
		        		for (var p in options.data) {
		        			if (options.data[p] != null && typeof(options.data[p]) === 'string' && options.data[p].trim() != "" ) {
		        				options.data[p] = SureAjax.xsscheck(options.data[p]);
		        			}
		        		}
		        	}
		        }
				options.url = processUrl(options.url, {
					_method : options.type
				});
				
				if (this.hiddenHttpMethod && options.type == 'PUT' || options.type == 'put' || options.type == "delete" || options.type == "DELETE")
					options.type = 'POST';
				
				$.ajax(options);
			},
			
			formSubmit : function(form, options){
				options = SureAjax.initOptions(options);
		        if (options.checkXSS) {
		       	 	$(form).find('input').each(function(){
		            	var val = SureAjax.xsscheck($(this).val());
		            	$(this).val(val);
		            });
		            $(form).find('textarea').each(function(){
		            	var val = SureAjax.xsscheck($(this).val());
		            	$(this).val(val);
		            });
		        }
				options.url = processUrl(options.url);
		        $(form).ajaxSubmit(options);
			},
			
			xsscheck : function(val) {
			    val = val.toString();
			    val = val.replace(/[<]/g, "&lt;");
			    val = val.replace(/[>]/g, "&gt;");
			    val = val.replace(/%3C/g, "&lt;");
			    val = val.replace(/%3E/g, "&gt;");
			    val = val.replace(/"/g, "&quot;");
			    val = val.replace(/'/g, "&#39;");
			    val = val.replace(/\n/g, "&#10;");
			    val = val.replace(/\r\n/g, "&#10;");
			    return val;
			},
			
			load : function(selecter, options){
				var callback = options.callback || function(){};
				var func = function(response){
					var html = response.responseText || response;
					$(selecter).html(html);
					callback();
				};
				options.complete = func;
				options.method = "GET";
				options.headers = options.headers || {};
				options.headers.Accept = options.headers.Accept || "text/html,application/xhtml+xml,application/xml";
				options.loadMask = false;
				SureAjax.ajax(options);
			},
			
			get :function(url, success, error) {
				$.ajax({
					url : processUrl(url),
			        type : "GET",
			        headers : {
						Accept : "application/json"
					},
					dataType : "json",
			        beforeSend: function(request,options) {
			        		//nothing
			        },           
			        success:function(data){
			        	if(success != null){
			        		success(data);
			        	}
			        },
			        error : function(response){
			        	if(error != null){
			        		error();
			        	}
			        }
			     });
			},
			

			put :function(url, params, success, error, isJson) {
				var sendData = params;
				if (isJson) {
					sendData = $.toJSON(params);
					$.ajax({
						url : processUrl(url),
				        type : "PUT",
				        headers : {
							Accept : "application/json"
						},
						dataType : "json",
						contentType: "application/json",
						data: sendData | "{}",
				        beforeSend: function(request,options) {
				        		//nothing
				        },           
				        success:function(data){
				        	if(success != null){
				        		success(data);
				        	}
				        },
				        error : function(response){
				        	if(error != null){
				        		error(response);
				        	}
				        }
				     });
				} else {
					$.ajax({
						url : processUrl(url, params),
				        type : "PUT",
				        headers : {
							Accept : "application/json"
						},
						dataType : "json",
						contentType: "application/json",
				        beforeSend: function(request,options) {
				        		//nothing
				        },           
				        success:function(data){
				        	if(success != null){
				        		success(data);
				        	}
				        },
				        error : function(response){
				        	if(error != null){
				        		error(response);
				        	}
				        }
				     });
				}
				
				
			},
			
			post :function(url, params, success, error, isJson) {
				var sendData = params;
				if (isJson) {
					sendData = $.toJSON(params);
					$.ajax({
						url : processUrl(url),
				        type : "POST",
				        headers : {
							Accept : "application/json"
						},
						dataType : "json",
						contentType: "application/json",
						data: sendData,
				        beforeSend: function(request,options) {
				        		//nothing
				        },           
				        success:function(data){
				        	if(success != null){
				        		success(data);
				        	}
				        },
				        error : function(response){
				        	if(error != null){
				        		error(response);
				        	}
				        }
				     });
				} else {
					$.ajax({
						url : processUrl(url, params),
				        type : "POST",
				        headers : {
							Accept : "application/json"
						},
						dataType : "json",
						contentType: "application/json",
				        beforeSend: function(request,options) {
				        		//nothing
				        },           
				        success:function(data){
				        	if(success != null){
				        		success(data);
				        	}
				        },
				        error : function(response){
				        	if(error != null){
				        		error(response);
				        	}
				        }
				     });
				}
				
				
			},
			
			del : function(url, success, error) {
				$.ajax({
					url : processUrl(url),
			        type : "DELETE",
			        headers : {
						Accept : "application/json"
					},
					dataType : "json",
			        beforeSend: function(request,options) {
			        		//nothing
			        },           
			        success:function(data){
			        	if(success != null){
			        		success(data);
			        	}
			        },
			        error : function(response){
			        	if(error != null){
			        		error();
			        	}
			        }
			     });
			}
		};
	
}(jQuery));

