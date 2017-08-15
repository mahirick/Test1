

$(function () {


  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      // User is signed in.
      SignInWithGoogle_Complete(user);
      SaveUserInfo();
      LoadFormData();

      $("#bodyMain").show();
    } else {
      // User is signed out.
      $("#liLogout").hide();
      SignInWithGoogle_Init();
    }
  });

  //Autosave for main data form
  //https://www.smashingmagazine.com/2011/12/sisyphus-js-client-side-drafts-and-more/
  $("form").sisyphus();

  topFunction();


});



//Save User Info to Firebase
function SaveUserInfo() {
  var oUser = firebase.auth().currentUser;
  var pURL = '';
  var displayName = '';

  oUser.providerData.forEach(function (profile) {
    if (profile.providerId == 'google.com') {
      pURL = profile.photoURL;
      displayName = profile.displayName;
    }
  });

  var sUser = {
    email: oUser.email,
    displayName: displayName,
    photoURL: pURL
  };

  var oFBDB = firebase.database().ref('ViewsparkClientInfo/' + oUser.uid);

  // oFBDB.on('value', function (snap) {
  //   console.log(snap.val());
  // });

  oFBDB.update(sUser).then(function () {
    //console.log("Data saved successfully.");
  }).catch(function (error) {
    $.announce.danger("Data could not be saved." + error);
  });;

}

//Save form data to Firebase DB
function SaveData(bSupressAnnounce) {
  var user = firebase.auth().currentUser;
  sData = JSON.stringify($('#frmClient').serializeArray());

  var oFBDB = firebase.database().ref('ViewsparkClientInfo/' + user.uid + '/data');
  oFBDB.set(sData);

  //Save the data to Firebase
  oFBDB.set(
    sData, function (error) {
      if (error) {
        $.announce.danger("Data could not be saved.  Error: " + error);
      } else {

        //Save the CharityName to the top level for Admin page
        s1 = JSON.parse(sData);
        jQuery.each(s1, function (i, field) {
          //console.log(field.name + ": " + field.value);
          if (field.name == 'CharityName') {
            firebase.database().ref('ViewsparkClientInfo/' + user.uid + '/CharityName').set(field.value);
            return false;
          }
        });

        //Save Date/Time
        var oDate = new Date();
        firebase.database().ref('ViewsparkClientInfo/' + user.uid + '/lastSaveDate').set(firebase.database.ServerValue.TIMESTAMP);

        LoadFormData();

        if (!bSupressAnnounce) $.announce.success('Data Saved.');
      }
    }
  );

  return false;
}

//Load form data for each user from Firebase
function LoadFormData() {

  var user = firebase.auth().currentUser;

  //Get data from firebase
  var oFBDB = firebase.database().ref('ViewsparkClientInfo/' + user.uid + '/data');
  oFBDB.once('value').then(function (snapshot) {
    //var username = snapshot.val().username;
    var sData = snapshot.val();
    oData = JSON.parse(sData);
    var iNonBlankFields = 0;
    var iTotalFields = 0;

    //Loop through data populating form fields as we go.
    jQuery.each(oData, function (i, field) {
      //console.log(field.name + ": " + field.value);

      //Loop through all form fields not buttons or submit
      $('.form-horizontal *').filter(':input').not(':button, :submit').each(function () {
        //console.log(this.id + ' ' + this.type);
        if (field.name == this.id) {
          $('#' + this.id).val(field.value);
          if (field.value != '') iNonBlankFields += 1;
          return false; //break from .each
        }
      });
    });

    //Save Non Blank Field Count
    firebase.database().ref('ViewsparkClientInfo/' + user.uid + '/nonBlankFieldCount').set(iNonBlankFields);

    //Count total data fields
    var iFields = $('.form-horizontal *').filter(':input').not(':button, :submit').length - 6;
    firebase.database().ref('ViewsparkClientInfo/' + user.uid + '/totalFieldCount').set(iFields);

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

