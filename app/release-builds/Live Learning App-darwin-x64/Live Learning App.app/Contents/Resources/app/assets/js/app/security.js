var App = getQueryVariable("App");//get App param
var IsXUserSession = false;

if (localStorage.getItem("LP_Session_Started") !== null) {
    if (localStorage.getItem("LP_Session_Started") !== 'true') {
        if (isAdminOrStaffPage(window.location.pathname) || isStudentOrTeacherPage(window.location.pathname))
            window.location = 'index.html';
    }
    else {
        if (localStorage.getItem("LP_Session_XUserXKey") !== null)
            IsXUserSession = true;
    }
}
else {
    if (isAdminOrStaffPage(window.location.pathname) || isStudentOrTeacherPage(window.location.pathname))
        window.location = 'index.html';
}

function isAdminOrStaffPage(Page)
{
    var Answer = false;

    switch (Page)
    {
        case '/Page_AdminModule_Dashboard.html':
            Answer = true;
            break;
        case '/Page_AdminModule_XUsers.html':
            Answer = true;
            break;
        case '/Page_AdminModule_Courses.html':
            Answer = true;
            break;
        case '/Page_AdminModule_CourseEdit.html':
            Answer = true;
            break;
        case '/Page_AdminModule_PageBuilder.html':
            Answer = true;
            break;
        case '/Page_AdminModule_Finance.html':
            Answer = true;
            break;
        case '/Page_AdminModule_MedGenius.html':
            Answer = true;
            break;
        case '/Page_AdminModule_CaseConsult.html':
            Answer = true;
            break;
        case '/Page_AdminModule_Profile.html':
            Answer = true;
            break;
    }

    return Answer;
}

function isStudentOrTeacherPage(Page) {
    var Answer = false;

    switch (Page) {
        case '/Page_StudentModule_MyCourses.html':
            Answer = true;
            break;
        case '/Page_StudentModule_CourseDashboard.html':
            Answer = true;
            break;
        case '/Page_StudentModule_CoursePlayer.html':
            {
                var ParameterX = getQueryVariable('XMode');
                //special case, by default this page is just accessed by an user and session, but for review parameter this page is accessed without user and session just in this parameter case
                if (ParameterX) {
                    if (ParameterX === 'Preview')
                        Answer = false;
                    else
                        Answer = true;
                }
                else
                    Answer = true;
            }
            break;
        case '/Page_StudentModule_PurchaseHistory.html':
            Answer = true;
            break;
        case '/Page_StudentModule_LPCredits.html':
            Answer = true;
            break;
        case '/Page_StudentModule_Certificate.html':
            Answer = true;
            break;
        case '/Page_TeacherModule_CreateCourse.html':
            Answer = true;
            break;
        case '/Page_TeacherModule_CourseWizard.html':
            Answer = true;
            break;
        case '/Page_TeacherModule_Dashboard.html':
            Answer = true;
            break;
        case '/Page_TeacherModule_ReviewQuizAnswer.html':
            Answer = true;
            break;
        case '/Page_TeacherModule_RevenueReport.html':
            Answer = true;
            break;
        case '/Page_StudentTeacherModule_Notifications.html':
            Answer = true;
            break;
        case '/Page_StudentTeacherModule_Profile.html':
            Answer = true;
            break;
        case '/Page_StudentTeacherModule_Messages.html':
            Answer = true;
        }

    return Answer;
}

function isGuestPage(Page) {
    var Answer = false;

    switch (Page) {
        case '/':
            Answer = true;
            break;
        case '/index.html':
            Answer = true;
            break;
        case '/Page_SearchResults.html':
            Answer = true;
            break;
        case '/Page_SubCategoryHome.html':
            Answer = true;
            break;
        case '/Page_CourseLandingPage.html':
            Answer = true;
            break;
        case '/Page_LPPlayer.html':
            Answer = true;
            break;
        case '/Page_TeacherPublicHome.html':
            Answer = true;
            break;
        case '/Page_ShoppingCart.html':
            Answer = true;
            break;
        case '/Page_Checkout.html':
            Answer = true;
            break;
        case '/Page_MedGenius.html':
            Answer = true;
            break;
        case '/Page_MedGeniusQuizPlayer.html':
            Answer = true;
            break;
        case '/Page_BecomeTeacher.html':
            Answer = true;
            break;
    }

    return Answer;
}