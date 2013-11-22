var appID = "PwoRQJAzB3FYi93anPbIlM0SCy1MGMb15X57dbdX";
var jsKey = "4bI7q9HInMvv1F8DguHHU6zJMayOgek19SKT4gzI";



//********************************************************************************************************************************************
//
//Login
//
//********************************************************************************************************************************************
$('#loginBtn').click(function () {
    $('#resp').hide();
	var uname = $('#username').val();
	var pword = $('#password').val();
	
	Parse.initialize(appID, jsKey);
    
    Parse.User.logIn(uname, pword, {
        success: function (user) {
            //redirect to pitches page
            console.log('login successful');
            window.location.replace("/admin");
        },
        error: function (user, error) {
            console.log(error.code + ": " + error.message);
            $('#resp').show();
            $('#resp').addClass('alert alert-danger');
            $('#resp').prepend('<p>Login Error: ' + error.message + '</p>');
        }
    });
    return false;
});


//********************************************************************************************************************************************
//
//Password Reset
//
//********************************************************************************************************************************************
$('#resetBtn').click(function () {
    var email = $('#email').val();
    
    Parse.initialize(appID, jsKey);
    
    Parse.User.requestPasswordReset(email, {
		success: function () {
			console.log('Password Reset Successful');
			$('#resetResp').show();
            $('#resetResp').addClass('alert');
            $('#resetResp').addClass('alert-success');
            $('#resetResp').prepend('Password Reset Successful. Check your mailbox');
		},
		error: function (error) {
			console.log(error.code + ': ' + error.message);
			console.log('Password Reset Failed');
			$('#resetResp').show();
            $('#resetResp').addClass('alert');
            $('#resetResp').addClass('alert-danger');
            $('#resetResp').prepend(error.message);
		}
	});
    
    return false;
});

   
//********************************************************************************************************************************************
//
//log out
//
//********************************************************************************************************************************************
function logout() {
    console.log('logging out');
	Parse.initialize(appID, jsKey);
	
	Parse.User.logOut();
    
    verify();
}

//********************************************************************************************************************************************
//
//verify user is logged in
//
//********************************************************************************************************************************************
function verify() {
    Parse.initialize(appID, jsKey);
    
    var currentUser = Parse.User.current();
    
    if(currentUser){
        $('#userName').html('Welcome <b>' + currentUser.attributes.username + '</b>');
    }else{
           window.location.replace("index.html");
    }
}

//********************************************************************************************************************************************
//
//Password Update
//
//********************************************************************************************************************************************
$('#pw_submit').click(function() {
    Parse.initialize(appID, jsKey);
    
    var user = Parse.User.current();
    
    var uname = user.attributes.username;
    var pword = $('#pw_old').val();
    
    var new_pword = $('#pw_new').val();
    var new_pword_2 = $('#pw_new_2').val();
    
    //verify confirmation passwords match
    if(new_pword === new_pword_2){
        
        //login user to ensure credentials are valid
        Parse.User.logIn(uname, pword, {
            success: function(u) {
                u.set('password', new_pword);
                u.save(null, {
                    success: function(u) {
                        $('#resp').text('Password changed successfully');
                        $('#resp').addClass('alert');
                        $('#resp').addClass('alert-success');
                        
                        //re-login
                        Parse.User.logIn(uname, new_pword, {
                            success: function(nu) {
                                //window.location.replace("landing.html");
                                $('#pw').trigger('reset');
                            },
                            error: function(error) {
                                $('#resp').text(error.message);
                                $('#resp').addClass('alert');
                                $('#resp').addClass('alert-danger');
                            }
                        });
                    },
                    error: function(error) {
                        $('#resp').text(error.message);
                        $('#resp').addClass('alert');
                        $('#resp').addClass('alert-danger');
                    }
                });
            },
            error: function(error){
                $('#resp').text(error.message);
                $('#resp').addClass('alert');
                $('#resp').addClass('alert-danger');
            }
        });
    }else{
        $('#resp').text('Password does not match confirmation');
        $('#resp').addClass('alert');
        $('#resp').addClass('alert-danger');
    }
    
    return false;
});



//********************************************************************************************************************************************
//
//Send Mail
//
//********************************************************************************************************************************************
function sendMail(from, to, subject, body) {
    var msgObj = {
            "from": from,
            "to": to,
            "subject": subject,
            "text": body
        };
    $.ajax({
        url: 'https://api.mailgun.net/v2/vientoapps.com/messages',
        type: 'POST',
        cache: false,
        contentType: 'application/json;charset-utf8',
        crossDomain: true,
        dataType: 'jsonp',
        data: JSON.stringify(msgObj),
        success: function(response) {
            console.log('Email sent ' + response);
        },
        error: function(error) {
            console.error('Mailgun Error: ' + error);
        },
        beforeSend: function(xhr) {
            xhr.setRequestHeader('Authorization', 'Basic api:key-8a7uy1jop-fweooul65904zvdo4mv567');
        }
    });
}



//********************************************************************************************************************************************
//
//Save PDF
//
//********************************************************************************************************************************************
function savePDF(){
    
    var doc = new jsPDF();
    
    var specialElementHandlers = {
        '#editor': function(element, renderer) {
            return true;
        }
    };
    
    var html = $('#receipt').html();
    
    doc.fromHTML($('#receipt').get(0), 15, 15, {
        'width': 170,
        'elementHandlers': specialElementHandlers
    });
    
    doc.save('Receipt.pdf'); 
}


//**************************************************************************************************************************************
//
//Print PDF
//
//**************************************************************************************************************************************
function printPDF(){
    console.log('print pdf');
    
    var doc = new jsPDF();
    
    var specialElementHandlers = {
        '#editor': function(element, renderer) {
            return true;
        }
    };
    
    var html = $('#receipt').html(); console.log(html);
    
    doc.fromHTML($('#receipt').get(0), 15, 15, {
        'width': 170,
        'elementHandlers': specialElementHandlers
    }); console.log('pdf created');
    
    doc.output('datauri');
    var out = doc.output();
    var uri = 'data:application/pdf;base64,' + Base64.encode(out); console.log('uri created');
    window.open(uri, _blank);
}

//**************************************************************************************************************************************
//
//Validate PIN
//
//**************************************************************************************************************************************
$('#validateBtn').on('click', function() {
    $('#validateBtn').attr('disabled', 'disabled');
    var pin = $('#pin').val();
    
    var data = {MESSAGE: 'mas ' + pin};
    
    $.get('/validate', data, function(res, textStatus, xHR) {
        $('#res').text(res);
        $('#validateBtn').removeAttr('disabled');
    });
});