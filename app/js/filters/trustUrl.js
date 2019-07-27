(function () {
    'use strict';
	angular
        .module('Blurbiz')
		.filter("trustUrl", ['$sce', function ($sce) {
	        return function (recordingUrl) {
	            return $sce.trustAsResourceUrl(recordingUrl);
	        };
	    }]);
})();