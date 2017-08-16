
$(function () {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            // User is signed in.
            SignInWithGoogle_Complete(user);

            var email = user.email;
            if ((email.toLowerCase().indexOf('mahisoft.com') > -1) || (email.toLowerCase().indexOf('viewspark.org') > -1)) {
                $("#liAdmin").show(500);
                $('#divMainRow').show(500);
            } else {
                $("#liAdmin").hide(500);
                alert('Not authorized for admin.');
                window.location.href = 'index.html';
            }

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

function addTextAreaEvents() {

    $('#frmClient textarea').focus(function () {
        var $this = $(this);
        $this.select();

        // Work around Chrome's little problem
        $this.mouseup(function () {
            // Prevent further mouseup intervention
            $this.unbind("mouseup");
            return false;
        });
    });

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
            var setupMarkedCompleted = '';
            var setupMarkedCompletedDateTitle = 'Setup Not Marked Complete.';

            if (ObjectData.setupMarkedCompleted) {
                setupMarkedCompleted = 'checked';
                
                oDate = new Date(ObjectData.setupMarkedCompletedDate);
                setupMarkedCompletedDateTitle = 'Submitted Complete On: ' + oDate.format("mm/dd/yyyy h:MM:ss TT");
            }

            sData += '<tr>';
            sData += '<td><button type="button" class="btn btn-link" onclick="return GridRowSelect_Click(\'' + FBUID + '\')";>Details</button></td>';
            sData += '<td>' + CharityName + '</td>';
            sData += '<td>' + ObjectData.displayName + ' (' + ObjectData.email + ')</td>';
            sData += '<td>' + lastSavedDate.format("mm/dd/yyyy h:MM:ss TT") + '</td>';   //http://blog.stevenlevithan.com/archives/date-time-format
            sData += '<td class="text-center">' + ObjectData.nonBlankFieldCount + '/' + ObjectData.totalFieldCount + '</td>';
            sData += '<td class="text-center"><input type="checkbox" ' + setupMarkedCompleted + ' disabled title="' + setupMarkedCompletedDateTitle + '"></td>';
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
            sData += '  <label class="col-md-4 control-label" for="' + field.name + '">' + field.name.replace(/([A-Z])/g, ' $1').trim() + '</label>';
            sData += '  <div class="col-md-8">';


            if (field.name.substring(field.name.length - 3) == "URL" && (field.value != '')) {
                //hyper link field
                sData += '    <a href="' + field.value + '" target="_blank">';
                sData += '    <textarea name="' + field.name + '" rows="' + iRows + '" cols="80" readonly>' + field.value + '</textarea>';
                sData += '    </a>';            
            }            
            else {
                sData += '    <textarea id="' + field.name + '" name="' + field.name + '" rows="' + iRows + '" cols="80" readonly>' + field.value + '</textarea>';
            }

            sData += '</div>';
            sData += '</div>';

        });

        sData += '</form>';
        $("#divMainRow").empty();
        $("#divMainRow").append(sData);
        $("#divMainRow").show(500);

        addTextAreaEvents();
    });
}