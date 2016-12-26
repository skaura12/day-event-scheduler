;(function($){
    var pluginName = 'dayPlanner';

    function Plugin(element,options){
        this.$ele = element;
        this.options = $.extend({}, $.fn[pluginName].defaults,options);
        this.init();
    }

    Plugin.prototype = {
        init: function(){
            var self = this;
            self._buildTemplate();
        },
        _buildTemplate: function(){
            var self = this,
                startTime = this.options.startTime,
                endTime = this.options.endTime,time,
                headingsRow = $("<div class='headings-row'></div>"),
                durationBoxRow = $("<div class='time-slot-row'></div>"),
                durationCount= moment.duration(moment(endTime,"h:mma").diff(moment(startTime,"h:mma"))).asMinutes()/60,
                iterator = 0;

            boxStartTime = startTime;
            while(iterator != durationCount){
                boxEndTime = moment(boxStartTime,"h:mma").add(60,"minutes").format("h:mma");
                $("<div class='heading'>"+boxStartTime+"</div>").width(100/durationCount + "%").appendTo(headingsRow);
                $("<div class='time-slot-box' data-startTime='"+boxStartTime+"' data-endTime='"+boxEndTime+"'></div>").width(100/durationCount + "%").appendTo(durationBoxRow);
                boxStartTime = boxEndTime;
                ++iterator;
            }
            iterator = 0;
            headingsRow.appendTo(self.$ele);
            durationBoxRow.appendTo(self.$ele);
        },
        _attachEvents: function(){
            var self = this;
        },
        resize:function(){
            var self = this;
        },
        destroy: function(){
            this.$ele.empty();
            $.data(this.$ele, 'plugin_' + pluginName, null);
        }
    };
    $.fn[pluginName] = function(options){
        var args = arguments;
        if(options == undefined || typeof options === 'object') {
            return this.each(function () {
                if (!$.data(this, "plugin_" + pluginName)) {
                    $.data(this, "plugin_" + pluginName, new Plugin($(this), options));
                }
            });
        }else if (typeof options === 'string' && options[0] !== '_' && options !== 'init') {

            var returns;

            this.each(function () {
                var instance = $.data(this, 'plugin_' + pluginName);

                if (instance instanceof Plugin && typeof instance[options] === 'function') {
                    returns = instance[options].apply( instance, Array.prototype.slice.call( args, 1 ) );
                }
            });

            return returns !== undefined ? returns : this;
        }
    };
    $.fn[pluginName].defaults = {
        "startTime": "9:00am",
        "endTime": "5:00pm"
    };
})(jQuery);