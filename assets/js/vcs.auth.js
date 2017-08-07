
function SignInWithGoogle() {

  //FORCE Google Authentication
  var provider = new firebase.auth.GoogleAuthProvider();
  provider.addScope('profile');
  firebase.auth().signInWithPopup(provider).then(function (result) {
    var token = result.credential.accessToken;
    user = result.user;
    $.announce.success('Logged In');
    SaveUserInfo();
    LoadFormData();

  }).catch(function (error) {
    var errorCode = error.code;
    var errorMessage = error.message;
    var email = error.email;
    var credential = error.credential;
    console.log("Error in Auth: " + errorMessage);
  });
}


function Logout() {
  firebase.auth().signOut().then(function () {
    $.announce.success('Logged out');
    window.location.href = 'loggedOut.html';
  }).catch(function (error) {
    $.announce.danger('Error in logout: ' + error.message);
  });
}