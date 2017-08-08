
function SignInWithGoogle_Init() {
  var provider = new firebase.auth.GoogleAuthProvider();
  provider.addScope('profile');
  firebase.auth().signInWithRedirect(provider);
}

function SignInWithGoogle_Complete(user) {
  var email = user.email;
  // var emailVerified = user.emailVerified;
  $("#liLogout").show(true);

  if (email.toLowerCase().indexOf('mahisoft.com') > -1) $("#liAdmin").show(500);
  if (email.toLowerCase().indexOf('viewspark.org') > -1) $("#liAdmin").show(500);

  //$.announce.success('Logged In');  
}


function Logout() {
  firebase.auth().signOut().then(function () {
    $.announce.success('Logged out');
    window.location.href = 'loggedOut.html';
  }).catch(function (error) {
    $.announce.danger('Error in logout: ' + error.message);
  });
}