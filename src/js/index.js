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
            self._attachEvents();
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
            var modalString =
                '<div id= "add-event-modal" class="modal fade" tabindex="-1" role="dialog">' +
                '<div class="modal-dialog" role="document">' +
                '<div class="modal-content">' +
                '<div class="modal-header">' +
                '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
                '<h4 class="modal-title">Event</h4>' +
                '</div>' +
                '<div class="modal-body">' +
                    '<p class="event-name-row">' +
                        '<label>Name</label>' +
                        '<input name="event-name" type="text" class="name">' +
                    '</p>' +
                    '<p id="event-duration">' +
                        '<label>From</label>' +
                        '<input type="text" class="time start" /> ' +
                        '<label>To</label>' +
                        '<input type="text" class="time end" />' +
                    '</p>' +
                '</div>' +
                '<div class="modal-footer">'+
                '<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>'+
                '<button type="button" class="btn btn-primary">Save changes</button>'+
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>';
            $(modalString).appendTo(self.$ele);
        },
        _attachEvents: function(){
            var self = this;
            self.$ele.find(".time-slot-box").on("click",function (event) {
                var startTime = $(event.target).data("starttime"),
                    endTime = $(event.target).data("endtime");
                console.log(startTime);
                console.log(endTime);
                $("#add-event-modal").modal("show");
                self.$ele.find("#event-duration .start").timepicker("setTime",moment(startTime,"h:mma")._d);
                self.$ele.find("#event-duration .end").timepicker("setTime",moment(endTime,"h:mma")._d)

            });

            $('#event-duration .start').timepicker({
                'showDuration': false,
                'timeFormat': 'g:ia',
                'orientation': 'b',
                'minTime': self.options.startTime,
                'maxTime': self.options.endTime
            });

            $('#event-duration .end').timepicker({
                'showDuration': true,
                'timeFormat': 'g:ia',
                'orientation': 'b',
                'minTime': self.options.startTime,
                'maxTime': self.options.endTime
            });

            var timeOnlyExampleEl = document.getElementById('event-duration');
            var timeOnlyDatepair = new Datepair(timeOnlyExampleEl);
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
        "date": new Date(),
        "startTime": "9:00am",
        "endTime": "5:00pm"
    };
})(jQuery);