//get URL variables
var CourseWizard_CourseXKey = getQueryVariable("CourseXKey");

var CourseWizardCore_CourseForHeader;

var CourseWizardXMode = 'TeacherCourseWizard';
var InitializeCourseWizardAPIURL = APIUrl + '/getCourseForWizard?p_string_CourseXKey=' + CourseWizard_CourseXKey;

if (CourseWizard_CourseXKey) {
    //get the Course
    $('#div_Loader').css('display', 'block');

    $.getJSON(APIUrl + '/getCourse?p_string_CourseXKey=' + CourseWizard_CourseXKey + '&p_string_SectionItemsMode=GetAllPublishedItems')
        .done(function (data) {
            //success
            if ($.isNumeric(data) === false) {

                CourseWizardCore_CourseForHeader = data;

                //Load data on UI
                $('#h2_CourseTitle').html(getFirstCharactersOfSentence(CourseWizardCore_CourseForHeader.CourseTitle, 70));

                if (CourseWizardCore_CourseForHeader.CourseImageXFileName)
                    $('#div_CourseImage').css('background-image', 'url("' + WEBAPPDomainUrl + '/LecturepadCloud/Courses/' + CourseWizardCore_CourseForHeader.XKey + '/Landing Page/' + CourseWizardCore_CourseForHeader.CourseImageXFileName + '")');

                $('#span_CourseXStatus').html(CourseWizardCore_CourseForHeader.XStatus);

                $('#p_TeacherName').html('By ' + CourseWizardCore_CourseForHeader.TeacherFullName);
                //end load data on UI

                loadCategoriesForCourseWizard();//synchronous call

                updateSaveButtonsTextAndOtherUIControls();

                initializeAddCourseWizard();
            }

            $('#div_LoaderAmazing').css('display', 'none');
        })
        .fail(function (jqXHR, textStatus, err) {

            $('#div_LoaderAmazing').css('display', 'none');
        });
}

function updateSaveButtonsTextAndOtherUIControls() {
    if (CourseWizardCore_CourseForHeader.XStatus === 'Approved') {
        $('#button_SaveCourseGoals').html('Update');
        $('#button_SaveTestVideo').html('Update');
        $('#button_SaveCourseLandingPage').html('Update');
        $('#button_SavePriceAndCoupons').html('Update');
        $('#button_SaveAutomaticMessage').html('Update');
        //--
        $("#span_SubmitForReview").css("background", "gray");
        $("#span_SubmitForReview").css("border", "solid 1px gray");
        $("#span_SubmitForReview").css("pointer-events", "none");
    }

    if (CourseWizardCore_CourseForHeader.XStatus === 'Review' || CourseWizardCore_CourseForHeader.XStatus === 'Updated') {
        $('#button_SaveCourseGoals').prop('disabled', true);
        $('#button_SaveTestVideo').prop('disabled', true);
        $('#button_SaveCourseLandingPage').prop('disabled', true);
        $('#button_SavePriceAndCoupons').prop('disabled', true);
        $('#button_SaveAutomaticMessage').prop('disabled', true);
        $('#span_SubmitForReview').html('Course on Review');
        //--
        $("#span_SubmitForReview").css("background", "gray");
        $("#span_SubmitForReview").css("border", "solid 1px gray");
        $("#span_SubmitForReview").css("pointer-events", "none");
    }
}

//init actionsXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
$('#select_CoursePrice').append('<option value="FREE">FREE</option>');

for (var index = 20; index <= 200; index++) {
    $('#select_CoursePrice').append('<option value="' + index + '">$' + index + '</option>');

    index = index + 4;
}

//init plugins for static elements on UI XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
initializeSorting();

initTinymceEditors(); initTinymceSimpleEditors();
//end of init plugins for static elements on UI XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

//end init actionsXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX