/**
 * Copyright 2015, Wuxi SOUL.
 *
 * 提示框
 * 依赖：
 *  /js/lib/jquery/plugin/jquery.migrate.min.js
 *  /js/lib/jquery/plugin/jquery.BlockUI.min.js
 *  /js/lib/jquery/plugin/jquery.artDialog.js
 *
 *  /js/lib/surejs/v2/sureError.js
 *
 *  css:
 *  /js/lib/jquery/plugin/artDialog/skins/black.css 或者自定义的皮肤
 *  /css/sure.css
 *
 *  或者 合集引入：
 *  /js/lib/jquery/jquery.plugin.min.js
 *  /js/lib/surejs/all.min.js
 *
 */

!(function (window, $) {
    'use strict';

    if ($.os && $.os.mobile == true) {
        toastr.options = {
            "closeButton": true,
            "debug": false,
            "newestOnTop": false,
            "progressBar": false,
            "positionClass": "toast-top-full-width",
            "preventDuplicates": false,
            "onclick": null,
            "showDuration": "300",
            "hideDuration": "200",
            "timeOut": "5000",
            "extendedTimeOut": "1000",
            "showEasing": "swing",
            "hideEasing": "linear",
            "showMethod": "fadeIn",
            "hideMethod": "fadeOut"
        }
    } else {
        toastr.options = {
            "closeButton": true,
            "debug": false,
            "newestOnTop": false,
            "progressBar": false,
            "positionClass": "toast-top-right",
            "preventDuplicates": false,
            "onclick": null,
            "showDuration": "300",
            "hideDuration": "200",
            "timeOut": "5000",
            "extendedTimeOut": "1000",
            "showEasing": "swing",
            "hideEasing": "linear",
            "showMethod": "fadeIn",
            "hideMethod": "fadeOut"
        }
    }

    var _Msg = (function(){
        var msg = {
            showPopupWin: function (url) {
                art.dialog.open(url);
            },

            hidePopupWin: function () {
                $.unblockUI();
            },

            showLoadingImg: function (msg) {
                var loadMsg = "拼命加载中";
                if (typeof(msg) == "string")
                    loadMsg = msg;
                else if (msg == false)
                    loadMsg = "";
                if ($.os && $.os.mobile) {
                    if ($('.loading').length <= 0) {
                        $(document.body).prepend('<div class="loading" style="display: none;"><div class="loading" style="display: none;">  <img src="/img/m/loading.gif"><strong>'+loadMsg+'</strong>  </div>');
                    } else {
                        $(".loading strong").text(loadMsg);
                    }
                    $(".loading").show();
                } else {

                    if ($('#index_loadingimg').length <= 0) {
                        $(document.body).prepend('<div id="index_loadingimg" class="loadingimg" style="display: none;"><span class="loadingimg_roundborder"><img src="/img/dynamicloading_100_55.gif" /><label>' + loadMsg + '</label></span></div>');
                    } else {
                        $("#index_loadingimg label").text(loadMsg);
                    }
                    if ($('#index_loadinglayer').length <= 0) {
                        $(document.body).prepend('<div id="index_loadinglayer" class="loadinglayer" style="display: none;"></div>');
                    }
                    $("#index_loadingimg").show();
                    $("#index_loadinglayer").show();
                }
            },
            
            hideLoadingImg: function () {
                $("#index_loadingimg").hide();
                $("#index_loadinglayer").hide();
                $(".loading").hide();
            },

            showLoadBar: function (msg) {
                SureMsg.showLoadingImg(msg);
            },

            hideLoadBar: function () {
                SureMsg.hideLoadingImg();
            },

            updateLoadBar : function(msg) {
                if ($.os && $.os.mobile) {
                    $(".loading strong").text(msg);
                } else {

                    $("#index_loadingimg label").text(msg);
                }
            },

            parseResponse: function (response, callbackFn) {
                var me = this, errorJson = null;
                var errorMsg = response.responseText;
                if (response.hasOwnProperty("responseJSON")) {
                    errorJson = response.responseJSON;
                } else {
                    try {
                        errorJson = eval("(" + errorMsg + ")");
                    } catch (error) {
                        if (window.console) {
                            console.log(error);
                        }
                    }
                }
                if (errorJson != null) {
                    me.showErrorInfo("执行出错", SureError.parseErrorMsg(errorJson), callbackFn);
                } else if (errorMsg.length > 0) {
                	me.showSimpleDialog("执行出错", errorMsg, callbackFn);
                } else if (errorMsg.length == 0) {
                    me.showErrorInfo(response.status, response.statusText, callbackFn);
                }
            },

            /**
             * 提问并输入内容
             * @param    title
             *                    {String}    弹出框标题
             * @param    content
             *                    {String}    提问内容
             * @param    hide
             *                    {Boolean}    是否隐藏输入内容（如输入密码时）
             * @param    ok
             *                    {Function}    回调函数. 接收参数：输入值
             * @param    value
             *                    {String}    默认值
             */
            prompt: function (title, content, hide, ok, value) {
                swal({
                        title: title,
                        text: content,
                        type: "input",
                        confirmButtonText:  "确定",
                        cancelButtonText: "取消",
                        showCancelButton: true,
                        closeOnConfirm: true,
                        animation: "slide-from-top",
                        inputPlaceholder: "请输入"
                    },
                    function(inputValue){
                        if (inputValue === false) return false;

                        if (inputValue === "") {
                            swal.showInputError("必填");
                            return false
                        }
                        ok && ok(inputValue);
                    });
            },

            /**
             * 有自带取消按钮的弹框
             * @param title
             * @param content
             */
            showNewDialog: function (title, content, cancleFun) {
                art.dialog({
                    title: title,
                    lock: true,
                    content: content,
                    cancel: cancleFun
                });
            },
            
            /**
             * @param title
             * @param content
             */
            showSimpleDialog: function (title, content) {
                art.dialog({
                    title: title,
                    lock: true,
                    content: content
            
                });
            },


            showDialog: function (title, content, ok, can, okVal, cancelVal) {
                swal({
                        title: title,
                        text : content,
                        html: true,
                        showCancelButton: true,
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText: okVal || "确定",
                        cancelButtonText: cancelVal || "取消",
                        closeOnConfirm: true,
                        closeOnCancel: true
                    },
                    function(isConfirm){
                        if (isConfirm) {
                            ok && typeof(ok) == 'function' &&  ok();
                        } else {
                            can && typeof(can) == 'function' && can();
                        }
                    });
            },

            /**
             * 有确认和取消 按钮的弹出对话框。仅仅做弹框的效果封装成功用的，弹出框中的交互逻辑 都在回调函数中处理
             * @param title 对话框标题
             * @param content 对话框内显示的html合格代码
             * @param successFun
             * @param cancleFun
             */
            showFormDialog: function (title, content, successFun, cancleFun) {
                //this.showDialog(title, $(content).html(), successFun, cancleFun);
                art.dialog({
                    title: title,
                    lock: true,
                    content: content,
                    okValue: '确 定',
                    ok: successFun,
                    cancelValue: '取消',
                    cancel: cancleFun
                });
            },

            /**
             * 4.提示信息在加载中
             * 适用于ajax请求加载前，或页面加载前
             *
             * 使用必要条件：在对应的页面底部加上如下代码：
             *   <div style="display: none;" class="loading">
             *        <img src="/view/wechat/v2/img/loading.gif"><strong>加载中</strong>
             *   </div>
             *
             * @param msg
             */
            showLoading: function (msg) {
                var loading = $('.loading');
                if (typeof(msg) === 'string')
                    $('.loading strong').text(msg);
                loading.show();
            },
            /**
             * 加载完成，关闭 信息加载中提示
             * 和showLoading想对应，加页面加载完成或ajax请求结束时调用
             */
            hideLoading: function () {
                var loading = $('.loading');
                setTimeout(function () {
                    loading.hide();
                    $('.loading strong').text('加载中');
                }, 500);
            },

            showNormalInfo: function (title, msg, cb) {
                swal(title, msg);
                cb && cb();
            },


            showErrorInfo: function (title, msg, cb) {
                if (msg && msg.length > 100) {
                    msg = msg.substr(0, 100);
                }
                swal({
                    title: title,
                    text: msg,
                    type: "error",
                    timer: 2000,
                    confirmButtonText: "确定"
                }, function(){
                    cb && cb();
                });
            },

            showWarningInfo: function (msg, ok, can) {
                swal({
                        title: msg,
                        showCancelButton: true,
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText:  "确定",
                        cancelButtonText:  "取消",
                        closeOnConfirm: true,
                        closeOnCancel: true
                    },
                    function(isConfirm){
                        if (isConfirm) {
                            ok && ok();
                        } else {
                            can && can();
                        }
                    });
            },

            // 弱提示，提示信息会自动关闭 (pc左上角 ，wap顶部 )
            msg: function (title, msg, timeout, onClose) {
                toastr.clear();
                toastr.info(msg, title, {
                    timeOut: timeout || 3000,
                    onHidden : function() {
                        onClose && onClose();
                    }
                });
            },
            info: function (title, msg, cb) {
                toastr.clear();
                toastr.info(msg, title, {
                    onHidden : function() {
                        cb && cb();
                    }
                });
            },
            notice: function (title, msg, cb) {
                toastr.clear();
                toastr.info(msg, title, {
                    onHidden : function() {
                        cb && cb();
                    }
                });
            },
            error: function (title, msg, cb) {
                toastr.clear();
                toastr.error(msg, title, {
                    onHidden : function() {
                        cb && cb();
                    }
                });
            },
            warning: function (title, msg, cb) {
                toastr.clear();
                toastr.warning(msg, title, {
                    onHidden : function() {
                        cb && cb();
                    }
                });
            },
            success: function (title, msg, cb) {
                toastr.clear();
                toastr.success(msg, title, {
                    onHidden : function() {
                        cb && cb();
                    }
                });
            },
            /**
             * 确认
             * @param msg
             * @param ok 确认回调
             * @param can  取消回调
             * @param okVal 默认确认
             * @param cancelVal  默认取消
             */
            confirm: function (msg, ok, can, okVal, cancelVal) {
                swal({
                        title: msg,
                        showCancelButton: true,
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText: okVal || "确定",
                        cancelButtonText: cancelVal || "取消",
                        closeOnConfirm: true,
                        closeOnCancel: true
                    },
                    function(isConfirm){
                        if (isConfirm) {
                            ok && typeof(ok) == 'function' &&  ok();
                        } else {
                            can && typeof(can) == 'function' && can();
                        }
                    });
            },

            /**
             * 确认 显示加载过程
             * 回调里面需要返回 true 和 false
             *
             * @param msg
             * @param ok 确认回调
             * @param can  取消回调
             * @param okVal 默认确认
             * @param cancelVal  默认取消
             */
            confirm1: function (msg, ok, can, okVal, cancelVal) {
                swal({
                        title: msg,
                        showCancelButton: true,
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText: okVal || "确定",
                        cancelButtonText: cancelVal || "取消",
                        closeOnConfirm: false,
                        closeOnCancel: true,
                        showLoaderOnConfirm: true
                    },
                    function(isConfirm){

                        if (isConfirm) {
                            var ret = true;
                            ok && typeof(ok) == 'function' &&  (ret = ok());
                            if (ret) {
                                setTimeout(function(){
                                    swal("成功!", null, "success");
                                }, 1500);
                            } else {
                                setTimeout(function(){
                                    swal("失败", null, "error");
                                }, 1500);
                            }
                        } else {
                            can && typeof(can) == 'function' && can();
                        }
                    });
            },

            alert: function (msg, cb) {
                swal({
                        title: msg,
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText: "确定",
                        closeOnConfirm: true
                    },
                    function(){
                        cb && cb();
                    });
            }
        };
        return msg;
    })();

    window.SureMsg = _Msg;

}(window, jQuery));

