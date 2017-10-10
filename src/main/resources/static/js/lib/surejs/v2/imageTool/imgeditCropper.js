/**
 * Created by tedo on 2016/9/14.
 */
(function($, window){
	'use strict';

	$.fn.extend({
		SureImgEditor : function(options){
			var opts = $.extend({}, $.fn.SureImgEditor.Defaults, options);

			function buildDiv(){
				var html = '<div class="img_cut_box">'+
					'<div class="img_container">'+
					'<img class="cropImg" src="">'+
					'</div>'+
					'<div class="edit_btns">'+
					'<a href="javascript:;" data-method="reset" title="原始">'+
					'<span class="ybiconfont ybicon-originalsize"></span>'+
					'</a>'+
					'<a href="javascript:;" data-method="zoom" data-option="0.1" title="放大">'+
					'<span class="ybiconfont ybicon-add3"></span>'+
					'</a>'+
					'<a href="javascript:;" data-method="zoom" data-option="-0.1" title="缩小">'+
					'<span class="ybiconfont ybicon-minus4"></span>'+
					'</a>'+
					'<a href="javascript:;" data-method="rotate"  data-option="-90" title="逆时针">'+
					'<span class="ybiconfont ybicon-anticlockwise"></span>'+
					'</a>'+
					'<a href="javascript:;" data-method="rotate" data-option="90" title="顺时针">'+
					'<span class="ybiconfont ybicon-clockwise"></span>'+
					'</a>'+
					'<a style="display: none" href="javascript:;" data-method="scaleY" data-option="-1" title="垂直">'+
					'<span class="ybiconfont ybicon-fliphorizintal"></span>'+
					'</a>'+
					'<a style="display: none" href="javascript:;" data-method="scaleX" data-option="-1" title="水平">'+
					'<span class="ybiconfont ybicon-flipvertical"></span>'+
					'</a>'+
					'</div>'+
					'<div class="btn_group">'+
					'<a class="upload" href="javascript:;" style="display: none"><span class="ybiconfont ybicon-upload"></span>重新上传</a>'+
					'<a class="save" id="image-save" data-option="" data-method="getData">确认</a>'+
					'<a class="cancel"  id="image-back"  href="javascript:;">取消</a>'+
					'</div>'+
					'</div>';
				return html;
			}

			function init(me){
				var $me = $(me);
				$me.find('.img_cut_box').remove();
				var wrapDiv = buildDiv();
				$me.append(wrapDiv);
				me.$wrapDiv = $me.find('.img_cut_box');
				if (typeof opts.editBtn === 'string') {
					me.editBtn = $me.find(opts.editBtn);
				} else {
					me.editBtn = $(opts.editBtn);
				}
			}

			return $(this).each(function(){
				var me = this;
				var $me = $(this);
				me.win = null;
				me.showWin = function(e){
					if (e != undefined)
						e.stopPropagation();

					var src = $me.attr('src').replace(/[\r\n]/g,"").replace(/\s+/g,"");
					var urls = src.split("?");
					src = urls[0];
					var key;
					if (src.indexOf('http:') >= 0 ){
						var domain = src.substr(src.indexOf('http://') + 7);
						key = domain.substr(domain.indexOf('/') + 1);
					} else {
						SureMsg.alert("对不起，不支持对该图片进行裁剪");
						return;
					}
					var qiniu = new QiniuJsSDK();
					qiniu.domain =src.substr(0, src.indexOf('/', 8) + 1);
					var imageUtil = new QiniuImageUtil();
					imageUtil.qiniu = qiniu;
					$(".img_cut_box").remove();
					init(me);
					$me.find(".cropImg").attr("src",src);

					//智印云增加
					var minCropBoxWidth = 0, minCropBoxHeight = 0;
					if (opts.ir != undefined) {
						var ir = opts.ir;
						var $img_container = $me.find('.img_container');
						var icWidth = $img_container.width(), icHeight = $img_container.height();
						var irHeight = ir.height, irWidth = ir.width;
						var minW = opts.minW, minH = opts.minH;

						minCropBoxWidth = minW * icWidth / irWidth;
						minCropBoxHeight = minH * icHeight / irHeight;
					}

					me.win = art.dialog({
						title : opts.title,
						content: me.$wrapDiv[0],
						top : 20,
						left : 30,
						init:function(){
							var $image = $('.img_container img');
							SureMsg.showLoading("初始化");
							$image.cropper('destroy').cropper({
								aspectRatio: opts.minW/opts.minH,
								//dragCrop : false,
								//cropBoxResizable : false,
								//checkCrossOrigin : false,
								minCropBoxWidth : minCropBoxWidth,
								minCropBoxHeight : minCropBoxHeight,
								crop: function(e) {

								},
								built : function() {
									SureMsg.hideLoading();
								}
							});
							function imageProcess($this) {
								var data = $this.data();
								var $target;
								var result = null;
								if ($this.prop('disabled') || $this.hasClass('disabled')) {
									return;
								}
								if ($image.data('cropper') && data.method) {
									data = $.extend({}, data); // Clone a new one

									if (typeof data.target !== 'undefined') {
										$target = $(data.target);

										if (typeof data.option === 'undefined') {
											try {
												data.option = JSON.parse($target.val());
											} catch (e) {
												console.log(e.message);
											}
										}
									}
									result = $image.cropper(data.method, data.option, data.secondOption);
									switch (data.method) {
										case 'scaleX':
										case 'scaleY':
											$this.data('option', -data.option);
											break;
									}

									if ($.isPlainObject(result) && $target) {
										try {
											$target.val(JSON.stringify(result));
										} catch (e) {
											console.log(e.message);
										}
									}
									console.log(result);
									return result;
								}
							}

							$('.img_cut_box .edit_btns').unbind('click').on('click', '[data-method]', function () {
								imageProcess($(this));
							});

							$('#image-back').unbind('click').on('click', function () {
								$image.cropper('destroy');
								me.win.close();
							});

							$('#image-save').unbind('click').on('click', function () {
								var result = imageProcess($(this));
								/**
								 left: 图片的左偏移量
								 top: 图片的上偏移量
								 width: 图片宽度
								 height: 图片高度
								 naturalWidth:图片自然宽度
								 naturalHeight: 图片自然高度
								 aspectRatio: 图片长宽比
								 rotate: 图片的旋转角度
								 scaleX:图片横坐标上的缩放因子
								 scaleY: 图片纵坐标上的缩放因子
								 */
								var imageData = $image.cropper("getImageData");

								if (result.x < 0 || result.y < 0) {
									SureMsg.alert("请将剪裁框放入图片内!");
									return;
								}
								if ((result.rotate/90) % 2 == 1||(result.rotate/90) % 2 == -1) {
									if (result.width+result.x > imageData.naturalHeight ||
										result.height+result.y > imageData.naturalWidth) {
										SureMsg.alert("请将剪裁框放入图片内!");
										return;
									}
								}else {
									if (result.width+result.x > imageData.naturalWidth ||
										result.height+result.y > imageData.naturalHeight) {
										SureMsg.alert("请将剪裁框放入图片内!");
										return;
									}
								}

								var url = imageUtil.crop(result.rotate, {
									w: result.width,
									h: result.height,
									x: result.x,
									y: result.y
								}, key);
								console.dir(options);
								SureMsg.msg("更新成功");
								$image.cropper('destroy');
								opts.callback(url);
								me.win.close();
							})
						}
					});
					$('.img_cut_box .edit_btns a').simpletooltip({position: 'top'});
					//me.adapter.loadImgResWrapImg(src, key);
				};
				if (typeof opts.editBtn === 'string') {
					me.editBtn = $me.find(opts.editBtn);
				} else {
					me.editBtn = $(opts.editBtn);
				}
				me.editBtn.unbind('click').bind('click', me.showWin);
				return me;
			});
		}
	});

	$.fn.SureImgEditor.Defaults = {
		minW : 100,			//最小宽度
		minH : 100,			//最小高度
		clientSizeLimit : 1 * 1024 * 1024,//客户端处理的限制,超出此限制由服务器处理
		title : '图片编辑',
		bucket : "yb-test-album",
		editBtn : '.ImgEditBtn'
	};

	var __SureImgTool = {
		/**
		 * 获取最小截图框的宽度(w)和高度(h)
		 *
		 * @param needW		图片需要的宽度
		 * @param needH		图片需要的高度
		 * @param showW		截图窗口显示的宽度
		 * @param showH		截图窗口显示的高度
		 * @param naturalW	图片的原始宽度度
		 * @param naturalH	图片的原始高度
		 * @returns	[w, h]
		 */
		getMinSize : function (needW, needH, showW, showH, naturalW, naturalH) {
			var	minW = needW * showW / naturalW;
			var minH = needH * showH / naturalH;

			if (minW > showW){
				minW = showW;
				minH = minW * needH / needW;

				if (minH > showH) {
					minH = showH;
					minW = minH * needW/ needH;
				}
			} else if (minH > showH) {
				minH = showH;
				minW = minH * needW / needH;
				if (minW > showW){
					minW = showW;
					minH = minW * needH / needW;
				}
			}
			return [minW, minH];
		},

		/**
		 * 获取截图偏移
		 *
		 * @param c		jcrop选择对象
		 * @param showW		截图窗口显示的宽度
		 * @param showH		截图窗口显示的高度
		 * @param naturalW	图片的原始宽度度
		 * @param naturalH	图片的原始高度
		 * @returns 偏移对象
		 */
		getCropOffset : function (c, showW, showH, naturalW, naturalH){
			var rx1 = naturalW / showW;
			var ry1 = naturalH / showH;
			var offset = {};

			if (c.y < 0) {
				c.y2 = c.y2 + c.y;
				c.y = 0;
				c.h = c.y2;
			}
			if (c.x < 0) {
				c.x2 = c.x2 + c.x;
				c.x = 0;
				c.w = c.x2;
			}

			offset.x = c.x * rx1;
			offset.y = c.y * ry1;
			offset.x2 = c.x2 * rx1;
			offset.y2 = c.y2 * ry1;

			var w = c.w * rx1;
			var h = c.h * ry1;

			offset.w = w;
			offset.h = h;

			return offset;
		},

		/**
		 * 裁图工具
		 *
		 * @param op 参数
		 * 		cropArea	裁图显示区域
		 * 		preview		预览图显示区域
		 * 		pcnt		预览图的框
		 * 		pimg		预览图图片
		 * 		cropImg		裁图图片
		 * 		cropInfo	裁图信息显示区域
		 * 		cropBtn		裁图按钮显示区域
		 * 		sizeLockCB	最小尺寸的限制的checkbox
		 * 		arLockCB	比例限制的checkbox
		 * 		needW		裁图需要的最小宽度
		 * 		needH		裁图需要的最小高度
		 *
		 */
		crop : function(op){
			// Create variables (in this scope) to hold the API and image size
			var cropAreaSelector = op.cropArea || '.splitcontent';
			var previewSelector = op.preview || '.preview-pane';
			var pcntSelector = op.pcnt || '.preview-pane .preview-container';
			var pimgSelector = op.pimg || '.preview-pane .preview-container img';
			var cropImgSelector = op.cropImg || '.cropImg';
			var cropInfoSelector = op.cropInfo || '.splitinfo';
			var cropBtnSelector = op.cropBtn || '.splitbtnwin';
			var sizeLockCBSelector = op.sizeLockCB || '.size_lock';
			var arLockCBSelector = op.arLockCB || '.ar_lock';


			this.$cropArea = $(cropAreaSelector);
			this.$preview = $(previewSelector);
			this.$pcnt = $(pcntSelector);
			this.$pimg = $(pimgSelector);
			this.$cImg = $(cropImgSelector);
			this.$cInfo = $(cropInfoSelector);
			this.$cbtn = $(cropBtnSelector);
			this.$sizeLockCB = $(sizeLockCBSelector);
			this.$arLockCB = $(arLockCBSelector);

			this.needW = op.needW ;
			this.needH = op.needH ;

			this.previewW = op.previewW || 250;

			this.jcrop_api = new Object();

			this.offset = new Object();

			this.canvasImg = new Image();//截图的原始图片
			var me = this;

			this.canvasImg.onload = function(e) {
				var naturalWidth = e.target.naturalWidth;
				var naturalHeight = e.target.naturalHeight;
				me.initCrop(e.target.src, me.previewW,
					me.needH * me.previewW / me.needW,
					[naturalWidth, naturalHeight]);
			};

			this.boundx;
			this.boundy;

			this.updateCIF = op.updateCIF || function(){
				me.$cropArea.find('.xy1').html("X1: " + me.offset.x.toFixed(2) + " Y1:" + me.offset.y.toFixed(2));
				me.$cropArea.find('.xy2').html("X2: " + me.offset.x2.toFixed(2) + " Y2:" + me.offset.y2.toFixed(2));
				me.$cropArea.find('.wh').html("W: " + me.offset.w.toFixed(2) + " H:" + me.offset.h.toFixed(2));
			};

			this.$arLockCB.change(function(e) {
				me.jcrop_api.setOptions(this.checked?
				{ aspectRatio: me.needW/me.needH }: { aspectRatio: 0 });
				me.jcrop_api.focus();
			});

			this.$sizeLockCB.change(function(e) {
				var  minWH = SureImgTool.getMinSize(me.needW, me.needH,
					me.$cImg.width(), me.$cImg.height(),
					me.canvasImg.naturalWidth, me.canvasImg.naturalHeight);

				me.jcrop_api.setOptions(this.checked? {
					minSize: minWH
				}: {
					minSize: [ 0, 0 ]
				});
				me.jcrop_api.focus();
			});


			var me = this;

			/**
			 * @param src 裁图图片的src
			 * @param w	预览图宽度
			 * @param h 预览图高度
			 */
			this.initCrop = function(src, w, h) {
				w = w || me.$pcnt.width();
				h = h || me.$pcnt.height();
				var xsize = w, ysize = h;

				//显示裁图区域
				me.$cropArea.show();

				//设置预览图
				me.$pcnt.width(w);
				me.$pcnt.height(h);
				me.$pimg.attr('src', src);
				me.$pimg.width(w);
				me.$pimg.height(h);

				//设置裁图
				me.$cImg.unbind('load');
				me.$cImg.attr('style', '');
				if (this.jcrop_api.hasOwnProperty('destroy')) {
					if (typeof (this.jcrop_api.destroy) === 'function') {
						this.jcrop_api.destroy();
					}
				}

				me.$cImg.bind('load', function() {
					SureMsg.hideLoadingImg();
					var minWH = SureImgTool.getMinSize(me.needW, me.needH,
						me.$cImg.width(), me.$cImg.height(),  me.canvasImg.naturalWidth, me.canvasImg.naturalHeight);

					var minW = minWH[0];
					var minH = minWH[1];

					me.$cImg.Jcrop({
						onChange : updatePreview,
						onSelect : updatePreview,
						aspectRatio : me.needW / me.needH,
						minSize : minWH
					}, function() {
						// Use the API to get the real image size
						var bounds = this.getBounds();
						me.boundx = bounds[0];
						me.boundy = bounds[1];
						me.jcrop_api = this;

						me.$arLockCB.attr('checked',true);
						me.$sizeLockCB.attr('checked',true);

						me.jcrop_api.setSelect([0, 0, minW, minH]);
					});
				});

				me.$cImg.attr('src', src);

				function updatePreview(c, b) {
					if (parseInt(c.w) > 0) {
						me.$cInfo.show();//截图信息显示
						me.$cbtn.show();//截图按钮显示

						var rx = xsize / c.w;
						var ry = ysize / c.h;

						me.$pimg.css({
							width : Math.round(rx * me.boundx) + 'px',
							height : Math.round(ry * me.boundy) + 'px',
							marginLeft : '-' + Math.round(rx * c.x) + 'px',
							marginTop : '-' + Math.round(ry * c.y) + 'px'
						});
						me.offset = SureImgTool.getCropOffset(c, me.boundx, me.boundy, me.canvasImg.naturalWidth, me.canvasImg.naturalHeight);
						me.updateCIF();
					}
				}
			};

			/**
			 * 载入裁图图片
			 */
			this.loadCropImg = function(src){
				this.canvasImg.src = src;
			};
		},

		cropAdapter : {
			qiniu : function(options) {
				var opts = $.extend({}, {
					callback : function(newUrl){
						SureMsg.hideLoadingImg();
					},
					bucket : "yearbook-resource"
				}, options);
				var me = this;

				me.opts = opts;
				me.baseSrc = ""; //七牛图片处理临时文件的src

				var imageUtil = new QiniuImageUtil();//七牛图片处理工具


				me.cropImgFunc = function() {
					if (me.opts.cropUtil.offset.w <= 0 || me.opts.cropUtil.offset.h <=0 ){
						SureMsg.hideLoadingImg();
						SureMsg.alert("请选择合适的区域");
						return;
					}
					SureMsg.showLoadingImg();
					var newUrl = imageUtil.crop(rotate, me.opts.cropUtil.offset, me.key);
					me.opts.callback(newUrl);
				};

				var rotate = 0;

				this.rotateLeft = function() {
					SureMsg.showLoadingImg();
					rotate = rotate - 90;
					if (rotate < 0)
						rotate = rotate + 360;
					if (rotate == 0) {
						me.opts.cropUtil.loadCropImg(me.baseSrc);
					} else {
						me.opts.cropUtil.loadCropImg(imageUtil.rotate(rotate, me.key));
					}

				};

				this.rotateRight = function() {
					SureMsg.showLoadingImg();
					rotate = rotate + 90;
					if (rotate >= 360)
						rotate = rotate - 360;
					if (rotate == 0) {
						me.opts.cropUtil.loadCropImg(me.baseSrc);
					} else {
						me.opts.cropUtil.loadCropImg(imageUtil.rotate(rotate, me.key));
					}
				};

				this.loadImgResWrapImg = function(img, md5) {
					me.key = md5;

					$(me.opts.wrapDiv).find('.preview-pane .preview-container img').attr('src', '/img/loading5.gif');
					$(me.opts.wrapDiv).find('.cropImg').attr('src', img + "?imageMogr2/strip/quality/50/interlace/1");
					me.baseSrc = img;
					$(me.opts.wrapDiv).find('.splitcontent').show();
					me.opts.cropUtil.loadCropImg(me.baseSrc + "?imageMogr2/strip/quality/50/interlace/1");
					$(me.opts.wrapDiv).find('.preview-pane').show();
					$(me.opts.wrapDiv).find('.statusShow').hide();

					var urls = img.split("?");
					var src = urls[0];
					var domain = src.substr(0, src.indexOf('/', 8) + 1);
					var qiniu = new  QiniuJsSDK();
					qiniu.domain = domain;
					imageUtil.qiniu = qiniu;
				};
			}
		}
	};

	window.SureImgTool = __SureImgTool;

})(jQuery, window);