let ngLogJSmodule = angular.module('ngLogJS', []);

import ngLogJSconfig from './ng-logjs.config';

ngLogJSmodule.config(ngLogJSconfig);

export default ngLogJSmodule