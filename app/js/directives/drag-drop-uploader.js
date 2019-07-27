/**
 * Drag Drop Uploader Directive
 */

angular    
    .module('Blurbiz')
    .directive('dragDropUploader', dragDropUploader);

function dragDropUploader() {
    var directive = {
        template: '<div id="holder" ng-transclude></div><p id="upload" class="hidden"><label>Drag & drop not supported, but you can still upload via this input field:<br><input type="file"></label></p><p id="filereader">File API & FileReader API not supported</p><p id="formdata">XHR2s FormData is not supported</p><p id="progress">XHR2s upload progress isnt supported</p><p class="ng-hide">Upload progress: <progress id="uploadprogress" min="0" max="100" value="0">0</progress></p>',
        transclude: true,
        link: function($scope, iElm, iAttrs, controller) {
        var holder = document.getElementById("holder"),
        tests = {
            filereader: typeof FileReader != 'undefined',
            dnd: 'draggable' in document.createElement('span'),
            formdata: !!window.FormData,
            progress: "upload" in new XMLHttpRequest
        }, 
        support = {
            filereader: document.getElementById('filereader'),
            formdata: document.getElementById('formdata'),
            progress: document.getElementById('progress')
        },
        acceptedTypes = {
            'image/png': true,
            'image/jpeg': true,
            'image/gif': true
        },
        progress = document.getElementById('uploadprogress'),
        fileupload = document.getElementById('upload');

        "filereader formdata progress".split(' ').forEach(function (api) {
        if (tests[api] === false) {
            support[api].className = 'fail';
        } else {
            // FFS. I could have done el.hidden = true, but IE doesn't support
            // hidden, so I tried to create a polyfill that would extend the
            // Element.prototype, but then IE10 doesn't even give me access
            // to the Element object. Brilliant.
            support[api].className = 'hidden';
        }
    });

    function previewfile(file) {
    if (tests.filereader === true && acceptedTypes[file.type] === true) {
        var reader = new FileReader();
        reader.onload = function (event) {
        var image = new Image();
        image.src = event.target.result;
        image.width = 250; // a fake resize
        holder.appendChild(image);
        };

        reader.readAsDataURL(file);
    }  else {
        holder.innerHTML += '<p>Uploaded ' + file.name + ' ' + (file.size ? (file.size/1024|0) + 'K' : '');
        console.log(file);
    }
    }

    function readfiles(files) {
        // var formData = tests.formdata ? new FormData() : null;
        // for (var i = 0; i < files.length; i++) {
        //     if (tests.formdata) formData.append('file', files[i]);
        //         previewfile(files[i]);
        // }

        $scope.uploadFiles(files, function() {
        });
    }

    if (tests.dnd) { 
    holder.ondragover = function () {
        this.className = 'hover'; 
        return false; 
    };
    holder.ondragend = function () 
    { 
        this.className = ''; 
        return false; 
    };
    holder.ondrop = function (e) {
        this.className = '';
        e.preventDefault();
        readfiles(e.dataTransfer.files);
    }
    }
        }
    };
    return directive;
};                                                                                      

                                                                                                                                                                     