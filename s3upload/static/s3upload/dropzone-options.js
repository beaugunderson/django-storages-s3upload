/*globals Dropzone:true*/

'use strict';

// Ping our server with the data returned by the S3 repsonse
function pingServer(file) {
  // Although the file has been sucessfully uploaded, don't show the success
  // styling until it has also been successfully processed.
  file.previewElement.classList.remove('dz-success');

  var s3Response = file.xhr.responseXML;
  var request = new XMLHttpRequest();
  var formData = new FormData();

  request.open('POST', document.location.href, true);

  request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
  request.setRequestHeader('X-CSRFToken',
    document.getElementById('s3upload').attributes['data-csrf-token'].value);

  request.onload = function () {
    if (this.status >= 200 && this.status < 400) {
      // Re-apply success styling
      file.previewElement.classList.add('dz-success');
    } else {
      // We reached our target server, but it returned an error.
      file.status = Dropzone.ERROR;

      Dropzone.forElement('#s3upload')
        .emit('error', file, request.responseText);
    }
  };

  request.onerror = function () {
    // There was a connection error of some sort
    alert('Connection error');
  };

  function byTagName(tagName) {
    return s3Response.getElementsByTagName(tagName)[0].textContent;
  }

  formData.append('bucket', byTagName('Bucket'));
  formData.append('key', byTagName('Key'));
  formData.append('etag', byTagName('ETag'));

  request.send(formData);
}

if (typeof dropzoneOptions === 'undefined') {
  var dropzoneOptions = {};
}

function dropzoneInit() {
  this.on('success', function (file) {
    pingServer(file);
  });

  if (typeof dropzoneOptions.customInit === 'function') {
    dropzoneOptions.customInit.apply(this);
  }
}

dropzoneOptions.dictDefaultMessage =
  dropzoneOptions.dictDefaultMessage || 'Drop files here or click to upload.';

dropzoneOptions.parallelUploads = dropzoneOptions.parallelUploads || 5;

dropzoneOptions.init = dropzoneOptions.init || dropzoneInit;

Dropzone.options.s3upload = dropzoneOptions;
