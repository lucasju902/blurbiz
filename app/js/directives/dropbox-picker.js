angular
	.module("Blurbiz")
	.directive("dropBoxPicker", ["DropBoxSettings", function(DropBoxSettings) {
	    return {
	        restrict: "A",
	        scope: {
	            dbPickerFiles: "="
	        },
	        link: function(scope, element, attrs) {
	            function instanciate() {
	                Dropbox.choose(dropboxOptions);
	            }

	            var dropboxOptions = {
	                success: dropboxsuccess,
	                cancel: function() {},
	                linkType : DropBoxSettings.linkType,
	                multiselect: DropBoxSettings.multiselect,
	                extensions : DropBoxSettings.extensions,
	            };

	            function dropboxsuccess(files){
	                scope.$apply(function() {
	                    for (var i = 0; i < files.length; i++){
	                        scope.dbPickerFiles.push(files[i]);
	                        console.log(files[i]);
	                    }
	                });
	            };

	            element.bind("click", function() {
	                instanciate();
	            });
	        }
	    }
	}]);