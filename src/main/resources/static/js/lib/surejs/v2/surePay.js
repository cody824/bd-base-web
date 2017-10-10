!(function (window, $) {

    
    var __PayReq = function(options){
    	
    	var defaultReq = {
		    busId: null,              	//业务ID	充值时为需要充值账户ID
		    busType: "",             	//支付业务类型
		    pdUserId : null,			//业务使用者ID，如服务站点ID
		    money: 0,                	//支付金额 仅场景为recharge、sponsor时有效
		    useAccount : false,			//是否使用账户余额支付
		    useTPP : true,				//是否使用第三方支付
		    tradeCode : "",				//内部交易码
		    payWay : "",				//支付类型
		    subject: "支付",            	//支付订单主题
		    note: null,                	//交易备注
		    showUrl: "/" ,            	//货品展示地址
		    redirectUrl : "",			//支付成功后重定向页面
		    extraInfo : "",				//附加信息
		    wecatTradeType: ($.os.wechat)?"JSAPI":"NATIVE", //JSAPI:公共号支付，NATIVE扫码支付
    	};
    	this.config = $.extend({}, defaultReq, options);
    }
    
    window.PayRequest = __PayReq;

    var __PayApiUtil = {
         //支付方式
        PAY_TYPE_ALI: 'ali', //支付宝
        PAY_TYPE_UPOP: 'upop', //银联
        PAY_TYPE_WECHAT: 'wechat',//微信
        
        isSubmit : false,
	
    	updateFormInfo : function (config, payReq){
		    $("#" + config.payFormId + "  input[name='busType']").val(payReq.busType);
		    $("#" + config.payFormId + "  input[name='tradeCode']").val(payReq.tradeCode);
		    $("#" + config.payFormId + "  input[name='payWay']").val(payReq.payWay);
		    $("#" + config.payFormId + "  input[name='subject']").val(payReq.subject);
		    $("#" + config.payFormId + "  input[name='note']").val(payReq.note);
		    $("#" + config.payFormId + "  input[name='showUrl']").val(payReq.showUrl);
		    $("#" + config.payFormId + "  input[name='wecatTradeType']").val(payReq.wecatTradeType);
		    $("#" + config.payFormId + "  input[name='redirectUrl']").val(payReq.redirectUrl);
		    $("#" + config.payFormId + "  input[name='extraInfo']").val(payReq.extraInfo);
		},
		
		buildPayPopHtml : function (config){
		
			var returnHtml = "";
			//弹出 支付提示
			returnHtml+=' <div class="pay_tip  hidden">';
			returnHtml+='   <h3>请在第三方的支付页面完成支付</h3>';
			returnHtml+='   <p class="help-block">支付完成前请不要关闭此窗口，完成支付后根据您的情况点击下面的按钮</p>';
			returnHtml+='   <div class="btn_group">';
			returnHtml+='       <a href="javaScript:void(0)" class="success">已完成支付</a>';
			returnHtml+='       <a href="javascript:void (0);" class="fail">支付遇到问题</a>';
			returnHtml+='    </div>';
			returnHtml+=' </div>';
			
			returnHtml+=' <div id="pay_fail_box" class="hidden">';
			returnHtml+='   <div class="pay_fail" >';
			returnHtml+='    <h3>如果您的支付遇到问题</h3>';
			returnHtml+='    <p class="help-block">请联系客服电话:'+ config.companyPhone+'，QQ:'+ config.companyQQ+'</p>';
			returnHtml+='    <div class="btn_group">';
			returnHtml+='       <a href="javascript:void (0);" class="confirm">确定</a>';
			returnHtml+='    </div>';
			returnHtml+='   </div>';
			returnHtml+='</div>';
			
			returnHtml+='<div class="wechatPay_box hidden wx_pay_tip">';
			returnHtml+=' <p>微信扫码支付</p>';
			returnHtml+='  <div class="qrcode" id="wechatPayImage"></div>';
			returnHtml+='  <div class="tips"><img src="' + config.staticUrl+'img/pc/scan_code_tips.png"></div>';
			returnHtml+='</div>';

			return returnHtml;
		
		},
		
		initPopEvent : function(config, sCB){
			$('.btn_group .fail').unbind('click');
			$('.btn_group .fail').click(function () {
			    $(".aui_header .aui_title").text("温馨提示");
			    $(".aui_content").html($("#pay_fail_box").html());
			    $(".btn_group .confirm").click(function () {
			    	SureUtil.closeDialog('popDoPayingDialog');
			    });
			});
			//遮罩按钮事件
			$('.pay_tip .success').unbind('click');
			$('.pay_tip .success').click(function () {
			   if (typeof sCB == "function") sCB();
			    SureUtil.closeDialog('popDoPayingDialog');
			});
		},
		
		buildPayFormHtml : function (config) {
			var returnHtml = "";
			returnHtml += '  <form id="' + config.payFormId +'" name="alipayment" action="' + config.baseUrl + 'submit" method="post" target="_blank">';
			returnHtml += '       <input name="busType" type="hidden" value="">';
			returnHtml += '       <input name="tradeCode" type="hidden" value="">';
			returnHtml += '       <input name="payWay" type="hidden" value="">';
			returnHtml += '       <input name="subject" type="hidden" value=""/>';
			returnHtml += '       <input name="note" type="hidden"  value=""/>'; // note支付订单描述
			returnHtml += '       <input name="showUrl" value="/u/center#order" type="hidden"/>';           //订单浏览地址，充值没有
			returnHtml += '       <input name="wecatTradeType" value="NATIVE" type="hidden"/>';
			returnHtml += '       <input name="redirectUrl" value="" type="hidden"/>';
			returnHtml += '       <input name="extraInfo" value="" type="hidden"/>';
			returnHtml += '<ul>';
			for (var i = 0; i < config.supportPayWay.length; i++) {
				if (config.supportPayWay[i] == SurePayUtil.PAY_TYPE_UPOP) {
				    returnHtml += '<li>';
				    returnHtml += ' <input id="unipay" type="radio" name="formPayWayR"  value="upop">';
				    returnHtml += ' <label for="unipay"><img src="' + config.staticUrl + 'img/pc/Unionpay_img.png" width="150" height="45" alt="银联在线支付"></label>';
				    returnHtml += '</li>';
				}
				if (config.supportPayWay[i] == SurePayUtil.PAY_TYPE_ALI) {
				    returnHtml += '<li>';
				    returnHtml += ' <input id="alipay" type="radio" name="formPayWayR"  value="ali">';
				    returnHtml += ' <label for="alipay"><img src="' + config.staticUrl + 'img/pc/alipay_img.png" width="150" height="45" alt="支付宝"></label>';
				    returnHtml += '</li>';
				}
				if (config.supportPayWay[i] == SurePayUtil.PAY_TYPE_WECHAT&&($.os.wechat||!$.os.mobile||$.os.iPad)) {
				    returnHtml += '<li>';
				    returnHtml += ' <input id="wechat" type="radio" name="formPayWayR"  value="wechat">';
				    returnHtml += ' <label for="wechat"><img src="' + config.staticUrl + 'img/pc/wechatpay.png" width="150" height="45" alt="微信在线支付"></label>';
				    returnHtml += '</li>';
				}
			}
			returnHtml += '</ul>';
			returnHtml += '</form>';
			return returnHtml;
		},
		
		showPayDialog : function(config){
			art.dialog({
			    id: "popDoPayingDialog",
			    title: "支付处理中",
			    lock: true,
			    padding: 0,
			    content: document.querySelector('.pay_tip'),
			    close: function () {
			    }
			});
		},
		
		showWechatDialog : function(config){
			art.dialog({
			    id: "popDoPayingDialog",
			    title: "扫码支付",
			    lock: true,
			    padding: 0,
			    content: document.querySelector('.wx_pay_tip'),
			    close: function () {
			    }
			});
		},
		
		closeDialog : function(){
			SureUtil.closeDialog('popDoPayingDialog');
		},
		
		defaultPayTool : null,
		
		getPayTool : function(options){
			if (SurePayUtil.defaultPayTool == null) {
				SurePayUtil.defaultPayTool = new SurePayTool();
			}
			if (options == null) {
				return SurePayUtil.defaultPayTool;
			} else {
				return new SurePayTool(options);
			}
		}

    }
    
    window.SurePayUtil = __PayApiUtil;

    var __PayApiObj = function(options) {
    	
    	var defaultConfg = {
    		baseUrl : "/api/surepay/platform/",           
    		staticUrl : "/",
    		supportPayWay : [SurePayUtil.PAY_TYPE_ALI, SurePayUtil.PAY_TYPE_UPOP, SurePayUtil.PAY_TYPE_WECHAT],
    		payFormId : "surepay_submit_form",
    		companyPhone : '400-0610-127',  //客服 电话  TODO 初始化从配置文件读
    		companyQQ : '4000610127'    //客服  QQ
    	};
    	this.config = $.extend({}, defaultConfg, options);
    	var  po = this;
    	
    	this.checkTimer = null;
        
        /**
         * 支付前准备阶段，处理业务逻辑
         * id：业务对象id
         * type：业务类型
         * money：业务金额
         * useAccount：是否余额付款
         */
        this.prepare = function(payReq, callback) {
            var url = po.config.baseUrl + "prepare";
            SureAjax.ajax({
                url : url,
                async: false,
                type : "POST",
                headers : {
                    Accept : "application/json"
                },
                data : payReq,
                success : callback
            });
        };
        
        this.status = function(payReq, callback){
        	var url = po.config.baseUrl + "status";
			SureAjax.ajax({
			    url : url,
			    type : "GET",
			    headers : {
			        Accept : "application/json"
			    },
			    data : payReq,
			    success : callback
			});
        
        };
            
        /**
         * 微信支付
         * @param callback
         */
        this.submit = function(payReq, callback) {
        	var url = po.config.baseUrl + "submit";
            SureAjax.ajax({
                url : url,
                type : 'POST',
                async : false,
                data : payReq,
                success : callback
            });
        };
        	

        /**
         * 提交支付api;如果是微信公共号支付，调用接口前需要先做opendId验证，确认当前账户是否绑定微信
         * @param payReq
         * @param sCB
         * @param eCB
         * @returns {boolean}
         */
        this.pay = function (payReq, sCB, eCB) {
            if(SurePayUtil.isSubmit){
                console.log("提交过于频繁！");
                return false;
            }
            SurePayUtil.isSubmit = true;
            setTimeout(function(){SurePayUtil.isSubmit = false;},3000);
            po.prepare(payReq, function (ppResult) {
            	payReq.tradeCode = ppResult.tradeCode;
            	SurePayUtil.updateFormInfo(po.config, payReq);
                if (payReq.payWay == SurePayUtil.PAY_TYPE_WECHAT) {
                    po.doWechatPay(payReq,sCB, eCB);
                } else {
                	if ((ppResult.needPay + "") == "false"){
                		po.submit(payReq, function(){
                			if (typeof sCB == "function")sCB();
                		});
                	} else {
                		if(!$.os.mobile){
                            //弹出遮罩
                        	SurePayUtil.showPayDialog(po.config);
                        }
                        SurePayUtil.initPopEvent(po.config, sCB);
                        $("#" + po.config.payFormId).submit();
                	}
                }
            });
        };
            
       this.doWechatPay =  function (payReq,sCB, eCB) {
	        if(payReq.wecatTradeType == "NATIVE"){
	            if (SureUtil.isNotNull($('#wechatPayImage').html())) {
	                SurePayUtil.showWechatDialog();
	            } else {
	                po.submit(payReq, function (data) {
	                    createORCode({
	                        ORCodeWidth: 140,
	                        ORCodeHeight: 140,
	                        ORCodeDiv: $('#wechatPayImage'),
	                        ORCodeURL: data.code_url
	                    });
	                    $('#wechatPayImage canvas').addClass("QRcodeimg");
	                    SurePayUtil.showWechatDialog();
	                    //微信支付结果 监听
	                    po.checkTimer = setInterval(function () {
	                        po.checkPayResult(payReq, function(){
	                        	SurePayUtil.closeDialog();
	                        	clearInterval(po.checkTimer);
	                        	po.checkTimer = null;
	                        });
	                    }, 8000)
	                });
	            }
	
	        }else if (payReq.wecatTradeType=="JSAPI"){
	            po.submit(payReq, function (data) {
	                SurePayUtil.isSubmit = false;
	                if (data.return_code == "SUCCESS" && data.result_code == "SUCCESS") {
	                    WechatPay.onBridgeReady(data.appid, data.nonceStr_js, data.prepay_id, data.paySign_js, data.timeStamp_js,
	                        function (res) {
	                            setTimeout(function () {
	                                if(typeof(sCB)=="function" ){
	                                    sCB();
	                                }
	                            }, 1000);
	                        })
	                } else {
	                    SureMsg.alert(data.return_msg);
	                }
	            });
	        }
       };
	       
       this.checkPayResult = function(payReq, sCB){
    	   po.status(payReq, function(data){
    		   if (data.status == "complete" || data.status == "cancel")
    			   if(typeof(sCB)=="function" )sCB();
    	   });
       };
        
       this.initShowPayHtml = function (container, sCB) {
            var $formContainer = $("#" + container);
            $formContainer.html("").append(SurePayUtil.buildPayFormHtml(po.config));
            if ($('.wx_pay_tip').length == 0)
            	$("body").append(SurePayUtil.buildPayPopHtml(po.config));
            //渲染控件样式
            SureUtil.changeButtonCss();
            //切换支付方式按钮按键
            $("#" + po.config.payFormId + " input[name=formPayWayR]").on('ifClicked', function () {
                $("#" + po.config.payFormId + " input[name=payWay]").val($(this).val());
            });
            if (typeof(sCB) == "function") {
                sCB();
            }
        };
        
        this.getPayWay = function(){
        	return  $("#" + po.config.payFormId + " input[name=payWay]").val();
        }
    };
    
    window.SurePayTool = __PayApiObj;
}(window, jQuery));