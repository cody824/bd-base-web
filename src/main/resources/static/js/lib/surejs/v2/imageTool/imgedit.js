(function($, window){
    'use strict';
	
	$.fn.extend({
		SureImgEditor : function(options){
			var opts = $.extend({}, $.fn.SureImgEditor.Defaults, options);
			
			function buildDiv(){
				var html = '<div class="splitwin"><div class="splitcontent">' +
					'<div class="splitleft">' +
						'<img class="cropImg"  src="" />' +
					'</div>' +
					'<div class="splitright">' +
						'<div class="statusShow">初始化中……<div class="upaction"></div></div>' +
						'<div style="display:none" class="preview-pane">' +
							'<div class="preview-container">' +
								'<img src="" class="jcrop-preview" alt="预览图片" />' +
							'</div>' +
						'</div>' +
						'<div style="display:none" class="splitinfo">' +
							'<p class="xy1">X1:0 Y1:0</p>' +
							'<p class="xy2">X2:0 Y2:0</p>' +
							'<p class="wh">宽:0 高:0</p>' +
							'<p>' +
								'<input type="checkbox" class="ar_lock" checked="checked" disabled="true" />适合比例<label>' +
								'<input type="checkbox" class="size_lock" />最小限制</label>' +
							'</p>' +
						'</div>' +
					'</div>' +
				'</div>' +
				'<div class="splitbtnwin"  style="display:none">' +
					'<input type="button" name="crop"  value="确定" />' +
					'<input type="button" style="display:none" class="serverEditPickFile" value="选择文件" />' +
					'<input type="button" name="rotateLeft" value="左转90°" />' +
					'<input type="button" name="rotateRight" value="右转90°" />' +
				'</div></div>';
				return html;
			}
			
			function init(me){
				var $me = $(me);
				$me.find('.splitwin').remove();
				var wrapDiv = buildDiv();
				$me.append(wrapDiv);
            	me.$wrapDiv = $me.find('.splitwin');
            	if (typeof opts.editBtn === 'string') {
            		me.editBtn = $me.find(opts.editBtn);
            	} else {
            		me.editBtn = $(opts.editBtn);
            	}
            	
            	me.cropUtil = new SureImgTool.crop({
    				cropArea : $me.find('.splitcontent')[0],
    				preview : $me.find('.preview-pane')[0],
    				pcnt : $me.find('.preview-pane .preview-container')[0],
    				pimg :  $me.find('.preview-pane .preview-container .jcrop-preview')[0],
    				cropImg : $me.find('.cropImg')[0],
    				cropInfo : $me.find('.splitinfo')[0],
    				cropBtn : $me.find('.splitbtnwin')[0],
    				sizeLockCB : $me.find('.size_lock')[0],
    				arLockCB : $me.find( '.ar_lock')[0],
    				needW : opts.minW,
    				needH : opts.minH
    			});
			}
			
			return $(this).each(function(){
            	var me = this;
            	var $me = $(this);
            	
            	function bindEvent($wrapWin){
    				var $cropBtn = $wrapWin.find('.splitbtnwin input[name=crop]');
    				var $leftBtn = $wrapWin.find('.splitbtnwin input[name="rotateLeft"]');
    				var $rightBtn = $wrapWin.find('.splitbtnwin input[name="rotateRight"]');
    				
    				$cropBtn.unbind("click");
    				$cropBtn.bind("click", function(){
    					me.adapter.cropImgFunc();
    				});
    				
    				$leftBtn.unbind("click");
    				$leftBtn.bind("click", function(){
    					me.adapter.rotateLeft();
    				});
    				
    				$rightBtn.unbind("click");
    				$rightBtn.bind("click", function(){
    					me.adapter.rotateRight();
    				});
    			}
         
    		 	
               	var clientAdapter = new SureImgTool.cropAdapter.client({
            		callback : function(img){
            			SureMsg.hideLoadingImg();
            			if (me.win)
            				me.win.close();
            			if (typeof opts.callback == "function") {
            				opts.callback(img);
            			}
            		}
            	});
            	
            	var qiniuAdapter = new SureImgTool.cropAdapter.qiniu({
            		bucket : opts.bucket,
            		callback : function(img){
            			SureMsg.hideLoadingImg();
            			if (me.win)
            				me.win.close();
            			if (typeof opts.callback == "function") {
            				opts.callback(img);
            			}
            		}
            	});
    			
            	me.win = null;
            	
            	me.adapter = qiniuAdapter;
            	
            	me.showWin = function(e){
            		e.stopPropagation();
            		var file = me.upfile;
            		var mustServer = false, mustClient = false;
            		var src = $me.attr('src');
            		if (me.lastSrc != src) {
            			init(me);
            			me.editBtn.unbind('click');
            			me.editBtn.bind('click',me.showWin);
            			clientAdapter.opts.wrapDiv = me.$wrapDiv;
            			clientAdapter.opts.cropUtil = me.cropUtil;
            			qiniuAdapter.opts.wrapDiv = me.$wrapDiv;
            			qiniuAdapter.opts.cropUtil = me.cropUtil;
            			qiniuAdapter.opts.container = $me.find('.cropImg')[0];
            			qiniuAdapter.opts.browse_button = $me.find('.serverEditPickFile')[0];
                    	bindEvent($me);
            		}
            		me.win = art.dialog({
    					title : opts.title,
    					content: me.$wrapDiv[0],
    					top : 20,
    					left : 30
    				});
            		
            		if (me.lastSrc != src) {
            			me.lastSrc = src;
            			if (src.indexOf("http:") == 0) {
                			mustServer = true;
                		} else if (src.indexOf("blob:http:") == 0) {
            				if (file) {
            					if (file.size < opts.clientSizeLimit) {
            						mustClient = true;
            						src = getBase64Image(me);
            					} else {
            						mustServer = true;
            						src = file.getSource().getSource();
            					}
            				} else {
            					src = getBase64Image(me);
            				}
                		} 
            			
            			if (mustServer) {
            				me.adapter = qiniuAdapter;
            				me.adapter.loadImgWrapImg(src);	
            			} else if (mustClient) {
            				me.adapter = clientAdapter;
            				me.adapter.loadImgWrapImg(src);	
            			} else {
        					var img = new mOxie.Image();
        					img.onload = function(){
                    			me.adapter = img.size >= opts.clientSizeLimit? qiniuAdapter : clientAdapter;
                    			me.adapter.loadImgWrapImg(src);	
                    		};
                    		img.load(src);
            			}
            		} 
            	};
            	if (typeof opts.editBtn === 'string') {
            		me.editBtn = $me.find(opts.editBtn);
            	} else {
            		me.editBtn = $(opts.editBtn);
            	}
            	me.editBtn.bind('click', me.showWin);
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
					if(window.console){
					console.log('initcrop', [ xsize, ysize ]);
					}
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
				client : function(options) {
					var opts = $.extend({}, {
						callback : function(newUrl){
							SureMsg.hideLoadingImg();
						}
					}, options);
					var me = this;
					me.opts = opts;

					me.cropImgFunc = function() {
						SureMsg.showLoadingImg();
						setTimeout(function() {
							if (me.opts.cropUtil.offset.w <= 0 || me.opts.cropUtil.offset.h <= 0) {
								SureMsg.hideLoadingImg();
								SureMsg.alert("请选择合适的区域");
								return;
							}
							var cvs = document.createElement("canvas");
							var w = parseInt(me.opts.cropUtil.offset.w);
							var h = parseInt(me.opts.cropUtil.offset.h);
							cvs.width = w;
							cvs.height = h;
							var canvas = cvs.getContext("2d");
							canvas.drawImage(me.opts.cropUtil.canvasImg, me.opts.cropUtil.offset.x,
									me.opts.cropUtil.offset.y, w, h, 0, 0, w, h);
							var newUrl = cvs.toDataURL();
							me.opts.callback(newUrl);
						}, 500);
					};

					this.rotateLeft = function() {
						SureMsg.showLoadingImg();
						if (window.console) {
							console.log("左转90度");
						}
						setTimeout(function() {
							var url = $(me.opts.cropUtil.canvasImg).rotate(-90, true);
							me.opts.cropUtil.loadCropImg(url);
						}, 500);

					};

					this.rotateRight = function() {
						SureMsg.showLoadingImg();
						if (window.console) {
							console.log("右转90度");
						}
						setTimeout(function() {
							var url = $(me.opts.cropUtil.canvasImg).rotate(90, true);
							me.opts.cropUtil.loadCropImg(url);
						}, 500);
					};

					this.loadImgWrapImg = function(img) {
						me.opts.cropUtil.loadCropImg(img);
						me.opts.wrapDiv.find('.preview-pane').show();
						me.opts.wrapDiv.find('.statusShow').hide();
					};
				},
				
				qiniu : function(options) {
					var opts = $.extend({}, {
						callback : function(newUrl){
							SureMsg.hideLoadingImg();
						},
						bucket : "yearbook-resource"
					}, options);
					var me = this;

					me.opts = opts;
					me.key = "";//七牛图片处理临时文件的key
					me.baseSrc = ""; //七牛图片处理临时文件的src
					
					var imageUtil = new QiniuImageUtil({});//七牛图片处理工具

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

					this.loadImgWrapImg = function(img) {
						var name = new UUID().id; //七牛图片处理临时文件的名
						imageUtil.getUpdateToken( {
							scope : me.opts.bucket + ":tmp/" + name,
							persistentOps : 'imageMogr2/auto-orient/strip/quality/50/rotate/90;'
								 + 'imageMogr2/auto-orient/strip/quality/50/rotate/180;' + 
								 + 'imageMogr2/auto-orient/strip/quality/50/rotate/270'
						}, function(xhr){
							var uploader = new SIUploader({
								basePath : 'tmp/',
								fileName : name,
								browse_button : me.opts.browse_button,
								container : me.opts.container,
								auto_start : true,
								isTarget : false,
								uptoken : xhr.uptoken,
								bucket : me.opts.bucket
							}, function(domain, file, res) {
								me.key = res.key;
								me.baseSrc = domain + "/" + encodeURI(res.key);
								$(me.opts.wrapDiv).find('.preview-pane .preview-container img').attr('src', '/img/loading5.gif');
								$(me.opts.wrapDiv).find('.preview-pane .preview-container img').width(100);
								$(me.opts.wrapDiv).find('.preview-pane .preview-container img').height(100);
								me.opts.cropUtil.loadCropImg(me.baseSrc);
								$(me.opts.wrapDiv).find('.preview-pane').show();
								$(me.opts.wrapDiv).find('.statusShow').hide();
							}, true, $(me.opts.wrapDiv).find('.cropImg'), $(me.opts.wrapDiv).find('.splitright .upaction'));
							imageUtil.qiniu = uploader.qiniu;
							uploader.qiniuUploader.bind('PostInit', function() {
								uploader.addLoaclImg(img);
								$(me.opts.wrapDiv).find('.splitcontent').show();
								
							});
						});
					};
				}


			}
	};
	
	window.SureImgTool = __SureImgTool;
	
})(jQuery, window);