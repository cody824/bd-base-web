(function ($) {
    /**
     * 美图秀秀编辑工具，两个方法
     * 调用美图秀秀头像插件进行头像编辑
     *
     * 需求：
     *        1、在页面<head></head>之间引入美图秀秀JS:<script src="http://open.web.meitu.com/sources/xiuxiu.js" type="text/javascript"></script>
     *        2、控件：artDialog
     * 使用说明:
     *        1、编辑src为imgSrc的图片，b64 : imgSrc是否为64位编码
     *        SureXX.show(imgSrc, b64, {
     *				cropPresets :  "500x600",//图片比例
     *				titleVisible : 0,		//是否显示窗口标题
     *				localFileEnabled : 0,	//是否允许本地上传
     *				onSaveBase64Image : function(data, fileName, fileType){//保存为base64位编码的回调函数
     *					data = "data:image/png;base64," + data;
     *					slot.uploader.addLoaclImg(data);
     *					SureXX.close();
     *				}
     *		});
     *
     *        2、关闭窗口：
     *        SureXX.close();
     *
     *
     */
    var __xiuxiuTool = {

        Defaults: {
            xiuxiuWinId: 'xiuxiuWin',
            xiuxiuSwfContainerId: 'xiuxiuSwfContainer',
            id: "xiuxiuEditor",
            uploadType: 3,
            title: "编辑图片",// 编辑窗口标题
            width: 800, // 编辑窗口宽度
            height: 600,// 编辑窗口高度,
            editBtn: '.xxMagicBtn',
            onSaveBase64Image: function (data, fileName, fileType) {
                console.log(data, fileName, fileType);
            }
        },

        __buildHtml: function (options) {
            var xxWin = $("#" + options.xiuxiuWinId);
            if (xxWin.length > 0) {
                xxWin.remove();
            }
            $(document.body).append(
                '<div id="' + options.xiuxiuWinId + '"><div id="'
                + options.xiuxiuSwfContainerId + '"></div></div>');
        },

        win: null,

        __init: function (options) {
            var opts = $.extend({}, SureXX.Defaults, options);
            SureXX.__buildHtml(opts);
            if (typeof opts.beforeInit === "function")
                opts.beforeInit(opts);
            if (opts.cropPresets)
                xiuxiu.setLaunchVars("cropPresets", opts.cropPresets, opts.id);
            if (opts.cropPresets)
                xiuxiu.setLaunchVars("maxFinalWidth", opts.maxFinalWidth,
                    opts.id);
            if (opts.cropPresets)
                xiuxiu.setLaunchVars("maxFinalHeight", opts.maxFinalHeight,
                    opts.id);
            if (opts.hasOwnProperty("localFileEnabled"))
                xiuxiu.setLaunchVars("localFileEnabled", opts.localFileEnabled,
                    opts.id);
            if (opts.hasOwnProperty("localFileEnabled"))
                xiuxiu.setLaunchVars("localFileEnabled", opts.localFileEnabled,
                    opts.id);
            if (opts.uploadBtnLabel)
                xiuxiu.setLaunchVars("uploadBtnLabel", opts.uploadBtnLabel,
                    opts.id);
            if (opts.hasOwnProperty("titleVisible"))
                xiuxiu.setLaunchVars("titleVisible", opts.titleVisible,
                    opts.id);
            if (opts.hasOwnProperty("preventBrowseDefault"))
                xiuxiu.setLaunchVars("preventBrowseDefault", opts.preventBrowseDefault,
                    opts.id);
            if (opts.hasOwnProperty("quality"))
                xiuxiu.setLaunchVars("quality", opts.quality, opts.id);
            if (opts.hasOwnProperty("nav"))
                xiuxiu.setLaunchVars("nav", opts.nav, opts.id);
            if (opts.hasOwnProperty("customMenu"))
                xiuxiu.setLaunchVars("customMenu", opts.customMenu, opts.id);
            if (opts.hasOwnProperty("customMaterial"))
                xiuxiu.setLaunchVars("customMaterial", opts.customMaterial,
                    opts.id);
            xiuxiu.embedSWF("xiuxiuSwfContainer", opts.type, opts.width,
                opts.height, opts.id);
            xiuxiu.setUploadType(opts.uploadType, opts.id);
            if (opts.hasOwnProperty("uploadURL")) {
                xiuxiu.setUploadURL(opts.uploadURL, opts.id);
            }

            if (opts.hasOwnProperty("uploadDataFieldName")) {
                xiuxiu.setUploadDataFieldName(opts.uploadDataFieldName, opts.id)
            }
            if (opts.hasOwnProperty("uploadArgs")) {
                xiuxiu.setUploadArgs(opts.uploadArgs, opts.id)
            }
            xiuxiu.onInit = opts.onInit;
            xiuxiu.onBrowse = opts.onBrowse;
            xiuxiu.onSaveBase64Image = opts.onSaveBase64Image;
            xiuxiu.onUploadResponse = opts.onUploadResponse;
            xiuxiu.onClose = opts.onClose;
            return opts;
        },

        /**
         * 获取图片对象的Base64编码
         * @param img    图片对象
         * @param callback    回调函数
         * @returns
         */
        __getBase64Image: function (img, callback) {
            if (img.hasOwnProperty("upfile")) {
                var reader = new FileReader();
                reader.onload = function (e) {
                    var dataURL = e.target.result;
                    dataURL = dataURL.replace(/data:image\/(.+);base64,/, "");
                    if (SureMsg && typeof SureMsg.hideLoadBar === "function") {
                        SureMsg.hideLoadBar();
                    }
                    callback(dataURL);
                };
                reader.onprogress = function (e) {
                    if (SureMsg && typeof SureMsg.showLoadBar === "function") {
                        SureMsg.showLoadBar();
                    }
                };
                reader.readAsDataURL(img.upfile.getSource().getSource());
            } else {
                var canvas = document.createElement("canvas");
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                var ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight);
                var dataURL = canvas.toDataURL("image/png");
                dataURL = dataURL.replace(/data:image\/(.+);base64,/, "");
                callback(dataURL);
            }
        },

        /**
         * 显示美图秀秀编辑窗口
         * @param src        待编辑图片的源，如果是 base64编码，需要把“data:image/png;base64,”的前缀去掉
         * @param base64    是否是 base64编码
         * @param options    美图秀秀插件选项，具体查看美图API支持大部分插件配置
         */
        show: function (src, base64, options) {
            var opts = SureXX.__init(options);
            console.log(opts);
            if (src) {
                base64 = base64 || false;
                xiuxiu.onInit = function () {
                    xiuxiu.loadPhoto(src, base64, opts.id);
                };
            }
            SureXX.win = dialog({
                title: opts.title,
                content: document.getElementById(opts.xiuxiuWinId),
                zIndex: 99999,
                top: 20,
                onclose: function () {
                    setTimeout(function () {
                        var xxWin = $("#" + opts.xiuxiuWinId);
                        xxWin.remove();
                        if (opts.onClose) {
                            opts.onClose();
                        }
                    }, 500);
                }
            });
            SureXX.win.show();
        },


        avatarQiniu: function (options) {

        },

        /**
         * 关闭美图秀秀编辑窗口
         */
        close: function () {
            if (SureXX.win)
                SureXX.win.close();
        }

    };

    window.SureXX = __xiuxiuTool;
})(jQuery);