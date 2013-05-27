(function($){
    $('body').tooltip({
        selector: "*[data-toggle=tooltip]"
    });
})(jQuery);

/******************************************************************/
//helper functions
function safeApply(scope, fn) {
    var phase = scope.$root.$$phase;
    if(phase === '$apply' || phase === '$digest')
        scope.$eval(fn);
    else
        scope.$apply(fn);
}

//calendar
$(document).on('click', 'div.mini-calendar tbody td', function(){
    $('div.mini-calendar tbody td').removeClass('on');
    $(this).addClass('on');
});

//update entity
function updateEntity(source, destination) {
    if(typeof source === typeof  destination) {
        angular.copy(source, destination);
    }
}

//define applicaton
var saturnApp = angular.module('saturnApp', ['ui', 'ui.bootstrap', 'ngResource']);

saturnApp.config(['$routeProvider', function($routeProvider) {
        $routeProvider.
            when('/', {templateUrl: 'partials/index.html'}).
            when('/login', {templateUrl: 'partials/login.html'}).
            when('/settings/profile', {templateUrl: 'partials/settings-profile.html'}).
            when('/settings/account', {templateUrl: 'partials/settings-account.html'}).
            when('/calendar/:calendarId/settings', {templateUrl: 'partials/calendar-settings.html'}).
            when('/calendar/create', {templateUrl: 'partials/calendar-settings.html'}).
            otherwise({redirectTo: '/'});
    }
    ]).run(function($rootScope, $location){
        //application config
        $rootScope.config = {
            'baseURL': 'https://www.googleapis.com/calendar/v3',
            'collapsed': {
            }
        };

        // register listener to watch route changes
        $rootScope.$on( "$routeChangeStart", function(event, next, current) {
            if ( $rootScope.user.loggedIn === false ) {
                // no logged user, we should be going to #login
                if (next.templateUrl !== "partials/login.html") {
                    $location.path( "/login" );
                }
            }

            if ( $rootScope.user.loggedIn === true ) {
                // logged in users should not see the login again
                if (next.templateUrl === "partials/login.html") {
                    $location.path( "/" );
                }
            }
        });

        //application data storage
        $rootScope.dataCache = {
            'calendarList': [
                {
                    'title': 'My calendars',
                    'calendars': []
                },
                {
                    'title': 'Subscribed calendars',
                    'calendars': []
                }
            ],
            'eventTokens': [],
            'currentCalendar':{},
            'tempCalendar': {},
            'events': []
        };

        $rootScope.user = {
            'loggedIn': false
        };
    });

/******************************************************************/
saturnApp.filter('encodeURIComponent', function() {
    return window.encodeURIComponent;
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
                'method': 'PATCH'
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
saturnApp.controller('EventController', function($scope, $rootScope, $filter, $location, Events, Calendars){
    $scope.eventSources = $rootScope.dataCache.events;

    //master calendar
    $scope.masterCalendar = {
        header:{
            left: 'month agendaWeek agendaDay',
            center: 'title',
            right: 'today prev,next'
        },
        allDayDefault: false,
        selectable: true,
        defaultView: 'agendaWeek',
        slotMinutes: 15,
        eventClick: $scope.eventClick,
        viewDisplay: function(view){
        },
        loading: function(bool){
            if(!bool) {
                $rootScope.$broadcast('loading:Started');
                $scope.calendar.fullCalendar('gotoDate', $scope.dateCache);
            } else {
                $rootScope.$broadcast('loading:Finished');
            }
        },
        select: $scope.select,
        unselect: $scope.unselect
    };

    //mini calendar
    $scope.miniCalendar = {
        header:{
            left: '',
            center: 'title',
            right: 'today prev,next'
        },
        editable: false,
        selectable: false,
        columnFormat: {
            day: 'D'
        },
        eventRender: function(){
            return false;
        },
        dayClick: function(date, allDay, jsEvent, view){
        }
    };

    //after the user has logged in load calendars
    $rootScope.$on('login', function(){

    });
});

/******************************************************************/
/* Settings */
saturnApp.controller('SettingsController', function($scope, $rootScope){
});

/******************************************************************/
//User
var userConfig = {
    'clientId': '512508236814-d35qanajio78edinfs3sekn56g8ia07l.apps.googleusercontent.com',
    'scopes': 'https://www.googleapis.com/auth/calendar'
};

saturnApp.controller('UserController', function($scope, $rootScope, $location){
    //check user
    $scope.login = function(){
        gapi.auth.authorize({
            'client_id': userConfig.clientId,
            'scope': userConfig.scopes,
            'immediate': false
        }, loginCallback);
    };

    //called after the user has logged in
    function loginCallback(response){
        if(response && !response.error) {
            safeApply($rootScope, function(){
                //notify everyone that the user has logged in
                $rootScope.$broadcast('login');

                //save a copy of the access token for later use
                $rootScope.dataCache.access_token = response.access_token;

                //set the user as logged in
                $rootScope.user.loggedIn = true;

                //redirect to the home page
                $location.path('/');
            });
        }
    }

    //logout
    $scope.logout = function(){
        //notify everyone that the user has logged out
        $rootScope.$broadcast('logout');

        //set the user as logged in
        $rootScope.user.loggedIn = false;

        //redirect to the login page
        $location.path('/login');
    };
});

//sort calendars by access role
function sortCalendars(calendars, callback){
    angular.forEach(calendars, function(value, key){
        //personal calendars
        if(calendars[key].accessRole === 'owner'){
            $rootScope.dataCache.calendarList[0].calendars.push(calendars[key]);
        }

        //subscribed calendars
        if(calendars[key].accessRole === 'reader'){
            $rootScope.dataCache.calendarList[1].calendars.push(calendars[key]);
        }
    });

    if(callback && typeof callback === 'function'){
        callback();
    }
}