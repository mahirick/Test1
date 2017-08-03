

$(function () {

  //Autosave for main data form
  //https://www.smashingmagazine.com/2011/12/sisyphus-js-client-side-drafts-and-more/
  $("form").sisyphus();

  $('document').ready(function () {

    //FORCE Google Authentication
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider).then(function (result) {
      var token = result.credential.accessToken;
      user = result.user;
      console.log("Successful Auth: " + user.email + ' uid: ' + user.uid);

      LoadFormData();

    }).catch(function (error) {
      var errorCode = error.code;
      var errorMessage = error.message;
      var email = error.email;
      var credential = error.credential;
      console.log("Error in Auth: " + errorMessage);
    });


    topFunction();
  });







});

//Save form data to Firebase DB
function SaveData() {
  var user = firebase.auth().currentUser;

  sData = JSON.stringify($('#frmClient').serializeArray());

  var oFBDB = firebase.database().ref('ViewsparkClientInfo/' + user.uid + '/data');

  //Save the data to Firebase
  oFBDB.set(
    sData, function (error) {
      if (error) {
        $.announce.danger("Data could not be saved.  Error: " + error);
      } else {
        //console.log('Data Saved');
        LoadFormData();
        $.announce.success('Data Saved.');
      }
    }
  );

}

//Load form data for each user from Firebase
function LoadFormData() {

  //Get data from firebase
  var oFBDB = firebase.database().ref('ViewsparkClientInfo/' + user.uid + '/data');
  oFBDB.once('value').then(function (snapshot) {
    //var username = snapshot.val().username;
    var sData = snapshot.val();
    oData = JSON.parse(sData);

    //Loop through data populating form fields as we go.
    jQuery.each(oData, function (i, field) {
      //console.log(field.name + ": " + field.value);

      //Loop through all form fields not buttons or submit
      $('.form-horizontal *').filter(':input').not(':button, :submit').each(function () {
        //console.log(this.id + ' ' + this.type);
        if (field.name == this.id) {
          $('#' + this.id).val(field.value);
          return false; //break from .each
        }
      });

    });



  });




}


function UploadFileToFBStorage(sULFieldName, sFieldName) {

  var oFiles = document.getElementById(sULFieldName).files;
  if (oFiles.length <= 0) {
    $.announce.danger('Please select a file before uploading.');
  }
  else {
    var oFile = oFiles[0];

    // Create a root reference
    var storageRef = firebase.storage().ref();
    var metadata = { contentType: 'image/jpeg' };
    // Upload file and metadata to the object 'images/mountains.jpg'
    var uploadTask = storageRef.child('images/' + oFile.name).put(oFile, metadata);


    // Listen for state changes, errors, and completion of the upload.
    uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
      function (snapshot) {
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');
        switch (snapshot.state) {
          case firebase.storage.TaskState.PAUSED: // or 'paused'
            console.log('Upload is paused');
            break;
          case firebase.storage.TaskState.RUNNING: // or 'running'
            console.log('Upload is running');
            break;
        }
      }, function (error) {

        // A full list of error codes is available at
        // https://firebase.google.com/docs/storage/web/handle-errors
        switch (error.code) {
          case 'storage/unauthorized':
            $.announce.danger(error.message);
            break;

          case 'storage/canceled':
            $.announce.danger(error.message);
            break;
          case 'storage/unknown':
            // Unknown error occurred, inspect error.serverResponse
            $.announce.danger(error.message);
            break;
        }
      }, function () {
        // Upload completed successfully, now we can get the download URL
        //var downloadURL = uploadTask.snapshot.downloadURL;
        $('#' + sFieldName).val(uploadTask.snapshot.downloadURL);
        SaveData();        
        $.announce.success('File Uploaded and saved.');
      });
  }

}


//Navigate page to the top when an accordian pane is clicked
function topFunction() {
  document.body.scrollTop = 0; // For Chrome, Safari and Opera 
  document.documentElement.scrollTop = 0; // For IE and Firefox
}