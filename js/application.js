$('body').tooltip({
    selector: "*[data-toggle=tooltip]"
});

function colspan(){
    if($(window).width() > 1400) {
        $('#sidebar, #sidebar-2').addClass('span2').removeClass('span3');
        $('#content').addClass('span8').removeClass('span6');
    } else {
        $('#sidebar, #sidebar-2').addClass('span3').removeClass('span2');
        $('#content').addClass('span6').removeClass('span8');
    }
}

$(window).resize(function(){
    colspan();
});

colspan();

/******************************************************************/
//safe apply
function safeApply(scope, fn) {
    var phase = scope.$root.$$phase;
    if(phase == '$apply' || phase == '$digest')
        scope.$eval(fn);
    else
        scope.$apply(fn);
}

//defin applicaton
var saturnApp = angular.module('saturnApp', ['ui', 'ui.bootstrap', 'ngResource']);

saturnApp.config(['$routeProvider', function($routeProvider) {
    $routeProvider.
        when('/', {templateUrl: 'partials/index.html', controller: 'EventController'}).
        when('/settings', {templateUrl: 'partials/settings.html', controller: 'SettingsController'}).
        when('/calendar/:calendarId/settings', {templateUrl: 'partials/calendar-settings.html', controller: 'CalendarController'}).
        otherwise({redirectTo: '/'});
    }
]).run(function($rootScope){
    $rootScope.config = {
        'baseURL': 'https://www.googleapis.com/calendar/v3'
    };

    $rootScope.dataCache = {};
});

/******************************************************************/
//ACL
saturnApp.factory('ACL', function($resource, $rootScope){
    return $resource(
        $rootScope.config.baseURL + '/calendars/:calendarId/acl/:ruleId',
        {
            'calendarId': '@calendarId',
            'ruleId': '@ruleId'
        },
        {
            'insert': {
                'method': 'POST'
            },
            'list': {
                'method': 'GET'
            },
            'update': {
                'method': 'PUT'
            },
            'patch': {
                'method': 'patch'
            }
        }
    );
});

//Calendar List
saturnApp.factory('CalendarList', function($resource, $rootScope){
    return $resource(
        $rootScope.config.baseURL + '/users/:user/calendarList/:calendarId',
        {
            'user': 'me',
            'calendarId': '@calendarId'
        },
        {
            'insert': {
                'method': 'POST'
            },
            'list': {
                'method': 'GET'
            },
            'update': {
                'method': 'PUT'
            },
            'patch': {
                'method': 'patch'
            }
        }
    );
});

//Calendars
saturnApp.factory('Calendars', function($resource, $rootScope){
    return $resource(
        $rootScope.config.baseURL + '/calendars/:calendarId',
        {
            'calendarId': '@calendarId'
        },
        {
            'clear': {
                'method': 'POST',
                'url': $rootScope.config.baseURL + '/calendars/:calendarId/clear'
            },
            'insert': {
                'method': 'POST'
            },
            'update': {
                'method': 'PUT'
            },
            'patch': {
                'method': 'patch'
            }
        }
    );
});

//Colors
saturnApp.factory('Colors', function($resource, $rootScope){
    return $resource(
        $rootScope.config.baseURL,
        {
            'get': {
                'method': 'GET',
                'url': $rootScope.config.baseURL + '/colors'
            }
        }
    );
});

//Events
saturnApp.factory('Events', function($resource, $rootScope){
    return $resource(
        $rootScope.config.baseURL,
        {
            'calendarId': '@calendarId',
            'eventId': '@eventId',
            'access_token': '@access_token'
        },
        {
            'delete': {
                'method': 'DELETE',
                'url': $rootScope.config.baseURL + '/calendars/:calendarId/events/:eventId'
            },
            'get': {
                'method': 'GET',
                'url': $rootScope.config.baseURL + '/calendars/:calendarId/events/:eventId'
            },
            'import': {
                'method': 'POST',
                'url': $rootScope.config.baseURL + '/calendars/:calendarId/events/import'
            },
            'insert': {
                'method': 'POST',
                'url': $rootScope.config.baseURL + '/calendars/:calendarId/events'
            },
            'instances': {
                'method': 'GET',
                'url': $rootScope.config.baseURL + '/calendars/:calendarId/events/:eventId/instances'
            },
            'list': {
                'method': 'GET',
                'url': $rootScope.config.baseURL + '/calendars/:calendarId/events'
            },
            'move': {
                'method': 'POST',
                'URL': $rootScope.config.baseURL + '/calendars/:calendarId/events/:eventId/move'
            },
            'quickAdd': {
                'method': 'POST',
                'url': $rootScope.config.baseURL + '/calendars/:calendarId/events/quickAdd'
            },
            'update': {
                'method': 'POST',
                'url': $rootScope.config.baseURL + '/calendars/:calendarId/events/:eventId'
            },
            'patch': {
                'method': 'PATCH',
                'url': $rootScope.config.baseURL + '/calendars/:calendarId/events/:eventId'
            }
        }
    );
});

//Colors
saturnApp.factory('Freebusy', function($resource, $rootScope){
    return $resource(
        $rootScope.config.baseURL,
        {
            'query': {
                'method': 'POST',
                'url': $rootScope.config.baseURL + '/freeBusy'
            }
        }
    );
});

//Settings
saturnApp.factory('Settings', function($resource, $rootScope){
    return $resource(
        $rootScope.config.baseURL,
        {
            'userId' : '@userId',
            'setting': '@setting'
        },
        {
            'get': {
                'method': 'GET',
                'url': $rootScope.config.baseURL + '/users/:userId/settings/:setting'
            },
            'list': {
                'method': 'GET',
                'url': $rootScope.config.baseURL + '/users/:userId/settings'
            }
        }
    );
});

/******************************************************************/
/* Events */
saturnApp.controller('EventController', function($scope, $rootScope, $filter, CalendarList, Events ,$timeout){
    $scope.test = function() {
        console.log(this);
    };

    $scope.checkAuth = function(){
        gapi.auth.authorize({
            'client_id': userConfig.clientId,
            'scope': userConfig.scopes,
            'immediate': false
        }, $scope.authCallback);
    }

    $scope.authCallback = function(response){
        if(response && !response.error) {
            $rootScope.dataCache.access_token = response.access_token;

            $timeout(function(){
                $rootScope.dataCache.CalendarList = CalendarList.list({
                    'access_token': $rootScope.dataCache.access_token
                });
            }, 1000);
        }
    }

    //get events from google calendar
    $scope.googleCalendarEvents = {
        'url' : 'http://www.google.com/calendar/feeds/usa__en%40holiday.calendar.google.com/public/basic'
    };

    $scope.eventsCache = [$scope.googleCalendarEvents];
    $scope.eventSources = $.grep([$scope.googleCalendarEvents], function(arrayElement, index){
        return arrayElement.state === true;
    });

    $scope.resetEventDetails = function(start, end){
        $scope.action = 'Add';

        var date = new Date(),
            d = date.getDate(),
            m = date.getMonth(),
            y = date.getFullYear(),
            H = date.getHours(),
            M  = date.getMinutes();

        switch (true) {
            case (M < 15):
                M = 15;

                break;

            case (M < 30):
                M = 30;

                break;

            case (M < 45):
                M = 45;

                break;

            case (M < 60):
                M = 60;

                break;
        }

        var startDate = start ? start : new Date(y, m, d, H, M),
            endDate = end ? end : new Date(y, m, d, H + 1, M);

        $scope.currentEvent = {
            'title': 'New Event',
            'location': '',
            'description': '',
            'start': startDate,
            'end': endDate,
            'startTime': $filter('date')(startDate, 'shortTime'),
            'endTime': $filter('date')(endDate, 'shortTime'),
            'timezone': '',
            'allDay': false,
            'recurring': false,
            'recurrenceEnd': null,
            'frequency': 0,
            'interval': 0,
            'repeatDays': {
                'sunday': false,
                'monday': false,
                'tuesday': false,
                'wednesday': false,
                'thursday': false,
                'friday': false,
                'saturday': false
            } ,
            'availability': 1,
            'color': '#99ccff',
            'textColor': '#333'
        };
    }

    $scope.resetEventDetails();

    $scope.addRemoveEventSource = function(sources,source) {
        var canAdd = 0;
        angular.forEach(sources,function(value, key){
            if(sources[key] === source) {
                sources.splice(key,1)
                canAdd = 1;
            }
        });
        if(canAdd === 0){
            sources.push(source);
        }
    };

    $scope.removeEventSource = function(sources,index) {
        sources.splice(index,1);
    };

    /*******************************************************/
    //called after the user has selected something in the calendar
    $scope.select = function(startDate, endDate, allDay, jsEvent, view){
        $scope.$apply(function(){
            $scope.resetEventDetails(startDate, endDate, allDay, jsEvent, view);
        });
    };

    //when you click on an event
    $scope.eventClick = function(event, jsEvent, view){
        if(event.editable || event.source.editable) {
            $scope.$apply(function(){
                $scope.action = 'Edit';
                $scope.currentEvent = event;
            });
        }

        if(event.url) {
            window.open(event.url, 'eventPreview', 'width=400, height=400');
        }

        return false;
    };

    //after you drag and drop an event
    $scope.eventDrop = function(event, dayDelta, minuteDelta, allDay, revertFunc, jsEvent, ui, view){

    }

    //after you resize an event
    $scope.eventResize = function( event, dayDelta, minuteDelta, revertFunc, jsEvent, ui, view ) {

    }

    //save new event
    $scope.save = function(){
    }

    //remove an event
    $scope.remove = function(index){
        alert(2);
    }

    //got to a new date
    $scope.$watch('currentDate', function() {
        if($scope.currentDate != undefined){
            //go to the specified date
            $scope.calendar.fullCalendar('gotoDate', $scope.currentDate);
        }
    });

    /*******************************************************/
    //calendar configuration
    $scope.extendedCalendar = {
        header:{
            left: 'month agendaWeek agendaDay',
            center: 'title',
            right: 'today prev,next'
        },
        editable:  true,
        selectable: true,
        slotMinutes: 15,
        eventClick: $scope.eventClick,
        eventDrop: $scope.eventDrop,
        eventResize: $scope.eventResize,
        eventRender: function(event, element, view){
            var content = '';

            content += '<div class="event-dates"><i class="icon-calendar"></i> ' + $filter('date')(event.start, 'dd/MM/yyyy') + ', ';
            content +=  $filter('date')(event.start, 'shortTime');
            if(event.end){
                content += ' - ' + $filter('date')(event.end, 'dd/MM/yyyy') + ', ';
                content += $filter('date')(event.start, 'shortTime');
            }
            content += '</div>';

            if(event.description) {
                content += '<p class="event-description">' + event.description + '</p>';
            }

            if(event.location) {
                content += '<div class="event-location">' + event.location + '</div>';
            }

            element.popover({
                'title': event.title,
                'content': content,
                'html': true,
                'trigger': 'hover',
                'placement': 'top',
                'delay': 200
            });
        },
        viewDisplay: function(view){
            $scope.dateCache = $scope.calendar.fullCalendar('getDate');
        },
        loading: function(bool){
            if(!bool) {
                $scope.calendar.fullCalendar('gotoDate', $scope.dateCache);
            }
        },
        select: $scope.select,
        unselect: $scope.unselect
    };

    $scope.miniCalendar = {
        header:{
            left: '',
            center: 'title',
            right: 'today prev,next'
        },
        editable:  false,
        selectable: false,
        columnFormat: {
            day: 'D'
        },
        eventRender: function(){
            return false;
        },
        dayClick: function(date, allDay, jsEvent, view){
            $scope.$apply(function(){
                $scope.currentDate = date;
            });
        }
    };
});

/******************************************************************/
/* Settings */
saturnApp.controller('SettingsController', function($scope, $rootScope, $http, $location){
});

var userConfig = {
    'clientId': '512508236814-d35qanajio78edinfs3sekn56g8ia07l.apps.googleusercontent.com',
    'scopes': 'https://www.googleapis.com/auth/calendar'
};