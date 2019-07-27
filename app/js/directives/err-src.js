angular
	.module('Blurbiz')
	.directive('errSrc', function() {
		var directive = {
			link: function(scope, element, attrs) {
				element.bind('error', function() {
					if (attrs.src != attrs.errSrc) {
						attrs.$set('src', attrs.errSrc);
					}
				});

				attrs.$observe('ngSrc', function(value) {
					if (!value && attrs.errSrc) {
						attrs.$set('src', attrs.errSrc);
					}
				});
			}
		};
		return directive;
	});