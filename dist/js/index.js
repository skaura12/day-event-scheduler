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
                console.log("events",this.events);
            }catch (ex){
                console.log("Can not read localStorage as JSON");
            }
        }

        this.init();
    }

    function generateEventId() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
    }

    function findEventById(events,id) {
        var results = events.filter(function (ele) {
            return ele.id === id;
        })
        return results[0];
    }



    Plugin.prototype = {
        init: function(){
            var self = this;
            self._buildTemplate();
            self.widthForOneMinute  = self.$ele.find(".time-slot-box").outerWidth()/60 ;
            self._attachEvents();
            self._addEventsFromHistory();
        },
        _buildTemplate: function(){
            var self = this,
                startTime = this.options.startTime,
                endTime = this.options.endTime,time,
                headingsRow = $("<div class='headings-row'></div>"),
                durationBoxRow = $("<div class='time-slot-row'></div>"),
                durationCount= moment.duration(moment(endTime,"h:mma").diff(moment(startTime,"h:mma"))).asMinutes()/60,
                boxCount= moment.duration(moment(endTime,"h:mma").diff(moment(startTime,"h:mma"))).asMinutes()/30,
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
            while(iterator != boxCount){

            }
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
                '<button type="button" class="btn btn-default" data-dismiss="modal">Discard</button>'+
                '<button type="button" class="btn btn-primary delete">Delete</button>'+
                '<button type="button" class="btn btn-primary save">Save</button>'+
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
                self.$ele.find("#add-event-modal").data("mode","new");

                $("#add-event-modal").modal("show");
                self.$ele.find("#event-duration .start").timepicker("setTime",startTime);
                self.$ele.find("#event-duration .end").timepicker("setTime",endTime);
                self.$ele.find("#add-event-modal input[name='event-name']").val("");
                self.$ele.find("#add-event-modal .btn.delete").addClass("hidden");
            });

            self.$ele.find(".btn.save").on("click",function (event,mode) {
                var name = self.$ele.find("#add-event-modal input[name='event-name']").val(),
                    from = self.$ele.find("#event-duration .start").val(),
                    to = self.$ele.find("#event-duration .end").val(),
                    event,$eventElement,duration, positionFromLeft,mode = self.$ele.find("#add-event-modal").data("mode"),isValidEvent;
                if(mode === "edit"){
                    isValidEvent = self._checkEventValidity({
                        "mode" :"edit",
                        "from": from,
                        "to": to,
                        "id": self.$ele.find("#add-event-modal").data("id")
                    })
                }else if(mode === "new"){
                    isValidEvent = self._checkEventValidity({
                        "mode" :"new",
                        "from": from,
                        "to": to
                    })
                }
                if(isValidEvent) {
                    if (mode === "new") {
                        event = {
                            id: generateEventId()
                        };
                        self.events.push(event);
                        $eventElement = $("<div class='event'></div>").attr("data-id", event.id)
                        $eventElement.appendTo(self.$ele.find(".day-timeline"));
                    } else if (mode === "edit") {
                        event = findEventById(self.events, self.$ele.find("#add-event-modal").data("id"));
                        $eventElement = self.$ele.find(".day-timeline .event[data-id='" + event.id + "']");
                    }
                    event.name = name;
                    event.from = from;
                    event.to = to;
                    self._updateLocalStorage();
                    $eventElement.text(event.name).attr("title", event.name);
                    self._positionEventOnTimeline(event);
                    $("#add-event-modal").modal("hide");
                }
            });

            self.$ele.find(".btn.delete").on("click",function(){
                var eventId = self.$ele.find("#add-event-modal").data("id"),eventIndex;
                self.events.forEach(function (ele,index) {
                    if(ele.id === eventId){
                        eventIndex = index;
                    }
                })
                self.events.splice(eventIndex,1);
                self._updateLocalStorage();
                self.$ele.find(".day-timeline .event[data-id='"+eventId +"']").remove();
                $("#add-event-modal").modal("hide");

            });

            self.$ele.find(".day-timeline").on("click",".event",function (event) {
                //add data-id to add-event-modal domElement
                var event = findEventById(self.events,$(event.target).data("id"));

                self.$ele.find("#event-duration .start").timepicker("setTime",event.from);
                self.$ele.find("#event-duration .end").timepicker("setTime",event.to);
                self.$ele.find("#add-event-modal input[name='event-name']").val(event.name);
                self.$ele.find("#add-event-modal").data("mode","edit").data("id",event.id);
                $("#add-event-modal").modal("show");

            });
            self.$ele.find("#add-event-modal").on("hide.bs.modal",function (event) {
                $(event.target).find(".btn.delete").removeClass("hidden");
            })

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
            $(window).on("resize",function(event){
                self.resize();
            });
        },
        _checkEventValidity : function(eventJson){
            var self = this,
                fromMoment = moment(eventJson.from,"h:mma"),
                toMoment = moment(eventJson.to,"h:mma");

            if(fromMoment.isAfter(toMoment)){
                alert("Event Start Time cannot be after Event End Time");
                return false;
            }

            if(moment.duration(toMoment.diff(fromMoment)).asMinutes()<30 ){
                alert("Event Duration can not be less than 30 minutes");
                return false;
            }

            if(moment.duration(toMoment.diff(fromMoment)).asMinutes()> 240){
                alert("Event Duration can not be more than 4 hours");
                return false;
            }

            for(var i=0; i< self.events.length; ++i){
                if( moment(self.events[i].from,"h:mma").isBetween(fromMoment,toMoment) ||
                    moment(self.events[i].to,"h:mma").isBetween(fromMoment,toMoment) ||
                    fromMoment.isBetween(moment(self.events[i].from,"h:mma"),moment(self.events[i].to,"h:mma")) ||
                    toMoment.isBetween(moment(self.events[i].from,"h:mma"),moment(self.events[i].to,"h:mma"))){

                    if(eventJson.mode === "new" || (eventJson.mode=== "edit" && self.events[i].id != eventJson.id)) {
                        alert("Can not have overlapping events.Please reschedule this or other events");
                        return false;
                    }
                }
            }
            return true;
        },
        _updateLocalStorage: function () {
            var self = this;
            localStorage.setItem("events",JSON.stringify(self.events));
        },
        _addEventsFromHistory: function(){
            var self = this;
            self.events.forEach(function(e){
                $("<div class='event'></div>").attr("data-id", e.id).text(e.name).attr("title", e.name).appendTo(self.$ele.find(".day-timeline"));
                self._positionEventOnTimeline(e);
            })
        },
        _positionEventOnTimeline: function(eventJson){
            var self = this,
                $eventElement = self.$ele.find(".day-timeline .event[data-id='" + eventJson.id + "']"),
                duration,
                positionFromLeft;

            duration = (moment(eventJson.to, "h:mma").diff(moment(eventJson.from, "h:mma"), 'minutes'));
            positionFromLeft = (moment(eventJson.from, "h:mma").diff(moment(self.options.startTime, "h:mma"), 'minutes')) * self.widthForOneMinute;
            $eventElement.width(duration * self.widthForOneMinute).css("left", positionFromLeft);
        },
        resize:function(){
            var self = this;
            self.widthForOneMinute  = self.$ele.find(".time-slot-box").outerWidth()/60;
            self.events.forEach(function(e){
                self._positionEventOnTimeline(e);
            })
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