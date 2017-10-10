/**
 * Sure 分享基础库
 *
 * 目前支持mob和微信两个分享接口
 * 其中微信需要在微信环境才可以支持生效
 *
 * 参考：
 * http://wiki.mob.com/sharesdk-for-web%E5%BF%AB%E9%80%9F%E9%9B%86%E6%88%90/
 * http://mp.weixin.qq.com/wiki/7/aaa137b55fb2e0456bf8dd9148dd613f.html
 *
 * 使用之前加载：
 * <script id="-mob-share" src="http://f1.webshare.mob.com/code/mob-share.js?appkey=a80bfb821574"></script>
 * <script type="text/javascript" src="http://res.wx.qq.com/open/js/jweixin-1.1.0.js"></script>
 *
 *
 * 微信初始化：
 * 	SureShare.init({
 *		mob_appkey : '${mob_appkey}',
 *		shareParam : {
 *			title :'#忆尔##《${book.name}》#', // 分享标题
 *			desc : '美好的回忆共同创造，记录我们一起的日子，快来参加《${book.name}》纪念册的制作吧！', // 分享内容
 *			link : '${baseUrl}invite/book/${book.identifyCode}', // 分享链接
 *			imgUrl: '${baseUrl}img/logo.png', // 分享图片，使用逗号,隔开
 *		},
 *		wechat : $.os.wechat
 *	});
 *
 * mob初始化（默认样式,移动端）
 *
 *
 * mob初始化 （自定义样式）
 * 1.单个页面分享，这种针对比如预览书册的分享，单个页面只有一个分享入口
 *
 * 		页面结构：
 * 	<div class="bp_sharelist_wrapper">
 *		<label>分享到：</label>
 *			<ul>
 *				<li class="weibo share_weibo active">
 *				<li class="qqzone share_qzone">
 *				<li class="wechat share_weixin">
 *				<li class="renren share_renren">
 *			</ul>
 *	</div>
 *
 *     	var shareParam = {};
 *	 	shareParam.title = "《${bookTpl.name}》预览分享";
 *		shareParam.description =  "${bookTpl.desc}";
 *		shareParam.pic = "";
 *		shareParam.url = "${baseUrl}bookTpl/${bookTpl.id}/preview";
 *		SureShare.initMobSingle({
 *       	shareParam : shareParam
 *   	});
 *
 *
 *   2.单个页面有多中分享入口，比如书册空间首页需要分享相册 投票 话题等不同的内容
 *    		页面结构：
 * 	<div class="bp_sharelist_wrapper" share-link="" share-title="" share-desc="" share-pc="">>
 *		<label>分享到：</label>
 *			<ul>
 *				<li class="weibo share_weibo active" share-type="weibo"
 *				<li class="qqzone share_qzone" share-type="weibo" >
 *				<li class="wechat share_weixin" share-type="weibo" >
 *				<li class="renren share_renren" share-type="weibo" >
 *			</ul>
 *	</div>
 *
 *    $('.bp_sharelist_wrapper').initMob({
 *        debug : true
 *    });
 *
 *    参数说明：
 *    share-type: 分享类型，取值 weibo qzone weixin renren
 *    share-link: 分享链接，分享出去用户点击的进入的URL
 *    share-title: 分享标题
 *    share-desc: 分享内容
 *    share-pic:  分享图片
 *
 */
(function($, window){
	'use strict';

	var wx_config = {};
	var wx_config_ready = false;
	window.SureShare = {
		getCurUrl : function() {
			return encodeURIComponent(window.location.origin + window.location.pathname + window.location.search);
		},

		initWxConfig : function(config) {
			wx_config = config || {};
			wx_config_ready = true;
		},

		init : function(option) {
			this.shareParam =  $.extend({}, {}, option.shareParam);
			this.option =  $.extend({}, defaultOption, option);
			if (option.wechat && $.os.wechat) {
				initWx();
			}
			initMob();
		},

		initMobSingle : function (option) {
			this.shareParam =  $.extend({}, {}, option.shareParam);
			this.option =  $.extend({}, defaultOption, option);
			mobShare.config( {
				debug: this.option.debug, // 开启调试，将在浏览器的控制台输出调试信息
				appkey: this.option.mob_appkey, // appkey
				params: this.shareParam,
			} );
			var weibo = mobShare( 'weibo' );
			var qzone = mobShare( 'qzone' );
			//var renren = mobShare( 'renren' );
			var weixin = mobShare( 'weixin' );
			var qq = mobShare( 'qq' );
		 	
			$( '.share_qq' ).unbind("click").click( function() {
				qq.send();
			} );
			
			$( '.share_weibo' ).unbind("click").click( function() {
				weibo.send();
			} );
			$( '.share_qzone' ).unbind("click").click( function() {
				qzone.send();
			} );
			//$( '.share_renren' ).unbind("click").click( function() {
			//	renren.send();
			//} );
			$( '.share_weixin' ).unbind("click").click( function() {
				weixin.send();
			} );
		}
	};

	var defaultOption = {
		mob_appkey : 'a80bfb821574',
		debug : false,
		success : function(){}
	};

	$.fn.extend({
		initMob :function(options){
			var opts = $.extend({}, defaultOption, options);
			$(this).each(function(){

				var shareParam = getShareParmFormDom(this);
				
				$(this).find('ul li').unbind("click");		
				$(this).find('ul li').click(function(){
					if ($(this).attr('share-title')) {
						//支持不同的分享渠道定义不同的内容
						shareParam = getShareParmFormDom(this);
					}
					var shareType = $(this).attr('share-type') || "weibo" ;
					mobShare.config( {
						debug: opts.debug , // 开启调试，将在浏览器的控制台输出调试信息
						appkey: opts.mob_appkey, // appkey
						params: shareParam
					} );
					var share = mobShare( shareType );
					share.send();
				});
			});
		}
	});

	function getShareParmFormDom(share) {
		var link = $(share).attr('share-link');
		var title = $(share).attr('share-title');
		var description = $(share).attr('share-desc');
		var pic = $(share).attr('share-pic');

		return {
			url : link || "http://www.yearbook.com.cn/",
			title : title || "来自忆尔的分享",
			description : description || "",
			pic : pic || "http://www.yearbook.com.cn/img/logo.png"
		}
	}

	/**
	 * mob 平台分享接口
	 */
	function initMob() {
		mobShare.config( {
			debug: SureShare.option.debug, // 开启调试，将在浏览器的控制台输出调试信息
			appkey: SureShare.option.mob_appkey, // appkey

			params: {
				url : SureShare.shareParam.link,
				title : SureShare.shareParam.title,
				description :SureShare.shareParam.desc,
				pic : SureShare.shareParam.imgUrl
			},

			callback: function( plat, params ) {
				SureShare.option.success(plat, params );
			}
		});
	}

	// 严格依照微信JS-SDK说明文档开发 http://mp.weixin.qq.com/wiki/7/aaa137b55fb2e0456bf8dd9148dd613f.html
	/*
	 * 注意：
	 * 1. 所有的JS接口只能在公众号绑定的域名下调用，公众号开发者需要先登录微信公众平台进入“公众号设置”的“功能设置”里填写“JS接口安全域名”。
	 * 2. 如果发现在 Android 不能分享自定义内容，请到官网下载最新的包覆盖安装，Android 自定义分享接口需升级至 6.0.2.58 版本及以上。
	 * 3. 完整 JS-SDK 文档地址：http://mp.weixin.qq.com/wiki/7/aaa137b55fb2e0456bf8dd9148dd613f.html
	 *
	 * 如有问题请通过以下渠道反馈：
	 * 邮箱地址：weixin-open@qq.com
	 * 邮件主题：【微信JS-SDK反馈】具体问题
	 * 邮件内容说明：用简明的语言描述问题所在，并交代清楚遇到该问题的场景，可附上截屏图片，微信团队会尽快处理你的反馈。
	 */
	function initWx() {
		var wx_permissions = {};

		SureAjax.get("/api/weixin/jsconfig?url=" + SureShare.getCurUrl(), function(ret){
			var config = {};
			config.debug = SureShare.option.debug;
			config.appId = ret.appid;
			config.nonceStr = ret.noncestr;
			config.timestamp = ret.timestamp;
			config.signature = ret.signature;
			SureShare.initWxConfig(config);
			load_wx();
		}, function(){

		});
		wx.error(function (res) {
			wx_config_ready = false;
		});
		function load_wx(){

			var shareParam = SureShare.shareParam;
			wx.config({
				debug: wx_config['debug'],
				appId: wx_config['appId'],
				timestamp: wx_config['timestamp'],
				nonceStr: wx_config['nonceStr'],
				signature: wx_config['signature'],
				jsApiList: [
					//'chooseImage',
					// 'previewImage',
					// 'uploadImage',
					// 'downloadImage',
					'onMenuShareTimeline',
					'onMenuShareAppMessage',
					'onMenuShareQQ',
					'onMenuShareWeibo',
					//'openLocation',
					// 'getLocation',
					// 'hideOptionMenu',
					// 'showOptionMenu',
					//'translateVoice',
					// 'startRecord',
					// 'stopRecord',
					// 'onRecordEnd',
					//'playVoice',
					// 'pauseVoice',
					// 'stopVoice',
					// 'uploadVoice',
					// 'downloadVoice'
				]
			});
			wx.ready(function () {
				if (wx_config_ready){
					wx.checkJsApi({
						jsApiList: [
							//'chooseImage',
							//'previewImage',
							//'uploadImage',
							//'downloadImage',
							'onMenuShareTimeline',
							'onMenuShareAppMessage',
							'onMenuShareQQ',
							'onMenuShareWeibo',
							//'openLocation',
							//'getLocation',
							//'hideOptionMenu',
							//'showOptionMenu',
							//'translateVoice',
							//'startRecord',
							//'stopRecord',
							//'onRecordEnd',
							//'playVoice',
							//'pauseVoice',
							//'stopVoice',
							//'uploadVoice',
							//'downloadVoice'
						],
						success: function (res) {
							wx_permissions = res['checkResult'];
						}
					});
				}

				//分享给朋友
				wx.onMenuShareAppMessage({
					title: shareParam.title,
					desc: shareParam.desc,
					link:  shareParam.link,
					imgUrl:  shareParam.imgUrl,
					trigger: function (res) {
					},
					success: function (res) {
					},
					cancel: function (res) {
					},
					fail: function (res) {
					}
				});
				//分享到朋友圈
				wx.onMenuShareTimeline({
					title: shareParam.title,
					link:  shareParam.link,
					imgUrl:  shareParam.imgUrl,
					trigger: function (res) {
					},
					success: function (res) {
						SureShare.option.success(res);
					},
					cancel: function (res) {
					},
					fail: function (res) {
					}
				});
				//分享到QQ
				wx.onMenuShareQQ({
					title: shareParam.title,
					desc: shareParam.desc,
					link:  shareParam.link,
					imgUrl:  shareParam.imgUrl,
					trigger: function (res) {
					},
					complete: function (res) {
					},
					success: function (res) {
						SureShare.option.success(res);
					},
					cancel: function (res) {
					},
					fail: function (res) {
					}
				});
				//分享到腾讯微博
				wx.onMenuShareWeibo({
					title: shareParam.title,
					desc: shareParam.desc,
					link:  shareParam.link,
					imgUrl:  shareParam.imgUrl,
					trigger: function (res) {
					},
					complete: function (res) {
					},
					success: function (res) {
						SureShare.option.success(res);
					},
					cancel: function (res) {
					},
					fail: function (res) {
					}
				});
			});
		};
	}
})(jQuery, window);
