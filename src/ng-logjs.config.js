function ngLogJSconfig($provide, $logProvider) {
    if (!$logProvider.logServerEndpoint) {
        $logProvider.logServerEndpoint = 'https://www.example.com/api/logs';
    }
    var levels = ['debug', 'info', 'warn', 'error'];
    if (!$logProvider.logServerLevels) {
        $logProvider.logServerLevels = ['error'];
    }

    $provide.decorator('$log', [
        '$delegate',
        function ($delegate) {
            var contentType = 'application/json; charset=UTF-8';

            _.each($logProvider.logServerLevels, function (level) {
                // storing the original function
                var original = $delegate[level];

                // creating a wrapped version of each $log level function _.wrap is from the
                // underscore.js library
                $delegate[level] = _.wrap(original, function (original) {

                    // logger data to be sent/logged to console
                    var data = Array
                        .prototype
                        .slice
                        .call(arguments, 1);
                    // call to the original function which will write to the console
                    original.apply($delegate, data);

                    $.ajax({
                        type: 'POST',
                        url: $logProvider.logServerEndpoint,
                        contentType: contentType,
                        crossDomain: true,
                        data: JSON.stringify(getData(level, data))
                    });
                });
            });
            // returning to $log object with the new wrapped log-level functions
            return $delegate;
        }
    ]);
}

function getData(level, data) {
    var userInfo = JSON.parse(localStorage.getItem('pos.userInfo'));
    var result = {};
    result.level = level;
    result.name = bowser.name;
    result.version = bowser.version;
    result.osname = bowser.osname;
    result.osversion = bowser.osversion;
    result.username = userInfo
        ? userInfo.MerchantId
        : undefined;
    result.hostname = window.location.host;
    result.protocol = window.location.protocol;

    var splitted = window
        .location
        .href
        .split('#');

    if (splitted && splitted.length > 1) 
        result.path = window.location.href.split('#')[1];
    
    if (!Array.isArray(data)) {
        result.message = 'error build log message';
    } else {
        if (data.length > 0) {
            for (var i = 0; i < data.length; i++) {
                if (data[i]instanceof Error) {
                    result.message = data[i].message;
                    if (data[i].stack) {
                        result.stack = data[i]
                            .stack
                            .split(/\n+/);
                    }
                } else if (angular.isString(data[i])) {
                    if (level == 'error') {
                        result.target = data[i];
                    } else {
                        result.message = data[i];
                    }
                }
            }
            if (!result.message) {
                result.message = 'Empty message';
            }
        }
    }
    return result;
}

export default
['$provide', '$logProvider', ngLogJSconfig];