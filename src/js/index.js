;(function($){
    var pluginName = 'dayPlanner';

    function Plugin(element,options){
        this.$ele = element;
        this.options = $.extend({}, $.fn[pluginName].defaults,options);
        if(!localStorage.getItem("events")){
            this.events = [];
        }else{
            try {
                this.events = JSON.parse(localStorage.getItem("events"));
            }catch (ex){
                console.log("Can not read localStorage as JSON");
            }
        }

        this.init();
    }

    Plugin.prototype = {
        init: function(){
            var self = this;
            self._buildTemplate();
            self.widthForOneMinute  = self.$ele.find(".time-slot-box").outerWidth()/60 ;
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
            $("<div class='day-timeline'></div>").append(headingsRow).append(durationBoxRow).appendTo(self.$ele);
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
                '<button type="button" class="btn btn-primary save">Save changes</button>'+
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
                self.$ele.find("#event-duration .start").timepicker("setTime",startTime);
                self.$ele.find("#event-duration .end").timepicker("setTime",endTime);

            });

            self.$ele.find(".btn.save").on("click",function (event) {
                var event= {
                    name: self.$ele.find("#add-event-modal .input[name='event-name']").val(),
                    from: self.$ele.find("#event-duration .start").val(),
                    to: self.$ele.find("#event-duration .end").val()
                },duration, positionFromLeft;
                self.events.push(event);
                self._updateLocalStorage();
                duration = (moment(event.to,"h:mma").diff(moment(event.from,"h:mma"),'minutes'));
                positionFromLeft = (moment(event.from ,"h:mma").diff(moment(self.options.startTime,"h:mma"),'minutes'))*self.widthForOneMinute;
                $("<div class='event'></div>").width(duration*self.widthForOneMinute).css("left",positionFromLeft).appendTo(self.$ele.find(".day-timeline"));
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
        _updateLocalStorage: function () {
            var self = this;
            localStorage.setItem("events",JSON.stringify(self.events));
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