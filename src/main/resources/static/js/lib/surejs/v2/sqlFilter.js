function SQLFilter() {
    var me = this;

    this.orderList = [];
    this.sesl = [];

    this.addOrder = function (order) {
        me.orderList.push(order);
    };

    this.addSQLExpressionSet = function (ses) {
        me.sesl.push(ses);
    };

    this.buildBySe = function (se, order, lop) {
        me.orderList = (typeof order == "undefined") ? [] : (order instanceof Array) ? order : [order];
        var ses = new SQLExpressionSet(lop || "and", (se instanceof Array) ? se : [se]);
        me.sesl.push(ses);
    };

    this.getFilter = function () {
        return {
            orderList: me.orderList,
            sesl: me.sesl
        };
    };
}

function SQLOrder(name, oType) {
    this.property = name;
    this.direction = oType;
}

function SQLExpressionSet(lop, selist) {
    this.logicalOp = lop;
    this.sel = selist;

}

/**
 *
 * @param lop 表达式逻辑关系符，and，or，not
 * @param name  属性名
 * @param mathM 匹配方式
 * @param exp   * 匹配的值
 *        Object[] 对象数组
 *        对于matchMode为between和in需要多个值
 * @param ignoreC
 * @constructor
 */
function SQLExpression(lop, name, mathM, exp, ignoreC) {
    /**
     * 表达式逻辑关系符，and，or，not
     *    连接该表达式时的逻辑关系符号
     */
    this.logicalOp = lop;
    /**
     * 属性名
     *        String类型
     */
    this.property = name;
    /**
     * 匹配方式
     *        String 类型
     */
    this.matchMode = mathM;

    /**
     * 匹配的值
     *        Object[] 对象数组
     *        对于matchMode为between和in需要多个值
     */
    if (exp instanceof Array)
        this.value = exp;
    else
        this.value = [exp];

    this.ignoreCase = ignoreC || false;

}