angular
	.module("Blurbiz")
	.directive("customLinkInvoker", ["$document", function($document) {
		return {
			restrict: "A",
			scope: {
				isEditing: "="
			},
			link: function(scope, element) {

				// var handler = function(e) {
				// 	e.stopPropagation();
				// 	scope.$apply(function() {
				// 		scope.isEditing = true;	
				// 	});					
				// };

				// element.on('click', handler);

				// scope.$on('$destroy', function() {
				// 	element.off('click', handler);
				// });

				element.data('custom-link-invoker', true);

				angular.element($document[0].body).on('click', function(e) {
					var inElement = angular.element(e.target).inheritedData('custom-link-invoker');
					if (inElement) {
						e.stopPropagation();
						scope.$apply(function() {
							scope.isEditing = true;
						});
					} else {
						scope.$apply(function() {
							scope.isEditing = false;
						});
					}
				});
			}
		}
	}]);