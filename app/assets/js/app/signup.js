var type = new URLSearchParams(window.location.search).get("t");


var FullName = '', Email = '', TypeOfUser = '', Password = '';
var RedirectToPage = '';
var facebookUser;
var googleUser = {};

if (IsXUserSession === true)
    setXUserEnvironment();

function setXUserEnvironment() {
    if (isAdminOrStaffPage(window.location.pathname) === true) {
        //set XUser environment
        $('#p_UserName').html(localStorage.getItem("LP_Session_XUserFullName"));
        $('#p_UserRole').html(localStorage.getItem("LP_Session_RoleName"));
        setXUserPhoto(localStorage.getItem("LP_Session_XUserXKey"), localStorage.getItem("LP_Session_TypeOfUser"), localStorage.getItem("LP_Session_PhotoFileName"), [document.getElementById("img_UserPicture")]);

        //responsive UI
        $('#p_ResponsiveAdminUserName').html(localStorage.getItem("LP_Session_XUserFullName"));
        $('#p_ResponsiveUserRole').html(localStorage.getItem("LP_Session_RoleName"));
        setXUserPhoto(localStorage.getItem("LP_Session_XUserXKey"), localStorage.getItem("LP_Session_TypeOfUser"), localStorage.getItem("LP_Session_PhotoFileName"), [document.getElementById("img_ResponsiveAdminUserPicture")]);
        //end responsive UI
        //end of set XUser environment
    }

    if (isStudentOrTeacherPage(window.location.pathname) === true || isGuestPage(window.location.pathname) === true) {
        //set XUser environment
        $('#div_GuestMenuGroup').css('display', 'none');//hide menus in navbar for guest
        $('#div_XUserMenuGroup').css('display', 'inline');//show menus in navbar for XUser
        if (localStorage.getItem("LP_Session_IsTeacher") === 'true') {
            $('#a_Menu_BecomeInstructor_XUserLogged').css('display', 'none');//hide menu for become Teacher
            $('#a_Menu_Instructor').css('display', 'block');//show menu for Teacher
        }
        else {
            $('#a_Menu_BecomeInstructor_XUserLogged').css('display', 'block');//show menu for become Teacher
            $('#a_Menu_Instructor').css('display', 'none');//hide menu for Teacher
        }

        setXUserPhoto(localStorage.getItem("LP_Session_XUserXKey"), localStorage.getItem("LP_Session_TypeOfUser"), localStorage.getItem("LP_Session_PhotoFileName"), [document.getElementById("img_UserPicture")]);

        //--
        if (localStorage.getItem("LP_Session_RoleName") === 'Administrator' || localStorage.getItem("LP_Session_RoleName") === 'Staff')
            $('#li_AdministratorPanel').css('display', 'block');
        else
            $('#li_AdministratorPanel').css('display', 'none');
        //--

        //responsive UI
        $('#p_ResponsiveUserName').html(localStorage.getItem("LP_Session_XUserFullName"));
        setXUserPhoto(localStorage.getItem("LP_Session_XUserXKey"), localStorage.getItem("LP_Session_TypeOfUser"), localStorage.getItem("LP_Session_PhotoFileName"), [document.getElementById("img_ResponsiveUserPicture")]);
        $('#div_ResponsiveXUserHeader').css('display', 'block');//show header in responsive menu for XUser

        $('#div_ResponsiveGuestMenuGroup').css('display', 'none');//hide menus in responsive menu for guest
        $('#div_ResponsiveXUserMenuGroup').css('display', 'block');//show XUser menus

        if (localStorage.getItem("LP_Session_IsTeacher") === 'true') {
            $('#div_ResponsiveMenu_BecomeInstructor_XUserLogged').css('display', 'none');//hide menu for become Teacher
            $('#div_ResponsiveMenu_Instructor').css('display', 'block');//show menu for Teacher
        }
        else {
            $('#div_ResponsiveMenu_BecomeInstructor_XUserLogged').css('display', 'block');//show menu for become Teacher
            $('#div_ResponsiveMenu_Instructor').css('display', 'none');//hide menu for Teacher
        }

        //--
        if (localStorage.getItem("LP_Session_RoleName") === 'Administrator' || localStorage.getItem("LP_Session_RoleName") === 'Staff')
            $('#div_AdministratorPanel').css('display', 'block');
        else
            $('#div_AdministratorPanel').css('display', 'none');
        //--
        //end responsive UI

        //end of set XUser environment
    }
}

function setXUserPhoto(XUserXKey, TypeOfXUser, XUserPhotoXFileName, IMGPackage) {
    //get Photo
    var Image_Temporal = document.createElement("IMG");

    Image_Temporal.onerror = function () {
        Image_Temporal.src = "images/user standard icon.png";
    };

    if (TypeOfXUser === 'LPUser')
        Image_Temporal.src = WEBAPPDomainUrl + '/LecturepadCloud/XUsers/' + XUserXKey + '/Profile/' + XUserPhotoXFileName;
    else {
        Image_Temporal.src = XUserPhotoXFileName;
    }

    Image_Temporal.onload = function () {
        $.each(IMGPackage, function (index, img) {
            img.src = Image_Temporal.src;
        });
        Image_Temporal.remove();
    };
    //end get Photo
}

function universalLogin(LoginMode) {
    if (LoginMode === 'Normal') {
        $('#h2_Modal_UniversalLoginTitle').html('<strong>Welcome back</strong>');
        $('#p_Modal_UniversalLoginDescription').html('Sign in to enjoy your courses');

        $("#div_Modal_SignInForm").modal();
    }

    if (LoginMode === 'MedGenius') {
        $('#h2_Modal_UniversalLoginTitle').html('<strong>Please Sign in</strong>');
        $('#p_Modal_UniversalLoginDescription').html('You must be signed in to participate in Med Genius');

        $('#div_Modal_SignInForm').modal();
    }
}

function getDataFromSignUpUI() {
    FullName = $.trim($('#input_FullName').val());
    Email = $.trim($('#input_Email').val());
    Password = $.trim($('#input_Password').val());
}

function getDataFromSignInUI() {
    Email = $.trim($('#input_Email_Login').val());
    Password = $.trim($('#input_Password_Login').val());
}

function validateSignUpFormFields() {
    getDataFromSignUpUI();

    if (!FullName || !Email || !Password)
        return 1;

    if (validateEmail(Email) === false)
        return 2;

    return 0;
}

function validateSignInFormFields() {
    getDataFromSignInUI();

    if (!Email || !Password)
        return 1;

    if (validateEmail(Email) === false)
        return 2;

    return 0;
}

function signUp() {

    var ValidationAnswer = validateSignUpFormFields();

    if (ValidationAnswer === 0) {

        $('#div_Modal_SignUpForm').append($('#div_Loader'));//append loader to the modal and display it
        $('#div_Loader').css('display', 'block');

        //send data
        $.getJSON(APIUrl + '/signUp?p_string_FullName=' + FullName + '&p_string_Email=' + Email + '&p_string_TypeOfUser=' + TypeOfUser + '&p_string_Password=' + Password + '&p_string_Author=WebApp&AccountType=' + type)
            .done(function (data) {
                // On success,
                var answer = data;

                if ($.isNumeric(answer) === false) {
                    startSession(answer);
                }

                if (answer === 1) {
                    showAlert('Error at server', '#c4453c');
                }

                if (answer === 2) {
                    showAlert(Email + ' already exists', '#c4453c');
                }

                $('#div_Loader').css('display', 'none');
            })
            .fail(function (jqXHR, textStatus, err) {
                $('#div_Loader').css('display', 'none');
            });
    }
    else {
        if (ValidationAnswer === 1)
            showAlert('Please, complete the Sign Up Form', '#c4453c');
        if (ValidationAnswer === 2)
            showAlert('Email wrong format', '#c4453c');
    }
}

function signIn() {
    var Answer = validateSignInFormFields();

    if (Answer === 0) {

        $('#div_Modal_SignInForm').append($('#div_Loader'));//append loader to the modal and display it
        $('#div_Loader').css('display', 'block');

        //send data
        $.getJSON(APIUrl + '/signIn?p_string_Email=' + Email + '&p_string_Password=' + Password)
            .done(function (data) {
                // On success,
                var answer = data;

                if ($.isNumeric(answer) === false) {

                    startSession(answer);
                }

                if (answer === 1) {
                    showAlert('Error at server', '#c4453c');
                }

                if (answer === 2) {
                    showAlert('This email is not registered', '#c4453c');
                }

                if (answer === 3) {
                    showAlert('User without password', '#c4453c');
                }

                if (answer === 4) {
                    showAlert('Wrong password for this account', '#c4453c');
                }

                $('#div_Loader').css('display', 'none');
            })
            .fail(function (jqXHR, textStatus, err) {
                $('#div_Loader').css('display', 'none');
            });
    }
    else {
        if (Answer === 1)
            showAlert('Please, complete the Sign In Form', '#c4453c');
        if (Answer === 2)
            showAlert('Email wrong format', '#c4453c');
    }
}

function verifyFacebookGoogleUser() {

    //this method is called after facebook or google logon sucessfull

    //get the data from social APIs
    if (TypeOfUser === 'FacebookUser') {
        Email = facebookUser.email;
        FullName = facebookUser.first_name + ' ' + facebookUser.last_name;
        Password = '';
    }

    if (TypeOfUser === 'GoogleUser') {
        FullName = googleUser.getBasicProfile().getName();
        Email = googleUser.getBasicProfile().getEmail();
        Password = '';
    }

    $('#div_ModalBody_SignInForm').append($('#div_Loader'));
    $('#div_Loader').css('display', 'block');

    //send data
    $.getJSON(APIUrl + '/getXUser?p_string_Email=' + Email)
        .done(function (data) {
            // On success,
            var reponse = data;

            if ($.isNumeric(reponse) === false) {

                startSession(reponse);
            }

            if (reponse === 1) {
                showAlert('Error at server', '#c4453c');
            }

            if (reponse === 2) {
                //if facebook/google XUser doesn't exist with this email, then register it
                $.getJSON(APIUrl + '/signUp?p_string_FullName=' + FullName + '&p_string_Email=' + Email + '&p_string_TypeOfUser=' + TypeOfUser + '&p_string_Password=' + Password + '&p_string_Author=WebApp&AccountType=' + type)
                    .done(function (data2) {
                        // On success,
                        var answer = data2;

                        if ($.isNumeric(answer) === false) {
                            startSession(answer);
                        }

                        if (answer === 1) {
                            showAlert('Error at server', '#c4453c');
                        }
                    })
                    .fail(function (jqXHR, textStatus, err) {
                        //alert('Error: ' + textStatus);
                    });
            }

            $('#div_Loader').css('display', 'none');
        })
        .fail(function (jqXHR, textStatus, err) {
            $('#div_Loader').css('display', 'none');
        });
}

function startSession(XUser) {
    if (typeof (Storage) !== "undefined") {
        localStorage.setItem("LP_Session_XUserXKey", XUser.XKey);
        localStorage.setItem("LP_Session_XUserFullName", XUser.FullName);
        localStorage.setItem("LP_Session_XUserEmail", XUser.Email);
        localStorage.setItem("LP_Session_TypeOfUser", XUser.TypeOfUser);
        localStorage.setItem("LP_Session_RoleName", XUser.RoleName);
        localStorage.setItem("LP_Session_StudentAccountXKey", XUser.StudentAccountXKey);
        localStorage.setItem("LP_Session_IsTeacher", XUser.IsTeacher);
        localStorage.setItem("LP_Session_TeacherAccountXKey", XUser.TeacherAccountXKey);

        if (XUser.XUserPhoto)
            localStorage.setItem("LP_Session_PhotoFileName", XUser.XUserPhoto.XFileName);
        else {
            localStorage.setItem("LP_Session_PhotoFileName", '');

            if (XUser.TypeOfUser === 'FacebookUser')
                localStorage.setItem("LP_Session_PhotoFileName", facebookUser.picture.data.url);

            if (XUser.TypeOfUser === 'GoogleUser')
                localStorage.setItem("LP_Session_PhotoFileName", googleUser.getBasicProfile().getImageUrl());
        }

        if (XUser.XUserWallpaper)
            localStorage.setItem("LP_Session_WallpaperFileName", XUser.XUserWallpaper.XFileName);
        else
            localStorage.setItem("LP_Session_WallpaperFileName", '');


        localStorage.setItem("LP_Session_Author", XUser.Email);
        localStorage.setItem("LP_Session_Started", 'true');

        //check if there is a RedirectToPage command
        if (RedirectToPage) {
            window.location = RedirectToPage;
        }
        else //follow normal flow
        {
            if (XUser.RoleName) {
                //verify the Role of XUser and redirect if it is student, teacher or staff or admin
                if (XUser.RoleName === 'Unknown') {
                    window.location = 'IndiTeTuCourse.html';
                }
                if (XUser.RoleName === 'Administrator' || XUser.RoleName === 'Staff') {
                    window.location = 'Page_AdminModule_Dashboard.html';
                }
            }
        }
    }
    else {
        showAlert('Sorry: we cant start your session', '#c4453c');
    }
}

function closeSession() {
    if (localStorage.getItem("LP_Session_TypeOfUser") === 'LPUser') {
        realeseSession();
    }

    if (localStorage.getItem("LP_Session_TypeOfUser") === 'FacebookUser') {
        facebookLogout();
    }

    if (localStorage.getItem("LP_Session_TypeOfUser") === 'GoogleUser') {
        googleLogout();
    }
}

function realeseSession() {
    //--
    localStorage.removeItem("LP_Session_XUserXKey");
    localStorage.removeItem("LP_Session_XUserFullName");
    localStorage.removeItem("LP_Session_XUserEmail");
    localStorage.removeItem("LP_Session_TypeOfUser");
    localStorage.removeItem("LP_Session_RoleName");
    localStorage.removeItem("LP_Session_StudentAccountXKey");
    localStorage.removeItem("LP_Session_IsTeacher");
    localStorage.removeItem("LP_Session_TeacherAccountXKey");
    localStorage.removeItem("LP_Session_PhotoFileName");
    localStorage.removeItem("LP_Session_WallpaperFileName");
    localStorage.removeItem("LP_Session_Author");
    //--
    localStorage.removeItem("LPShoppingCart");
    localStorage.removeItem("LP_StudentShoppingCartChecked");
    localStorage.removeItem("LP_ShoppingCartIsBulk");
    localStorage.removeItem("LP_ProceedToBilling");
    localStorage.removeItem("LP_PaymentType");
    localStorage.removeItem("LP_CreditsAmount");
    localStorage.removeItem("LPTRANS-ID");
    //--
    localStorage.setItem("LP_Session_Started", "false");
    //--

    window.location = 'index.html';
}

//FACEBOOK LOGIN ----------------------------------------------------
function facebookLogin() {

    $('#div_ModalBody_SignInForm').append($('#div_Loader'));
    $('#div_Loader').css('display', 'block');

    // Check whether the user already logged in
    FB.getLoginStatus(function (response) {
        if (response.status === 'connected') {
            $('#div_Loader').css('display', 'none');
            //display user data
            getFacebookUserData();
        }
    });

    FB.login(function (response) {
        if (response.authResponse) {
            $('#div_Loader').css('display', 'none');
            // Get and display the user profile data
            getFacebookUserData();
        } else {
            $('#div_Loader').css('display', 'none');
        }
    }, { scope: 'email' });
}

// Fetch the user profile data from facebook
function getFacebookUserData() {
    $('#div_ModalBody_SignInForm').append($('#div_Loader'));
    $('#div_Loader').css('display', 'block');

    FB.api('/me', { locale: 'en_US', fields: 'id,first_name,last_name,email,link,gender,locale,picture' },
        function (response) {
            facebookUser = response;
            $('#div_Loader').css('display', 'none');
            verifyFacebookGoogleUser();
        });
}

function facebookLogout() {

    FB.getLoginStatus(function (response) {
        if (response && response.status === 'connected') {
            FB.logout(function () {
                alert('You have successfully logout from Facebook.');
                realeseSession();
            });
        }
    });
}
//----------------------------

//GOOGLE LOGIN
function googleSignIn() {
    $('#div_ModalBody_SignInForm').append($('#div_Loader'));
    startGoogleLoginApp();
}

function googleLogout() {
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
        alert('You are signed out from Google');
        realeseSession();
    });
}