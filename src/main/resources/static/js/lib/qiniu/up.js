/**
 * 单个图片的上传控件
 * @param op		plupload参数/七牛参数/文件路径参数
 * 			bucket 			文件上传的空间
 * 			basePath		文件上传后的基础路径
 * 			fileName		文件名
 * 					不指定，使用原始文件名,如果指定文件名，则使用bucket：basePath + fileName作为key上传
 * 			chunk_size 		默认4mb
 * 			mas_file_size 	默认10mb
 * 			uptoken_url  	默认'/qiniu/upToken'
 * 			domain			默认'http://yearbook-album.qiniudn.com/'
 * 			mime_types		默认'image/*'
 * @param callback		上传完成后的回调函数
 * 					参数为图片信息
 * 
 * @param checkImgSize {boolean}  是否检查照片尺寸 默认false
 * 			依据container对象的imgWidth，imgHeight属性判断传入照片的尺寸是否合适
 * @param img {jquery obj}	上传照片显示（jquery对象）
 * 			如果不指定则自动设为container.parent().next();
 * 
 * @param pb {jqeury obj}	进度条显示div，空div即可，自动生成.
 * 			如果不指定则自动设为container.find('.progress');
 * @returns
 */
function SIUploader(op, callback, checkImgSize, img, pb) {
	if (!op.browse_button) {
		throw 'browse_button is required!';
	}
	
	if (!op.container) {
		throw 'container is required!';
	}
	
	if (op.drop_element){
		op.dragdrop = true;
	}
	
	this.container = op.container;
	this.checkImgSize = checkImgSize || false;
	
	this.target = $(this.container);
	this.showImg = img ||  this.target.parent().next();//照片框的下一个为照片显示img
	this.progressBar = pb || this.target.find('.progress');
	
	this.bucket = op.bucket || "yearbook-album";
	this.basePath = op.basePath || "";
	this.fileName = op.fileName || "";
	

	this.currentFile = null;
	this.originalSrc = null;
	
	this.key = this.fileName == "" ? null : this.bucket + ":" + this.basePath + this.fileName;
	
	var me = this;
	
	op.uptoken_url = op.uptoken_url || this.key == null ? '/qiniu/upToken?' : '/qiniu/upToken?scope=' + this.key ;
	
	me.defaults = {
		runtimes: 'html5,flash,html4',
	    browse_button: 'pickfiles',
	    container: 'uploader',
	    drop_element: 'uploader',
	    max_file_size: '12mb',
	    flash_swf_url: '/js/plupload/Moxie.swf',
	    dragdrop: true,
	    chunk_size: '4mb',
	    domain: 'http://' + me.bucket + '.qiniudn.com/',
	    multi_selection : false,
	    mime_types : 'image/*'
    };

	var options = $.extend({}, me.defaults, op, {
		init : {
			'FilesAdded' : function(up, files) {
				plupload.each(files, function(file) {
					var src = me.getSrc(file);
					me.originalSrc = me.showImg.attr("src");
					me.currentFile = file;
					me.showImg.attr("src", src);
					me.showImg.bind('load', me.AddfileExecute);					
					me.showImg.show();
				});
			},
			'BeforeUpload' : function(up, file) {				 
			},
			'FilesRemoved' : function(up, files){
			},
			'UploadProgress' : function(up, file) {
				 var progressbar= me.currentFile.loadingBar;				 
				 progressbar.setProgress(file.percent/100, up.total.bytesPerSec);
			},
			'UploadComplete' : function() {
			},
			'FileUploaded' : function(up, file, info) {
			    var progressbar= me.currentFile.loadingBar;
				progressbar.setComplete(up, info);
				var res = $.parseJSON(info);
				var domain = up.getOption('domain');
				callback(domain, file, res);
			},
			'Error' : function(up, err, errTip) {
			},
			'Key' : function(up, file) {
				var base = me.basePath;
				var fileName = me.fileName == "" ? file.name : me.fileName;
				return base + fileName;
			}
		}
	});
	
	function getNativeForIE9(file){
		var img = file.getSource().getSource();
		return o.inArray(o.typeOf(img), ['blob', 'file','object']) !== -1 ? img : null;
	}
	/**
	 * 获取文件的原始url
	 */
	this.getSrc = function(file){
		var src;
		//if (file.getNative() == null) {
		if (getNativeForIE9(file) == null) {
			src = this.qiniuUploader.originalUrl[file.getSource().uid];
		} else {
			src =  getObjectURL(getNativeForIE9(file));
		}
		return src;
	};
		
	this.AddfileExecute = function(){
		var yearbookPageUtil = {};
		yearbookPageUtil.defaultPhoto = "/img/template/people_bg.jpg";
		if (me.showImg.attr("src") !== yearbookPageUtil.defaultPhoto &&
				me.showImg.attr("src") !== me.originalSrc ) {
			if (me.checkImgSize) {
				me.checkImgFunc();
			} else {
				me.qiniuUploader.trigger('imgOk');
			}
		}
		me.showImg.unbind('load', me.AddfileExecute);
	};
	
	/**
	 * 李文彬
	 * 描述:处理选中的相册图片
	 */
	this.handleAlbumImage = function(image){
	    if(me.checkImgSize){
		var width = me.target.attr('imgWidth');
		var height = me.target.attr('imgHeight');
		image.naturalWidth = image.width;
		image.naturalHeight = image.height;
		var isOk = isImgSizeOk(image, width, height);
		if ((isOk & 2) === 2){
			me.checkAlbumImgRotateF(image,width, height, (isOk & 1) === 1);
		} else if ((isOk & 1) === 1) {
			me.checkAlbumImgSizeF(image, width, height);
		} else {
		    	me.addAlbumImg(image.src);
		}
	    }else{
		
	    }
	};
	
	/**
	 * 李文彬
	 */
	this.checkAlbumImgRotateF = function(image, width, height, sizeCheck){
		confirmImgEdit(image, width, height, function(){
			SureImgWrap.init(width, height, null, 
				image.src+'?_dt='+(new Date()).getTime(), 1024*1024*2, me);
			SureImgWrap.imgMeta = image;
			SureImgWrap.cropAlbumImageShow();
		}, function(){
			if (sizeCheck)
				me.checkAlbumImgSizeF(image, width, height);
			else{
			    me.addAlbumImg(image.src);
			}
		});
	};
	
	/**
	 * @author 李文彬
	 */
	this.checkAlbumImgSizeF = function(image, width, height){
		confirmSize(image, width, height, function(){
		    me.addAlbumImg(image.src);
		}, function(){
		    console.log('hello man,a img is not ok for upload');
		});
	};
	
	/**
	 * 上传相册图片
	 * @param url 		相册图片的地址
	 * @param callback 	添加完成后的回调函数
	 */
	this.addAlbumImg = function(url, callback){
		var name = new UUID().id;		
		SureAjax.ajax({
			url : "/file/address",
			data : {
				name : name,
				url : url
			},
			success : function(xhr){
				var upImg = new mOxie.Image();
				upImg.onload = function() {
				    var blob = upImg.getAsBlob();
				    me.qiniuUploader.originalUrl[blob.uid] = xhr.address;
				    me.checkImgSize = false;
				    me.qiniuUploader.addFile(blob);
				    setTimeout(function(){
					me.checkImgSize = true; 
				    },3000);
				    if (typeof(callback) === "function") {
				    	callback();
				    }
				};
				upImg.load(xhr.address);
			}, error : function(){
			}
		});
	};
	
	this.newLoadingBar = function(){
		me.currentFile.loadingBar = new ImgProgress(me.qiniuUploader, me.currentFile,  me.progressBar);
	};
	
	this.removeCurrentFile = function(){
		me.qiniuUploader.removeFile(me.currentFile);
		if(me.showImg[0].src== me.originalSrc){
			me.showImg[0].src="/img/template/people_bg.jpg";
		}else{
		me.showImg[0].src = me.originalSrc;
		}
	};
	/**
	 * 上传网络图片
	 * @param url 		网络图片的地址
	 * @param callback 	添加完成后的回调函数
	 */
	this.addNetImg = function(url, callback){
		var name = new UUID().id;
		SureAjax.ajax({
			url : "/file/address",
			data : {
				name : name,
				url : url
			},
			success : function(xhr){
				var upImg = new mOxie.Image();
				upImg.onload = function() {
				    var blob = upImg.getAsBlob();
				    me.qiniuUploader.originalUrl[blob.uid] = xhr.address;
				    me.qiniuUploader.addFile(blob);
				    if (typeof(callback) === "function") {
				    	callback();
				    }
				};
				upImg.load(xhr.address);
			}, error : function(){
			}
		});
	};
	
	/**
	 * 上传本地图片
	 * @param img		图片的地址或者图片的native对象
	 * @param callback 	添加完成后的回调函数
	 */
	this.addLoaclImg = function(img, callback){
		if (typeof(img) === 'object') {
			me.qiniuUploader.addFile(img);
		} else if (typeof(img) === 'string'){
			var upImg = new mOxie.Image();
			upImg.onload = function() {
			    var file = upImg.getAsBlob();
			    me.qiniuUploader.originalUrl[file.uid] = img;
			    me.qiniuUploader.addFile(file);
			    if (typeof(callback) === "function") {
			    	callback();
			    }				
			};
			upImg.load(img);
		}
	};
	
	this.qiniu = new QiniuJsSDK();
	this.qiniuUploader = this.qiniu.uploader(options);
	
	this.qiniuUploader.bind('imgOK', function() {
	    me.newLoadingBar();
		console.log('hello man,a img is ok for upload');

	   
	});
	
	this.qiniuUploader.bind('imgNotOk', function() {
	    console.log('hello man,a img is not ok for upload');
	    me.removeCurrentFile();
	});
	
	this.checkImgFunc = function(){
		var width = me.target.attr('imgWidth');
		var height = me.target.attr('imgHeight');
		var isOk = isImgSizeOk(me.showImg[0], width, height);
		if ((isOk & 2) === 2){
			me.checkImgRotateF(width, height, (isOk & 1) === 1);
		} else if ((isOk & 1) === 1) {
			me.checkImgSizeF(width, height);
		} else {
			me.qiniuUploader.trigger('imgOk');
		}
	};
	
	this.checkImgRotateF = function(width, height, sizeCheck){
		confirmImgEdit(me.showImg[0], width, height, function(){
			SureImgWrap.init(width, height, me.currentFile.getNative(), 
					me.getSrc(me.currentFile), me.currentFile.origSize, me);
			me.qiniuUploader.trigger('imgNotOk');
			SureImgWrap.show();
		}, function(){
			if (sizeCheck)
				me.checkImgSizeF(width, height);
			else
				me.qiniuUploader.trigger('imgOk');
		});
	};
	
	this.checkImgSizeF = function(width, height){
		confirmSize(me.showImg[0], width, height, function(){
			me.qiniuUploader.trigger('imgOk');
		}, function(){
			me.qiniuUploader.trigger('imgNotOk');
		});
	};
	
	/**
	 * 保存网络图片的原始路径
	 */
	this.qiniuUploader.originalUrl = {};
	
	
}


function confirmSize(img, width, height, okFunc, cancelFunc){
	SureMsg.confirm("图片分辨率较低，推荐分辨率为[" + width +"x" + height + "], 确定使用？",
			okFunc, cancelFunc);
}

function confirmImgEdit(img, width, height, okFunc, cancelFunc) {
	var showR = getRatio(width, height);
	var showR2 = getRatio(img.naturalWidth, img.naturalHeight);
	$(document).unbind("click");
	SureMsg.confirm("图片比例不符，裁剪后效果更佳，推荐比例为[" + showR + "]，是否裁剪？", okFunc, cancelFunc);
}

function getRatio(a, b) {
	var ratio = a > b ? a/b : b/a;
	var ret = a + ":" + b;
	ratio = ratio.toFixed(2);
	if (a > b)
		ret = ratio + ":1";
	else
		ret = "1:" + ratio;
	return ret;
}

/**
 * 判断图片是否符合标准
 * @param img		图片
 * @param width		要求最小宽度
 * @param height	要求最小高度
 * @returns {Number} 0	符合要求
 * 					 1	不满足最小高度和宽度
 * 					 2 	不满足比例
 * 					 3 	不满足最小高度和宽度，也不满足比例要求	
 */
function isImgSizeOk(img, width, height) {
	var ret = 0;
	var naturalWidth = img.naturalWidth;
	var naturalHeight = img.naturalHeight;
	if (naturalWidth < (width - 5) || naturalHeight < (height - 5)) {
		ret = ret + 1;
	}
	
	var ratio = width/height;
	var ratio2 = naturalWidth/naturalHeight;
	if ((ratio > 1 && ratio2 < 1) || (ratio < 1 && ratio2 > 1)
			|| (ratio + 0.1) < ratio2 || (ratio - 0.1) > ratio2) {
		ret = ret + 2;
	}
	return ret ;
	
}