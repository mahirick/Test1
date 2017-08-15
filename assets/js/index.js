
$(function () {

    //Reject old browsers
    $.reject({
        reject: {
            msie: 9,
            msie: 8,
            msie: 7
            // safari: true, // Apple Safari  
            // chrome: true, // Google Chrome  
            // firefox: true, // Mozilla Firefox  
            // msie: true, // Microsoft Internet Explorer  
            // opera: true, // Opera  
            // konqueror: true, // Konqueror (Linux)  
            // unknown: true // Everything else              
        },
        imagePath: './assets/img/'
    });

    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            // User is signed in.
            $("#liLogout").show();
        } else {
            // User is signed out.
            $("#liLogout").hide();
            
        }
    });


});