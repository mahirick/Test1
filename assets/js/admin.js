
$(function () {

    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            // User is signed in.
            SignInWithGoogle_Complete(user);

            var email = user.email;
            if (email.toLowerCase().indexOf('mahisoft.com') > -1) $("#liAdmin").show(500);
            if (email.toLowerCase().indexOf('viewspark.org') > -1) $("#liAdmin").show(500);
            LoadMasterData();
        } else {
            // User is signed out.
            $("#liLogout").show(false);
            SignInWithGoogle_Init();
        }
    });

    topFunction();

});



//Navigate page to the top when an accordian pane is clicked
function topFunction() {
    document.body.scrollTop = 0; // For Chrome, Safari and Opera 
    document.documentElement.scrollTop = 0; // For IE and Firefox
}

//Admin functions
function LoadMasterData() {

    var user = firebase.auth().currentUser;


    //Get data from firebase
    var oFBDB = firebase.database().ref('ViewsparkClientInfo');
    oFBDB.on('value', function (snapshot) {
        var oData = snapshot.val();
        var sData = '';

        $("#tbodyData").empty();

        jQuery.each(oData, function (FBUID, ObjectData) {
            
            var CharityName = 'Not Entered Yet';
            if (ObjectData.CharityName) CharityName = ObjectData.CharityName;

            var lastSavedDate = new Date();
            if (ObjectData.lastSaveDate)
                lastSavedDate = new Date(ObjectData.lastSaveDate);
            
            sData += '<tr>';
            sData += '<td><button type="button" class="btn btn-link" onclick="return GridRowSelect_Click(\'' + FBUID + '\')";>Details</button></td>';
            sData += '<td>' + CharityName + '</td>';
            sData += '<td>' + ObjectData.displayName + ' (' + ObjectData.email + ')</td>';
            sData += '<td>' + lastSavedDate.format("mm/dd/yyyy h:MM:ss TT") + '</td>';   //http://blog.stevenlevithan.com/archives/date-time-format
            sData += '<td>' + ObjectData.nonBlankFieldCount + '/' + ObjectData.totalFieldCount + '</td>';
            sData += '</tr>\n';
        });

        $("#tbodyData").append(sData);


    });

    return false;
}

function GridRowSelect_Click(FBUID) {

    DisplayCharityDetails(FBUID);
    return false;

}

function DisplayCharityDetails(FBUID) {

    console.log("DisplayCharityDetails");

    $("#gridMaster").hide(300);
    $("#divRefreshData").hide(300);
    $("#divMainRow").hide(1);

    //Get data from firebase
    var oFBDB = firebase.database().ref('ViewsparkClientInfo/' + FBUID + '/data');
    oFBDB.on('value', function (snapshot) {
        //var username = snapshot.val().username;
        var sData = snapshot.val();
        oData = JSON.parse(sData);

        //Loop through data populating form fields as we go.
        var sData = '<form class="form-horizontal" id="frmClient" name="frmClient">';
        jQuery.each(oData, function (i, field) {
            //console.log(field.name + ": " + field.value);

            //Count rows for Text Area Display
            iRows = Math.ceil(field.value.length / 60);
            if (iRows < 1) iRows = 1;
            var iLines = field.value.split(/\r\n|\r|\n/).length;  //Count line breaks in string
            if (iLines > iRows) iRows = iLines;

            sData += '<div class="form-group">';
            sData += '  <label class="col-md-4 control-label" for="' + field.name + '">' + field.name + '</label>';
            sData += '  <div class="col-md-8">';


            if (field.name.substring(field.name.length - 3) == "URL") {
                //hyper link field
                sData += '    <a href="' + field.value + '" target="_blank">';
                sData += '    <textarea name="' + field.name + '" rows="' + iRows + '" cols="80">' + field.value + '</textarea>';
                sData += '    </a>';
            } else {
                sData += '    <textarea name="' + field.name + '" rows="' + iRows + '" cols="80">' + field.value + '</textarea>';
            }


            sData += '</div>';
            sData += '</div>';

        });

        sData += '</form>';
        $("#divMainRow").empty();
        $("#divMainRow").append(sData);
        $("#divMainRow").show(500);
    });
}