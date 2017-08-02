

$(function () {

  //Autosave for main data form
  //https://www.smashingmagazine.com/2011/12/sisyphus-js-client-side-drafts-and-more/
  $("form").sisyphus();

  //Submit Event Handler for forms
  $(".form-horizontal").submit(function (event) {

    SaveData();

    event.preventDefault(); //Cancel the submit
  });




  //Google Authentication
  var provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider).then(function (result) {
    var token = result.credential.accessToken;
    var user = result.user;
    var uid = user.uid;
    console.log("Successful Auth: " + user.email + uid);
  }).catch(function (error) {
    var errorCode = error.code;
    var errorMessage = error.message;
    var email = error.email;
    var credential = error.credential;
    console.log("Error in Auth: " + errorMessage);
  });


});


function LoadDataForm() {

  var database = firebase.database();

}

function SaveData() {

  //Loop through all form fields not buttons or submit
  // $('.form-horizontal *').filter(':input').not(':button, :submit').each(function () {
  //   console.log(this.id + ' ' + this.type);
  // });

  

  firebase.database().ref('https://ricktestproject-cf590.firebaseio.com/ViewsparkClientInfo/' + user.uid).set({
    
  });
}



//Navigate page to the top when an accordian pane is clicked
function topFunction() {
  document.body.scrollTop = 0; // For Chrome, Safari and Opera 
  document.documentElement.scrollTop = 0; // For IE and Firefox
}