# day-event-scheduler

The library allows user to schedule events for a day between 9am to 5pm.Once the user opens the application he/she can start 
scheduling events by clicking on the time slots which represents 30 minutes.User can delete or reschedule any of the created events by
clicking on the highlighted event area.

The application does not allow overlapping events.


Local Storage is used to save the created events for a day. This is assumed that the user needs to schedule events only for the current day 
and once the day ends and the application is refreshed a new timeline appears and all the events corresponding to the previous day are
deleted.


For Development Purposes after cloning the repository user needs to run the following commands.

npm install

to download all node packages.

bower install

to download all front end packages

gulp

to run the build process which involves scss compilation,js and css minification and to initiate additional filewatchers.
