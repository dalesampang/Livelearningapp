var Categories = [];//local buffer of Categories

//****************************Add Course Wizard Variables*************************************************
var CanInitializeWizardCourse = true;

var CurrentWizardCourse = {};

var CurrentWizardCategory;//Category for Course Wizard

var CurrentWizardSubCategory;//SubCategory for Course Wizard

var CourseGoalsPackage = [];

var CourseGoals;

var CanInitializeCourseGoals = true;

//-----------------------------------------------------------------------------
var TestVideo, TestVideo_Video;

var PreRecordedContent = '', XLanguage = '', InstructionType = '', Microphone = '', Camera = '', EditingSoftware = '';

var CanInitializeTestVideo = true;

var EditMode_TestVideo = '';//indicate if new or edit a object for TestVideo

//------------------------------------------------------------------------------

var CurriculumSections = [];

var CurrentCurriculumSection;

var SectionTitle = '', SectionLearningObjective = '', SectionListNumber = 0;

var CanInitializeCurriculumSection = true;

var EditMode_CurriculumSection = ''; //indicate if new or edit a object for CurriculumSection

//------------------------------------------------------------------------------

var KinfOfItem = '', SectionItemTitle = '', SectionItemXDescription = '', SectionItemSectionListNumber = 0, SectionItemKindOfItemListNumber = 0, SectionItemPublished = '';

var EditMode_SectionItem = ''; //indicate if new or edit a object for SectionItem

var AuxiliarContent = '';

var Question = '', RightAnswer = '', RelatedLecture = '', TimeLimitInSeconds = 0, QuizQuestionListNumber = 0;

var QuestionChoicesPackage = [];

var MinimunChoicesQuantity = 3, MaximunChoicesQuantity = 15;

var EditMode_QuizQuestion = '';

//------------------------------------------------------------------------------

var CourseLandingPage, CourseLandingPage_Media_CourseImage, CourseLandingPage_Media_PromotionalVideo, CourseLandingPage_Media_ClosedCaptions;

var Title = '', SubTitle = '', XDescription = '', PrimaryTought = '';

var CanInitializeCourseLandingPage = true;

var EditMode_CourseLandingPage = '';//indicate if new or edit a object for CourseLandingPage

var CourseLandingPage_Media_XLanguage = '';

//------------------------------------------------------------------------------

var CoursePrice;

var Price = 0.0, Currency = '';

var CanInitializeCoursePrice = true;

var EditMode_CoursePrice = '';//indicate if new or edit a object for CoursePrice

//------------------------------------------------------------------------------

var CourseCoupons = [];//local buffer of CourseCoupons

var CurrentCourseCoupon;

var Code = '', DiscountedPrice = 0.0, NumberOfCoupons = 0, DeadLine = Date.now(), CouponXStatus = '';

var CanInitializeCourseCoupon = true;

var EditMode_CourseCoupon = '';//indicate if new or edit a object for CourseCoupon

//------------------------------------------------------------------------------

var AutomaticMessage;

var WelcomeMessage = '', CongratulationsMessage = '';

var CanInitializeAutomaticMessage = true;

var EditMode_AutomaticMessage = '';//indicate if new or edit a object for TestVideo

//****************************End of Add Course Wizard Variables******************************************


//******************************************Add Course Wizard Logic*********************************************

function initializeAddCourseWizard() {
    if (CanInitializeWizardCourse === true) {
        $('body').append($('#div_Loader'));//append and display loader 
        $('#div_Loader').css('display', 'block');

        //first of all, verify if the admin has a Course draft
        $.getJSON(InitializeCourseWizardAPIURL)
            .done(function (data) {
                // On success
                //if the course exists the API returns a Course object, if not, it returns an int value
                if ($.isNumeric(data) === false) {
                    CurrentWizardCourse = data;

                    //set UI
                    if (CurrentWizardCourse.SubCategoryXKey && CurrentWizardCourse.SubCategoryXKey != 'null') {
                        getCurrentWizardCategoryAndSubCategoryBySubCategoryXKey(CurrentWizardCourse.SubCategoryXKey);

                        var TemporalSubCategoryXName = CurrentWizardSubCategory.XName;

                        $('#select_Wizard_Categories').val(CurrentWizardCategory.XName);
                        $('#select_Wizard_Categories').change();

                        $('#select_Wizard_SubCategories').val(TemporalSubCategoryXName);
                        $('#select_Wizard_SubCategories').change();
                    }
                    //end of set UI
                }

                if (data === 1)
                    showAlert('Error at server');

                if (data === 2)//means no Course Draft
                {
                    //create new Course
                    createTemporalCourse();
                }

                CanInitializeWizardCourse = false;

                //initialize the CourseGoals
                document.getElementById("goals-tab").click();

                $('#div_Loader').css('display', 'none');//hide loader
            })
            .fail(function (jqXHR, textStatus, err) {
                $('#div_Loader').css('display', 'none');//hide loader
            });
    }
}

function verifyWizardCourseIntegrity() {

    var Success = false;

    //if the CurrentWizardCourse has been first initialized, then add new to server
    if (CurrentWizardCourse.XStatus === 'TemporalDraft') {

        //change the XStatus of the Course to Draft
        CurrentWizardCourse.XStatus = 'Draft';

        $('body').append($('#div_Loader'));//append and display loader 
        $('#div_Loader').css('display', 'block');

        $.ajax({
            async: false,
            method: "GET",
            url: APIUrl + '/addCourse?p_string_SubCategoryXKey=' + CurrentWizardCourse.SubCategoryXKey + '&p_string_XStatus=' + CurrentWizardCourse.XStatus + '&p_string_XUserXKey=' + localStorage.getItem("LP_Session_XUserXKey") + '&p_string_Author=' + localStorage.getItem("LP_Session_Author"),
            dataType: "json",
            success: function (data) {
                // On success,
                var answer = data;//if succeded, the API returns the XKey of the new objects, XKey length > 1

                if (answer.length > 1) {

                    //set values
                    CurrentWizardCourse.XKey = getFlag(answer, "CourseXKey");
                    //end set values
                    
                    Success = true;

                    //--
                    if (localStorage.getItem("LP_Session_IsTeacher") === 'false') {
                        localStorage.setItem("LP_Session_IsTeacher", 'true');
                        localStorage.setItem("LP_Session_TeacherAccountXKey", getFlag(answer, "TeacherAccountXKey"));
                    }
                    //--

                    showAlert('Course draft generated', '#17aa1c');
                }

                if (answer === '1') {
                    showAlert('Error at server', '#c4453c');
                }

                $('#div_Loader').css('display', 'none');//hide loader
            },
            error: function (jqXHR, textStatus, errorThrown) {
                $('#div_Loader').css('display', 'none');//hide loader
            }
        });
    }
    else
    {
        if (CurrentWizardCourse.XStatus === 'Approved') {
            if (confirm('Your course is already approved, if you make any update on it, the course needs to be submited again for approval. While you update your course, this is in an Updating state and it will not be visible on Lecturepad courses until be Approved by Lecturepad') === true) {
                CurrentWizardCourse.XStatus = 'Updating';

                if (updateWizardCourse() === true) {
                    //update UI
                    $("#span_SubmitForReview").css("background", "#17aa1c");
                    $("#span_SubmitForReview").css("border", "solid 1px #17aa1c");
                    $("#span_SubmitForReview").css("pointer-events", "all");
                    //end update UI
                    Success = true;
                }
            }
            else
                Success = false;
        }
        else
            Success = true;
    }

    return Success;
}

function createTemporalCourse() {
    //the CurrentWizardCourse has been initialized before this method is called
    CurrentWizardCourse.XKey = 'X';

    if (CurrentWizardSubCategory)
        CurrentWizardCourse.SubCategoryXKey = CurrentWizardSubCategory.XKey;
    else
        CurrentWizardCourse.SubCategoryXKey = 'null';

    CurrentWizardCourse.XStatus = 'TemporalDraft';
}

function getCurrentWizardCategoryByXName(CategoryXName) {
    //loop the local buffer and find the requested Category
    for (var i = 0; i < Categories.length; i++) {
        if (Categories[i].XName === CategoryXName) {
            CurrentWizardCategory = Categories[i];
            break;
        }
    }
}

function getCurrentWizardSubCategoryByXName(SubCategoryXName) {
    //loop the local buffer and find the requested SubCategory
    for (var i = 0; i < CurrentWizardCategory.SubCategories.length; i++) {
        if (CurrentWizardCategory.SubCategories[i].XName === SubCategoryXName) {
            CurrentWizardSubCategory = CurrentWizardCategory.SubCategories[i];
            CurrentWizardCourse.SubCategoryXKey = CurrentWizardSubCategory.XKey;
            break;
        }
    }
}

function getCurrentWizardCategoryAndSubCategoryBySubCategoryXKey(SubCategoryXKey) {
    //loop the local buffer and find the requested Category
    for (var i = 0; i < Categories.length; i++) {
        //loop the local buffer and find the requested SubCategory
        for (var j = 0; j < Categories[i].SubCategories.length; j++) {
            if (Categories[i].SubCategories[j].XKey === SubCategoryXKey) {
                CurrentWizardSubCategory = Categories[i].SubCategories[j];
                CurrentWizardCategory = Categories[i];
                return;
            }
        }
    }
}

function loadCategoriesForCourseWizard() {
    //get the Categories
    $.ajax({
        async: false,
        method: "GET",
        url: APIUrl + '/getAllCategoriesAndSubCategories',
        dataType: "json",
        success: function (data) {
            $('#select_Wizard_Categories').children().remove();
            $.each(data, function (index, Category) {//loop collection

                Categories.push(Category);//insert into local buffer

                //update UI
                $('#select_Wizard_Categories').append("<option id=\"option_Wizard_Category_" + Category.XKey + "\" value=\"" + Category.XName + "\">" + Category.XName + "</option>");
                //end of update the UI

            });

            //--get the initial CurrentCategory
            if (Categories.length > 0) {
                CurrentWizardCategory = Categories[0];
                loadWizardSubCategories();
            }
            //--end of get the initial CurrentCategory

            $('#div_Loader').css('display', 'none');//hide the loader
        },
        error: function (jqXHR, textStatus, errorThrown) {
            $('#div_Loader').css('display', 'none');//hide loader
        }
    });
}

function loadWizardSubCategories() {
    CurrentWizardSubCategory = null;

    $('#select_Wizard_SubCategories').find('option').remove().end();//clear the select 

    //loop the local buffer 
    for (var i = 0; i < CurrentWizardCategory.SubCategories.length; i++) {
        $('#select_Wizard_SubCategories').append("<option id=\"option_Wizard_SubCategory_" + CurrentWizardCategory.SubCategories[i].XKey + "\" value=\"" + CurrentWizardCategory.SubCategories[i].XName + "\">" + CurrentWizardCategory.SubCategories[i].XName + "</option>");
    }
    //end of get the current SubCategory

    if (CurrentWizardCategory.SubCategories.length > 0) {
        CurrentWizardSubCategory = CurrentWizardCategory.SubCategories[0];
        CurrentWizardCourse.SubCategoryXKey = CurrentWizardSubCategory.XKey;
    }
}

function updateWizardCourse() {
    var ValidationAnswer = false;

    $('body').append($('#div_Loader'));//append and display loader 
    $('#div_Loader').css('display', 'block');

    $.ajax({
        async: false,
        method: "GET",
        url: APIUrl + '/updateCourse?p_string_CourseXKey=' + CurrentWizardCourse.XKey + '&p_string_SubCategoryXKey=' + CurrentWizardCourse.SubCategoryXKey + '&p_string_XStatus=' + CurrentWizardCourse.XStatus + '&p_string_Author=' + localStorage.getItem("LP_Session_Author"),
        dataType: "json",
        success: function (data) {
            // On success,
            var answer = data;

            if (answer === 0) {

                showAlert('Course updated', '#17aa1c');

                ValidationAnswer = true;
            }

            if (answer === 1) {
                showAlert('Error at server', '#c4453c');
            }

            if (answer === 3) {
                showAlert('This Course not longer exists and cannot be updated', '#c4453c');
            }

            $('#div_Loader').css('display', 'none');//hide loader
        },
        error: function (jqXHR, textStatus, errorThrown) {
            $('#div_Loader').css('display', 'none');//hide loader
        }
    });

    return ValidationAnswer;
}

function updateWizardCourseSubCategory() {
    var ValidationAnswer = false;

    $('body').append($('#div_Loader'));//append and display loader 
    $('#div_Loader').css('display', 'block');

    $.ajax({
        async: false,
        method: "GET",
        url: APIUrl + '/updateCourseSubCategory?p_string_CourseXKey=' + CurrentWizardCourse.XKey + '&p_string_SubCategoryXKey=' + CurrentWizardCourse.SubCategoryXKey + '&p_string_Author=' + localStorage.getItem("LP_Session_Author"),
        dataType: "json",
        success: function (data) {
            // On success,
            var answer = data;

            if (answer === 0) {
                ValidationAnswer = true;
            }

            if (answer === 1) {
                showAlert('Error at server', '#c4453c');
            }

            if (answer === 2 || answer === 3) {//special case admits two values same erro message
                showAlert('This Course not longer exists and cannot be updated', '#c4453c');
            }

            $('#div_Loader').css('display', 'none');//hide loader
        },
        error: function (jqXHR, textStatus, errorThrown) {
            $('#div_Loader').css('display', 'none');//hide loader
        }
    });

    return ValidationAnswer;
}

function initializeCourseGoalsWizard() {
    if (CurrentWizardCourse.XKey !== '' && CanInitializeCourseGoals === true) {
        $('body').append($('#div_Loader'));//append and display loader
        $('#div_Loader').css('display', 'block');

        $.getJSON(APIUrl + '/getAllCourseGoals?p_string_CourseXKey=' + CurrentWizardCourse.XKey)//get all CourseGoals
            .done(function (data) {
                $.each(data, function (index, CourseGoals_X) {//loop collection

                    //update UI
                    if (CourseGoals_X.Question === 'KnowledgeRequirements') {
                        $('#ul_KnowledgeRequirements').append("<li class=\"ui-state-default\"><input type=\"text\" class=\"form-control\" value=\"" + CourseGoals_X.Answer + "\" onmouseover= \"$(this).next().css('visibility','visible');\" onfocus=\"SortableMenuToggled= true;\" onblur=\"SortableMenuToggled=false; $(this).next().css('visibility','hidden');\" onmouseout= \"if(SortableMenuToggled === false) { $(this).next().css('visibility','hidden'); } else { if($(this).is(':focus') === false) { $(this).next().css('visibility','hidden'); } }\" /><div class=\"SortableMenuToggle\" style=\"float:right;\" onmousemove=\"$(this).css('visibility', 'visible');\" onmouseout=\"if (SortableMenuToggled === false) { $(this).css('visibility','hidden'); } else { if($(this).prev().is(':focus') === false) { $(this).css('visibility','hidden'); } }\"><div type=\"button\" class=\"btn btn-default\" onclick=\"$(this).parent().parent().remove();\"><span class=\"glyphicon glyphicon-trash\"></span></div><div type=\"button\" class=\"btn btn-default LPDragandDrop handle\"><span class=\"glyphicon glyphicon-menu-hamburger\"></span></div></div></li >");
                    }

                    if (CourseGoals_X.Question === 'TargetStudents') {
                        $('#ul_TargetStudents').append("<li class=\"ui-state-default\"><input type=\"text\" class=\"form-control\" value=\"" + CourseGoals_X.Answer + "\" onmouseover= \"$(this).next().css('visibility','visible');\" onfocus=\"SortableMenuToggled= true;\" onblur=\"SortableMenuToggled=false; $(this).next().css('visibility','hidden');\" onmouseout= \"if(SortableMenuToggled === false) { $(this).next().css('visibility','hidden'); } else { if($(this).is(':focus') === false) { $(this).next().css('visibility','hidden'); } }\" /><div class=\"SortableMenuToggle\" style=\"float:right;\" onmousemove=\"$(this).css('visibility', 'visible');\" onmouseout=\"if (SortableMenuToggled === false) { $(this).css('visibility','hidden'); } else { if($(this).prev().is(':focus') === false) { $(this).css('visibility','hidden'); } }\"><div type=\"button\" class=\"btn btn-default\" onclick=\"$(this).parent().parent().remove();\"><span class=\"glyphicon glyphicon-trash\"></span></div><div type=\"button\" class=\"btn btn-default LPDragandDrop handle\"><span class=\"glyphicon glyphicon-menu-hamburger\"></span></div></div></li >");
                    }

                    if (CourseGoals_X.Question === 'Goals') {
                        $('#ul_Goals').append("<li class=\"ui-state-default\"><input type=\"text\" class=\"form-control\" value=\"" + CourseGoals_X.Answer + "\" onmouseover= \"$(this).next().css('visibility','visible');\" onfocus=\"SortableMenuToggled= true;\" onblur=\"SortableMenuToggled=false; $(this).next().css('visibility','hidden');\" onmouseout= \"if(SortableMenuToggled === false) { $(this).next().css('visibility','hidden'); } else { if($(this).is(':focus') === false) { $(this).next().css('visibility','hidden'); } }\" /><div class=\"SortableMenuToggle\" style=\"float:right;\" onmousemove=\"$(this).css('visibility', 'visible');\" onmouseout=\"if (SortableMenuToggled === false) { $(this).css('visibility','hidden'); } else { if($(this).prev().is(':focus') === false) { $(this).css('visibility','hidden'); } }\"><div type=\"button\" class=\"btn btn-default\" onclick=\"$(this).parent().parent().remove();\"><span class=\"glyphicon glyphicon-trash\"></span></div><div type=\"button\" class=\"btn btn-default LPDragandDrop handle\"><span class=\"glyphicon glyphicon-menu-hamburger\"></span></div></div></li >");
                    }
                    //end of update the UI

                });

                CanInitializeCourseGoals = false;

                $('#div_Loader').css('display', 'none');//hide the loader
            })
            .fail(function (jqXHR, textStatus, err) {
                $('#div_Loader').css('display', 'none');
            });
    }
}

function addCourseGoal(TextControl, ul_ContainerID, Content, Question) {
    $('#' + ul_ContainerID).append("<li class=\"ui-state-default\"><input type=\"text\" class=\"form-control\" value=\"" + Content + "\" onmouseover= \"$(this).next().css('visibility','visible');\" onfocus=\"SortableMenuToggled= true;\" onblur=\"SortableMenuToggled=false; $(this).next().css('visibility','hidden');\" onmouseout= \"if(SortableMenuToggled === false) { $(this).next().css('visibility','hidden'); } else { if($(this).is(':focus') === false) { $(this).next().css('visibility','hidden'); } } \" /><div class=\"SortableMenuToggle\" style=\"float:right;\" onmousemove=\"$(this).css('visibility', 'visible');\" onmouseout=\"if (SortableMenuToggled === false) { $(this).css('visibility','hidden'); } else { if($(this).prev().is(':focus') === false) { $(this).css('visibility','hidden'); } }\"><div type=\"button\" class=\"btn btn-default\" onclick=\"$(this).parent().parent().remove();\"><span class=\"glyphicon glyphicon-trash\"></span></div><div type=\"button\" class=\"btn btn-default LPDragandDrop handle\"><span class=\"glyphicon glyphicon-menu-hamburger\"></span></div></div></li>");
    $(TextControl).val('');
}

function saveCourseGoals() {
    if (verifyWizardCourseIntegrity() === true) {
        //update the Course wizard SubCategory
        if (CurrentWizardCourse.SubCategoryXKey) {
            updateWizardCourseSubCategory();
        }
        //end of update the Course wizard SubCategory

        //clear CourseGoalsPackage
        CourseGoalsPackage.splice(0, CourseGoalsPackage.length);

        $('#ul_KnowledgeRequirements li input').each(function (index) {
            CourseGoals = {};
            CourseGoals.CourseXKey = CurrentWizardCourse.XKey;
            CourseGoals.Question = 'KnowledgeRequirements';
            CourseGoals.Answer = $(this).val();
            CourseGoals.ListNumber = index;
            CourseGoalsPackage.push(CourseGoals);
        });

        $('#ul_TargetStudents li input').each(function (index) {
            CourseGoals = {};
            CourseGoals.CourseXKey = CurrentWizardCourse.XKey;
            CourseGoals.Question = 'TargetStudents';
            CourseGoals.Answer = $(this).val();
            CourseGoals.ListNumber = index;
            CourseGoalsPackage.push(CourseGoals);
        });

        $('#ul_Goals li input').each(function (index) {
            CourseGoals = {};
            CourseGoals.CourseXKey = CurrentWizardCourse.XKey;
            CourseGoals.Question = 'Goals';
            CourseGoals.Answer = $(this).val();
            CourseGoals.ListNumber = index;
            CourseGoalsPackage.push(CourseGoals);
        });

        if (CourseGoalsPackage.length > 0) {

            $('body').append($('#div_Loader'));//append and display loader 
            $('#div_Loader').css('display', 'block');

            $.ajax({
                method: "POST",
                url: APIUrl + '/addCourseGoals?p_string_CourseXKey=' + CurrentWizardCourse.XKey + '&p_string_Author=' + localStorage.getItem("LP_Session_Author"),
                dataType: "json",
                data: { '': CourseGoalsPackage },
                success: function (data) {
                    //on success,
                    if (data === 0)
                    {
                        showAlert('Changes saved', '#17aa1c');
                        $("#videoTest-tab").trigger("click");
                    }

                    if (data === 1)
                        showAlert('Error at server', '#c4453c');

                    $('#div_Loader').css('display', 'none');//hide loader
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    $('#div_Loader').css('display', 'none');//hide loader
                }
            });
        }
    }
}

function initializeTestVideoWizard() {

    if (CurrentWizardCourse.XKey !== '' && CanInitializeTestVideo === true) {

        $('body').append($('#div_Loader'));//append and display loader
        $('#div_Loader').css('display', 'block');

        $.getJSON(APIUrl + '/getTestVideo?p_string_CourseXKey=' + CurrentWizardCourse.XKey)//get TestVideo
            .done(function (data) {

                // On success,
                //if the TestVideo exists the API returns a TestVideo object, if not, it returns an int value
                if ($.isNumeric(data) === false) {
                    TestVideo = data;

                    //get embeded objects
                    TestVideo_Video = TestVideo.TestVideo_Video;

                    if (TestVideo_Video) {
                        $('#img_TestVideo_Video').css('display', 'none');
                        $('#video_TestVideo_Video').css('display', 'block');
                        document.getElementById("video_TestVideo_Video").src = WEBAPPDomainUrl + '/LecturepadCloud/Courses/' + CurrentWizardCourse.XKey + '/TestVideo/' + TestVideo_Video.XFileName;
                        $('#span_TestVideo_Video_XFileName').html(getSummaryOfSentence(TestVideo_Video.XFileName, 25));
                    }
                    //end of get embeded objects

                    //update the UI NOTE:Special case, this case process empty values
                    if (TestVideo.PreRecordedContent)
                        $("input[name=optradio][value=" + TestVideo.PreRecordedContent + "]").prop('checked', true);

                    if (TestVideo.XLanguage)
                        $('#select_XLanguage option[value="' + TestVideo.XLanguage + '"]').prop('selected', true);

                    if (TestVideo.InstructionType)
                        $('#select_InstructionType option[value="' + TestVideo.InstructionType + '"]').prop('selected', true);

                    if (TestVideo.Microphone)
                        $('#select_Microphone option[value="' + TestVideo.Microphone + '"]').prop('selected', true);

                    if (TestVideo.Camera)
                        $('#select_Camera option[value="' + TestVideo.Camera + '"]').prop('selected', true);

                    if (TestVideo.EditingSoftware)
                        $('#select_EditingSoftware option[value="' + TestVideo.EditingSoftware + '"]').prop('selected', true);

                    //end of update the UI

                    EditMode_TestVideo = 'Edit';
                }

                if (data === 1)
                    showAlert('Error at server', '#c4453c');

                if (data === 2)
                    EditMode_TestVideo = 'New';

                CanInitializeTestVideo = false;

                $('#div_Loader').css('display', 'none');//hide the loader

            })
            .fail(function (jqXHR, textStatus, err) {
                $('#div_Loader').css('display', 'none');
            });
    }
}

function getDataFromTestVideoUI() {
    PreRecordedContent = $("input:radio[name='optradio']:checked").val();
    XLanguage = $('#select_XLanguage option:selected').text();
    InstructionType = $('#select_InstructionType option:selected').text();
    Microphone = $('#select_Microphone option:selected').text();
    Camera = $('#select_Camera option:selected').text();
    EditingSoftware = $('#select_EditingSoftware option:selected').text();
}

function validateTestVideoFormFields() {
    getDataFromTestVideoUI();

    if (!PreRecordedContent || XLanguage === 'Select' || InstructionType === 'Select' || Microphone === 'Select' || Camera === 'Select' || EditingSoftware === 'Select')
        return 1;

    return 0;
}

function saveTestVideo(XMode) {
    var Response = 0;

    var ValidationAnswer = 0;

    var CanSaveTestVideo = false;

    if (XMode === 'No Validation')
        CanSaveTestVideo = true;

    if (XMode === 'Validation') {

        ValidationAnswer = validateTestVideoFormFields();

        if (ValidationAnswer === 0)
            CanSaveTestVideo = true;
        else
            CanSaveTestVideo = false;
    }

    if (verifyWizardCourseIntegrity() === true) {
        if (EditMode_TestVideo === 'New') {

            if (CanSaveTestVideo === true) {

                $('body').append($('#div_Loader'));//append loader to the body and display it
                $('#div_Loader').css('display', 'block');//shows loader

                $.ajax({
                    async: false,
                    method: "GET",
                    url: APIUrl + '/addTestVideo?p_string_CourseXKey=' + CurrentWizardCourse.XKey + '&p_string_PreRecordedContent=' + PreRecordedContent + '&p_string_XLanguage=' + XLanguage + '&p_string_InstructionType=' + InstructionType + '&p_string_Microphone=' + Microphone + '&p_string_Camera=' + Camera + '&p_string_EditingSoftware=' + EditingSoftware + '&p_string_Author=' + localStorage.getItem("LP_Session_Author"),
                    dataType: "json",
                    success: function (data) {
                        // On success,
                        var answer = data;//if succeded, the API returns the XKey of the new object, XKey length = 10

                        if (answer.length === 10) {
                            TestVideo = {};//create new object

                            //set values
                            TestVideo.XKey = data;
                            TestVideo.CourseXKey = CurrentWizardCourse.XKey;
                            TestVideo.PreRecordedContent = PreRecordedContent;
                            TestVideo.XLanguage = XLanguage;
                            TestVideo.InstructionType = InstructionType;
                            TestVideo.Microphone = Microphone;
                            TestVideo.Camera = Camera;
                            TestVideo.EditingSoftware = EditingSoftware;
                            //end set values

                            EditMode_TestVideo = 'Edit';//set for Edit

                            //if (XMode === 'Validation')
                            showAlert('Saved', '#17aa1c');
                            $("#curriculum-tab").trigger("click");
                        }

                        if (answer === '1') {
                            Response = 1;
                            showAlert('Error at server', '#c4453c');
                        }

                        if (answer === '2') {
                            Response = 1;
                            showAlert('TestVideo for this Course already exists', '#c4453c');
                        }

                        $('#div_Loader').css('display', 'none');//hide loader
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        Response = 1;
                        $('#div_Loader').css('display', 'none');
                    }
                });
            }
            else {
                if (ValidationAnswer === 1)
                    showAlert('Please, complete the TestVideo Form', '#c4453c');
            }

        }//----

        if (EditMode_TestVideo === 'Edit') {

            if (CanSaveTestVideo === true) {

                $('body').append($('#div_Loader'));//append loader to the body and display it
                $('#div_Loader').css('display', 'block');

                $.ajax({
                    async: false,
                    method: "GET",
                    url: APIUrl + '/updateTestVideo?p_string_TestVideoXKey=' + TestVideo.XKey + '&p_string_CourseXKey=' + TestVideo.CourseXKey + '&p_string_PreRecordedContent=' + PreRecordedContent + '&p_string_XLanguage=' + XLanguage + '&p_string_InstructionType=' + InstructionType + '&p_string_Microphone=' + Microphone + '&p_string_Camera=' + Camera + '&p_string_EditingSoftware=' + EditingSoftware + '&p_string_Author=' + localStorage.getItem("LP_Session_Author"),
                    dataType: "json",
                    success: function (data) {
                        // On success,
                        var answer = data;

                        if (answer === 0) {

                            //set new values
                            TestVideo.PreRecordedContent = PreRecordedContent;
                            TestVideo.XLanguage = XLanguage;
                            TestVideo.InstructionType = InstructionType;
                            TestVideo.Microphone = Microphone;
                            TestVideo.Camera = Camera;
                            TestVideo.EditingSoftware = EditingSoftware;
                            //end set new values

                            if (XMode === 'Validation')
                                showAlert('Updated', '#17aa1c');
                        }

                        if (answer === 1) {
                            Response = 1;
                            showAlert('Error at server', '#c4453c');
                        }

                        if (answer === 3) {
                            Response = 1;
                            showAlert('This TesVideo not longer exists and cannot be updated', '#c4453c');
                        }

                        $('#div_Loader').css('display', 'none');//hide loader
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        Response = 1;
                        $('#div_Loader').css('display', 'none');
                    }
                });

            }
            else {
                if (ValidationAnswer === 1)
                    showAlert('Please, complete the TestVideo Form', '#c4453c');
            }
        }
    }

    return Response;
}

function previewTestVideo_Video(file) {
    //update UI
    var oFReader = new FileReader();

    oFReader.onload = function (oFREvent) {
        document.getElementById("video_TestVideo_Video").src = oFREvent.target.result;

        try {
            document.getElementById("video_TestVideo_Video").play();
            $('#img_TestVideo_Video').css('display', 'none');
            $('#video_TestVideo_Video').css('display', 'block');
        }
        catch (err) {
            //alert(err.message);
        }
    };

    oFReader.readAsDataURL(file);

    $('#span_TestVideo_Video_XFileName').html(file.name);
    //end update UI
}

function uploadTestVideo_Video(sender) {
    var $container = $(sender).closest(".file-container");
    var form = new FormData();
    var file = $container.find("[type='file']").data("object");
    if (!file) {
        showAlert("You must select video file first", "error");
        return;
    }
    form.append("file1", file);
    var settings = {
        "async": true,
        "crossDomain": true,
        "url": APIUrl + '/uploadTestVideo_Video?p_string_CourseXKey=' + CurrentWizardCourse.XKey + '&p_string_TestVideoXKey=&p_string_Author=' + localStorage.getItem("LP_Session_Author"),
        "method": "POST",
        "headers": {
            "cache-control": "no-cache",
        },
        "processData": false,
        "contentType": false,
        "mimeType": "multipart/form-data",
        "data": form
    }

    $.ajax(settings).then(function (data, status, xhr) {
        showAlert("Saved", "success");
        $("#curriculum-tab").trigger("click");
    });
}

function addTestVideo_Video(TestVideo_VideoXKey, file) {
    TestVideo_Video = {};//create object

    //set values
    TestVideo_Video.XKey = TestVideo_VideoXKey;
    TestVideo_Video.TestVideoXKey = TestVideo.XKey;
    TestVideo_Video.XFileName = file.name;
    //end set values

    previewTestVideo_Video(file);
}

function updateTestVideo_Video(file) {
    TestVideo_Video.XFileName = file.name;

    //update UI
    previewTestVideo_Video(file);
    //end update UI
}

//------------------------------------------------------------------------------------------------
function initializeCurriculumSectionWizard() {
    if (CurrentWizardCourse.XKey !== '' && CanInitializeCurriculumSection === true) {

        $('body').append($('#div_Loader'));//append and display loader
        $('#div_Loader').css('display', 'block');

        $.getJSON(APIUrl + '/getAllCurriculumSections?p_string_CourseXKey=' + CurrentWizardCourse.XKey + '&p_string_Mode=GetAllSectionItems')//get CurriculumSections
            .done(function (data) {

                var LecturesOptionsForQuiz = "";

                $.each(data, function (index, CurriculumSection) {//loop collection

                    CurriculumSections.push(CurriculumSection);//insert into local buffer

                    //update UI
                    $('#div_Sections').append("<div id=\"div_CurriculumSectionContainer_" + CurriculumSection.XKey + "\" class=\"LPCurriculumSectionContainer\" onclick=\"selectCurriculumSection('" + CurriculumSection.XKey + "');\"><ul id=\"ul_Section_" + CurriculumSection.XKey + "\" class=\"sortable connectedSortable\" curriculumsectionxkey=\"" + CurriculumSection.XKey + "\"><li listgroup=\"CurriculumSections\"><div id=\"div_CurriculumItemSection_" + CurriculumSection.XKey + "\" class=\"CurriculumItemSection handle\"><div class=\"unpublished-section-wrapper\"><span id=\"span_CurriculumSection_" + CurriculumSection.XKey + "_SectionInfo\" style=\"font-weight:bold\">Unpublished Section</span>&nbsp;<span id=\"span_CurriculumSection_" + CurriculumSection.XKey + "_ListNumber\" style=\"font-weight:bold\">" + CurriculumSection.ListNumber + ":</span>&nbsp;&nbsp;<span id=\"span_CurriculumSection_" + CurriculumSection.XKey + "_Title\">" + CurriculumSection.Title + "</span>&nbsp;<span class=\"glyphicon glyphicon-pencil LPSectionOption\" onclick=\"openCurriculumSection('" + CurriculumSection.XKey + "');\"></span>&nbsp;<span class=\"glyphicon glyphicon-trash LPSectionOption\" onclick=\"deleteCurriculumSection('" + CurriculumSection.XKey + "');\"></span></div><span class=\"glyphicon glyphicon-menu-hamburger LPSectionMoveOption\" style=\"float:right\"></span></div><div id=\"div_CurriculumItemSectionEditForm_" + CurriculumSection.XKey + "\" class=\"CurriculumItemSectionEditForm\"><div class=\"row\"><div class=\"col-md-2\"><span style=\"font-weight:bold\">Section " + CurriculumSection.ListNumber + ":</span></div><div class=\"col-md-10\"><form><div class=\"form-group\"><input id=\"input_SectionTitle_Edit_" + CurriculumSection.XKey + "\" type=\"text\" class=\"form-control\" placeholder=\"Enter a Title\" maxlength = \"80\"></div><div class=\"form-group\"><label>What will students be able to do at the end of this section?*</label><input id=\"input_SectionLearningObjective_" + CurriculumSection.XKey + "\" type=\"text\" class=\"form-control\" placeholder=\"Enter a learning objective\" maxlength = \"200\"></div><button type=\"button\" class=\"CurriculumItemButton\" onclick=\"EditMode_CurriculumSection = 'Edit'; saveCurriculumSection();\">Save Section</button>&nbsp;<button type=\"button\" class=\"CurriculumItemTransparentButton\" onclick=\"$('#div_CurriculumItemSection_" + CurriculumSection.XKey + "').css('display', 'block'); $('#div_CurriculumItemSectionEditForm_" + CurriculumSection.XKey + "').css('display', 'none');\">Cancel</button></form></div></div></div></li></ul></div>");

                    $.each(CurriculumSection.SectionItems, function (index, SectionItem) {

                        var HTMLContent = "";

                        if (SectionItem.KindOfItem === 'Lecture') {
                            //header of SectionItem and first form
                            HTMLContent = "\
                                <li id=\"li_SectionItem_" + SectionItem.XKey + "\" listgroup=\"SectionItems\" kindofitem =\"Lecture\" sectionitemxkey =\"" + SectionItem.XKey + "\"> \
                                    <div id=\"div_SectionItem_" + SectionItem.XKey + "\" class=\"CurriculumItem handle\"> \
                                        <div id=\"div_SectionItemHeader_" + SectionItem.XKey + "\" class=\"LPSectionItemHeader\"> \
                                            <div style=\"float:left\"><span class=\"GreenCircle\">&nbsp;</span><span id=\"span_SectionItemType_" + SectionItem.XKey + "\" style=\"font-weight:bold\">" + SectionItem.KindOfItem + "</span>&nbsp;<span id=\"span_SectionItemKindOfItemListNumber_" + SectionItem.XKey + "\" style=\"font-weight:bold\">" + SectionItem.KindOfItemListNumber + "</span>&nbsp;<span id=\"span_SectionItemIcon_" + SectionItem.XKey + "\" class=\"glyphicon glyphicon-book\"></span>&nbsp;<span id=\"span_SectionItemTitle_" + SectionItem.XKey + "\">" + getSummaryOfSentence(SectionItem.Title, 50) + "</span>&nbsp;<span class=\"glyphicon glyphicon-pencil LPSectionOption\" onclick=\"openSectionItem('" + SectionItem.XKey + "','SectionItemEdit', 'Lecture');\"></span>&nbsp;<span class=\"glyphicon glyphicon-trash LPSectionOption\" onclick=\"deleteSectionItem('" + SectionItem.XKey + "','" + SectionItem.KindOfItem + "');\"></span></div><span class=\"glyphicon glyphicon-menu-hamburger LPSectionMoveOption\" style=\"float:right\"></span> <div id=\"div_SectionItemOptionsHiddenble_" + SectionItem.XKey + "\"><span id=\"span_SectionItemExpandableOption_" + SectionItem.XKey + "\" class=\"glyphicon glyphicon-chevron-down LPSectionVisibleOption\" style=\"float:right;margin-right:10px;padding-top:3px;\" onclick=\"processSectionItemOptions(this,'" + SectionItem.XKey + "');\"></span><button id=\"button_AddContent_" + SectionItem.XKey + "\" class=\"CurriculumItemButton\" style=\"float:right;\" onclick=\"processSectionItemAddContent('" + SectionItem.XKey + "');\">+Add Content</button><span id=\"span_SectionItemStatus_" + SectionItem.XKey + "\" class=\"LPSectionNotDisplayedOption\" style=\"float:right;margin-right:5px\"></span></div> <div id=\"div_ResoursesTab_" + SectionItem.XKey + "\" class=\"LPSectionItemOptionTab\"><strong>Add Resources</strong>&nbsp;<span class=\"glyphicon glyphicon-remove LPSectionVisibleOption\" onclick=\"processSectionItemAddResource('" + SectionItem.XKey + "');\"></span></div> <div id=\"div_ContentTab_" + SectionItem.XKey + "\" class=\"LPSectionItemOptionTab\"><strong id=\"strong_ContentTabTitle_" + SectionItem.XKey + "\">Select content type </strong>&nbsp;<span class=\"glyphicon glyphicon-remove LPSectionVisibleOption\" onclick=\"processSectionItemAddContent('" + SectionItem.XKey + "');\"></span></div> \
                                        </div> \
                                        <div id=\"div_SectionItemAdd_" + SectionItem.XKey + "\" class=\"LPSectionItemAdd\"> \
                                            <div id=\"div_SectionItemDescription_" + SectionItem.XKey + "\" class=\"LPSectionItemDescription LPSectionItemDescription_Panel\" onclick=\"openSectionItem('" + SectionItem.XKey + "', 'SectionItemEditXDescription', 'Lecture');\">" +
                                SectionItem.XDescription +
                                "</div> \
                                            <div id=\"div_SectionItemDescriptionForm_" + SectionItem.XKey + "\" class=\"LPSectionItemDescription\"> \
                                                <div class=\"row\"> \
                                                    <div class=\"col-md-12\"> \
                                                        <p>Lecture Description*</p> \
                                                        <form> \
                                                            <div class=\"form-group\"> \
                                                                <textarea id=\"textarea_SectionItemXDescription_" + SectionItem.XKey + "\" class=\"form-control TinymceSimple\" placeholder=\"Add a description, include what students will be able to do after completing the lecture.\"></textarea> \
                                                            </div> \
                                                            <button type=\"button\" class=\"CurriculumItemButton CurriculumItemButton_Right\" onclick=\"EditMode_SectionItem = 'Edit'; saveSectionItem('Lecture', 'SectionItemEditXDescription', '" + SectionItem.XKey + "');\">Save</button> &nbsp; <button type=\"button\" class=\"CurriculumItemTransparentButton CurriculumItemTransparentButton_Right\" onclick=\"processSectionItemAddDescription('" + SectionItem.XKey + "');\">Cancel</button> \
                                                        </form> \
                                                    </div> \
                                                </div> \
                                            </div>";
                            //end of header of SectionItem and first form

                            //SectionItemContents
                            HTMLContent += "\
                                            <div id=\"div_SectionItemContents_" + SectionItem.XKey + "\" class=\"LPSectionItemDescription\" style=\"display:block\"> \
                                                <div id=\"row_SectionItemContents_" + SectionItem.XKey + "\" class=\"row\">";

                            if (SectionItem.SectionItemContent) {
                                HTMLContent += "<div id=\"div_Content_" + SectionItem.SectionItemContent.XKey + "\" class=\"col-md-12\"> \
                                                        <div id=\"div_Row_Content_" + SectionItem.SectionItemContent.XKey + "\" class=\"row LPRowContent\"> \
                                                            <div class=\"col-md-3\"> \
                                                                <div id=\"div_ContentIcon_" + SectionItem.SectionItemContent.XKey + "\" class=\"LPContentIcon\"></div> \
                                                            </div> \
                                                            <div id=\"div_SectionItemContentDetails_" + SectionItem.XKey + "\" class=\"col-md-5\">";

                                HTMLContent += processSectionItemContentDetails(SectionItem);

                                HTMLContent += "</div> \
                                                            <div class=\"col-md-4\">";

                                if (CurrentWizardCourse.XStatus === 'Approved') {
                                    if (SectionItem.Published === 'No')
                                        HTMLContent += "<button type=\"button\" class=\"LPButton_GreenNew LPRight\" onclick=\"processPublishStatusForSectionItem(this,'" + SectionItem.XKey + "');\">Publish</button>";

                                    if (SectionItem.Published === 'Yes')
                                        HTMLContent += "<button type=\"button\" class=\"LPButton_WhiteNew LPRight\" onclick=\"processPublishStatusForSectionItem(this,'" + SectionItem.XKey + "');\">Unpublish</button>";
                                }

                                HTMLContent += "<button type=\"button\" class=\"LPButton_GreenNew LPRight\" onclick=\"window.location = 'Page_StudentModule_CoursePlayer.html?CourseXKey=" + CurrentWizardCourse.XKey + "&SectionItemToPlay=" + SectionItem.XKey + "&CoursePlayerMode=Review&XMode=TeacherPreview';\">Preview</button>";

                                //---
                                var DisplayClassSectionItemContentSwitches = '';

                                var CheckedStatusFreePreview = '';

                                var CheckedStatusDownloadable = '';
                                
                                if (CurrentWizardCourse.XStatus === 'Approved') {
                                    if (SectionItem.Published === 'No')
                                        DisplayClassSectionItemContentSwitches = 'LPDisplay_None';
                                }

                                if (SectionItem.SectionItemContent.FreePreview === 'Yes')
                                    CheckedStatusFreePreview = 'checked';

                                if (SectionItem.SectionItemContent.Downloadable === 'Yes')
                                    CheckedStatusDownloadable = 'checked';
                                
                                HTMLContent += "<div class=\"LPRight LPToggleOption " + DisplayClassSectionItemContentSwitches + "\"> \
                                                                    Free Preview &nbsp;\
                                                                    <label class=\"switch2\"> \
                                                                        <input type=\"checkbox\" id=\"input_FreePreview_" + SectionItem.SectionItemContent.XKey + "\" " + CheckedStatusFreePreview + " onclick=\"processSectionItemContentSwitches('" + SectionItem.SectionItemContent.XKey + "');\"> \
                                                                        <div class=\"slider2 round\"></div> \
                                                                    </label> \
                                                                </div>";

                                if (SectionItem.SectionItemContent.KindOfContent === 'Video' || SectionItem.SectionItemContent.KindOfContent === 'Audio' || SectionItem.SectionItemContent.KindOfContent === 'Document' || SectionItem.SectionItemContent.KindOfContent === 'Presentation')
                                    HTMLContent += "<div class=\"LPRight LPToggleOption " + DisplayClassSectionItemContentSwitches + "\"> \
                                                                    Downloadable &nbsp;\
                                                                    <label class=\"switch2\"> \
                                                                        <input type=\"checkbox\" id=\"input_Downloadable_" + SectionItem.SectionItemContent.XKey + "\" " + CheckedStatusDownloadable + " onclick=\"processSectionItemContentSwitches('" + SectionItem.SectionItemContent.XKey + "');\"> \
                                                                        <div class=\"slider2 round\"></div> \
                                                                    </label> \
                                                                </div>";
                                //---

                                HTMLContent += "</div>\
                                                        </div> \
                                                    </div>";
                            }

                            HTMLContent += "</div> \
                                            </div> ";
                            //End of SectionItemContents

                            //Video Captions
                            HTMLContent += "\
                                            <div id=\"div_SectionItemVideoCaptions_" + SectionItem.XKey + "\" class=\"LPSectionItemDescription LPRowContent\" style=\"display:block;\"> \
                                                <div class=\"row\"> \
                                                    <div class=\"col-md-12\"> \
                                                        <p style=\"font-weight:bold\">Captions</p> \
                                                        <table id=\"table_SectionItemCaptions_" + SectionItem.XKey + "\" class=\"table LPSectionItemDownloadablesTable\"> \
                                                            <tbody>";

                            $.each(SectionItem.SectionItemVideoCaptions, function (index, SectionItemVideoCaption) {
                                HTMLContent += "<tr id=\"tr_VideoCaption_" + SectionItemVideoCaption.XKey + "\"> \
                                                                    <td><span class=\"glyphicon glyphicon-globe\"></span>&nbsp;" + SectionItemVideoCaption.XLanguage + "&nbsp;<strong>(" + getSummaryOfSentence(SectionItemVideoCaption.XFileName, 60) + ")</strong>&nbsp;<span class=\"glyphicon glyphicon-trash LPSectionVisibleOption\" style=\"float:right\" onclick=\"deleteSectionItemVideoCaption('" + SectionItemVideoCaption.XKey + "','" + SectionItem.XKey + "','" + SectionItemVideoCaption.XFileName + "');\"></span></td> \
                                                                 </tr>";
                            });

                            HTMLContent += "\
                                                            </tbody> \
                                                        </table> \
                                                    </div> \
                                                </div> \
                                            </div>";
                            //End Video Captions

                            //SectionItemResources
                            HTMLContent += "\
                                            <div id=\"div_SectionItemDownloadableMaterials_" + SectionItem.XKey + "\" class=\"LPSectionItemDescription LPRowContent\" style=\"display:block;\"> \
                                                <div class=\"row\"> \
                                                    <div class=\"col-md-12\"> \
                                                        <p style=\"font-weight:bold\">Downloadable materials</p> \
                                                        <table id=\"table_SectionItemDownloadableResources_" + SectionItem.XKey + "\" class=\"table LPSectionItemDownloadablesTable\"> \
                                                            <tbody>";

                            $.each(SectionItem.SectionItemResources, function (index, SectionItemResource) {
                                HTMLContent += "<tr id=\"tr_Resources_" + SectionItemResource.XKey + "\"> \
                                                                    <td><span class=\"glyphicon glyphicon-save\"></span>&nbsp;" + getSummaryOfSentence(SectionItemResource.XFileName, 60) + "&nbsp;<span class=\"glyphicon glyphicon-trash LPSectionVisibleOption\" style=\"float:right\" onclick=\"deleteSectionItemResource('" + SectionItemResource.XKey + "','" + SectionItem.XKey + "','" + SectionItemResource.XFileName + "');\"></span></td> \
                                                                </tr>";
                            });

                            HTMLContent += "\
                                                           </tbody> \
                                                        </table> \
                                                    </div> \
                                                </div> \
                                            </div>";
                            //End of SectionItemResources


                            HTMLContent += "\
                                            <div id=\"div_SectionItemAddOptions_" + SectionItem.XKey + "\" class=\"LPSectionItemOptions\"> \
                                                <button id=\"button_AddDescription_" + SectionItem.XKey + "\" class=\"btn LPButton_SubmitWHite\" onclick=\"openSectionItem('" + SectionItem.XKey + "', 'SectionItemAddXDescription');\">Add Description</button>&nbsp;<button class=\"btn LPButton_SubmitWHite\" onclick=\"processSectionItemAddResource('" + SectionItem.XKey + "');\">Add Resources</button>&nbsp<button id=\"button_addVideoCaptions_" + SectionItem.XKey + "\" class=\"btn LPButton_SubmitWHite\" onclick=\"processSectionItemAddVideoCaptions('" + SectionItem.XKey + "');\">Add Captions</button> \
                                            </div> \
                                        </div> \
                                        <div id=\"div_SectionItemAddResource_" + SectionItem.XKey + "\" class=\"LPSectionItemDescription\" > \
                                            <div class=\"row\"> \
                                                <div class=\"col-md-12\"> \
                                                    <p>Downloadable file</p> \
                                                    <form id=\"form_UploadSectionItemResource_" + SectionItem.XKey + "\" class=\"upload\" style=\"margin-top:0px;\" method=\"post\" action=\"\" enctype=\"multipart/form-data\"> \
                                                        <div class=\"LPUploadControl\"> \
                                                            <div class=\"myProgress\"> \
                                                                <div class=\"myBar\"></div> \
                                                                <span id=\"span_SectionItemResource_XFileName_" + SectionItem.XKey + "\" class=\"LPUploadControlFileName\">No file selected</span> \
                                                                <span class=\"glyphicon glyphicon-remove LPUploadCancel\"></span> \
                                                            </div> \
                                                            <button class=\"LPUploadButton\" type=\"button\" onclick=\"uploadSectionItemResource(this, '" + SectionItem.XKey + "');\">Upload File</button> \
                                                            <input id=\"input_SectionItemResourceFile_" + SectionItem.XKey + "\" type= \"file\" style=\"visibility:hidden;\" multiple onchange= \"setUploadSectionItemResourceFormAction('" + SectionItem.XKey + "')\" /> \
                                                            <span class=\"LPUploadMode\" style=\"display:none\"></span> \
                                                            <span class=\"SectionItemXKey\" style=\"display:none\"></span> \
                                                        </div> \
                                                        <p style=\"font-size:12px;margin-top:5px;\"> <strong>Tip</strong>: A resource is for any type of document that can be used to help students in the lecture. This file is going to be seen as a lecture extra. Make sure everything is legible and the file size is less than 1 GiB.</p> \
                                                    </form> \
                                                </div>\
                                            </div> \
                                        </div> \
                                        <div id=\"div_SectionItemAddContent_" + SectionItem.XKey + "\" class=\"LPSectionItemDescription\"> \
                                            <div id=\"div_ContentTypes_" + SectionItem.XKey + "\"> \
                                                <div class=\"row\"> \
                                                    <div class=\"col-md-2\"> \
                                                        <div class=\"LPMediaCard\" onclick=\"processAddContentUpload('" + SectionItem.XKey + "', 'Video');\"> \
                                                            <div class=\"LPMediaCardImage\" style=\"background-image:url('images/video-play-3-xxl.png'); background-size:contain; background-repeat:no-repeat;\"></div> \
                                                            <div class=\"LPMediaCardFooter\">Video</div> \
                                                        </div> \
                                                    </div> \
                                                    <div class=\"col-md-2\"> \
                                                        <div class=\"LPMediaCard\" onclick=\"processAddContentUpload('" + SectionItem.XKey + "', 'Audio');\"> \
                                                            <div class=\"LPMediaCardImage\" style=\"background-image:url('images/headphone.png');\"></div> \
                                                            <div class=\"LPMediaCardFooter\">Audio</div> \
                                                        </div> \
                                                    </div> \
                                                    <div class=\"col-md-2\"> \
                                                        <div class=\"LPMediaCard\" onclick=\"processAddContentUpload('" + SectionItem.XKey + "', 'Presentation');\"> \
                                                            <div class=\"LPMediaCardImage\" style=\"background-image:url('images/presentation.png');\"></div> \
                                                            <div class=\"LPMediaCardFooter\">Presentation</div> \
                                                        </div> \
                                                    </div> \
                                                    <div class=\"col-md-2\"> \
                                                        <div class=\"LPMediaCard\" onclick=\"processAddContentUpload('" + SectionItem.XKey + "', 'Document');\"> \
                                                            <div class=\"LPMediaCardImage\" style=\"background-image:url('images/pdf.png');\"></div> \
                                                            <div class=\"LPMediaCardFooter\">Document</div> \
                                                        </div> \
                                                    </div> \
                                                    <div class=\"col-md-2\"> \
                                                        <div class=\"LPMediaCard\" onclick=\"processAddContentUpload('" + SectionItem.XKey + "', 'Text');\"> \
                                                            <div class=\"LPMediaCardImage\" style=\"background-image:url('images/article.png');\"></div> \
                                                            <div class=\"LPMediaCardFooter\">Text</div> \
                                                        </div> \
                                                    </div> \
                                                    <div class=\"col-md-2\"> \
                                                        <div class=\"LPMediaCard\" onclick=\"processAddContentUpload('" + SectionItem.XKey + "', 'Link');\"> \
                                                            <div class=\"LPMediaCardImage\" style=\"background-image:url('images/Link.png');\"></div> \
                                                            <div class=\"LPMediaCardFooter\">Embed Link</div> \
                                                        </div> \
                                                    </div> \
                                                </div> \
                                            </div> \
                                            <div id=\"div_AddContentUpload_" + SectionItem.XKey + "\" class=\"LPSectionItemDescription\"> \
                                                <div class=\"row\"> \
                                                    <div class=\"col-md-12\"> \
                                                        <form id=\"form_UploadSectionItemContent_" + SectionItem.XKey + "\" class=\"upload\" style=\"margin-top:0px;\" method=\"post\" action=\"\" enctype=\"multipart/form-data\"> \
                                                            <div id=\"div_SectionItemVideoCaptionXLanguage_" + SectionItem.XKey + "\" style=\"margin-bottom:5px;\"> \
                                                                <label>Locale</label> \
                                                                <select id=\"select_SectionItemVideoCaptionXLanguage_" + SectionItem.XKey + "\" class=\"LPUploadSelect\"> \
                                                                    <option value=\"Select\" selected>Select</option> \
                                                                    <option value=\"English (US)\">English (US)</option> \
                                                                    <option value=\"Spanish (ES)\">Spanish (ES)</option> \
                                                                </select>\
                                                            </div> \
                                                            <div id=\"div_LPUploadControl_" + SectionItem.XKey + "\" class=\"LPUploadControl\"> \
                                                                <div class=\"myProgress\"> \
                                                                    <div class=\"myBar\"></div> \
                                                                    <span id=\"span_SectionItemContent_XFileName_" + SectionItem.XKey + "\" class=\"LPUploadControlFileName\">No file selected</span> \
                                                                    <span class=\"glyphicon glyphicon-remove LPUploadCancel\"></span> \
                                                                </div> \
                                                                <button id=\"button_UploadContent_" + SectionItem.XKey + "\" class=\"LPUploadButton\" type=\"button\" onclick=\"if($('#span_PreXMode_" + SectionItem.XKey + "').text() === 'New' || $('#span_PreXMode_" + SectionItem.XKey + "').text() === 'Edit'){ uploadSectionItemContent(this, '" + SectionItem.XKey + "');} if($('#span_PreXMode_" + SectionItem.XKey + "').text() === 'NewVideoCaption'){uploadSectionItemVideoCaption(this, '" + SectionItem.XKey + "');}\">Upload File</button> \
                                                                <input id=\"input_SectionItemContentFile_" + SectionItem.XKey + "\" type= \"file\" style=\"visibility:hidden;\" multiple onchange= \"if($('#span_UploadChannel_" + SectionItem.XKey + "').text() === 'Content'){setUploadSectionItemContentFormAction('" + SectionItem.XKey + "','');} if($('#span_UploadChannel_" + SectionItem.XKey + "').text() === 'VideoCaption'){setUploadSectionItemVideoCaptionFormAction('" + SectionItem.XKey + "');}\" /> \
                                                                <span class=\"LPUploadMode\" style=\"display:none\"></span> \
                                                                <span class=\"SectionItemXKey\" style=\"display:none\"></span> \
                                                                <span id=\"span_SectionItemContentXKeyFor_" + SectionItem.XKey + "\" class=\"SectionItemContentXKey\" style=\"display:none\"></span> \
                                                                <span id=\"span_KindOfContent_" + SectionItem.XKey + "\" style=\"display:none\"></span> \
                                                                <span id=\"span_PreXMode_" + SectionItem.XKey + "\" style=\"display:none\"></span> \
                                                                <span id=\"span_VideoCaptionXLanguage_" + SectionItem.XKey + "\" style=\"display:none\"></span> \
                                                                <span id=\"span_UploadChannel_" + SectionItem.XKey + "\" style=\"display:none\"></span> \
                                                            </div> \
                                                            <div id=\"div_SectionItemContentText_" + SectionItem.XKey + "\" class=\"LPSectionItemDescription\"> \
                                                                <textarea id=\"textarea_SectionItemContentText_" + SectionItem.XKey + "\" class=\"form-control Tinymce\" placeholder=\"Write your content here\"> </textarea> \
                                                                <br/> \
                                                                <div class=\"row\"> \
                                                                    <div class=\"col-md-12\"> \
                                                                        <button type=\"button\" class=\"CurriculumItemButton CurriculumItemButton_Right\" onclick=\"saveSectionItemContent_Text('" + SectionItem.XKey + "');\">Save</button>&nbsp<button type=\"button\" class=\"CurriculumItemTransparentButton CurriculumItemTransparentButton_Right\" onclick=\"processSectionItemAddContent('" + SectionItem.XKey + "');\">Cancel</button> \
                                                                    </div> \
                                                                </div> \
                                                            </div> \
                                                            <div id=\"div_SectionItemContentLink_" + SectionItem.XKey + "\" class=\"LPSectionItemDescription\"> \
                                                                <input id=\"input_SectionItemContentLink_" + SectionItem.XKey + "\" class=\"form-control\" placeholder=\"Write your link here\"> \
                                                                <br/> \
                                                                <div class=\"row\"> \
                                                                    <div class=\"col-md-12\"> \
                                                                        <button type=\"button\" class=\"CurriculumItemButton CurriculumItemButton_Right\" onclick=\"saveSectionItemContent_Link('" + SectionItem.XKey + "');\">Save</button>&nbsp<button type=\"button\" class=\"CurriculumItemTransparentButton CurriculumItemTransparentButton_Right\" onclick=\"processSectionItemAddContent('" + SectionItem.XKey + "');\">Cancel</button> \
                                                                    </div> \
                                                                </div> \
                                                            </div> \
                                                            <p id=\"p_UploadContent_" + SectionItem.XKey + "\" style=\"font-size:12px;margin-top:5px;\"> </p> \
                                                        </form> \
                                                    </div>\
                                                </div> \
                                            </div> \
                                        </div > \
                                    </div> \
                                    <div id=\"div_SectionItemEditForm_" + SectionItem.XKey + "\" class=\"CurriculumItemEditForm\"> \
                                        <div class=\"row\"> \
                                            <div class=\"col-md-2\"> \
                                                <span class=\"GreenCircle\">&nbsp;</span><span id=\"span_SectionItemFormTitle_" + SectionItem.XKey + "\" style=\"font-weight:bold;\">" + SectionItem.KindOfItem + " " + SectionItem.KindOfItemListNumber + ":</span> \
                                            </div> \
                                            <div class=\"col-md-10\"> \
                                                <form> \
                                                    <div class=\"form-group\"> \
                                                        <input id=\"input_SectionItemTitle_" + SectionItem.XKey + "\" type=\"text\" class=\"form-control\" placeholder=\"Enter a Title\" maxlength=\"80\"> \
                                                    </div> \
                                                    <button type=\"button\" class=\"CurriculumItemButton\" onclick=\"EditMode_SectionItem = 'Edit'; saveSectionItem('Lecture', 'SectionItemEdit', '" + SectionItem.XKey + "');\">Save Lecture</button> &nbsp; <button type=\"button\" class=\"CurriculumItemTransparentButton\" onclick=\"processSectionItemEdit('" + SectionItem.XKey + "');\">Cancel</button> \
                                                </form> \
                                            </div> \
                                        </div> \
                                    </div> \
                               </li>";

                            $('#ul_Section_' + CurriculumSection.XKey).append(HTMLContent);

                            checkSectionItemXDescription(SectionItem);
                            checkSectionItemContentsLength(SectionItem);
                            checkSectionItemContentsTypeForIcon(SectionItem);
                            checkSectionItemContentsThumbnail(SectionItem, 'Server Side', File);
                            checkSectionItemVideoCaptionsLength(SectionItem);
                            checkSectionItemResourcesLength(SectionItem);

                            //add this lecture as an option for Quiz
                            LecturesOptionsForQuiz += "<option value=\"" + SectionItem.XKey + "\">" + SectionItem.Title + "</option>";
                        }

                        if (SectionItem.KindOfItem === 'Quiz') {
                            //header of SectionItem and first form
                            HTMLContent = "\
                                <li id=\"li_SectionItem_" + SectionItem.XKey + "\" listgroup=\"SectionItems\" kindofitem =\"Quiz\" sectionitemxkey =\"" + SectionItem.XKey + "\"> \
                                    <div id=\"div_SectionItem_" + SectionItem.XKey + "\" class=\"CurriculumItem handle\"> \
                                        <div id=\"div_SectionItemHeader_" + SectionItem.XKey + "\" class=\"LPSectionItemHeader\"> \
                                            <div style=\"float:left\"><span class=\"GreenCircle\">&nbsp;</span><span id=\"span_SectionItemType_" + SectionItem.XKey + "\" style=\"font-weight:bold\">" + SectionItem.KindOfItem + "</span>&nbsp;<span id=\"span_SectionItemKindOfItemListNumber_" + SectionItem.XKey + "\" style=\"font-weight:bold\">" + SectionItem.KindOfItemListNumber + "</span>&nbsp;<span id=\"span_SectionItemIcon_" + SectionItem.XKey + "\" class=\"glyphicon glyphicon-ok\"></span>&nbsp;<span id=\"span_SectionItemTitle_" + SectionItem.XKey + "\">" + getSummaryOfSentence(SectionItem.Title, 50) + "</span>&nbsp;<span class=\"glyphicon glyphicon-pencil LPSectionOption\" onclick=\"openSectionItem('" + SectionItem.XKey + "','SectionItemEdit', 'Quiz');\"></span>&nbsp;<span class=\"glyphicon glyphicon-trash LPSectionOption\" onclick=\"deleteSectionItem('" + SectionItem.XKey + "','" + SectionItem.KindOfItem + "');\"></span></div><span class=\"glyphicon glyphicon-menu-hamburger LPSectionMoveOption\" style=\"float:right\"></span> <div id=\"div_SectionItemOptionsHiddenble_" + SectionItem.XKey + "\"><span id=\"span_SectionItemExpandableOption_" + SectionItem.XKey + "\" class=\"glyphicon glyphicon-chevron-down LPSectionNotDisplayedOption\" style=\"float:right;margin-right:10px;padding-top:3px;\" onclick=\"processSectionItemOptions(this,'" + SectionItem.XKey + "');\"></span><button id=\"button_AddQuizQuestions_" + SectionItem.XKey + "\" class=\"CurriculumItemButton\" style=\"float:right;\" onclick=\"processSectionItemAddQuizQuestion('" + SectionItem.XKey + "');\">+Add Questions</button><span id=\"span_SectionItemStatus_" + SectionItem.XKey + "\" class=\"LPSectionNotDisplayedOption\" style=\"float:right;margin-right:5px\"></span></div><div id=\"div_QuizQuestionTab_" + SectionItem.XKey + "\" class=\"LPSectionItemOptionTab\"><strong id=\"strong_QuizQuestionTypeTabTitle_" + SectionItem.XKey + "\">Select question type </strong>&nbsp;<span class=\"glyphicon glyphicon-remove LPSectionVisibleOption\" onclick=\"processSectionItemAddQuizQuestion('" + SectionItem.XKey + "');\"></span></div> \
                                        </div> \
                                        <div id=\"div_SectionItemAdd_" + SectionItem.XKey + "\" class=\"LPSectionItemAdd\">";
                            //end of header of SectionItem and first form

                            //Quiz Questions
                            var ButtonPublish = '';

                            if (CurrentWizardCourse.XStatus === 'Approved') {
                                if (SectionItem.Published === 'No')
                                    ButtonPublish = "<button type=\"button\" class=\"LPButton_GreenNew LPRight\" onclick=\"processPublishStatusForSectionItem(this,'" + SectionItem.XKey + "');\">Publish</button>";

                                if (SectionItem.Published === 'Yes')
                                    ButtonPublish = "<button type=\"button\" class=\"LPButton_WhiteNew LPRight\" onclick=\"processPublishStatusForSectionItem(this,'" + SectionItem.XKey + "');\">Unpublish</button>";
                            }

                            HTMLContent += "\
                                            <div id=\"div_SectionItemQuizQuestions_" + SectionItem.XKey + "\" class=\"LPSectionItemDescription LPRowContent\" style=\"display:block\"> \
                                                <div class=\"row\"> \
                                                    <div class=\"col-md-12\"> \
                                                        <p style=\"font-size: 16px;color:#515f75;\">Questions&nbsp;<button class=\"LPButton_WhiteNew\" onclick=\"processSectionItemAddQuizQuestion('" + SectionItem.XKey + "');\">+New Question</button>&nbsp;<button class=\"LPButton_GreenNew\" onclick=\"window.location = 'Page_StudentModule_CoursePlayer.html?CourseXKey=" + CurrentWizardCourse.XKey + "&SectionItemToPlay=" + SectionItem.XKey + "&CoursePlayerMode=Review&XMode=TeacherPreview';\">Preview</button>&nbsp;" + ButtonPublish + "</p> \
                                                        <ul id=\"ul_SectionItemQuizQuestions_" + SectionItem.XKey + "\" class=\"sortable_Questions\" sectionitemxkey = \"" + SectionItem.XKey + "\">";
                            //load Quiz Questions
                            $.each(CurriculumSection.SectionItems[index].QuizQuestions, function (index_Local, QuizQuestion) {
                                HTMLContent += "<li id=\"li_QuizQUestion_" + QuizQuestion.XKey + "\" class=\"ui-state-default\" quizquestionxkey=\"" + QuizQuestion.XKey + "\"><div class=\"LPQuestionSummary handle_Question\" onmouseover= \"$(this).next().css('visibility','visible');\" onmouseout= \"$(this).next().css('visibility','hidden');\"><strong id=\"strong_QuizQuestionListNumber_" + QuizQuestion.XKey + "\">" + QuizQuestion.ListNumber + ".</strong>&nbsp;<span id=\"span_QuizQuestionQuestionSummary_" + QuizQuestion.XKey + "\">" + getSummaryOfSentence(getTextContentFromHTML(QuizQuestion.Question), 80) + "</span>&nbsp;<span style=\"color:hsla(0, 2%, 27%, 0.45);\">" + QuizQuestion.KindOfQuestion + "</span></div><div class=\"SortableMenuToggle\" style=\"float:right;\" onmousemove=\"$(this).css('visibility', 'visible');\" onmouseout=\"$(this).css('visibility','hidden');\"><div type=\"button\" class=\"btn btn-default\" onclick=\"openQuizQuestion('" + QuizQuestion.XKey + "');\"><span class=\"glyphicon glyphicon-pencil\"></span></div><div type=\"button\" class=\"btn btn-default\" onclick=\"deleteQuizQuestion('" + SectionItem.XKey + "','" + QuizQuestion.XKey + "');\"><span class=\"glyphicon glyphicon-trash\"></span></div><div type=\"button\" class=\"btn btn-default LPDragandDrop handle_Question\"><span class=\"glyphicon glyphicon-menu-hamburger\"></span></div></div></li>";
                            });
                            //end load Quiz Questions

                            HTMLContent += "\
                                                        </ul> \
                                                    </div> \
                                                </div> \
                                            </div>";
                            //End Quiz Questions


                            HTMLContent += "\
                                        </div> \
                                        <div id=\"div_SectionItemAddQuizQuestion_" + SectionItem.XKey + "\" class=\"LPSectionItemDescription\"> \
                                             <div id=\"div_QuizQuestionTypes_" + SectionItem.XKey + "\"> \
                                                <div class=\"row\"> \
                                                    <div class=\"col-md-6\"> \
                                                        <div class=\"LPMediaCard\" onclick=\"processAddQuizQuestion('" + SectionItem.XKey + "', 'Single Answer');\"> \
                                                            <div class=\"LPMediaCardImage\" style=\"background-image:url('images/single answer.png'); background-size:contain; background-repeat:no-repeat;\"></div> \
                                                            <div class=\"LPMediaCardFooter\">Single Answer</div> \
                                                        </div> \
                                                    </div> \
                                                    <div class=\"col-md-6\"> \
                                                        <div class=\"LPMediaCard\" onclick=\"processAddQuizQuestion('" + SectionItem.XKey + "', 'Multiple Choice');\"> \
                                                            <div class=\"LPMediaCardImage\" style=\"background-image:url('images/multichoice_question_icon.png');\"></div> \
                                                            <div class=\"LPMediaCardFooter\">Multiple Choice</div> \
                                                        </div> \
                                                    </div> \
                                                </div> \
                                             </div> \
                                             <div id=\"div_AddQuizQuestionFormulary_" + SectionItem.XKey + "\" class=\"LPSectionItemDescription\"> \
                                                <div class=\"row\"> \
                                                    <div class=\"col-md-12\"> \
                                                        <form id=\"form_SingleAnswer_" + SectionItem.XKey + "\"> \
                                                            <div class=\"form-group\"> \
                                                                <label>Question:*</label> \
                                                                <textarea id=\"textarea_QuizQuestion_SingleAnswer_" + SectionItem.XKey + "\" class=\"form-control TinymceSimple\" placeholder=\"Write a question, use rich content to make clear your question\"></textarea> \
                                                            </div> \
                                                            <div class=\"form-group\"> \
                                                                <label>Correct Answer:*</label> \
                                                                <textarea id=\"textarea_QuizQuestion_RightAnswer_" + SectionItem.XKey + "\" class=\"form-control\" placeholder=\"Write the right answer\"></textarea> \
                                                            </div> \
                                                            <div class=\"form-group\"> \
                                                                <label>Related lecture:</label>&nbsp;Select a related video lecture to help students answer this question. \
                                                                <select id=\"select_RelatedLecture_SingleAnswer_" + SectionItem.XKey + "\" class=\"form-control RelatedLecture\"> \
                                                                    <option value=\"Select\">Select</option>";
                            //Load previous SectionItems Lectures 
                            HTMLContent += LecturesOptionsForQuiz;
                            //End Load SectionItems Lectures
                            HTMLContent += "</select> \
                                                            </div> \
                                                            <div class=\"form-group\"> \
                                                                <label>Time Limit (in minutes) for this question:</label> (0 means no time limit) <br/> \
                                                                <input type=\"number\" id=\"input_TimeLimit_SingleAnswer_" + SectionItem.XKey + "\" class=\"form-control\" min=\"0\" /> \
                                                            </div> \
                                                            <button type=\"button\" class=\"CurriculumItemButton CurriculumItemButton_Right\" onclick=\"saveQuizQuestion('Single Answer','" + SectionItem.XKey + "', $('#span_QuizQuestionXKeyFor_SingleAnswer_" + SectionItem.XKey + "').text());\">Save</button> &nbsp; <button type=\"button\" class=\"CurriculumItemTransparentButton CurriculumItemTransparentButton_Right\" onclick=\"processSectionItemAddQuizQuestion('" + SectionItem.XKey + "');\">Cancel</button> \
                                                            <span id=\"span_PreXMode_SingleAnswer_" + SectionItem.XKey + "\" style=\"display:none\"></span> \
                                                            <span id=\"span_QuizQuestionXKeyFor_SingleAnswer_" + SectionItem.XKey + "\" style=\"display:none\"></span> \
                                                        </form> \
                                                        <form id=\"form_MultipleChoice_" + SectionItem.XKey + "\"> \
                                                            <div class=\"form-group\"> \
                                                                <label>Question:*</label> \
                                                                <textarea id=\"textarea_QuizQuestion_MultipleChoice_" + SectionItem.XKey + "\" class=\"form-control TinymceSimple\" placeholder=\"Write a question, use rich content to make clear your question\"></textarea> \
                                                            </div> \
                                                            <div class=\"form-group\"> \
                                                                <label>Answers:*</label>&nbsp;Write up to 15 possible answers and indicate which one is the best.\
                                                            </div> \
                                                            <div class=\"form-group\">\
                                                                <div id=\"div_MultipleChoices_" + SectionItem.XKey + "\">\
                                                                    \
                                                                </div> \
                                                            </div>\
                                                            <br/> \
                                                            <div class=\"form-group\"> \
                                                                <label>Related lecture:</label>&nbsp;Select a related video lecture to help students answer this question. \
                                                                <select id=\"select_RelatedLecture_MultipleChoice_" + SectionItem.XKey + "\" class=\"form-control RelatedLecture\"> \
                                                                    <option value=\"Select\">Select</option>";
                            //Load previous SectionItems Lectures
                            HTMLContent += LecturesOptionsForQuiz;
                            //End Load SectionItems Lectures
                            HTMLContent += "</select> \
                                                            </div> \
                                                            <div class=\"form-group\"> \
                                                                <label>Time Limit (in minutes) for this question:</label> (0 means no time limit) <br/> \
                                                                <input type=\"number\" id=\"input_TimeLimit_MultipleChoice_" + SectionItem.XKey + "\" class=\"form-control\" min=\"0\" /> \
                                                            </div> \
                                                            <button type=\"button\" class=\"CurriculumItemButton CurriculumItemButton_Right\" onclick=\"saveQuizQuestion('Multiple Choice', '" + SectionItem.XKey + "', $('#span_QuizQuestionXKeyFor_MultipleChoice_" + SectionItem.XKey + "').text());\">Save</button> &nbsp; <button type=\"button\" class=\"CurriculumItemTransparentButton CurriculumItemTransparentButton_Right\" onclick=\"processSectionItemAddQuizQuestion('" + SectionItem.XKey + "');\">Cancel</button> \
                                                            <span id=\"span_PreXMode_MultipleChoice_" + SectionItem.XKey + "\" style=\"display:none\"></span> \
                                                            <span id=\"span_QuizQuestionXKeyFor_MultipleChoice_" + SectionItem.XKey + "\" style=\"display:none\"></span> \
                                                        </form> \
                                                   </div>\
                                                </div> \
                                             </div> \
                                         </div > \
                                     </div> \
                                     <div id=\"div_SectionItemEditForm_" + SectionItem.XKey + "\" class=\"CurriculumItemEditForm\"> \
                                        <div class=\"row\"> \
                                            <div class=\"col-md-2\"> \
                                                <span class=\"GreenCircle\">&nbsp;</span><span id=\"span_SectionItemFormTitle_" + SectionItem.XKey + "\" style=\"font-weight:bold;\">" + SectionItem.KindOfItem + " " + SectionItem.KindOfItemListNumber + ":</span> \
                                            </div> \
                                            <div class=\"col-md-10\"> \
                                                <form> \
                                                    <div class=\"form-group\"> \
                                                        <input id=\"input_SectionItemTitle_" + SectionItem.XKey + "\" type=\"text\" class=\"form-control\" placeholder=\"Enter a Title\" maxlength=\"80\"> \
                                                    </div> \
                                                    <div class=\"form-group\"> \
                                                        <textarea id=\"textarea_SectionItemXDescription_" + SectionItem.XKey + "\" class=\"form-control TinymceSimple\" placeholder=\"Description\"></textarea> \
                                                    </div> \
                                                    <button type=\"button\" class=\"CurriculumItemButton\" onclick=\"EditMode_SectionItem = 'Edit'; saveSectionItem('Quiz', 'SectionItemEdit', '" + SectionItem.XKey + "');\">Save Quiz</button> &nbsp; <button type=\"button\" class=\"CurriculumItemTransparentButton\" onclick=\"processSectionItemEdit('" + SectionItem.XKey + "');\">Cancel</button> \
                                                </form> \
                                            </div> \
                                        </div> \
                                     </div> \
                                 </li>";

                            $('#ul_Section_' + CurriculumSection.XKey).append(HTMLContent);

                            checkSectionItemQuizQuestionsLength(SectionItem);
                        }
                    });

                    checkCurriculumSectionSectionItemsLength(CurriculumSection); //validate CurriculumSection

                    //end of update the UI
                });

                //plugins initilizations
                initializeSorting();
                initializeUploadWidget();
                initTinymceEditors();
                initTinymceSimpleEditors();
                //end of plugins inializations

                CanInitializeCurriculumSection = false;

                $('#div_Loader').css('display', 'none');//hide the loader
            })
            .fail(function (jqXHR, textStatus, err) {
                $('#div_Loader').css('display', 'none');
            });
    }
}

function checkCurriculumSectionSectionItemsLength(CurriculumSection) {
    if (CurriculumSection.SectionItems.length === 0)
        $('#span_CurriculumSection_' + CurriculumSection.XKey + '_SectionInfo').html('Unpublished Section:');
    else
        $('#span_CurriculumSection_' + CurriculumSection.XKey + '_SectionInfo').html('Section:');
}

function processNewCurriculumSectionForm() {
    if ($('#div_NewCurriculumItemSectionForm').css('display') === 'none') {
        cleanNewCurriculumSectionUI();

        EditMode_CurriculumSection = 'New';

        $('#button_AddCurriculumSection').css('display', 'none');
        $('#div_NewCurriculumItemSectionForm').css('display', 'block');
    }
    else {
        $('#button_AddCurriculumSection').css('display', 'block');
        $('#div_NewCurriculumItemSectionForm').css('display', 'none');
    }
}

function cleanNewCurriculumSectionUI() {
    $('#input_SectionTitle').val('');
    $('#input_SectionLearningObjective').val('');
}

function getDataFromNewCurriculumSectionUI() {
    SectionTitle = $.trim($('#input_SectionTitle').val());
    SectionLearningObjective = $.trim($('#input_SectionLearningObjective').val());
    SectionListNumber = CurriculumSections.length + 1;
}

function getDataFromEditCurriculumSectionUI() {
    SectionTitle = $.trim($('#input_SectionTitle_Edit_' + CurrentCurriculumSection.XKey).val());
    SectionLearningObjective = $.trim($('#input_SectionLearningObjective_' + CurrentCurriculumSection.XKey).val());
}

function validateNewCurriculumSectionFormFields() {
    getDataFromNewCurriculumSectionUI();

    if (!SectionTitle || !SectionLearningObjective)
        return 1;

    return 0;
}

function validateEditCurriculumSectionFormFields() {
    getDataFromEditCurriculumSectionUI();

    if (!SectionTitle || !SectionLearningObjective)
        return 1;

    return 0;
}

function getCurrentCurriculumSection(CurriculumSectionXKey) {
    //loop the local buffer and find the requested Curriculum Section
    for (var i = 0; i < CurriculumSections.length; i++) {
        if (CurriculumSections[i].XKey === CurriculumSectionXKey) {
            CurrentCurriculumSection = CurriculumSections[i];
            break;
        }
    }
}

function getCurriculumSection(CurriculumSectionXKey) {
    //loop the local buffer and find the requested Curriculum Section
    for (var i = 0; i < CurriculumSections.length; i++) {
        if (CurriculumSections[i].XKey === CurriculumSectionXKey) {
            return CurriculumSections[i];
        }
    }
}

function selectCurriculumSection(CurriculumSectionXKey) {
    //first of all reset other selected Curriculum Container
    $(".LPCurriculumSectionContainer").each(function (index) {
        $(this).removeClass('LPCurriculumSectionContainer_Active');
    });

    //show in UI
    $('#div_CurriculumSectionContainer_' + CurriculumSectionXKey).addClass('LPCurriculumSectionContainer_Active');

    getCurrentCurriculumSection(CurriculumSectionXKey);
}

function saveCurriculumSection() {

    if (verifyWizardCourseIntegrity() === true) {
        if (EditMode_CurriculumSection === 'New') {
            var ValidationAnswer = validateNewCurriculumSectionFormFields();

            if (ValidationAnswer === 0) {

                $('body').append($('#div_Loader'));//append loader to the body and display it
                $('#div_Loader').css('display', 'block');//shows loader

                //send data
                $.getJSON(APIUrl + '/addCurriculumSection?p_string_CourseXKey=' + CurrentWizardCourse.XKey + '&p_string_Title=' + SectionTitle + '&p_string_LearningObjective=' + SectionLearningObjective + '&p_int_ListNumber=' + SectionListNumber + '&p_string_Author=' + localStorage.getItem("LP_Session_Author"))
                    .done(function (data) {
                        // On success,
                        var answer = data;//if succeded, the API returns the XKey of the new object, XKey length = 10

                        if (answer.length === 10) {
                            var CurriculumSection = {};//create new object

                            //set values
                            CurriculumSection.XKey = data;
                            CurriculumSection.CourseXKey = CurrentWizardCourse.XKey;
                            CurriculumSection.Title = SectionTitle;
                            CurriculumSection.LearningObjective = SectionLearningObjective;
                            CurriculumSection.ListNumber = SectionListNumber;
                            CurriculumSection.SectionItems = [];//initialize the SectionItems
                            //end set values

                            CurriculumSections.push(CurriculumSection);//insert into local buffer

                            //update UI
                            $('#div_Sections').append("<div id=\"div_CurriculumSectionContainer_" + CurriculumSection.XKey + "\" class=\"LPCurriculumSectionContainer\" onclick=\"selectCurriculumSection('" + CurriculumSection.XKey + "');\"><ul id=\"ul_Section_" + CurriculumSection.XKey + "\" class=\"sortable connectedSortable\" curriculumsectionxkey=\"" + CurriculumSection.XKey + "\"><li listgroup=\"CurriculumSections\"><div id=\"div_CurriculumItemSection_" + CurriculumSection.XKey + "\" class=\"CurriculumItemSection handle\"><div style=\"float:left\"><span id=\"span_CurriculumSection_" + CurriculumSection.XKey + "_SectionInfo\" style=\"font-weight:bold\">Unpublished Section</span>&nbsp;<span id=\"span_CurriculumSection_" + CurriculumSection.XKey + "_ListNumber\" style=\"font-weight:bold\">" + CurriculumSection.ListNumber + ":</span>&nbsp;&nbsp;<span id=\"span_CurriculumSection_" + CurriculumSection.XKey + "_Title\">" + CurriculumSection.Title + "</span>&nbsp;<span class=\"glyphicon glyphicon-pencil LPSectionOption\" onclick=\"openCurriculumSection('" + CurriculumSection.XKey + "');\"></span>&nbsp;<span class=\"glyphicon glyphicon-trash LPSectionOption\" onclick=\"deleteCurriculumSection('" + CurriculumSection.XKey + "');\"></span></div><span class=\"glyphicon glyphicon-menu-hamburger LPSectionMoveOption\" style=\"float:right\"></span></div><div id=\"div_CurriculumItemSectionEditForm_" + CurriculumSection.XKey + "\" class=\"CurriculumItemSectionEditForm\"><div class=\"row\"><div class=\"col-md-2\"><span style=\"font-weight:bold\">Section " + CurriculumSection.ListNumber + ":</span></div><div class=\"col-md-10\"><form><div class=\"form-group\"><input id=\"input_SectionTitle_Edit_" + CurriculumSection.XKey + "\" type=\"text\" class=\"form-control\" placeholder=\"Enter a Title\" maxlength = \"80\"></div><div class=\"form-group\"><label>What will students be able to do at the end of this section?*</label><input id=\"input_SectionLearningObjective_" + CurriculumSection.XKey + "\" type=\"text\" class=\"form-control\" placeholder=\"Enter a learning objective\" maxlength = \"200\"></div><button type=\"button\" class=\"CurriculumItemButton\" onclick=\"EditMode_CurriculumSection = 'Edit'; saveCurriculumSection();\">Save Section</button>&nbsp;<button type=\"button\" class=\"CurriculumItemTransparentButton\" onclick=\"$('#div_CurriculumItemSection_" + CurriculumSection.XKey + "').css('display', 'block'); $('#div_CurriculumItemSectionEditForm_" + CurriculumSection.XKey + "').css('display', 'none');\">Cancel</button></form></div></div></div></li></ul></div>");
                            initializeSorting();
                            //end of update the UI

                            showAlert('Saved', '#17aa1c');

                            $('#div_NewCurriculumItemSectionForm').css('display', 'none');//hide formulary
                            $('#button_AddCurriculumSection').css('display', 'block');
                        }

                        if (answer === '1') {
                            showAlert('Error at server', '#c4453c');
                        }

                        if (answer === '2') {
                            showAlert('Curriculum Section for this Course already exists', '#c4453c');
                        }

                        $('#div_Loader').css('display', 'none');//hide loader
                    })
                    .fail(function (jqXHR, textStatus, err) {
                        $('#div_Loader').css('display', 'none');
                    });

            }
            else {
                if (ValidationAnswer === 1)
                    showAlert('Please, complete the Curriculum Section Form', '#c4453c');
            }

        }//----

        if (EditMode_CurriculumSection === 'Edit') {

            var ValidationAnswer = validateEditCurriculumSectionFormFields();

            if (ValidationAnswer === 0) {

                $('body').append($('#div_Loader'));//append loader to the body and display it
                $('#div_Loader').css('display', 'block');

                //send data
                $.getJSON(APIUrl + '/updateCurriculumSection?p_string_CurriculumSectionXKey=' + CurrentCurriculumSection.XKey + '&p_string_CourseXKey=' + CurrentCurriculumSection.CourseXKey + '&p_string_Title=' + SectionTitle + '&p_string_LearningObjective=' + SectionLearningObjective + '&p_int_ListNumber=' + CurrentCurriculumSection.ListNumber + '&p_string_Author=' + localStorage.getItem("LP_Session_Author"))
                    .done(function (data) {
                        // On success,
                        var answer = data;

                        if (answer === 0) {

                            //set new values
                            CurrentCurriculumSection.Title = SectionTitle;
                            CurrentCurriculumSection.LearningObjective = SectionLearningObjective;
                            //end set new values

                            //update the UI
                            $('#span_CurriculumSection_' + CurrentCurriculumSection.XKey + '_Title').html(CurrentCurriculumSection.Title);
                            //end of update the UI

                            showAlert('Updated', '#17aa1c');
                            $('#div_CurriculumItemSectionEditForm_' + CurrentCurriculumSection.XKey).css('display', 'none');//hide form
                            $('#div_CurriculumItemSection_' + CurrentCurriculumSection.XKey).css('display', 'block');//show header
                        }

                        if (answer === 1) {
                            showAlert('Error at server', '#c4453c');
                        }

                        if (answer === 2) {
                            showAlert(SectionTitle + ' already exists', '#c4453c');
                        }

                        if (answer === 3) {
                            showAlert('This Curriculum Section not longer exists and cannot be updated', '#c4453c');
                        }

                        $('#div_Loader').css('display', 'none');//hide loader
                    })
                    .fail(function (jqXHR, textStatus, err) {
                        $('#div_Loader').css('display', 'none');
                    });

            }
            else {
                if (ValidationAnswer === 1)
                    showAlert('Please, complete the Curriculum Section Form', '#c4453c');
            }
        }
    }
}

function openCurriculumSection(CurriculumSectionXKey) {

    getCurrentCurriculumSection(CurriculumSectionXKey);

    //load data to UI
    $('#input_SectionTitle_Edit_' + CurriculumSectionXKey).val(CurrentCurriculumSection.Title);
    $('#input_SectionLearningObjective_' + CurriculumSectionXKey).val(CurrentCurriculumSection.LearningObjective);
    //end of load data to UI

    //show form
    $('#div_CurriculumItemSection_' + CurriculumSectionXKey).css('display', 'none');
    $('#div_CurriculumItemSectionEditForm_' + CurriculumSectionXKey).css('display', 'inline');
}

function deleteCurriculumSection(CurriculumSectionXKey) {
    if (confirm("Are you sure you want to delete this item? This Section and its lectures, quizes, will be deleted") === true) {

        $('body').append($('#div_Loader'));//append and display loader in body
        $('#div_Loader').css('display', 'inline');

        $.getJSON(APIUrl + '/deleteCurriculumSection?p_string_CurriculumSectionXKey=' + CurriculumSectionXKey + '&p_string_CourseXKey=' + CurrentWizardCourse.XKey)
            .done(function (data) {
                // On success,
                var answer = data;

                if (answer === 0) {

                    //remove from UI
                    $('#div_CurriculumSectionContainer_' + CurriculumSectionXKey).remove();

                    //remove from  local array
                    for (var i = 0; i < CurriculumSections.length; i++) {
                        if (CurriculumSections[i].XKey === CurriculumSectionXKey)
                            CurriculumSections.splice(i, 1);
                    }

                    //set current element to null
                    if (CurrentCurriculumSection)
                        if (CurrentCurriculumSection.XKey === CurriculumSectionXKey)
                            CurrentCurriculumSection = null;

                    showAlert('Deleted', '#17aa1c');
                }

                if (answer === 1) {
                    showAlert('Error at server', '#c4453c');
                }

                if (answer === 2) {
                    showAlert('This Curriculum Section not longer exists and cannot be deleted', '#c4453c');
                }

                $('#div_Loader').css('display', 'none');//hide loader
            })
            .fail(function (jqXHR, textStatus, err) {
                $('#div_Loader').css('display', 'none');//hide loader
            });
    }
}

//SectionItem...the core of the core of the core of the Lecturepad Course, includes Lectures, Quizes
function processAddSectionItem(XMode) {
    if (XMode === 'Lecture') {
        if ($('#div_NewLectureForm').css('display') === 'none') {
            $('#div_NewLectureForm').css('display', 'block');
            $('#div_AddSectionItems').css('display', 'none');
        }
        else {
            $('#div_NewLectureForm').css('display', 'none');
            $('#div_AddSectionItems').css('display', 'block');
        }
    }

    if (XMode === 'Quiz') {

        if ($('#div_NewQuizForm').css('display') === 'none') {
            $('#div_NewQuizForm').css('display', 'block');
            $('#div_AddSectionItems').css('display', 'none');
        }
        else {
            $('#div_NewQuizForm').css('display', 'none');
            $('#div_AddSectionItems').css('display', 'block');
        }
    }
}

function cleanNewSectionItemUI(XMode) {
    if (XMode === 'Lecture') {
        $('#input_LectureTitle').val('');
    }

    if (XMode === 'Quiz') {
        $('#input_QuizTitle').val('');
        tinyMCE.get('textarea_QuizXDescription').setContent('');
    }
}

function cleanNewSectionItemContentUploadUI(SectionItemXKey) {
    $('#div_AddContentUpload_' + SectionItemXKey).find('.myBar').css('width', 0 + '% ');
    $('#div_AddContentUpload_' + SectionItemXKey).find('.LPUploadControlFileName').html('');
}

function getGlobalSectionItemsLength(XMode) {
    var Answer = 0;

    //loop the local buffer and find the requested SectionItem
    for (var i = 0; i < CurriculumSections.length; i++) {
        for (var j = 0; j < CurriculumSections[i].SectionItems.length; j++) {
            if (XMode === 'Lecture' && CurriculumSections[i].SectionItems[j].KindOfItem === 'Lecture')
                Answer++;
            if (XMode === 'Quiz' && CurriculumSections[i].SectionItems[j].KindOfItem === 'Quiz')
                Answer++;
        }
    }

    return Answer;
}

function getDataFromNewSectionItemUI(XMode) {
    if (XMode === 'Lecture') {
        KinfOfItem = XMode;
        SectionItemTitle = $.trim($('#input_LectureTitle').val());
        SectionItemXDescription = '';
        SectionItemSectionListNumber = CurrentCurriculumSection.SectionItems.length + 1;
        SectionItemKindOfItemListNumber = getGlobalSectionItemsLength(XMode) + 1;
        SectionItemPublished = 'No';
    }

    if (XMode === 'Quiz') {
        KinfOfItem = XMode;
        SectionItemTitle = $.trim($('#input_QuizTitle').val());
        SectionItemXDescription = $.trim(tinyMCE.get('textarea_QuizXDescription').getContent());
        SectionItemSectionListNumber = CurrentCurriculumSection.SectionItems.length + 1;
        SectionItemKindOfItemListNumber = getGlobalSectionItemsLength(XMode) + 1;
        SectionItemPublished = 'No';
    }
}

function getDataFromEditSectionItemUI(XMode, XModeFormulary, SectionItemXKey) {
    if (XMode === 'Lecture') {
        if (XModeFormulary === 'SectionItemEdit')
            SectionItemTitle = $.trim($('#input_SectionItemTitle_' + SectionItemXKey).val());
        if (XModeFormulary === 'SectionItemEditXDescription')
            SectionItemXDescription = $.trim(tinyMCE.get('textarea_SectionItemXDescription_' + SectionItemXKey).getContent());
    }

    if (XMode === 'Quiz') {
        if (XModeFormulary === 'SectionItemEdit') {
            SectionItemTitle = $.trim($('#input_SectionItemTitle_' + SectionItemXKey).val());
            SectionItemXDescription = $.trim(tinyMCE.get('textarea_SectionItemXDescription_' + SectionItemXKey).getContent());
        }
    }
}

function validateNewSectionItemFormFields(XMode) {
    getDataFromNewSectionItemUI(XMode);

    if (!KinfOfItem || !SectionItemTitle || !SectionItemSectionListNumber || !SectionItemKindOfItemListNumber) //SectionItemXDescription may be empty
        return 1;

    return 0;
}

function validateEditSectionItemFormFields(XMode, XModeFormulary, SectionItemXKey) {
    getDataFromEditSectionItemUI(XMode, XModeFormulary, SectionItemXKey);

    if (XModeFormulary === 'SectionItemEditXDescription') //for SectionItemEditXDescription no empty field validation needed
        return 0;

    if (!SectionItemTitle) //SectionItemXDescription maybe empty, SectionItemTitle is mandatory
        return 1;

    return 0;
}

function processSectionItemEdit(Id) {
    if ($('#div_SectionItem_' + Id).css('display') === 'block') {
        $('#div_SectionItem_' + Id).css('display', 'none');
        $('#div_SectionItemEditForm_' + Id).css('display', 'block');
    }
    else {
        $('#div_SectionItem_' + Id).css('display', 'block');
        $('#div_SectionItemEditForm_' + Id).css('display', 'none');
    }
}

function processSectionItemOptions(sender, Id) {
    if ($('#div_SectionItemAdd_' + Id).css('display') === 'none') {
        $(sender).removeClass('glyphicon-chevron-down');
        $(sender).addClass('glyphicon-chevron-up');
        $('#div_SectionItemAdd_' + Id).css('display', 'block');
    }
    else {
        $(sender).removeClass('glyphicon-chevron-up');
        $(sender).addClass('glyphicon-chevron-down');
        $('#div_SectionItemAdd_' + Id).css('display', 'none');
    }
}

function processSectionItemAddDescription(Id)//this apply just for lectures
{
    if ($('#div_SectionItemAddOptions_' + Id).css('display') === 'block' && $('#button_AddDescription_' + Id).css('display') === 'inline-block') {
        $('#div_SectionItemAddOptions_' + Id).css('display', 'none');
        $('#div_SectionItemDescriptionForm_' + Id).css('display', 'block');
    }
    else {
        $('#div_SectionItemAddOptions_' + Id).css('display', 'block');
        $('#div_SectionItemDescriptionForm_' + Id).css('display', 'none');
    }

    checkSectionItemXDescription(getSectionItem(Id));
}

function processSectionItemEditDescription(Id)//this apply just for lectures
{
    if ($('#div_SectionItemDescription_' + Id).css('display') === 'block') {
        $('#div_SectionItemDescription_' + Id).css('display', 'none');
        $('#div_SectionItemDescriptionForm_' + Id).css('display', 'block');
    }
}

function processSectionItemAddResource(Id) {
    if ($('#div_SectionItemAddResource_' + Id).css('display') === 'none') {
        $('#div_SectionItemOptionsHiddenble_' + Id).css('display', 'none');
        $('#div_ResoursesTab_' + Id).css('display', 'block');
        $('#div_SectionItemHeader_' + Id).css('border-bottom', 'solid 1px #808080');
        $('#div_SectionItemAdd_' + Id).css('display', 'none');
        $('#div_SectionItem_' + Id).append($('#div_SectionItemAddResource'));
        $('#div_SectionItemAddResource_' + Id).css('display', 'block');
    }
    else {
        $('#div_SectionItemOptionsHiddenble_' + Id).css('display', 'block');
        $('#div_ResoursesTab_' + Id).css('display', 'none');
        $('#div_SectionItemHeader_' + Id).css('border-bottom', '0');
        $('#div_SectionItemAdd_' + Id).css('display', 'block');
        $('#div_SectionItemAddResource_' + Id).css('display', 'none');
    }
}

function processSectionItemAddContent(Id) {
    if ($('#div_SectionItemOptionsHiddenble_' + Id).css('display') === 'block') {
        processContentTabHeaderX(Id);
        $('#div_ContentTypes_' + Id).css('display', 'block');//call this method to override the ContentTypes behaivour from processContentTabHeaderX
        $('#span_PreXMode_' + Id).text('New');
    }
    else {
        $('#div_SectionItemOptionsHiddenble_' + Id).css('display', 'block');
        $('#div_ContentTab_' + Id).css('display', 'none');
        $('#strong_ContentTabTitle_' + Id).html('Select content type');
        $('#div_SectionItemHeader_' + Id).css('border-bottom', '0');
        if ($('#span_SectionItemExpandableOption_' + Id).hasClass('glyphicon-chevron-up'))
            $('#div_SectionItemAdd_' + Id).css('display', 'block');
        $('#div_AddContentUpload_' + Id).css('display', 'none');
        $('#div_SectionItemAddContent_' + Id).css('display', 'none');
    }
}

function processSectionItemEditContent(SectionItemXKey, KindOfContent) {
    var SectionItem = getSectionItem(SectionItemXKey);

    $('#span_PreXMode_' + SectionItem.XKey).text('Edit');

    processContentTabHeaderX(SectionItem.XKey);

    processContentUploadFormulary(SectionItem.XKey, KindOfContent);

    $('#span_KindOfContent_' + SectionItem.XKey).text(KindOfContent);

    //----load AuxiliarContent if SectionItemContent is Text
    if (SectionItem.SectionItemContent) {
        if (SectionItem.SectionItemContent.KindOfContent === 'Text')
            tinyMCE.get('textarea_SectionItemContentText_' + SectionItemXKey).setContent(SectionItem.SectionItemContent.AuxiliarContent);
        if (SectionItem.SectionItemContent.KindOfContent === 'Link')
            $('#input_SectionItemContentLink_' + SectionItemXKey).val(SectionItem.SectionItemContent.AuxiliarContent);
    }
    //----

    cleanNewSectionItemContentUploadUI(SectionItem.XKey);//clean UI

    $('#div_AddContentUpload_' + SectionItem.XKey).css('display', 'block');
}

function processSectionItemAddVideoCaptions(SectionItemXKey) {
    var SectionItem = getSectionItem(SectionItemXKey);

    $('#span_PreXMode_' + SectionItem.XKey).text('NewVideoCaption');

    processContentTabHeaderX(SectionItem.XKey);

    processContentUploadFormulary(SectionItem.XKey, 'Caption');

    $('#span_KindOfContent_' + SectionItem.XKey).text('Caption');

    cleanNewSectionItemContentUploadUI(SectionItemXKey);//clean UI

    $('#div_AddContentUpload_' + SectionItem.XKey).css('display', 'block');
}

function processContentTabHeaderX(SectionItemXKey) {
    $('#div_SectionItemOptionsHiddenble_' + SectionItemXKey).css('display', 'none');
    $('#div_ContentTab_' + SectionItemXKey).css('display', 'block');
    $('#div_SectionItemHeader_' + SectionItemXKey).css('border-bottom', 'solid 1px #808080');
    $('#div_SectionItemAdd_' + SectionItemXKey).css('display', 'none');
    $('#div_SectionItemAddContent_' + SectionItemXKey).css('display', 'block');
    $('#div_ContentTypes_' + SectionItemXKey).css('display', 'none');
}

function processAddContentUpload(Id, XMode) {
    if ($('#div_ContentTypes_' + Id).css('display') === 'block') {
        $('#div_ContentTypes_' + Id).css('display', 'none');

        processContentUploadFormulary(Id, XMode);

        $('#span_KindOfContent_' + Id).text(XMode);

        $('#div_AddContentUpload_' + Id).css('display', 'block');
    }
}

function processContentUploadFormulary(Id, XMode) {
    //--common UI
    $('#div_LPUploadControl_' + Id).css('display', 'block');
    $('#div_SectionItemContentText_' + Id).css('display', 'none');
    $('#div_SectionItemContentLink_' + Id).css('display', 'none');
    $('#div_SectionItemVideoCaptionXLanguage_' + Id).css('display', 'none');
    //--

    if (XMode === 'Video') {
        $('#strong_ContentTabTitle_' + Id).html('Add Video');
        $('#button_UploadContent_' + Id).html('Upload Video');
        $('#p_UploadContent_' + Id).html('Video is the Lecturepad`s preferred delivery type. At least 60% of your course content should be high resolution video [720 or HD] with excellent audio and lighting. Upload your video directly to Lecturepad for best quality viewing and to make full use of learning tools! Widesecreen 16:9 ratio is preferred but 4:3 is accepted. Please note that the average video length is within 2 to 10 minutes and videos above 20 minutes long will not be approved.');
        document.getElementById("input_SectionItemContentFile_" + Id).accept = ".mp4, .ogg, .webm";
    }
    if (XMode === 'Audio') {
        $('#strong_ContentTabTitle_' + Id).html('Add Audio');
        $('#button_UploadContent_' + Id).html('Upload Audio');
        $('#p_UploadContent_' + Id).html('An audio lecture let your voice do the teaching. An aural experience can be usefull to stimulate the imagination and promote independent visualization and knowledge association, if you use an audio lecture, make sure your audio is clean, crisp, and easy to listen too!');
        document.getElementById("input_SectionItemContentFile_" + Id).accept = ".mp3";
    }
    if (XMode === 'Presentation') {
        $('#strong_ContentTabTitle_' + Id).html('Add Presentation');
        $('#button_UploadContent_' + Id).html('Upload Presentation');
        $('#p_UploadContent_' + Id).html('A presentation means slides (e.g Power Point). Slides are a great way to combine text and visuals to explain concepts in an effective and efficient way. Use meaningfull graphics and clearly legible text!');
        document.getElementById("input_SectionItemContentFile_" + Id).accept = ".pptx";
    }
    if (XMode === 'Document') {
        $('#strong_ContentTabTitle_' + Id).html('Add Document');
        $('#button_UploadContent_' + Id).html('Upload Document');
        $('#p_UploadContent_' + Id).html('Documents are PDF documents, let your students take a good lecture over a good PDF');
        document.getElementById("input_SectionItemContentFile_" + Id).accept = ".pdf";
    }
    if (XMode === 'Text') {
        $('#strong_ContentTabTitle_' + Id).html('Add Text');
        $('#button_UploadContent_' + Id).html('Upload Text');
        $('#p_UploadContent_' + Id).html('A Text lecture allows you to develop text-based multimedia pages. Reading is an incredibly effective way to learn and, coupled with multimedia, you have the opportunity to create an impactful learning experience.');
        //--override common UI
        $('#div_LPUploadControl_' + Id).css('display', 'none');
        $('#div_SectionItemContentText_' + Id).css('display', 'block');
        //--
    }
    if (XMode === 'Link') {
        $('#strong_ContentTabTitle_' + Id).html('Add Link');
        $('#button_UploadContent_' + Id).html('Upload a link');
        $('#p_UploadContent_' + Id).html('A Embedded Link lecture allows you to show any kind of content and it provides compatibility for old lectures formats.');
        //--override common UI
        $('#div_LPUploadControl_' + Id).css('display', 'none');
        $('#div_SectionItemContentLink_' + Id).css('display', 'block');
    }
    if (XMode === 'Caption') {
        $('#strong_ContentTabTitle_' + Id).html('Add Captions');
        $('#button_UploadContent_' + Id).html('Upload .vtt');
        $('#p_UploadContent_' + Id).html('<strong>Tip:</strong>&nbsp;Captions and subtitles help more people enjoy your videos. Only .vtt format is supported. Click <a href="https://atelier.u-sub.net/srt2vtt/">here</a> to convert your subtitle file to vtt.');
        document.getElementById("input_SectionItemContentFile_" + Id).accept = ".vtt";
        //override common UI
        $('#div_SectionItemVideoCaptionXLanguage_' + Id).css('display', 'block');
        //end override common UI
    }
}

function checkSectionItemXDescription(SectionItem) {
    if (SectionItem.XDescription.length === 0) {
        $('#div_SectionItemDescription_' + SectionItem.XKey).css('display', 'none');
        $('#button_AddDescription_' + SectionItem.XKey).css('display', 'inline-block');
    }
    else {
        $('#div_SectionItemDescription_' + SectionItem.XKey).css('display', 'block');
        $('#button_AddDescription_' + SectionItem.XKey).css('display', 'none');
    }
}

function checkSectionItemContentsTypeForIcon(SectionItem) {
    if (SectionItem.SectionItemContent)//has content
    {
        if (SectionItem.SectionItemContent.KindOfContent === 'Audio') {
            $('#div_ContentIcon_' + SectionItem.SectionItemContent.XKey).css('background-image', 'url("images/headphone.png")');
        }

        if (SectionItem.SectionItemContent.KindOfContent === 'Text') {
            $('#div_ContentIcon_' + SectionItem.SectionItemContent.XKey).css('background-image', 'url("images/article.png")');
        }

        if (SectionItem.SectionItemContent.KindOfContent === 'Link') {
            $('#div_ContentIcon_' + SectionItem.SectionItemContent.XKey).css('background-image', 'url("images/Link.png")');
        }
    }
}

function checkSectionItemContentsThumbnail(SectionItem, XMode, File) {
    if (SectionItem.SectionItemContent)//has content
    {
        if (SectionItem.SectionItemContent.KindOfContent === 'Video') {

            //we will generate the thumnail of the video and send it o the server
            if (XMode === 'Client Side') {
                //get thumbnail
                generateVideoThumbnailToServer(File, 'div_ContentIcon_' + SectionItem.SectionItemContent.XKey, CurrentWizardCourse.XKey, SectionItem.XKey, 'thumbnail.png');//generate thumbnail and send it to server
                //end get thumbnail
            }

            //we will get the thumnail of the video from the server
            if (XMode === 'Server Side') {
                getThumbnailFromServer_PNG(SectionItem);
            }
        }

        if (SectionItem.SectionItemContent.KindOfContent === 'Document') {

            //we will generate the thumnail of the pdf and send it o the server
            if (XMode === 'Client Side') {
                //get thumbnail
                generatePDFThumbnail(File, 'div_ContentIcon_' + SectionItem.SectionItemContent.XKey, CurrentWizardCourse.XKey, SectionItem.XKey, 'thumbnail.png');//generate thumbnail and send it to server
                //end get thumbnail
            }

            //we will get the thumnail of the video from the server
            if (XMode === 'Server Side') {
                getThumbnailFromServer_PNG(SectionItem);
            }
        }

        if (SectionItem.SectionItemContent.KindOfContent === 'Presentation') {
            //XMode not needed because the thumbnail is always generated on the server side
            getThumbnailFromServer_JPEG(SectionItem);
        }
    }
}

function getThumbnailFromServer_PNG(SectionItem) {
    //get thumbnail
    var Image_Temporal = document.createElement("IMG");

    Image_Temporal.onerror = function () {
        Image_Temporal.src = "images/missing file.png";
    };

    Image_Temporal.src = WEBAPPDomainUrl + '/LecturepadCloud/Courses/' + CurrentWizardCourse.XKey + '/Contents/' + SectionItem.XKey + '/thumbnail.png';

    Image_Temporal.onload = function () {
        $('#div_ContentIcon_' + SectionItem.SectionItemContent.XKey).css('background-image', 'url("' + Image_Temporal.src + '")');
        Image_Temporal.remove();
    };
    //end get thumbnail
}

function getThumbnailFromServer_JPEG(SectionItem) {
    //get thumbnail
    var Image_Temporal = document.createElement("IMG");

    Image_Temporal.onerror = function () {
        Image_Temporal.src = "images/missing file.png";
    };

    Image_Temporal.src = WEBAPPDomainUrl + '/LecturepadCloud/Courses/' + CurrentWizardCourse.XKey + '/Contents/' + SectionItem.XKey + '/thumbnail.jpeg';

    Image_Temporal.onload = function () {
        $('#div_ContentIcon_' + SectionItem.SectionItemContent.XKey).css('background-image', 'url("' + Image_Temporal.src + '")');
        Image_Temporal.remove();
    };
    //end get thumbnail
}

function checkSectionItemContentsLength(SectionItem) {
    if (!SectionItem.SectionItemContent)//no content
    {
        $('#div_SectionItemContents_' + SectionItem.XKey).css('display', 'none');
        $('#button_addVideoCaptions_' + SectionItem.XKey).css('display', 'none');
    }
    else {//content detected

        $('#button_AddContent_' + SectionItem.XKey).css('display', 'none');

        if (SectionItem.Published === 'Yes') {
            $('#span_SectionItemStatus_' + SectionItem.XKey).text('(Published)');
            $('#span_SectionItemStatus_' + SectionItem.XKey).css('display', 'block');
        }
        else {
            $('#span_SectionItemStatus_' + SectionItem.XKey).text('(Unpublished Content)');
            $('#span_SectionItemStatus_' + SectionItem.XKey).css('display', 'block');
        }

        $('#div_SectionItemContents_' + SectionItem.XKey).css('display', 'block');

        $('#span_SectionItemIcon_' + SectionItem.XKey).removeClass('glyphicon-book');//remove standard class glyphicon

        if (SectionItem.SectionItemContent.KindOfContent === 'Video') {
            $('#span_SectionItemIcon_' + SectionItem.XKey).addClass('glyphicon-play');//add class glyphicon according to content
            $('#button_addVideoCaptions_' + SectionItem.XKey).css('display', 'inline-block');
        }
        else
            $('#button_addVideoCaptions_' + SectionItem.XKey).css('display', 'none');

        if (SectionItem.SectionItemContent.KindOfContent === 'Audio') {
            $('#span_SectionItemIcon_' + SectionItem.XKey).addClass('glyphicon-headphones');//add class glyphicon according to content
        }

        if (SectionItem.SectionItemContent.KindOfContent === 'Presentation') {
            $('#span_SectionItemIcon_' + SectionItem.XKey).addClass('glyphicon-blackboard');//add class glyphicon according to content
        }

        if (SectionItem.SectionItemContent.KindOfContent === 'Document') {
            $('#span_SectionItemIcon_' + SectionItem.XKey).addClass('glyphicon-book');//add class glyphicon according to content
        }

        if (SectionItem.SectionItemContent.KindOfContent === 'Text') {
            $('#span_SectionItemIcon_' + SectionItem.XKey).addClass('glyphicon-file');//add class glyphicon according to content
        }

        if (SectionItem.SectionItemContent.KindOfContent === 'Link') {
            $('#span_SectionItemIcon_' + SectionItem.XKey).addClass('glyphicon-link');//add class glyphicon according to content
        }
    }
}

function checkSectionItemVideoCaptionsLength(SectionItem) {
    if (SectionItem.SectionItemVideoCaptions.length === 0)
        $('#div_SectionItemVideoCaptions_' + SectionItem.XKey).css('display', 'none');
    else
        $('#div_SectionItemVideoCaptions_' + SectionItem.XKey).css('display', 'block');
}

function checkSectionItemResourcesLength(SectionItem) {
    if (SectionItem.SectionItemResources.length === 0)
        $('#div_SectionItemDownloadableMaterials_' + SectionItem.XKey).css('display', 'none');
    else
        $('#div_SectionItemDownloadableMaterials_' + SectionItem.XKey).css('display', 'block');
}

function getSectionItem(SectionItemXKey) {
    //loop the local buffer and find the requested SectionItem
    for (var i = 0; i < CurriculumSections.length; i++) {
        for (var j = 0; j < CurriculumSections[i].SectionItems.length; j++) {
            if (CurriculumSections[i].SectionItems[j].XKey === SectionItemXKey) {
                return CurriculumSections[i].SectionItems[j];//not use break, use return to exit from the two loops
            }
        }
    }
}

function saveSectionItem(XMode, XModeFormulary, SectionItemXKey) {

    if (CurrentCurriculumSection) {
        if (EditMode_SectionItem === 'New') {
            var ValidationAnswer = validateNewSectionItemFormFields(XMode);

            if (ValidationAnswer === 0) {

                $('body').append($('#div_Loader'));//append loader to the body and display it
                $('#div_Loader').css('display', 'block');//shows loader

                //send data
                $.ajax({
                    method: "POST",
                    url: APIUrl + '/addSectionItem?p_string_CourseXKey=' + CurrentWizardCourse.XKey + '&p_string_CurriculumSectionXKey=' + CurrentCurriculumSection.XKey + '&p_string_KindOfItem=' + KinfOfItem + '&p_string_Title=' + SectionItemTitle + '&p_int_SectionListNumber=' + SectionItemSectionListNumber + '&p_int_KindOfItemListNumber=' + SectionItemKindOfItemListNumber + '&p_string_Published=' + SectionItemPublished + '&p_string_Author=' + localStorage.getItem("LP_Session_Author"),
                    dataType: "json",
                    data: { '': SectionItemXDescription },
                    success: function (data) {
                        // On success,
                        var answer = data;//if succeded, the API returns the XKey of the new object, XKey length = 10

                        if (answer.length === 10) {
                            var SectionItem = {};//create new object

                            //set values
                            SectionItem.XKey = data;
                            SectionItem.CurriculumSectionXKey = CurrentCurriculumSection.XKey;
                            SectionItem.KindOfItem = KinfOfItem;
                            SectionItem.Title = SectionItemTitle;
                            SectionItem.XDescription = SectionItemXDescription;
                            SectionItem.SectionListNumber = SectionItemSectionListNumber;
                            SectionItem.KindOfItemListNumber = SectionItemKindOfItemListNumber;
                            SectionItem.Published = SectionItemPublished;
                            SectionItem.SectionItemContent = null; //initialize
                            SectionItem.SectionItemVideoCaptions = [];//initialize
                            SectionItem.SectionItemResources = []; //initialize
                            SectionItem.QuizQuestions = []; //initialize
                            //end set values

                            CurrentCurriculumSection.SectionItems.push(SectionItem);//insert into local buffer

                            checkCurriculumSectionSectionItemsLength(CurrentCurriculumSection); //validate CurriculumSection

                            //update UI
                            var HTMLContent = "";

                            if (SectionItem.KindOfItem === 'Lecture') {
                                //header of SectionItem and first form
                                HTMLContent = "\
                                <li id=\"li_SectionItem_" + SectionItem.XKey + "\" listgroup=\"SectionItems\" kindofitem =\"Lecture\" sectionitemxkey =\"" + SectionItem.XKey + "\"> \
                                    <div id=\"div_SectionItem_" + SectionItem.XKey + "\" class=\"CurriculumItem handle\"> \
                                        <div id=\"div_SectionItemHeader_" + SectionItem.XKey + "\" class=\"LPSectionItemHeader\"> \
                                            <div style=\"float:left\"><span class=\"GreenCircle\">&nbsp;</span><span id=\"span_SectionItemType_" + SectionItem.XKey + "\" style=\"font-weight:bold\">" + SectionItem.KindOfItem + "</span>&nbsp;<span id=\"span_SectionItemKindOfItemListNumber_" + SectionItem.XKey + "\" style=\"font-weight:bold\">" + SectionItem.KindOfItemListNumber + "</span>&nbsp;<span id=\"span_SectionItemIcon_" + SectionItem.XKey + "\" class=\"glyphicon glyphicon-book\"></span>&nbsp;<span id=\"span_SectionItemTitle_" + SectionItem.XKey + "\">" + getSummaryOfSentence(SectionItem.Title, 50) + "</span>&nbsp;<span class=\"glyphicon glyphicon-pencil LPSectionOption\" onclick=\"openSectionItem('" + SectionItem.XKey + "','SectionItemEdit', 'Lecture');\"></span>&nbsp;<span class=\"glyphicon glyphicon-trash LPSectionOption\" onclick=\"deleteSectionItem('" + SectionItem.XKey + "','" + SectionItem.KindOfItem + "');\"></span></div><span class=\"glyphicon glyphicon-menu-hamburger LPSectionMoveOption\" style=\"float:right\"></span> <div id=\"div_SectionItemOptionsHiddenble_" + SectionItem.XKey + "\"><span id=\"span_SectionItemExpandableOption_" + SectionItem.XKey + "\" class=\"glyphicon glyphicon-chevron-down LPSectionVisibleOption\" style=\"float:right;margin-right:10px;padding-top:3px;\" onclick=\"processSectionItemOptions(this,'" + SectionItem.XKey + "');\"></span><button id=\"button_AddContent_" + SectionItem.XKey + "\" class=\"CurriculumItemButton\" style=\"float:right;\" onclick=\"processSectionItemAddContent('" + SectionItem.XKey + "');\">+Add Content</button><span id=\"span_SectionItemStatus_" + SectionItem.XKey + "\" class=\"LPSectionNotDisplayedOption\" style=\"float:right;margin-right:5px\"></span></div> <div id=\"div_ResoursesTab_" + SectionItem.XKey + "\" class=\"LPSectionItemOptionTab\"><strong>Add Resources</strong>&nbsp;<span class=\"glyphicon glyphicon-remove LPSectionVisibleOption\" onclick=\"processSectionItemAddResource('" + SectionItem.XKey + "');\"></span></div> <div id=\"div_ContentTab_" + SectionItem.XKey + "\" class=\"LPSectionItemOptionTab\"><strong id=\"strong_ContentTabTitle_" + SectionItem.XKey + "\">Select content type </strong>&nbsp;<span class=\"glyphicon glyphicon-remove LPSectionVisibleOption\" onclick=\"processSectionItemAddContent('" + SectionItem.XKey + "');\"></span></div> \
                                        </div> \
                                        <div id=\"div_SectionItemAdd_" + SectionItem.XKey + "\" class=\"LPSectionItemAdd\"> \
                                            <div id=\"div_SectionItemDescription_" + SectionItem.XKey + "\" class=\"LPSectionItemDescription LPSectionItemDescription_Panel\" onclick=\"openSectionItem('" + SectionItem.XKey + "', 'SectionItemEditXDescription', 'Lecture');\">" +
                                    SectionItem.XDescription +
                                    "</div> \
                                            <div id=\"div_SectionItemDescriptionForm_" + SectionItem.XKey + "\" class=\"LPSectionItemDescription\"> \
                                                <div class=\"row\"> \
                                                    <div class=\"col-md-12\"> \
                                                        <p>Lecture Description*</p> \
                                                        <form> \
                                                            <div class=\"form-group\"> \
                                                                <textarea id=\"textarea_SectionItemXDescription_" + SectionItem.XKey + "\" class=\"form-control TinymceSimple\" placeholder=\"Add a description, include what students will be able to do after completing the lecture.\"></textarea> \
                                                            </div> \
                                                            <button type=\"button\" class=\"CurriculumItemButton CurriculumItemButton_Right\" onclick=\"EditMode_SectionItem = 'Edit'; saveSectionItem('Lecture', 'SectionItemEditXDescription', '" + SectionItem.XKey + "');\">Save</button> &nbsp; <button type=\"button\" class=\"CurriculumItemTransparentButton CurriculumItemTransparentButton_Right\" onclick=\"processSectionItemAddDescription('" + SectionItem.XKey + "');\">Cancel</button> \
                                                        </form> \
                                                    </div> \
                                                </div> \
                                            </div>";
                                //end of header of SectionItem and first form

                                //SectionItemContents
                                HTMLContent += "\
                                            <div id=\"div_SectionItemContents_" + SectionItem.XKey + "\" class=\"LPSectionItemDescription\" style=\"display:block\"> \
                                                <div id=\"row_SectionItemContents_" + SectionItem.XKey + "\" class=\"row\">";

                                HTMLContent += "</div> \
                                            </div> ";
                                //End of SectionItemContents

                                //Video Captions
                                HTMLContent += "\
                                            <div id=\"div_SectionItemVideoCaptions_" + SectionItem.XKey + "\" class=\"LPSectionItemDescription LPRowContent\" style=\"display:block\"> \
                                                <div class=\"row\"> \
                                                    <div class=\"col-md-12\"> \
                                                        <p style=\"font-weight:bold\">Captions</p> \
                                                        <table id=\"table_SectionItemCaptions_" + SectionItem.XKey + "\" class=\"table LPSectionItemDownloadablesTable\"> \
                                                            <tbody>";

                                HTMLContent += "\
                                                            </tbody> \
                                                        </table> \
                                                    </div> \
                                                </div> \
                                            </div>";
                                //End Video Captions

                                //SectionItemResources
                                HTMLContent += "\
                                            <div id=\"div_SectionItemDownloadableMaterials_" + SectionItem.XKey + "\" class=\"LPSectionItemDescription LPRowContent\" style=\"display:block\"> \
                                                <div class=\"row\"> \
                                                    <div class=\"col-md-12\"> \
                                                        <p style=\"font-weight:bold\">Downloadable materials</p> \
                                                        <table id=\"table_SectionItemDownloadableResources_" + SectionItem.XKey + "\" class=\"table LPSectionItemDownloadablesTable\"> \
                                                            <tbody>";

                                HTMLContent += "\
                                                            </tbody> \
                                                        </table> \
                                                    </div> \
                                                </div> \
                                            </div>";
                                //End of SectionItemResources


                                HTMLContent += "\
                                            <div id=\"div_SectionItemAddOptions_" + SectionItem.XKey + "\" class=\"LPSectionItemOptions\"> \
                                                <button id=\"button_AddDescription_" + SectionItem.XKey + "\" class=\"btn LPButton_SubmitWHite\" onclick=\"openSectionItem('" + SectionItem.XKey + "', 'SectionItemAddXDescription');\">Add Description</button>&nbsp;<button class=\"btn LPButton_SubmitWHite\" onclick=\"processSectionItemAddResource('" + SectionItem.XKey + "');\">Add Resources</button>&nbsp<button id=\"button_addVideoCaptions_" + SectionItem.XKey + "\" class=\"btn LPButton_SubmitWHite\" onclick=\"processSectionItemAddVideoCaptions('" + SectionItem.XKey + "');\">Add Captions</button> \
                                            </div> \
                                        </div> \
                                        <div id=\"div_SectionItemAddResource_" + SectionItem.XKey + "\" class=\"LPSectionItemDescription\" > \
                                            <div class=\"row\"> \
                                                <div class=\"col-md-12\"> \
                                                    <p>Downloadable file</p> \
                                                    <form id=\"form_UploadSectionItemResource_" + SectionItem.XKey + "\" class=\"upload\" style=\"margin-top:0px;\" method=\"post\" action=\"\" enctype=\"multipart/form-data\"> \
                                                        <div class=\"LPUploadControl\"> \
                                                            <div class=\"myProgress\"> \
                                                                <div class=\"myBar\"></div> \
                                                                <span id=\"span_SectionItemResource_XFileName_" + SectionItem.XKey + "\" class=\"LPUploadControlFileName\">No file selected</span> \
                                                                <span class=\"glyphicon glyphicon-remove LPUploadCancel\"></span> \
                                                            </div> \
                                                            <button class=\"LPUploadButton\" type=\"button\" onclick=\"uploadSectionItemResource(this, '" + SectionItem.XKey + "');\">Upload File</button> \
                                                            <input id=\"input_SectionItemResourceFile_" + SectionItem.XKey + "\" type= \"file\" style=\"visibility:hidden;\" multiple onchange= \"setUploadSectionItemResourceFormAction('" + SectionItem.XKey + "')\" /> \
                                                            <span class=\"LPUploadMode\" style=\"display:none\"></span> \
                                                            <span class=\"SectionItemXKey\" style=\"display:none\"></span> \
                                                        </div> \
                                                        <p style=\"font-size:12px;margin-top:5px;\"> <strong>Tip</strong>: A resource is for any type of document that can be used to help students in the lecture. This file is going to be seen as a lecture extra. Make sure everything is legible and the file size is less than 1 GiB.</p> \
                                                    </form> \
                                                </div>\
                                            </div> \
                                        </div> \
                                        <div id=\"div_SectionItemAddContent_" + SectionItem.XKey + "\" class=\"LPSectionItemDescription\"> \
                                            <div id=\"div_ContentTypes_" + SectionItem.XKey + "\"> \
                                                <div class=\"row\"> \
                                                    <div class=\"col-md-2\"> \
                                                        <div class=\"LPMediaCard\" onclick=\"processAddContentUpload('" + SectionItem.XKey + "', 'Video');\"> \
                                                            <div class=\"LPMediaCardImage\" style=\"background-image:url('images/video-play-3-xxl.png'); background-size:contain; background-repeat:no-repeat;\"></div> \
                                                            <div class=\"LPMediaCardFooter\">Video</div> \
                                                        </div> \
                                                    </div> \
                                                    <div class=\"col-md-2\"> \
                                                        <div class=\"LPMediaCard\" onclick=\"processAddContentUpload('" + SectionItem.XKey + "', 'Audio');\"> \
                                                            <div class=\"LPMediaCardImage\" style=\"background-image:url('images/headphone.png');\"></div> \
                                                            <div class=\"LPMediaCardFooter\">Audio</div> \
                                                        </div> \
                                                    </div> \
                                                    <div class=\"col-md-2\"> \
                                                        <div class=\"LPMediaCard\" onclick=\"processAddContentUpload('" + SectionItem.XKey + "', 'Presentation');\"> \
                                                            <div class=\"LPMediaCardImage\" style=\"background-image:url('images/presentation.png');\"></div> \
                                                            <div class=\"LPMediaCardFooter\">Presentation</div> \
                                                        </div> \
                                                    </div> \
                                                    <div class=\"col-md-2\"> \
                                                        <div class=\"LPMediaCard\" onclick=\"processAddContentUpload('" + SectionItem.XKey + "', 'Document');\"> \
                                                            <div class=\"LPMediaCardImage\" style=\"background-image:url('images/pdf.png');\"></div> \
                                                            <div class=\"LPMediaCardFooter\">Document</div> \
                                                        </div> \
                                                    </div> \
                                                    <div class=\"col-md-2\"> \
                                                        <div class=\"LPMediaCard\" onclick=\"processAddContentUpload('" + SectionItem.XKey + "', 'Text');\"> \
                                                            <div class=\"LPMediaCardImage\" style=\"background-image:url('images/article.png');\"></div> \
                                                            <div class=\"LPMediaCardFooter\">Text</div> \
                                                        </div> \
                                                    </div> \
                                                    <div class=\"col-md-2\"> \
                                                        <div class=\"LPMediaCard\" onclick=\"processAddContentUpload('" + SectionItem.XKey + "', 'Link');\"> \
                                                            <div class=\"LPMediaCardImage\" style=\"background-image:url('images/Link.png');\"></div> \
                                                            <div class=\"LPMediaCardFooter\">Embed Link</div> \
                                                        </div> \
                                                    </div> \
                                                </div> \
                                            </div> \
                                            <div id=\"div_AddContentUpload_" + SectionItem.XKey + "\" class=\"LPSectionItemDescription\"> \
                                                <div class=\"row\"> \
                                                    <div class=\"col-md-12\"> \
                                                        <form id=\"form_UploadSectionItemContent_" + SectionItem.XKey + "\" class=\"upload\" style=\"margin-top:0px;\" method=\"post\" action=\"\" enctype=\"multipart/form-data\"> \
                                                            <div id=\"div_SectionItemVideoCaptionXLanguage_" + SectionItem.XKey + "\" style=\"margin-bottom:5px;\">    \
                                                                <label>Locale</label> \
                                                                <select id=\"select_SectionItemVideoCaptionXLanguage_" + SectionItem.XKey + "\" class=\"LPUploadSelect\"> \
                                                                    <option value=\"Select\" selected>Select</option> \
                                                                    <option value=\"English (US)\">English (US)</option> \
                                                                    <option value=\"Spanish (ES)\">Spanish (ES)</option> \
                                                                </select>\
                                                            </div> \
                                                            <div id=\"div_LPUploadControl_" + SectionItem.XKey + "\" class=\"LPUploadControl\"> \
                                                                <div class=\"myProgress\"> \
                                                                    <div class=\"myBar\"></div> \
                                                                    <span id=\"span_SectionItemContent_XFileName_" + SectionItem.XKey + "\" class=\"LPUploadControlFileName\">No file selected</span> \
                                                                    <span class=\"glyphicon glyphicon-remove LPUploadCancel\"></span> \
                                                                </div> \
                                                                <button id=\"button_UploadContent_" + SectionItem.XKey + "\" class=\"LPUploadButton\" type=\"button\" onclick=\"if($('#span_PreXMode_" + SectionItem.XKey + "').text() === 'New' || $('#span_PreXMode_" + SectionItem.XKey + "').text() === 'Edit'){ uploadSectionItemContent(this, '" + SectionItem.XKey + "');} if($('#span_PreXMode_" + SectionItem.XKey + "').text() === 'NewVideoCaption'){uploadSectionItemVideoCaption(this, '" + SectionItem.XKey + "');}\">Upload File</button> \
                                                                <input id=\"input_SectionItemContentFile_" + SectionItem.XKey + "\" type= \"file\" style=\"visibility:hidden;\" multiple onchange= \"if($('#span_UploadChannel_" + SectionItem.XKey + "').text() === 'Content'){setUploadSectionItemContentFormAction('" + SectionItem.XKey + "','');} if($('#span_UploadChannel_" + SectionItem.XKey + "').text() === 'VideoCaption'){setUploadSectionItemVideoCaptionFormAction('" + SectionItem.XKey + "');}\" /> \
                                                                <span class=\"LPUploadMode\" style=\"display:none\"></span> \
                                                                <span class=\"SectionItemXKey\" style=\"display:none\"></span> \
                                                                <span id=\"span_SectionItemContentXKeyFor_" + SectionItem.XKey + "\" class=\"SectionItemContentXKey\" style=\"display:none\"></span> \
                                                                <span id=\"span_KindOfContent_" + SectionItem.XKey + "\" style=\"display:none\"></span> \
                                                                <span id=\"span_PreXMode_" + SectionItem.XKey + "\" style=\"display:none\"></span> \
                                                                <span id=\"span_VideoCaptionXLanguage_" + SectionItem.XKey + "\" style=\"display:none\"></span> \
                                                                <span id=\"span_UploadChannel_" + SectionItem.XKey + "\" style=\"display:none\"></span> \
                                                            </div> \
                                                            <div id=\"div_SectionItemContentText_" + SectionItem.XKey + "\" class=\"LPSectionItemDescription\"> \
                                                                <textarea id=\"textarea_SectionItemContentText_" + SectionItem.XKey + "\" class=\"form-control Tinymce\" placeholder=\"Write your content here\"> </textarea> \
                                                                <br/> \
                                                                <div class=\"row\"> \
                                                                    <div class=\"col-md-12\"> \
                                                                        <button type=\"button\" class=\"CurriculumItemButton CurriculumItemButton_Right\" onclick=\"saveSectionItemContent_Text('" + SectionItem.XKey + "');\">Save</button>&nbsp<button type=\"button\" class=\"CurriculumItemTransparentButton CurriculumItemTransparentButton_Right\" onclick=\"processSectionItemAddContent('" + SectionItem.XKey + "');\">Cancel</button> \
                                                                    </div> \
                                                                </div> \
                                                            </div> \
                                                            <div id=\"div_SectionItemContentLink_" + SectionItem.XKey + "\" class=\"LPSectionItemDescription\"> \
                                                                <input id=\"input_SectionItemContentLink_" + SectionItem.XKey + "\" class=\"form-control\" placeholder=\"Write your link here\"> \
                                                                <br/> \
                                                                <div class=\"row\"> \
                                                                    <div class=\"col-md-12\"> \
                                                                        <button type=\"button\" class=\"CurriculumItemButton CurriculumItemButton_Right\" onclick=\"saveSectionItemContent_Link('" + SectionItem.XKey + "');\">Save</button>&nbsp<button type=\"button\" class=\"CurriculumItemTransparentButton CurriculumItemTransparentButton_Right\" onclick=\"processSectionItemAddContent('" + SectionItem.XKey + "');\">Cancel</button> \
                                                                    </div> \
                                                                </div> \
                                                            </div> \
                                                            <p id=\"p_UploadContent_" + SectionItem.XKey + "\" style=\"font-size:12px;margin-top:5px;\"> </p> \
                                                        </form> \
                                                    </div>\
                                                </div> \
                                            </div> \
                                        </div > \
                                    </div> \
                                    <div id=\"div_SectionItemEditForm_" + SectionItem.XKey + "\" class=\"CurriculumItemEditForm\"> \
                                        <div class=\"row\"> \
                                            <div class=\"col-md-2\"> \
                                                <span class=\"GreenCircle\">&nbsp;</span><span id=\"span_SectionItemFormTitle_" + SectionItem.XKey + "\" style=\"font-weight:bold;\">" + SectionItem.KindOfItem + " " + SectionItem.KindOfItemListNumber + ":</span> \
                                            </div> \
                                            <div class=\"col-md-10\"> \
                                                <form> \
                                                    <div class=\"form-group\"> \
                                                        <input id=\"input_SectionItemTitle_" + SectionItem.XKey + "\" type=\"text\" class=\"form-control\" placeholder=\"Enter a Title\" maxlength=\"80\"> \
                                                    </div> \
                                                    <button type=\"button\" class=\"CurriculumItemButton\" onclick=\"EditMode_SectionItem = 'Edit'; saveSectionItem('Lecture', 'SectionItemEdit', '" + SectionItem.XKey + "');\">Save Lecture</button> &nbsp; <button type=\"button\" class=\"CurriculumItemTransparentButton\" onclick=\"processSectionItemEdit('" + SectionItem.XKey + "');\">Cancel</button> \
                                                </form> \
                                            </div> \
                                        </div> \
                                    </div> \
                               </li>";

                                $('#ul_Section_' + CurrentCurriculumSection.XKey).append(HTMLContent);

                                checkSectionItemXDescription(SectionItem);
                                checkSectionItemContentsLength(SectionItem);
                                checkSectionItemVideoCaptionsLength(SectionItem);
                                checkSectionItemResourcesLength(SectionItem);
                            }

                            if (SectionItem.KindOfItem === 'Quiz') {

                                var RelatedLectureOptionsPackage = getRelatedLectureOptions(SectionItem);//get the RelatedLectures package

                                //header of SectionItem and first form
                                HTMLContent = "\
                                <li id=\"li_SectionItem_" + SectionItem.XKey + "\" listgroup=\"SectionItems\" kindofitem =\"Quiz\" sectionitemxkey =\"" + SectionItem.XKey + "\"> \
                                    <div id=\"div_SectionItem_" + SectionItem.XKey + "\" class=\"CurriculumItem handle\"> \
                                        <div id=\"div_SectionItemHeader_" + SectionItem.XKey + "\" class=\"LPSectionItemHeader\"> \
                                            <div style=\"float:left\"><span class=\"GreenCircle\">&nbsp;</span><span id=\"span_SectionItemType_" + SectionItem.XKey + "\" style=\"font-weight:bold\">" + SectionItem.KindOfItem + "</span>&nbsp;<span id=\"span_SectionItemKindOfItemListNumber_" + SectionItem.XKey + "\" style=\"font-weight:bold\">" + SectionItem.KindOfItemListNumber + "</span>&nbsp;<span id=\"span_SectionItemIcon_" + SectionItem.XKey + "\" class=\"glyphicon glyphicon-ok\"></span>&nbsp;<span id=\"span_SectionItemTitle_" + SectionItem.XKey + "\">" + getSummaryOfSentence(SectionItem.Title, 50) + "</span>&nbsp;<span class=\"glyphicon glyphicon-pencil LPSectionOption\" onclick=\"openSectionItem('" + SectionItem.XKey + "','SectionItemEdit', 'Quiz');\"></span>&nbsp;<span class=\"glyphicon glyphicon-trash LPSectionOption\" onclick=\"deleteSectionItem('" + SectionItem.XKey + "','" + SectionItem.KindOfItem + "');\"></span></div><span class=\"glyphicon glyphicon-menu-hamburger LPSectionMoveOption\" style=\"float:right\"></span> <div id=\"div_SectionItemOptionsHiddenble_" + SectionItem.XKey + "\"><span id=\"span_SectionItemExpandableOption_" + SectionItem.XKey + "\" class=\"glyphicon glyphicon-chevron-down LPSectionNotDisplayedOption\" style=\"float:right;margin-right:10px;padding-top:3px;\" onclick=\"processSectionItemOptions(this,'" + SectionItem.XKey + "');\"></span><button id=\"button_AddQuizQuestions_" + SectionItem.XKey + "\" class=\"CurriculumItemButton\" style=\"float:right;\" onclick=\"processSectionItemAddQuizQuestion('" + SectionItem.XKey + "');\">+Add Questions</button><span id=\"span_SectionItemStatus_" + SectionItem.XKey + "\" class=\"LPSectionNotDisplayedOption\" style=\"float:right;margin-right:5px\"></span></div><div id=\"div_QuizQuestionTab_" + SectionItem.XKey + "\" class=\"LPSectionItemOptionTab\"><strong id=\"strong_QuizQuestionTypeTabTitle_" + SectionItem.XKey + "\">Select question type </strong>&nbsp;<span class=\"glyphicon glyphicon-remove LPSectionVisibleOption\" onclick=\"processSectionItemAddQuizQuestion('" + SectionItem.XKey + "');\"></span></div> \
                                        </div> \
                                        <div id=\"div_SectionItemAdd_" + SectionItem.XKey + "\" class=\"LPSectionItemAdd\">";
                                //end of header of SectionItem and first form

                                //Quiz Questions
                                var ButtonPublish = '';

                                if (CurrentWizardCourse.XStatus === 'Approved') {
                                    if (SectionItem.Published === 'No')
                                        ButtonPublish = "<button type=\"button\" class=\"LPButton_GreenNew LPRight\" onclick=\"processPublishStatusForSectionItem(this,'" + SectionItem.XKey + "');\">Publish</button>";

                                    if (SectionItem.Published === 'Yes')
                                        ButtonPublish = "<button type=\"button\" class=\"LPButton_WhiteNew LPRight\" onclick=\"processPublishStatusForSectionItem(this,'" + SectionItem.XKey + "');\">Unpublish</button>";
                                }

                                HTMLContent += "\
                                            <div id=\"div_SectionItemQuizQuestions_" + SectionItem.XKey + "\" class=\"LPSectionItemDescription LPRowContent\" style=\"display:block\"> \
                                                <div class=\"row\"> \
                                                    <div class=\"col-md-12\"> \
                                                        <p style=\"font-size: 16px;color:#515f75;\">Questions&nbsp;<button class=\"LPButton_WhiteNew\" onclick=\"processSectionItemAddQuizQuestion('" + SectionItem.XKey + "');\">+New Question</button>&nbsp;<button class=\"LPButton_GreenNew\" onclick=\"window.location = 'Page_StudentModule_CoursePlayer.html?CourseXKey=" + CurrentWizardCourse.XKey + "&SectionItemToPlay=" + SectionItem.XKey + "&CoursePlayerMode=Review&XMode=TeacherPreview';\">Preview</button>&nbsp;" + ButtonPublish + "</p> \
                                                        <ul id=\"ul_SectionItemQuizQuestions_" + SectionItem.XKey + "\" class=\"sortable_Questions\" sectionitemxkey = \"" + SectionItem.XKey + "\">";                                //load Quiz Questions
                                //--
                                //end load Quiz Questions

                                HTMLContent += "\
                                                        </ul> \
                                                    </div> \
                                                </div> \
                                            </div>";
                                //End Quiz Questions


                                HTMLContent += "\
                                        </div> \
                                        <div id=\"div_SectionItemAddQuizQuestion_" + SectionItem.XKey + "\" class=\"LPSectionItemDescription\"> \
                                             <div id=\"div_QuizQuestionTypes_" + SectionItem.XKey + "\"> \
                                                <div class=\"row\"> \
                                                    <div class=\"col-md-6\"> \
                                                        <div class=\"LPMediaCard\" onclick=\"processAddQuizQuestion('" + SectionItem.XKey + "', 'Single Answer');\"> \
                                                            <div class=\"LPMediaCardImage\" style=\"background-image:url('images/single answer.png'); background-size:contain; background-repeat:no-repeat;\"></div> \
                                                            <div class=\"LPMediaCardFooter\">Single Answer</div> \
                                                        </div> \
                                                    </div> \
                                                    <div class=\"col-md-6\"> \
                                                        <div class=\"LPMediaCard\" onclick=\"processAddQuizQuestion('" + SectionItem.XKey + "', 'Multiple Choice');\"> \
                                                            <div class=\"LPMediaCardImage\" style=\"background-image:url('images/multichoice_question_icon.png');\"></div> \
                                                            <div class=\"LPMediaCardFooter\">Multiple Choice</div> \
                                                        </div> \
                                                    </div> \
                                                </div> \
                                             </div> \
                                             <div id=\"div_AddQuizQuestionFormulary_" + SectionItem.XKey + "\" class=\"LPSectionItemDescription\"> \
                                                <div class=\"row\"> \
                                                    <div class=\"col-md-12\"> \
                                                        <form id=\"form_SingleAnswer_" + SectionItem.XKey + "\"> \
                                                            <div class=\"form-group\"> \
                                                                <label>Question:*</label> \
                                                                <textarea id=\"textarea_QuizQuestion_SingleAnswer_" + SectionItem.XKey + "\" class=\"form-control TinymceSimple\" placeholder=\"Write a question, use rich content to make clear your question\"></textarea> \
                                                            </div> \
                                                            <div class=\"form-group\"> \
                                                                <label>Correct Answer:*</label> \
                                                                <textarea id=\"textarea_QuizQuestion_RightAnswer_" + SectionItem.XKey + "\" class=\"form-control\" placeholder=\"Write the right answer\"></textarea> \
                                                            </div> \
                                                            <div class=\"form-group\"> \
                                                                <label>Related lecture:</label>&nbsp;Select a related video lecture to help students answer this question. \
                                                                <select id=\"select_RelatedLecture_SingleAnswer_" + SectionItem.XKey + "\" class=\"form-control\"> \
                                                                    <option value=\"Select\">Select</option>";
                                //--
                                HTMLContent += RelatedLectureOptionsPackage;
                                //--
                                HTMLContent += "</select> \
                                                            </div> \
                                                            <div class=\"form-group\"> \
                                                                <label>Time Limit (in minutes) for this question:</label> (0 means no time limit) <br/> \
                                                                <input type=\"number\" id=\"input_TimeLimit_SingleAnswer_" + SectionItem.XKey + "\" class=\"form-control\" min=\"0\" /> \
                                                            </div> \
                                                            <button type=\"button\" class=\"CurriculumItemButton CurriculumItemButton_Right\" onclick=\"saveQuizQuestion('Single Answer','" + SectionItem.XKey + "', $('#span_QuizQuestionXKeyFor_SingleAnswer_" + SectionItem.XKey + "').text());\">Save</button> &nbsp; <button type=\"button\" class=\"CurriculumItemTransparentButton CurriculumItemTransparentButton_Right\" onclick=\"processSectionItemAddQuizQuestion('" + SectionItem.XKey + "');\">Cancel</button> \
                                                            <span id=\"span_PreXMode_SingleAnswer_" + SectionItem.XKey + "\" style=\"display:none\"></span> \
                                                            <span id=\"span_QuizQuestionXKeyFor_SingleAnswer_" + SectionItem.XKey + "\" style=\"display:none\"></span> \
                                                        </form> \
                                                        <form id=\"form_MultipleChoice_" + SectionItem.XKey + "\"> \
                                                            <div class=\"form-group\"> \
                                                                <label>Question:*</label> \
                                                                <textarea id=\"textarea_QuizQuestion_MultipleChoice_" + SectionItem.XKey + "\" class=\"form-control TinymceSimple\" placeholder=\"Write a question, use rich content to make clear your question\"></textarea> \
                                                            </div> \
                                                            <div class=\"form-group\"> \
                                                                <label>Answers:*</label>&nbsp;Write up to 15 possible answers and indicate which one is the best.\
                                                            </div> \
                                                            <div class=\"form-group\">\
                                                                <div id=\"div_MultipleChoices_" + SectionItem.XKey + "\">\
                                                                    \
                                                                </div> \
                                                            </div>\
                                                            <br/> \
                                                            <div class=\"form-group\"> \
                                                                <label>Related lecture:</label>&nbsp;Select a related video lecture to help students answer this question. \
                                                                <select id=\"select_RelatedLecture_MultipleChoice_" + SectionItem.XKey + "\" class=\"form-control\"> \
                                                                    <option value=\"Select\">Select</option>";
                                //--
                                HTMLContent += RelatedLectureOptionsPackage;
                                //--
                                HTMLContent += "</select> \
                                                            </div> \
                                                            <div class=\"form-group\"> \
                                                                <label>Time Limit (in minutes) for this question:</label> (0 means no time limit) <br/> \
                                                                <input type=\"number\" id=\"input_TimeLimit_MultipleChoice_" + SectionItem.XKey + "\" class=\"form-control\" min=\"0\" /> \
                                                            </div> \
                                                            <button type=\"button\" class=\"CurriculumItemButton CurriculumItemButton_Right\" onclick=\"saveQuizQuestion('Multiple Choice', '" + SectionItem.XKey + "', $('#span_QuizQuestionXKeyFor_MultipleChoice_" + SectionItem.XKey + "').text());\">Save</button> &nbsp; <button type=\"button\" class=\"CurriculumItemTransparentButton CurriculumItemTransparentButton_Right\" onclick=\"processSectionItemAddQuizQuestion('" + SectionItem.XKey + "');\">Cancel</button> \
                                                            <span id=\"span_PreXMode_MultipleChoice_" + SectionItem.XKey + "\" style=\"display:none\"></span> \
                                                            <span id=\"span_QuizQuestionXKeyFor_MultipleChoice_" + SectionItem.XKey + "\" style=\"display:none\"></span> \
                                                        </form> \
                                                   </div>\
                                                </div> \
                                             </div> \
                                         </div > \
                                     </div> \
                                     <div id=\"div_SectionItemEditForm_" + SectionItem.XKey + "\" class=\"CurriculumItemEditForm\"> \
                                        <div class=\"row\"> \
                                            <div class=\"col-md-2\"> \
                                                <span class=\"GreenCircle\">&nbsp;</span><span id=\"span_SectionItemFormTitle_" + SectionItem.XKey + "\" style=\"font-weight:bold;\">" + SectionItem.KindOfItem + " " + SectionItem.KindOfItemListNumber + ":</span> \
                                            </div> \
                                            <div class=\"col-md-10\"> \
                                                <form> \
                                                    <div class=\"form-group\"> \
                                                        <input id=\"input_SectionItemTitle_" + SectionItem.XKey + "\" type=\"text\" class=\"form-control\" placeholder=\"Enter a Title\" maxlength=\"80\"> \
                                                    </div> \
                                                    <div class=\"form-group\"> \
                                                        <textarea id=\"textarea_SectionItemXDescription_" + SectionItem.XKey + "\" class=\"form-control TinymceSimple\" placeholder=\"Description\"></textarea> \
                                                    </div> \
                                                    <button type=\"button\" class=\"CurriculumItemButton\" onclick=\"EditMode_SectionItem = 'Edit'; saveSectionItem('Quiz', 'SectionItemEdit', '" + SectionItem.XKey + "');\">Save Quiz</button> &nbsp; <button type=\"button\" class=\"CurriculumItemTransparentButton\" onclick=\"processSectionItemEdit('" + SectionItem.XKey + "');\">Cancel</button> \
                                                </form> \
                                            </div> \
                                        </div> \
                                     </div> \
                                 </li>";

                                $('#ul_Section_' + CurrentCurriculumSection.XKey).append(HTMLContent);

                                checkSectionItemQuizQuestionsLength(SectionItem);
                            }

                            //plugins initilizations
                            initializeSorting();
                            initializeUploadWidget();
                            initTinymceEditors();
                            initTinymceSimpleEditors();
                            //end of plugins inializations

                            //end of update the UI

                            showAlert('Saved', '#17aa1c');

                            processAddSectionItem(SectionItem.KindOfItem);//hide formulary

                            updateSectionItemSorted('Added', '');
                        }

                        if (answer === '1') {
                            showAlert('Error at server', '#c4453c');
                        }

                        if (answer === '2') {
                            showAlert('Section Item for this Curriculum Section already exists', '#c4453c');
                        }

                        $('#div_Loader').css('display', 'none');//hide loader
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        $('#div_Loader').css('display', 'none');//hide loader
                    }
                });
            }
            else {
                if (ValidationAnswer === 1)
                    showAlert('Please, complete the Section Item Form', '#c4453c');
            }

        }//----

        if (EditMode_SectionItem === 'Edit') {

            var ValidationAnswer = validateEditSectionItemFormFields(XMode, XModeFormulary, SectionItemXKey);

            if (ValidationAnswer === 0) {

                var SectionItem = getSectionItem(SectionItemXKey);

                var Temporal_SectionItemTitle = SectionItem.Title;
                var Temporal_SectionItemXDescription = SectionItem.XDescription;

                //set values
                if (XMode === 'Lecture') {
                    if (XModeFormulary === 'SectionItemEdit')
                        Temporal_SectionItemTitle = SectionItemTitle;
                    if (XModeFormulary === 'SectionItemEditXDescription')
                        Temporal_SectionItemXDescription = SectionItemXDescription;
                }
                if (XMode === 'Quiz') {
                    Temporal_SectionItemTitle = SectionItemTitle;
                    Temporal_SectionItemXDescription = SectionItemXDescription;
                }

                $('body').append($('#div_Loader'));//append loader to the body and display it
                $('#div_Loader').css('display', 'block');

                $.ajax({
                    method: "POST",
                    url: APIUrl + '/updateSectionItem?p_string_SectionItemXKey=' + SectionItem.XKey + '&p_string_CurriculumSectionXKey=' + SectionItem.CurriculumSectionXKey + '&p_string_KindOfItem=' + SectionItem.KindOfItem + '&p_string_Title=' + Temporal_SectionItemTitle + '&p_int_SectionListNumber=' + SectionItem.SectionListNumber + '&p_int_KindOfItemListNumber=' + SectionItem.KindOfItemListNumber + '&p_string_Published=' + SectionItem.Published + '&p_string_Author=' + localStorage.getItem("LP_Session_Author"),
                    dataType: "json",
                    data: { '': Temporal_SectionItemXDescription },
                    success: function (data) {
                        // On success,
                        var answer = data;

                        if (answer === 0) {

                            //set values
                            SectionItem.Title = Temporal_SectionItemTitle;
                            SectionItem.XDescription = Temporal_SectionItemXDescription;
                            //end set values

                            //update the UI
                            $('#span_SectionItemTitle_' + SectionItem.XKey).html(getSummaryOfSentence(SectionItem.Title, 50));

                            if (XModeFormulary === 'SectionItemEditXDescription')
                                $('#div_SectionItemDescription_' + SectionItem.XKey).html(SectionItem.XDescription);
                            //end of update the UI

                            alert('updated');

                            //close the form
                            if (XModeFormulary === 'SectionItemEdit')
                                processSectionItemEdit(SectionItem.XKey);

                            if (XMode === 'Lecture') {
                                if (XModeFormulary === 'SectionItemEditXDescription') {
                                    processSectionItemAddDescription(SectionItem.XKey);
                                    checkSectionItemXDescription(SectionItem);
                                }
                            }
                            //end close the form
                        }

                        if (answer === 1) {
                            alert('Error at server');
                        }

                        if (answer === 2) {
                            alert(SectionTitle + ' already exists for this Curriculum Section');
                        }

                        if (answer === 3) {
                            alert('This Section Item not longer exists and cannot be updated');
                        }

                        $('#div_Loader').css('display', 'none');//hide loader
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        alert('Error: ' + textStatus);
                        $('#div_Loader').css('display', 'none');//hide loader
                    }
                });
            }
            else {
                if (ValidationAnswer === 1)
                    alert('Please, complete the Section Item Form');
            }
        }
    }
    else
        alert('Please, select a Curriculum Section first');
}

function processPublishStatusForSectionItem(sender, SectionItemXKey)
{
    var PublishedStatus = '';

    if ($(sender).html() === 'Unpublish')
        PublishedStatus = 'No';

    if ($(sender).html() === 'Publish')
        PublishedStatus = 'Yes';

    $('body').append($('#div_Loader'));//append and display loader 
    $('#div_Loader').css('display', 'block');

    $.getJSON(APIUrl + '/publishUnPublishSectionItem?p_string_SectionItemXKey=' + SectionItemXKey + '&p_string_Published=' + PublishedStatus + '&p_string_Author=' + localStorage.getItem("LP_Session_Author"))
        .done(function (data) {
            // On success,
            var answer = data;

            if (answer === 0) {
                //update UI
                if (PublishedStatus === 'No')
                {
                    $('#span_SectionItemStatus_' + SectionItemXKey).html('(Unpublished Content)');
                    $(sender).html('Publish');
                }

                if (PublishedStatus === 'Yes')
                {
                    $('#span_SectionItemStatus_' + SectionItemXKey).html('(Published)');
                    $(sender).html('Unpublish');
                }
                //end update UI
            }

            if (answer === 1) {
                showAlert('Error at server', '#c4453c');
            }

            if (answer === 2) {
                showAlert('This SectionItem not longer exists and cannot be updated', '#c4453c');
            }

            $('#div_Loader').css('display', 'none');//hide loading animation
        })
        .fail(function (jqXHR, textStatus, err) {
            $('#div_Loader').css('display', 'none');//hide loading animation
        });
}

function openSectionItem(SectionItemXKey, XModeFormulary, XMode) {

    var SectionItem = getSectionItem(SectionItemXKey);

    //load data to UI and show form
    if (XModeFormulary === 'SectionItemEdit') {
        if (XMode === 'Lecture') {
            $('#input_SectionItemTitle_' + SectionItemXKey).val(SectionItem.Title);
        }

        if (XMode === 'Quiz') {
            $('#input_SectionItemTitle_' + SectionItemXKey).val(SectionItem.Title);
            tinyMCE.get('textarea_SectionItemXDescription_' + SectionItemXKey).setContent(SectionItem.XDescription);
        }
        processSectionItemEdit(SectionItemXKey);
    }

    if (XModeFormulary === 'SectionItemAddXDescription') {
        if (XMode === 'Lecture') {
            tinyMCE.get('textarea_SectionItemXDescription_' + SectionItemXKey).setContent(SectionItem.XDescription);
        }
        processSectionItemAddDescription(SectionItemXKey);
    }

    if (XModeFormulary === 'SectionItemEditXDescription') {
        if (XMode === 'Lecture') {
            tinyMCE.get('textarea_SectionItemXDescription_' + SectionItemXKey).setContent(SectionItem.XDescription);
        }
        processSectionItemEditDescription(SectionItemXKey);
    }
    //end of load data to UI and show form
}

function updateSectionItemSorted(XMode, SectionItemXKey) {
    var NewSectionListNumber = 1;
    var NewKindOfItemListNumber_Lecture = 1;
    var NewKindOfItemListNumber_Quiz = 1;
    var SectionItemsForUpdate = [];
    var CurrentCurriculumSectionXKey = 'X';

    $('#div_Sections .LPCurriculumSectionContainer ul li').each(function (index, li) {

        if ($(li).parent().attr('curriculumsectionxkey') !== undefined)
            if ($(li).parent().attr('curriculumsectionxkey') !== CurrentCurriculumSectionXKey) {
                //reset variables
                NewSectionListNumber = 1;
                CurrentCurriculumSectionXKey = $(li).parent().attr('curriculumsectionxkey');
                //end reset variables
            }

        if ($(li).attr('listgroup') !== undefined)
            if ($(li).attr('listgroup') === 'SectionItems') {

                var SectionItem = getSectionItem($(li).attr('sectionitemxkey'));

                //--
                if (SectionItem.CurriculumSectionXKey !== $(li).parent().attr('curriculumsectionxkey')) {
                    //remove from previous array
                    var CurriculumSection_Last = getCurriculumSection(SectionItem.CurriculumSectionXKey);
                    for (var i = 0; i < CurriculumSection_Last.SectionItems.length; i++) {
                        if (CurriculumSection_Last.SectionItems[i].XKey === SectionItem.XKey) {
                            CurriculumSection_Last.SectionItems.splice(i, 1);
                            checkCurriculumSectionSectionItemsLength(CurriculumSection_Last);
                        }
                    }

                    //add to new array
                    var CurriculumSection_New = getCurriculumSection($(li).parent().attr('curriculumsectionxkey'));
                    CurriculumSection_New.SectionItems.push(SectionItem);
                    checkCurriculumSectionSectionItemsLength(CurriculumSection_New);

                    //set to new 
                    SectionItem.CurriculumSectionXKey = CurriculumSection_New.XKey;
                }
                //--

                SectionItem.SectionListNumber = NewSectionListNumber;

                if ($(this).attr('kindofitem') === 'Lecture') {
                    SectionItem.KindOfItemListNumber = NewKindOfItemListNumber_Lecture;
                    NewKindOfItemListNumber_Lecture++;
                }

                if ($(this).attr('kindofitem') === 'Quiz') {
                    SectionItem.KindOfItemListNumber = NewKindOfItemListNumber_Quiz;
                    NewKindOfItemListNumber_Quiz++;
                }

                $('#span_SectionItemKindOfItemListNumber_' + SectionItem.XKey).html(SectionItem.KindOfItemListNumber);
                $('#span_SectionItemFormTitle_' + SectionItem.XKey).html(SectionItem.KindOfItem + " " + SectionItem.KindOfItemListNumber + ":");
                SectionItemsForUpdate.push(SectionItem);

                if ((XMode === 'Sorted' || XMode === 'Added') && SectionItem.KindOfItem === 'Quiz') {
                    realeaseQuizQuestionsRelatedLecture(SectionItem);
                }

                NewSectionListNumber++;
            }
    });

    $('body').append($('#div_Loader'));//append and display loader
    $('#div_Loader').css('display', 'block');

    $.ajax({
        method: "POST",
        url: APIUrl + '/updateSectionItemsSorted?p_string_Author=' + localStorage.getItem("LP_Session_Author"),
        dataType: "json",
        data: { '': SectionItemsForUpdate },
        success: function (data) {
            //on success,
            if (data === 1)
                showAlert('Error at server', '#c4453c');

            if (data === 2)
                showAlert('A Section Item not longer exists and the update operation was canceled', '#c4453c');

            $('#div_Loader').css('display', 'none');//hide the loader
        },
        error: function (jqXHR, textStatus, errorThrown) {
            $('#div_Loader').css('display', 'none');//hide the loader
        }
    });
}

function canDeleteLecture(SectionItemXKey) {
    var Answer = true;
    var BreakLoops = false;

    $.each(CurriculumSections, function (index, CurriculumSection) {
        $.each(CurriculumSection.SectionItems, function (index2, SectionItem) {
            if (SectionItem.KindOfItem === 'Quiz') {
                $.each(SectionItem.QuizQuestions, function (index3, QuizQuestion) {
                    if (QuizQuestion.RelatedLecture === SectionItemXKey) {
                        Answer = false;
                        BreakLoops = true;
                        return false;
                    }
                });
            }

            if (BreakLoops === true)
                return false;
        });
        if (BreakLoops === true)
            return false;
    });

    return Answer;
}

function deleteSectionItem(SectionItemXKey, XMode) {

    if (confirm('You are about to remove a curriculum item. Are you sure you want to continue?') === true) {

        if (canDeleteLecture(SectionItemXKey) === true) {//the method canDeleteLecture works for Lectures and Quizes, but filter only Lectures deleting

            $('body').append($('#div_Loader'));//append and display loader 
            $('#div_Loader').css('display', 'block');

            $.getJSON(APIUrl + '/deleteSectionItem?p_string_CourseXKey=' + CurrentWizardCourse.XKey + '&p_string_SectionItemXKey=' + SectionItemXKey)
                .done(function (data) {
                    // On success,
                    var answer = data;

                    if (answer === 0) {

                        //remove from UI
                        document.getElementById("li_SectionItem_" + SectionItemXKey).remove();

                        $('.RelatedLecture option[value="' + SectionItemXKey + '"]').remove();//remove option from Quiz formularies if exist with this SectionItemXKey
                        //end of remove from UI

                        //update UI
                        updateSectionItemSorted('Deleted', '');
                        //end update UI

                        //remove from  local array
                        for (var i = 0; i < CurrentCurriculumSection.SectionItems.length; i++) {
                            if (CurrentCurriculumSection.SectionItems[i].XKey === SectionItemXKey) {
                                CurrentCurriculumSection.SectionItems.splice(i, 1);
                                checkCurriculumSectionSectionItemsLength(CurrentCurriculumSection);
                                break;
                            }
                        }

                        showAlert('Deleted', '#17aa1c');
                    }

                    if (answer === 1) {
                        showAlert('Error at server', '#c4453c');
                    }

                    if (answer === 2) {
                        showAlert('This Section Item not longer exists and cannot be deleted', '#c4453c');
                    }

                    $('#div_Loader').css('display', 'none');//hide loader
                })
                .fail(function (jqXHR, textStatus, err) {
                    $('#div_Loader').css('display', 'none');//hide loader
                });
        }
        else
            showAlert('You can not delete this Lecture, because a QuizQuestion is linked to it. Delete the QuizQuestion or unlink it.', '#c4453c');
    }
}

//..........
function addSectionItemContent(SectionItemContentXKey, SectionItemXKey, XFileName, AuxiliarContent, File) {
    SectionItem = getSectionItem(SectionItemXKey);

    var SectionItemContent = {};//create the object

    //set values
    SectionItemContent.XKey = SectionItemContentXKey;
    SectionItemContent.SectionItemXKey = SectionItemXKey;
    SectionItemContent.KindOfContent = $('#span_KindOfContent_' + SectionItemXKey).text();
    SectionItemContent.FreePreview = 'No';
    SectionItemContent.Downloadable = 'No';
    SectionItemContent.XFileName = XFileName;
    SectionItemContent.AuxiliarContent = AuxiliarContent;
    //end set values

    SectionItem.SectionItemContent = SectionItemContent;//add to SectionItem

    //update UI
    var HTMLContent = "";

    HTMLContent += "<div id=\"div_Content_" + SectionItem.SectionItemContent.XKey + "\" class=\"col-md-12\"> \
                                                        <div id=\"div_Row_Content_" + SectionItem.SectionItemContent.XKey + "\" class=\"row LPRowContent\"> \
                                                            <div class=\"col-md-3\"> \
                                                                <div id=\"div_ContentIcon_" + SectionItem.SectionItemContent.XKey + "\" class=\"LPContentIcon\"></div> \
                                                            </div> \
                                                            <div id=\"div_SectionItemContentDetails_" + SectionItem.XKey + "\" class=\"col-md-5\">";

    HTMLContent += processSectionItemContentDetails(SectionItem);

    HTMLContent += "</div> \
                                                            <div class=\"col-md-4\">";

    if (CurrentWizardCourse.XStatus === 'Approved') {
        if (SectionItem.Published === 'No')
            HTMLContent += "<button type=\"button\" class=\"LPButton_GreenNew LPRight\" onclick=\"processPublishStatusForSectionItem(this,'" + SectionItem.XKey + "');\">Publish</button>";

        if (SectionItem.Published === 'Yes')
            HTMLContent += "<button type=\"button\" class=\"LPButton_WhiteNew LPRight\" onclick=\"processPublishStatusForSectionItem(this,'" + SectionItem.XKey + "');\">Unpublish</button>";
    }

    HTMLContent += "<button type=\"button\" class=\"LPButton_GreenNew LPRight\" onclick=\"window.location = 'Page_StudentModule_CoursePlayer.html?CourseXKey=" + CurrentWizardCourse.XKey + "&SectionItemToPlay=" + SectionItem.XKey + "&CoursePlayerMode=Review&XMode=TeacherPreview';\">Preview</button>";

    //---
    var DisplayClassSectionItemContentSwitches = '';

    var CheckedStatusFreePreview = '';

    var CheckedStatusDownloadable = '';

    if (CurrentWizardCourse.XStatus === 'Approved') {
        if (SectionItem.Published === 'No')
            DisplayClassSectionItemContentSwitches = 'LPDisplay_None';
    }

    if (SectionItem.SectionItemContent.FreePreview === 'Yes')
        CheckedStatusFreePreview = 'checked';

    if (SectionItem.SectionItemContent.Downloadable === 'Yes')
        CheckedStatusDownloadable = 'checked';

    HTMLContent += "<div class=\"LPRight LPToggleOption " + DisplayClassSectionItemContentSwitches + "\"> \
                                                                    Free Preview &nbsp;\
                                                                    <label class=\"switch2\"> \
                                                                        <input type=\"checkbox\" id=\"input_FreePreview_" + SectionItem.SectionItemContent.XKey + "\" " + CheckedStatusFreePreview + " onclick=\"processSectionItemContentSwitches('" + SectionItem.SectionItemContent.XKey + "');\"> \
                                                                        <div class=\"slider2 round\"></div> \
                                                                    </label> \
                                                                </div>";

    if (SectionItem.SectionItemContent.KindOfContent === 'Video' || SectionItem.SectionItemContent.KindOfContent === 'Audio' || SectionItem.SectionItemContent.KindOfContent === 'Document' || SectionItem.SectionItemContent.KindOfContent === 'Presentation')
        HTMLContent += "<div class=\"LPRight LPToggleOption " + DisplayClassSectionItemContentSwitches + "\"> \
                                                                    Downloadable &nbsp;\
                                                                    <label class=\"switch2\"> \
                                                                        <input type=\"checkbox\" id=\"input_Downloadable_" + SectionItem.SectionItemContent.XKey + "\" " + CheckedStatusDownloadable + " onclick=\"processSectionItemContentSwitches('" + SectionItem.SectionItemContent.XKey + "');\"> \
                                                                        <div class=\"slider2 round\"></div> \
                                                                    </label> \
                                                                </div>";
                                //---

                                    
                                HTMLContent += "</div>\
                                                        </div> \
                                                    </div>";

    $('#row_SectionItemContents_' + SectionItemXKey).append(HTMLContent);
    //end update UI

    processSectionItemAddContent(SectionItemXKey);//process UI

    checkSectionItemContentsLength(SectionItem);//validate

    $('#span_SectionItemExpandableOption_' + SectionItem.XKey).click();//display SectionItem Content

    checkSectionItemContentsTypeForIcon(SectionItem);//apply icon

    checkSectionItemContentsThumbnail(SectionItem, 'Client Side', File);
}

function saveSectionItemContent_Text(SectionItemXKey) {

    var SectionItem = getSectionItem(SectionItemXKey);

    //get data
    AuxiliarContent = $.trim(tinyMCE.get('textarea_SectionItemContentText_' + SectionItemXKey).getContent());
    //end get data

    if (!SectionItem.SectionItemContent) {
        
        $('body').append($('#div_Loader'));//append loader to the body and display it
        $('#div_Loader').css('display', 'block');//shows loader

        //send data
        $.ajax({
            method: "POST",
            url: APIUrl + '/addSectionItemContent_TextContent?p_string_SectionItemXKey=' + SectionItem.XKey + '&p_string_KindOfContent=' + $('#span_KindOfContent_' + SectionItem.XKey).text() + '&p_string_FreePreview=No&p_string_Downloadable=No&p_string_Author=' + localStorage.getItem("LP_Session_Author"),
            dataType: "json",
            data: { '': AuxiliarContent },
            success: function (data) {
                // On success,
                var answer = data;//if succeded, the API returns the XKey of the new object, XKey length = 10

                if (answer.length === 10) {
                    var SectionItemContent = {};//create new object

                    //set values
                    SectionItemContent.XKey = data;
                    SectionItemContent.SectionItemXKey = SectionItem.XKey;
                    SectionItemContent.KindOfContent = $('#span_KindOfContent_' + SectionItem.XKey).text();
                    SectionItemContent.Published = 'No';
                    SectionItemContent.FreePreview = 'No';
                    SectionItemContent.Downloadable = 'No';
                    SectionItemContent.XFileName = "";
                    SectionItemContent.AuxiliarContent = AuxiliarContent;
                    //end set values

                    SectionItem.SectionItemContent = SectionItemContent;//add to SectionItem

                    //update UI
                    addSectionItemContent(SectionItem.SectionItemContent.XKey, SectionItem.XKey, '', SectionItemContent.AuxiliarContent, null);
                    //end update UI

                }

                if (answer === 1) {
                    showAlert('Error at server', '#c4453c');
                }

                if (answer === 2) {
                    showAlert('Text SectionItemContent already exists for this SectionItem', '#c4453c');
                }

                $('#div_Loader').css('display', 'none');//hide loader
            },
            error: function (jqXHR, textStatus, errorThrown) {
                $('#div_Loader').css('display', 'none');//hide loader
            }
        });

        return;
    }

    if (SectionItem.SectionItemContent) {

        $('body').append($('#div_Loader'));//append loader to the body and display it
        $('#div_Loader').css('display', 'block');//shows loader

        //send data
        $.ajax({
            method: "POST",
            url: APIUrl + '/updateSectionItemContent_TextContent?p_string_SectionItemContentXKey=' + SectionItem.SectionItemContent.XKey + '&p_string_SectionItemXKey=' + SectionItem.XKey + '&p_string_KindOfContent=' + SectionItem.SectionItemContent.KindOfContent + '&p_string_FreePreview=' + SectionItem.SectionItemContent.FreePreview + '&p_string_Downloadable=' + SectionItem.SectionItemContent.Downloadable + '&p_string_Author=' + localStorage.getItem("LP_Session_Author"),
            dataType: "json",
            data: { '': AuxiliarContent },
            success: function (data) {
                // On success,
                var answer = data;//if succeded, the API returns the XKey of the new object, XKey length = 10

                if (answer === 0) {
                    //set values
                    SectionItem.SectionItemContent.AuxiliarContent = AuxiliarContent;
                    //end set values

                    //no UI update

                    showAlert('Updated', '#17aa1c');

                    processSectionItemAddContent(SectionItem.XKey);//close the form
                }

                if (answer === 1) {
                    showAlert('Error at server', '#c4453c');
                }

                if (answer === 2) {
                    showAlert('This SectionItemContent already exists for this SectionItem', '#c4453c');
                }

                if (answer === 3) {
                    showAlert('This SectionItemContent not longer exists and cannot be updated', '#');
                }

                $('#div_Loader').css('display', 'none');//hide loader
            },
            error: function (jqXHR, textStatus, errorThrown) {
                $('#div_Loader').css('display', 'none');//hide loader
            }
        });
    }
}

function saveSectionItemContent_Link(SectionItemXKey) {

    var SectionItem = getSectionItem(SectionItemXKey);

    //get data
    AuxiliarContent = $.trim($('#input_SectionItemContentLink_' + SectionItemXKey).val());

    //check empty field
    if (!AuxiliarContent)
    {
        showAlert('Add an URL for this lecture', '#c4453c');
        return;
    }
    else
    {
        if (isURL(AuxiliarContent) === false)
        {
            showAlert('Verify your URL format', '#c4453c');
            return;
        }
    }
    //end get data

    if (!SectionItem.SectionItemContent) {
        
        $('body').append($('#div_Loader'));//append loader to the body and display it
        $('#div_Loader').css('display', 'block');//shows loader

        //send data
        $.ajax({
            method: "GET",
            url: APIUrl + '/addSectionItemContent_LinkContent?p_string_SectionItemXKey=' + SectionItem.XKey + '&p_string_KindOfContent=' + $('#span_KindOfContent_' + SectionItem.XKey).text() + '&p_string_FreePreview=No&p_string_Downloadable=No&p_string_AuxiliarContent=' + AuxiliarContent + '&p_string_Author=' + localStorage.getItem("LP_Session_Author"),
            dataType: "json",
            success: function (data) {
                // On success,
                var answer = data;//if succeded, the API returns the XKey of the new object, XKey length = 10

                if (answer.length === 10) {
                    var SectionItemContent = {};//create new object

                    //set values
                    SectionItemContent.XKey = data;
                    SectionItemContent.SectionItemXKey = SectionItem.XKey;
                    SectionItemContent.KindOfContent = $('#span_KindOfContent_' + SectionItem.XKey).text();
                    SectionItemContent.Published = 'No';
                    SectionItemContent.FreePreview = 'No';
                    SectionItemContent.Downloadable = 'No';
                    SectionItemContent.XFileName = "";
                    SectionItemContent.AuxiliarContent = AuxiliarContent;
                    //end set values

                    SectionItem.SectionItemContent = SectionItemContent;//add to SectionItem

                    //update UI
                    addSectionItemContent(SectionItem.SectionItemContent.XKey, SectionItem.XKey, '', SectionItemContent.AuxiliarContent, null);
                    //end update UI

                }

                if (answer === 1) {
                    showAlert('Error at server', '#c4453c');
                }

                if (answer === 2) {
                    showAlert('Link SectionItemContent already exists for this SectionItem', '#c4453c');
                }

                $('#div_Loader').css('display', 'none');//hide loader
            },
            error: function (jqXHR, textStatus, errorThrown) {
                $('#div_Loader').css('display', 'none');//hide loader
            }
        });

        return;
    }

    if (SectionItem.SectionItemContent) {

        $('body').append($('#div_Loader'));//append loader to the body and display it
        $('#div_Loader').css('display', 'block');//shows loader

        //send data
        $.ajax({
            method: "GET",
            url: APIUrl + '/updateSectionItemContent_LinkContent?p_string_SectionItemContentXKey=' + SectionItem.SectionItemContent.XKey + '&p_string_SectionItemXKey=' + SectionItem.XKey + '&p_string_KindOfContent=' + SectionItem.SectionItemContent.KindOfContent + '&p_string_FreePreview=' + SectionItem.SectionItemContent.FreePreview + '&p_string_Downloadable=' + SectionItem.SectionItemContent.Downloadable + '&p_string_AuxiliarContent=' + AuxiliarContent + '&p_string_Author=' + localStorage.getItem("LP_Session_Author"),
            dataType: "json",
            success: function (data) {
                // On success,
                var answer = data;//if succeded, the API returns the XKey of the new object, XKey length = 10

                if (answer === 0) {
                    //set values
                    SectionItem.SectionItemContent.AuxiliarContent = AuxiliarContent;
                    //end set values

                    //no UI update

                    showAlert('Updated', '#17aa1c');

                    processSectionItemAddContent(SectionItem.XKey);//close the form
                }

                if (answer === 1) {
                    showAlert('Error at server', '#c4453c');
                }

                if (answer === 2) {
                    showAlert('This SectionItemContent already exists for this SectionItem', '#c4453c');
                }

                if (answer === 3) {
                    showAlert('This SectionItemContent not longer exists and cannot be updated', '#c4453c');
                }

                $('#div_Loader').css('display', 'none');//hide loader
            },
            error: function (jqXHR, textStatus, errorThrown) {
                showAlert('Error: ' + textStatus);
                $('#div_Loader').css('display', 'none');//hide loader
            }
        });
    }
}

function updateSectionItemContent(SectionItemXKey, XFileName, AuxiliarContent, File) {
    var SectionItem = getSectionItem(SectionItemXKey);
    var CanRealese = false;

    SectionItem.SectionItemContent.KindOfContent = $('#span_KindOfContent_' + SectionItemXKey).text();
    SectionItem.SectionItemContent.XFileName = XFileName;
    SectionItem.SectionItemContent.AuxiliarContent = AuxiliarContent;

    //update UI
    $('#div_SectionItemContentDetails_' + SectionItemXKey).empty();
    $('#div_SectionItemContentDetails_' + SectionItemXKey).append(processSectionItemContentDetails(SectionItem));
    //end update UI

    processSectionItemAddContent(SectionItemXKey);//process UI

    checkSectionItemContentsLength(SectionItem);//validate

    checkSectionItemContentsThumbnail(SectionItem, 'Client Side', File);
}

function processSectionItemContentDetails(SectionItem) {
    var HTMLContent = "";

    if (SectionItem.SectionItemContent.KindOfContent !== 'Text' && SectionItem.SectionItemContent.KindOfContent !== 'Link') {
        HTMLContent += "<span id=\"span_SectionItemContentXFileName_" + SectionItem.SectionItemContent.XKey + "\">" + getSummaryOfSentence(SectionItem.SectionItemContent.XFileName, 30) + "</span > <br />";
    }

    if (SectionItem.SectionItemContent.KindOfContent === 'Video' || SectionItem.SectionItemContent.KindOfContent === 'Audio') {
        HTMLContent += "<span id=\"span_SectionItemContentLength_" + SectionItem.SectionItemContent.XKey + "\">" + getFlag(SectionItem.SectionItemContent.AuxiliarContent, 'Duration') + "</span><br/>";
    }

    if (SectionItem.SectionItemContent.KindOfContent === 'Presentation') {
        HTMLContent += "<span id=\"span_SectionItemContentLength_" + SectionItem.SectionItemContent.XKey + "\">" + getFlag(SectionItem.SectionItemContent.AuxiliarContent, 'Slides') + " Slides</span > <br />";
    }

    if (SectionItem.SectionItemContent.KindOfContent === 'Document') {
        HTMLContent += "<span id=\"span_SectionItemContentLength_" + SectionItem.SectionItemContent.XKey + "\">" + getFlag(SectionItem.SectionItemContent.AuxiliarContent, 'Pages') + " Pages</span > <br />";
    }

    if (SectionItem.SectionItemContent.KindOfContent === 'Text') {
        HTMLContent += "<span>Article</span><br/>";
    }

    if (SectionItem.SectionItemContent.KindOfContent === 'Link') {
        HTMLContent += "<span>Link</span><br/>";
    }

    HTMLContent += "<a onclick=\"$('#span_SectionItemContentXKeyFor_" + SectionItem.XKey + "').text('" + SectionItem.SectionItemContent.XKey + "'); processSectionItemEditContent('" + SectionItem.XKey + "', '" + SectionItem.SectionItemContent.KindOfContent + "');\"><span class=\"glyphicon glyphicon-pencil\"></span>&nbsp;Edit Content</a><br/>";

    if (SectionItem.SectionItemContent.KindOfContent !== 'Video') {
        HTMLContent += "<a onclick=\"$('#span_SectionItemContentXKeyFor_" + SectionItem.XKey + "').text('" + SectionItem.SectionItemContent.XKey + "'); processSectionItemEditContent('" + SectionItem.XKey + "', 'Video');\"><span class=\"glyphicon glyphicon-play\"></span>Replace with video</a >";
    }

    return HTMLContent;
}

function uploadSectionItemContent(sender, SectionItemXKey) {

    var SectionItem = getSectionItem(SectionItemXKey);

    $(sender).parent().find('.SectionItemXKey').text(SectionItemXKey);

    if (!SectionItem.SectionItemContent)
        $(sender).parent().find('.LPUploadMode').text("New SectionItemContent");

    if (SectionItem.SectionItemContent)
        $(sender).parent().find('.LPUploadMode').text("Update SectionItemContent");

    $('#span_UploadChannel_' + SectionItemXKey).text('Content');

    $('#input_SectionItemContentFile_' + SectionItemXKey).click();
}

function setUploadSectionItemContentFormAction(SectionItemXKey) {
    if ($('#span_PreXMode_' + SectionItemXKey).text() === 'New')
        document.getElementById("form_UploadSectionItemContent_" + SectionItemXKey).action = APIUrl + '/uploadSectionItemContent?p_string_CourseXKey=' + CurrentWizardCourse.XKey + '&p_string_SectionItemXKey=' + SectionItemXKey + '&p_string_KindOfContent=' + $('#span_KindOfContent_' + SectionItemXKey).text() + '&p_string_Published=No&p_string_FreePreview=No&p_string_Downloadable=No&p_int_ListNumber=0&p_string_XFileName=' + $('#input_SectionItemContentFile_' + SectionItemXKey).val().split('\\').pop() + '&p_string_Author=' + localStorage.getItem("LP_Session_Author");
    if ($('#span_PreXMode_' + SectionItemXKey).text() === 'Edit')
        document.getElementById("form_UploadSectionItemContent_" + SectionItemXKey).action = APIUrl + '/replaceSectionItemContent?p_string_CourseXKey=' + CurrentWizardCourse.XKey + '&p_string_SectionItemXKey=' + SectionItemXKey + '&p_string_SectionItemContentXKey=' + $('#span_SectionItemContentXKeyFor_' + SectionItemXKey).text() + '&p_string_KindOfContent=' + $('#span_KindOfContent_' + SectionItemXKey).text() + '&p_string_Author=' + localStorage.getItem("LP_Session_Author");
}

function processSectionItemContentSwitches(SectionItemContentXKey)
{
    var FreePreviewStatus = '';
    var DownloadableStatus = '';

    if ($('#input_FreePreview_' + SectionItemContentXKey).is(':checked'))
        FreePreviewStatus = 'Yes';
    else
        FreePreviewStatus = 'No';

    if ($('#input_Downloadable_' + SectionItemContentXKey).is(':checked'))
        DownloadableStatus = 'Yes';
    else
        DownloadableStatus = 'No';

    $('body').append($('#div_Loader'));//append and display loader in body
    $('#div_Loader').css('display', 'inline');

    $.getJSON(APIUrl + '/processSectionItemContentSwitches?p_string_SectionItemContentXKey=' + SectionItemContentXKey + '&p_string_FreePreview=' + FreePreviewStatus + '&p_string_Downloadable=' + DownloadableStatus + '&p_string_Author=' + localStorage.getItem("LP_Session_Author"))
        .done(function (data) {
            // On success,
            var answer = data;

            if (answer === 0) {
                //nothing
            }

            if (answer === 1) {
                showAlert('Error at server', '#c4453c');
            }

            if (answer === 2) {
                showAlert('This SectionItemContent not longer exists and cannot be updated', '#c4453c');
            }

            $('#div_Loader').css('display', 'none');//hide loading animation
        })
        .fail(function (jqXHR, textStatus, err) {
            $('#div_Loader').css('display', 'none');//hide loading animation
        });
}

function deleteSectionItemContent(SectionItemContentXKey, SectionItemXKey, XFileName) {

    if (confirm('You are about to remove a content. Are you sure you want to continue?') === true) {

        $('body').append($('#div_Loader'));//append and display loader in body
        $('#div_Loader').css('display', 'inline');

        $.getJSON(APIUrl + '/deleteSectionItemContent?p_string_CourseXKey=' + CurrentWizardCourse.XKey + '&p_string_SectionItemContentXKey=' + SectionItemContentXKey + '&p_string_SectionItemXKey=' + SectionItemXKey + '&p_string_XFileName=' + XFileName)
            .done(function (data) {
                // On success,
                var answer = data;

                if (answer === 0) {

                    //remove from UI
                    $('#div_Content_' + SectionItemContentXKey).remove();

                    //remove from  local array
                    for (var i = 0; i < CurriculumSections.length; i++) {
                        for (var j = 0; j < CurriculumSections[i].SectionItems.length; j++) {

                            if (CurriculumSections[i].SectionItems[j].SectionItemContent) {
                                if (CurriculumSections[i].SectionItems[j].SectionItemContent.XKey === SectionItemContentXKey) {
                                    CurriculumSections[i].SectionItems[j].SectionItemContent = null;
                                    break;
                                }
                            }
                        }
                    }

                    showAlert('Deleted', '#c4453c');
                }

                if (answer === 1) {
                    showAlert('Error at server', '#c4453c');
                }

                if (answer === 2) {
                    showAlert('This Section Item Content not longer exists and cannot be deleted', '#c4453c');
                }

                $('#div_Loader').css('display', 'none');//hide loader
            })
            .fail(function (jqXHR, textStatus, err) {
                $('#div_Loader').css('display', 'none');//hide loader
            });
    }
}
//...........
function addSectionItemVideoCaption(SectionItemVideoCaptionXKey, SectionItemXKey, XFileName) {
    SectionItem = getSectionItem(SectionItemXKey);

    var SectionItemVideoCaption = {};//create the object

    //set values
    SectionItemVideoCaption.XKey = SectionItemVideoCaptionXKey;
    SectionItemVideoCaption.SectionItemXKey = SectionItemXKey;
    SectionItemVideoCaption.XLanguage = $('#span_VideoCaptionXLanguage_' + SectionItemXKey).text();
    SectionItemVideoCaption.XFileName = XFileName;
    //end set values

    SectionItem.SectionItemVideoCaptions.push(SectionItemVideoCaption);//add to collection

    //update UI
    $('#table_SectionItemCaptions_' + SectionItemXKey).append("<tr id=\"tr_VideoCaption_" + SectionItemVideoCaption.XKey + "\"> \
                                                       <td><span class=\"glyphicon glyphicon-globe\"></span>&nbsp;" + SectionItemVideoCaption.XLanguage + "&nbsp;<strong>(" + getSummaryOfSentence(SectionItemVideoCaption.XFileName, 60) + ")</strong>&nbsp;<span class=\"glyphicon glyphicon-trash LPSectionVisibleOption\" style=\"float:right\" onclick=\"deleteSectionItemVideoCaption('" + SectionItemVideoCaption.XKey + "','" + SectionItem.XKey + "','" + SectionItemVideoCaption.XFileName + "');\"></span></td> \
                                                    </tr>");
    processSectionItemAddContent(SectionItemXKey);
    //end update UI

    checkSectionItemVideoCaptionsLength(SectionItem);//validate
}

function uploadSectionItemVideoCaption(sender, SectionItemXKey) {

    $('#span_VideoCaptionXLanguage_' + SectionItemXKey).text($('#select_SectionItemVideoCaptionXLanguage_' + SectionItemXKey + ' option:selected').text());

    if ($('#span_VideoCaptionXLanguage_' + SectionItemXKey).text() !== 'Select') {
        $(sender).parent().find('.SectionItemXKey').text(SectionItemXKey);

        $(sender).parent().find('.LPUploadMode').text("New SectionItemVideoCaption");

        $('#span_UploadChannel_' + SectionItemXKey).text('VideoCaption');

        $('#input_SectionItemContentFile_' + SectionItemXKey).click();
    }
    else {
        showAlert('Choose a Language for the Caption', '#c4453c');
    }
}

function setUploadSectionItemVideoCaptionFormAction(SectionItemXKey) {
    if ($('#span_PreXMode_' + SectionItemXKey).text() === 'NewVideoCaption')
        document.getElementById("form_UploadSectionItemContent_" + SectionItemXKey).action = APIUrl + '/uploadSectionItemVideoCaption?p_string_CourseXKey=' + CurrentWizardCourse.XKey + '&p_string_SectionItemXKey=' + SectionItemXKey + '&p_string_XLanguage=' + $('#span_VideoCaptionXLanguage_' + SectionItemXKey).text() + '&p_string_XFileName=' + $('#input_SectionItemContentFile_' + SectionItemXKey).val().split('\\').pop() + '&p_string_Author=' + localStorage.getItem("LP_Session_Author");
}

function deleteSectionItemVideoCaption(SectionItemVideoCaptionXKey, SectionItemXKey, XFileName) {

    if (confirm('You are about to remove a Video Caption. Are you sure you want to continue?') === true) {

        $('body').append($('#div_Loader'));//append and display loader in body
        $('#div_Loader').css('display', 'inline');

        $.getJSON(APIUrl + '/deleteSectionItemVideoCaption?p_string_CourseXKey=' + CurrentWizardCourse.XKey + '&p_string_SectionItemVideoCaptionXKey=' + SectionItemVideoCaptionXKey + '&p_string_SectionItemXKey=' + SectionItemXKey + '&p_string_XFileName=' + XFileName)
            .done(function (data) {
                // On success,
                var answer = data;

                if (answer === 0) {

                    //remove from UI
                    $('#tr_VideoCaption_' + SectionItemVideoCaptionXKey).remove();

                    //remove from  local array
                    for (var i = 0; i < CurriculumSections.length; i++) {
                        for (var j = 0; j < CurriculumSections[i].SectionItems.length; j++) {
                            for (var k = 0; k < CurriculumSections[i].SectionItems[j].SectionItemVideoCaptions.length; k++) {
                                if (CurriculumSections[i].SectionItems[j].SectionItemVideoCaptions[k].XKey === SectionItemVideoCaptionXKey) {
                                    CurriculumSections[i].SectionItems[j].SectionItemVideoCaptions.splice(k, 1);
                                    checkSectionItemVideoCaptionsLength(CurriculumSections[i].SectionItems[j]);//validate
                                    break;
                                }
                            }
                        }
                    }

                    showAlert('Deleted', '#17aa1c');
                }

                if (answer === 1) {
                    showAlert('Error at server', '#c4453c');
                }

                if (answer === 2) {
                    showAlert('This Section Item Video Caption not longer exists and cannot be deleted','#c4453c');
                }

                $('#div_Loader').css('display', 'none');//hide loader
            })
            .fail(function (jqXHR, textStatus, err) {
                $('#div_Loader').css('display', 'none');//hide loader
            });
    }
}
//...........
function addSectionItemResource(SectionItemResourceXKey, SectionItemXKey, XFileName) {
    SectionItem = getSectionItem(SectionItemXKey);

    var SectionItemResource = {};//create the object

    //set values
    SectionItemResource.XKey = SectionItemResourceXKey;
    SectionItemResource.SectionItemXKey = SectionItemXKey;
    SectionItemResource.XFileName = XFileName;
    //end set values

    SectionItem.SectionItemResources.push(SectionItemResource);//add to collection

    //update UI
    $('#table_SectionItemDownloadableResources_' + SectionItemXKey).append("<tr id=\"tr_Resources_" + SectionItemResource.XKey + "\"> \
                                                       <td><span class=\"glyphicon glyphicon-save\"></span>&nbsp;" + getSummaryOfSentence(SectionItemResource.XFileName, 60) + "&nbsp;<span class=\"glyphicon glyphicon-trash LPSectionVisibleOption\" style=\"float:right\" onclick=\"deleteSectionItemResource('" + SectionItemResource.XKey + "','" + SectionItem.XKey + "','" + SectionItemResource.XFileName + "');\"></span></td> \
                                                    </tr>");
    processSectionItemAddResource(SectionItemXKey);
    //end update UI

    checkSectionItemResourcesLength(SectionItem);//validate
}

function uploadSectionItemResource(sender, SectionItemXKey) {

    $(sender).parent().find('.SectionItemXKey').text(SectionItemXKey);

    $(sender).parent().find('.LPUploadMode').text("New SectionItemResource");

    $('#input_SectionItemResourceFile_' + SectionItemXKey).click();
}

function setUploadSectionItemResourceFormAction(SectionItemXKey) {
    document.getElementById("form_UploadSectionItemResource_" + SectionItemXKey).action = APIUrl + '/uploadSectionItemResource?p_string_CourseXKey=' + CurrentWizardCourse.XKey + '&p_string_SectionItemXKey=' + SectionItemXKey + '&p_string_XFileName=' + $('#input_SectionItemResourceFile_' + SectionItemXKey).val().split('\\').pop() + '&p_string_Author=' + localStorage.getItem("LP_Session_Author");
}

function deleteSectionItemResource(SectionItemResourceXKey, SectionItemXKey, XFileName) {

    if (confirm('You are about to remove a resource. Are you sure you want to continue?') === true) {

        $('body').append($('#div_Loader'));//append and display loader in body
        $('#div_Loader').css('display', 'inline');

        $.getJSON(APIUrl + '/deleteSectionItemResource?p_string_CourseXKey=' + CurrentWizardCourse.XKey + '&p_string_SectionItemResourceXKey=' + SectionItemResourceXKey + '&p_string_SectionItemXKey=' + SectionItemXKey + '&p_string_XFileName=' + XFileName)
            .done(function (data) {
                // On success,
                var answer = data;

                if (answer === 0) {

                    //remove from UI
                    $('#tr_Resources_' + SectionItemResourceXKey).remove();

                    //remove from  local array
                    for (var i = 0; i < CurriculumSections.length; i++) {
                        for (var j = 0; j < CurriculumSections[i].SectionItems.length; j++) {
                            for (var k = 0; k < CurriculumSections[i].SectionItems[j].SectionItemResources.length; k++) {
                                if (CurriculumSections[i].SectionItems[j].SectionItemResources[k].XKey === SectionItemResourceXKey) {
                                    CurriculumSections[i].SectionItems[j].SectionItemResources.splice(k, 1);
                                    checkSectionItemResourcesLength(CurriculumSections[i].SectionItems[j]);//validate
                                    break;
                                }
                            }
                        }
                    }

                    showAlert('Deleted','#17aa1c');
                }

                if (answer === 1) {
                    showAlert('Error at server', '#c4453c');
                }

                if (answer === 2) {
                    showAlert('This Section Item Resource not longer exists and cannot be deleted', '#c4453c');
                }

                $('#div_Loader').css('display', 'none');//hide loader
            })
            .fail(function (jqXHR, textStatus, err) {
                $('#div_Loader').css('display', 'none');//hide loader
            });
    }
}
//............
//-------
function processQuizQuestionTabHeaderX(SectionItemXKey) {
    $('#div_SectionItemOptionsHiddenble_' + SectionItemXKey).css('display', 'none');
    $('#div_QuizQuestionTab_' + SectionItemXKey).css('display', 'block');
    $('#div_SectionItemHeader_' + SectionItemXKey).css('border-bottom', 'solid 1px #808080');
    $('#div_SectionItemAdd_' + SectionItemXKey).css('display', 'none');
    $('#div_SectionItemAddQuizQuestion_' + SectionItemXKey).css('display', 'block');
    $('#div_QuizQuestionTypes_' + SectionItemXKey).css('display', 'none');
}

function processSectionItemAddQuizQuestion(Id) {
    if ($('#div_SectionItemOptionsHiddenble_' + Id).css('display') === 'block') {
        processQuizQuestionTabHeaderX(Id);
        $('#div_QuizQuestionTypes_' + Id).css('display', 'block');//call this method to override the QuizQuestionTypes behaivour from processQuizQuestionTabHeaderX
    }
    else {
        $('#div_SectionItemOptionsHiddenble_' + Id).css('display', 'block');
        $('#div_QuizQuestionTab_' + Id).css('display', 'none');
        $('#strong_QuizQuestionTabTitle_' + Id).html('Select question type');
        $('#div_SectionItemHeader_' + Id).css('border-bottom', '0');
        if ($('#span_SectionItemExpandableOption_' + Id).hasClass('glyphicon-chevron-up'))
            $('#div_SectionItemAdd_' + Id).css('display', 'block');
        $('#div_AddQuizQuestionFormulary_' + Id).css('display', 'none');
        $('#div_SectionItemAddQuizQuestion_' + Id).css('display', 'none');
    }
}

function cleanNewQuizQuestionUI(Id, XMode) {
    if (XMode === 'Single Answer') {
        tinyMCE.get('textarea_QuizQuestion_SingleAnswer_' + Id).setContent('');
        $('#textarea_QuizQuestion_RightAnswer_' + Id).val('');
        $('#select_RelatedLecture_SingleAnswer_').prop('selectedIndex', 0);
        $('#input_TimeLimit_SingleAnswer_' + Id).val('0');
    }

    if (XMode === 'Multiple Choice') {
        tinyMCE.get('textarea_QuizQuestion_MultipleChoice_' + Id).setContent('');
        $('#div_MultipleChoices_' + Id).empty();
        for (i = 1; i <= MinimunChoicesQuantity; i++) {
            addQuestionChoice(Id, null, '');
        }
        $('#select_RelatedLecture_MultipleChoice_').prop('selectedIndex', 0);
        $('#input_TimeLimit_MultipleChoice_' + Id).val('0');
    }
}

function addQuestionChoice(SectionItemXKey, QuestionChoice, RightAnswer_Here) {
    var HTMLContent = "";

    if (QuestionChoice) {
        HTMLContent += "\
                                                                 <div class=\"LPQuestionChoiceContainer\" style=\"margin-bottom:5px;\"> \
                                                                    <table class=\"LPTableQuestionChoice\"> \
                                                                        <tr>";
        if (QuestionChoice.Choice === RightAnswer_Here)
            HTMLContent += "                                               <td><input type=\"radio\" class=\"LPRightChoice\" name=\"radio_RightChoice\" checked></td>";
        else
            HTMLContent += "                                               <td><input type=\"radio\" class=\"LPRightChoice\" name=\"radio_RightChoice\"></td>";


        HTMLContent += "                                                   <td><textarea class=\"form-control LPChoiceContent \" onclick=\"validateAddNewQuestionChoiceForm(this, '" + SectionItemXKey + "');\">" + QuestionChoice.Choice + "</textarea><td> \
                                                                           <td><span class=\"glyphicon glyphicon-trash\" onclick=\"validateDeleteQuestionChoice(this, '" + SectionItemXKey + "');\"></span></td> \
                                                                        </tr> \
                                                                        <tr> \
                                                                            <td></td > \
                                                                            <td> \
                                                                                <input type=\"text\" class=\"form-control LPChoiceContentExplanation\" placeholder=\"Explain why this is o isn`t the best answer.\" value=\"" + QuestionChoice.WhyThisAnswerIs + "\"> \
                                                                            </td> \
                                                                            <td></td >\
                                                                        </tr> \
                                                                    </table> \
                                                                 </div>";

        $('#div_MultipleChoices_' + SectionItemXKey).append(HTMLContent);
    }
    else {
        $('#div_MultipleChoices_' + SectionItemXKey).append("\       <div class=\"LPQuestionChoiceContainer\" style=\"margin-bottom:5px;\"> \
                                                                    <table class=\"LPTableQuestionChoice\"> \
                                                                        <tr> \
                                                                            <td><input type=\"radio\" class=\"LPRightChoice\" name=\"radio_RightChoice\"></td> \
                                                                            <td><textarea class=\"form-control LPChoiceContent \" onclick=\"validateAddNewQuestionChoiceForm(this, '" + SectionItemXKey + "');\"></textarea><td> \
                                                                            <td><span class=\"glyphicon glyphicon-trash\" onclick=\"validateDeleteQuestionChoice(this, '" + SectionItemXKey + "');\"></span></td> \
                                                                        </tr> \
                                                                        <tr> \
                                                                            <td></td > \
                                                                            <td> \
                                                                                <input type=\"text\" class=\"form-control LPChoiceContentExplanation\" placeholder=\"Explain why this is o isn`t the best answer.\"> \
                                                                            </td> \
                                                                            <td></td >\
                                                                        </tr> \
                                                                    </table> \
                                                                 </div> \
        ");
    }
}

function validateDeleteQuestionChoice(sender, SectionItemXKey) {
    if ($('#div_MultipleChoices_' + SectionItemXKey).children().length > MinimunChoicesQuantity) {
        $(sender).parent().parent().parent().parent().parent().remove();
    }
    else
        showAlert('You need to have at least ' + MinimunChoicesQuantity + ' possible answers', '#c4453c');
}

function validateAddNewQuestionChoiceForm(sender, SectionItemXKey) {
    if ($('#div_MultipleChoices_' + SectionItemXKey).children().length <= MaximunChoicesQuantity) {
        if ($(sender).parent().parent().parent().parent().parent().is(':last-child'))
            addQuestionChoice(SectionItemXKey, null, '');
    }
    else
        showAlert('You are available to have at maximun ' + MaximunChoicesQuantity + ' possible answers', '#c4453c');
}

function processAddQuizQuestion(Id, XMode) {
    if ($('#div_QuizQuestionTypes_' + Id).css('display') === 'block') {
        $('#div_QuizQuestionTypes_' + Id).css('display', 'none');

        processQuizQuestionFormulary(Id, XMode);

        cleanNewQuizQuestionUI(Id, XMode);

        if (XMode === 'Single Answer') {
            $('#span_PreXMode_SingleAnswer_' + Id).text('New');
        }

        if (XMode === 'Multiple Choice') {
            $('#span_PreXMode_MultipleChoice_' + Id).text('New');
        }

        $('#div_AddQuizQuestionFormulary_' + Id).css('display', 'block');
    }
}

function processQuizQuestionFormulary(Id, XMode) {

    if (XMode === 'Single Answer') {
        $('#strong_QuizQuestionTypeTabTitle_' + Id).html('Add Single Answer');
        $('#form_SingleAnswer_' + Id).css('display', 'block');
        $('#form_MultipleChoice_' + Id).css('display', 'none');
    }
    if (XMode === 'Multiple Choice') {
        $('#strong_QuizQuestionTypeTabTitle_' + Id).html('Add Multiple Choice');
        $('#form_SingleAnswer_' + Id).css('display', 'none');
        $('#form_MultipleChoice_' + Id).css('display', 'block');
    }
}

function getDataFromQuizQuestionUI(SectionItem, XMode, PreXMode) {

    if (XMode === 'Single Answer') {
        Question = $.trim(tinyMCE.get('textarea_QuizQuestion_SingleAnswer_' + SectionItem.XKey).getContent());
        RightAnswer = $.trim($('#textarea_QuizQuestion_RightAnswer_' + SectionItem.XKey).val());

        if ($('#select_RelatedLecture_SingleAnswer_' + SectionItem.XKey + ' option:selected').val() !== 'Select')
            RelatedLecture = $('#select_RelatedLecture_SingleAnswer_' + SectionItem.XKey + ' option:selected').val();
        else
            RelatedLecture = 'null';

        if ($('#input_TimeLimit_SingleAnswer_' + SectionItem.XKey).val() === '')
            TimeLimitInSeconds = 0;
        else
            TimeLimitInSeconds = $('#input_TimeLimit_SingleAnswer_' + SectionItem.XKey).val();

        if (PreXMode === 'New')
            QuizQuestionListNumber = SectionItem.QuizQuestions.length + 1;
    }

    if (XMode === 'Multiple Choice') {
        Question = $.trim(tinyMCE.get('textarea_QuizQuestion_MultipleChoice_' + SectionItem.XKey).getContent());

        if ($('#select_RelatedLecture_MultipleChoice_' + SectionItem.XKey + ' option:selected').val() !== 'Select')
            RelatedLecture = $('#select_RelatedLecture_MultipleChoice_' + SectionItem.XKey + ' option:selected').val();
        else
            RelatedLecture = 'null';

        if ($('#input_TimeLimit_MultipleChoice_' + SectionItem.XKey).val() === '')
            TimeLimitInSeconds = 0;
        else
            TimeLimitInSeconds = $('#input_TimeLimit_MultipleChoice_' + SectionItem.XKey).val();

        if (PreXMode === 'New')
            QuizQuestionListNumber = SectionItem.QuizQuestions.length + 1;
    }
}

function getRelatedLectureOptions(SectionItem) {
    var RelatedLectureOptions = "";

    var CurriculumSection_ForThisSectionItem = getCurriculumSection(SectionItem.CurriculumSectionXKey);

    $.each(CurriculumSections, function (index, CurriculumSection_Temporal) {

        var BreakLoop = false;

        if (CurriculumSection_Temporal.ListNumber <= CurriculumSection_ForThisSectionItem.ListNumber) {
            $.each(CurriculumSection_Temporal.SectionItems, function (index2, SectionItem_Temporal) {

                var CanAddLectureOption = false;

                if (SectionItem_Temporal.KindOfItem === 'Lecture') {
                    if (SectionItem_Temporal.CurriculumSectionXKey !== SectionItem.CurriculumSectionXKey) {
                        CanAddLectureOption = true;
                    }
                    else {
                        if (SectionItem_Temporal.SectionListNumber < SectionItem.SectionListNumber)
                            CanAddLectureOption = true;
                        else {
                            BreakLoop = true;
                            return false;
                        }
                    }

                    if (CanAddLectureOption === true) {
                        RelatedLectureOptions += "<option value=\"" + SectionItem_Temporal.XKey + "\">" + SectionItem_Temporal.Title + "</option>";
                    }
                }

            });

            if (BreakLoop === true)
                return false;

        }
        else
            return false;

        if (BreakLoop === true)
            return false;
    });

    return RelatedLectureOptions;
}

function realeaseQuizQuestionsRelatedLecture(SectionItem) {
    var RelatedLectureOptionsPackage = getRelatedLectureOptions(SectionItem);

    //realese UI for RelatedLecture
    $('#select_RelatedLecture_SingleAnswer_' + SectionItem.XKey).empty();
    $('#select_RelatedLecture_SingleAnswer_' + SectionItem.XKey).append("<option value=\"Select\">Select</option>");
    $('#select_RelatedLecture_SingleAnswer_' + SectionItem.XKey).append(RelatedLectureOptionsPackage);

    $('#select_RelatedLecture_MultipleChoice_' + SectionItem.XKey).empty();
    $('#select_RelatedLecture_MultipleChoice_' + SectionItem.XKey).append("<option value=\"Select\">Select</option>");
    $('#select_RelatedLecture_MultipleChoice_' + SectionItem.XKey).append(RelatedLectureOptionsPackage);
    //end realese UI for RelatedLecture

    var CountRelatedLectureChanges = 0;

    $.each(SectionItem.QuizQuestions, function (index, QuizQuestion) {

        var RelatedLectureOptionDetected = false;

        if (QuizQuestion.RelatedLecture !== 'null') {
            if ($('#select_RelatedLecture_SingleAnswer_' + SectionItem.XKey + ' option[value="' + QuizQuestion.RelatedLecture + '"]').length > 0)//this serves also for MultipleChoice, the same formulary, selects have the same ooptions
            {
                RelatedLectureOptionDetected = true;
                $('#select_RelatedLecture_SingleAnswer_' + SectionItem.XKey + ' option[value="' + QuizQuestion.RelatedLecture + '"]').prop('selected', true);
            }

            if (RelatedLectureOptionDetected === false) {
                QuizQuestion.RelatedLecture = 'null';
                CountRelatedLectureChanges++;
            }
        }
    });

    if (CountRelatedLectureChanges > 0)
        showAlert('When sort a Quiz, you need to reassing your Related Lectures for your questions, only you will have available Lectures previous to where your Quiz is placed. Quiz ' + SectionItem.Title + '`questions needs editing.', '#c4453c');
}

function buildUpQuestionChoicesPackage(SectionItemXKey) {
    var Answer = 0;

    if (QuestionChoicesPackage.length > 0)//clean up the package
        QuestionChoicesPackage = []; //create new array

    RightAnswer = ''; //realese the RightAnswer

    $('#div_MultipleChoices_' + SectionItemXKey + ' .LPQuestionChoiceContainer').each(function (index) {

        var QuestionChoice = {};//create the object

        QuestionChoice.Choice = $.trim($(this).find('.LPChoiceContent').val());
        QuestionChoice.WhyThisAnswerIs = $.trim($(this).find('.LPChoiceContentExplanation').val());
        QuestionChoice.ListNumber = QuestionChoicesPackage.length + 1;

        if ($(this).find('.LPRightChoice').is(':checked')) {
            RightAnswer = QuestionChoice.Choice;
        }

        //verify empty fields
        if ((!QuestionChoice.Choice || !QuestionChoice.WhyThisAnswerIs) && $(this).is(':last-child') === false) {
            Answer = 1;
            return false;
        }//abort operation

        if ((QuestionChoice.Choice && QuestionChoice.WhyThisAnswerIs) && $(this).is(':last-child') === false) {
            QuestionChoicesPackage.push(QuestionChoice);
        }

        if ((QuestionChoice.Choice && QuestionChoice.WhyThisAnswerIs) && $(this).is(':last-child') === true) {
            QuestionChoicesPackage.push(QuestionChoice);
        }
        //end verify empty fields
    });

    if (Answer === 0 && !RightAnswer) {
        Answer = 2;
    }

    if (Answer === 0 && QuestionChoicesPackage.length < MinimunChoicesQuantity) {
        Answer = 3;
    }

    return Answer;
}

function validateQuizQuestion(SectionItem, XMode, PreXMode) {
    getDataFromQuizQuestionUI(SectionItem, XMode, PreXMode);

    if (XMode === 'Single Answer') {
        if (!Question || !RightAnswer)
            return 1;
    }

    if (XMode === 'Multiple Choice') {
        if (!Question)
            return 1;

        return buildUpQuestionChoicesPackage(SectionItem.XKey);
    }

    return 0;
}

function checkSectionItemQuizQuestionsLength(SectionItem) {
    if (SectionItem.QuizQuestions.length === 0) {
        $('#div_SectionItemQuizQuestions_' + SectionItem.XKey).css('display', 'none');
        $('#span_SectionItemExpandableOption_' + SectionItem.XKey).css('display', 'none');
        $('#button_AddQuizQuestions_' + SectionItem.XKey).css('display', 'block');
    }
    else {
        $('#span_SectionItemExpandableOption_' + SectionItem.XKey).css('display', 'block');
        $('#button_AddQuizQuestions_' + SectionItem.XKey).css('display', 'none');
        $('#div_SectionItemQuizQuestions_' + SectionItem.XKey).css('display', 'block');
    }
}

function getQuizQuestion(QuizQuestionXKey) {
    //loop the local buffer and find the requested SectionItem
    for (var i = 0; i < CurriculumSections.length; i++) {
        for (var j = 0; j < CurriculumSections[i].SectionItems.length; j++) {
            for (var k = 0; k < CurriculumSections[i].SectionItems[j].QuizQuestions.length; k++) {
                if (CurriculumSections[i].SectionItems[j].QuizQuestions[k].XKey === QuizQuestionXKey) {
                    return CurriculumSections[i].SectionItems[j].QuizQuestions[k];
                }
            }
        }
    }
}

function saveQuizQuestion(XMode, SectionItemXKey, QuizQuestionXKey) {
    var SectionItem = getSectionItem(SectionItemXKey);
    var QuizQuestion;

    if (QuizQuestionXKey)
        QuizQuestion = getQuizQuestion(QuizQuestionXKey);

    if (XMode === 'Single Answer') {
        if ($('#span_PreXMode_SingleAnswer_' + SectionItemXKey).text() === 'New') {
            var ValidationAnswer = validateQuizQuestion(SectionItem, XMode, $('#span_PreXMode_SingleAnswer_' + SectionItemXKey).text());

            if (ValidationAnswer === 0) {
                $('body').append($('#div_Loader'));//append loader to the body and display it
                $('#div_Loader').css('display', 'block');//shows loader

                //send data
                $.ajax({
                    method: "POST",
                    url: APIUrl + '/addQuizQuestion?p_string_SectionItemXKey=' + SectionItemXKey + '&p_string_KindOfQuestion=' + XMode + '&p_string_RightAnswer=' + encodeURIComponent(RightAnswer) + '&p_string_RelatedLecture=' + RelatedLecture + '&p_int_TimeLimitInSeconds=' + TimeLimitInSeconds + '&p_int_ListNumber=' + QuizQuestionListNumber + '&p_string_Author=' + localStorage.getItem("LP_Session_Author"),
                    dataType: "json",
                    data: { '': Question },
                    success: function (data) {
                        // On success,
                        var answer = data;//if succeded, the API returns the XKey of the new object, XKey length = 10

                        if (answer.length === 10) {
                            var QuizQuestion = {};//create new object

                            //set values
                            QuizQuestion.XKey = data;
                            QuizQuestion.SectionItemXKey = SectionItemXKey;
                            QuizQuestion.KindOfQuestion = XMode;
                            QuizQuestion.Question = Question;
                            QuizQuestion.RightAnswer = RightAnswer;
                            QuizQuestion.RelatedLecture = RelatedLecture;
                            QuizQuestion.TimeLimitInSeconds = TimeLimitInSeconds;
                            QuizQuestion.ListNumber = QuizQuestionListNumber;
                            //end set values

                            SectionItem.QuizQuestions.push(QuizQuestion);//push it to local buffer

                            //update UI
                            $('#ul_SectionItemQuizQuestions_' + SectionItemXKey).append("<li id=\"li_QuizQUestion_" + QuizQuestion.XKey + "\" class=\"ui-state-default\" quizquestionxkey=\"" + QuizQuestion.XKey + "\"><div class=\"LPQuestionSummary handle_Question\" onmouseover= \"$(this).next().css('visibility','visible');\" onmouseout= \"$(this).next().css('visibility','hidden');\"><strong id=\"strong_QuizQuestionListNumber_" + QuizQuestion.XKey + "\">" + QuizQuestion.ListNumber + ".</strong>&nbsp;<span id=\"span_QuizQuestionQuestionSummary_" + QuizQuestion.XKey + "\">" + getSummaryOfSentence(getTextContentFromHTML(QuizQuestion.Question), 80) + "</span>&nbsp;<span style=\"color:hsla(0, 2%, 27%, 0.45);\">" + QuizQuestion.KindOfQuestion + "</span></div><div class=\"SortableMenuToggle\" style=\"float:right;\" onmousemove=\"$(this).css('visibility', 'visible');\" onmouseout=\"$(this).css('visibility','hidden');\"><div type=\"button\" class=\"btn btn-default\" onclick=\"openQuizQuestion('" + QuizQuestion.XKey + "');\"><span class=\"glyphicon glyphicon-pencil\"></span></div><div type=\"button\" class=\"btn btn-default\" onclick=\"deleteQuizQuestion('" + SectionItem.XKey + "','" + QuizQuestion.XKey + "');\"><span class=\"glyphicon glyphicon-trash\"></span></div><div type=\"button\" class=\"btn btn-default LPDragandDrop handle_Question\"><span class=\"glyphicon glyphicon-menu-hamburger\"></span></div></div></li>");
                            //end UI

                            processSectionItemAddQuizQuestion(SectionItemXKey, XMode);//close the form

                            checkSectionItemQuizQuestionsLength(SectionItem);

                            if ($('#span_SectionItemExpandableOption_' + SectionItemXKey).hasClass('glyphicon-chevron-down'))
                                $('#span_SectionItemExpandableOption_' + SectionItemXKey).click();//display SectionItem Content

                            showAlert('Saved', '#17aa1c');
                        }

                        if (answer === '1') {
                            showAlert('Error at server', '#c4453c');
                        }

                        if (answer === '2') {
                            showAlert('Quiz Question for this Quiz already exists', '#c4453c');
                        }

                        $('#div_Loader').css('display', 'none');//hide loader
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        $('#div_Loader').css('display', 'none');//hide loader
                    }
                });
            }
            else {
                if (ValidationAnswer === 1)
                    showAlert('Please complete the Quiz Question form', '#c4453c');
            }
        }

        if ($('#span_PreXMode_SingleAnswer_' + SectionItemXKey).text() === 'Edit') {
            var ValidationAnswer = validateQuizQuestion(SectionItem, XMode, $('#span_PreXMode_SingleAnswer_' + SectionItemXKey).text());

            if (ValidationAnswer === 0) {

                $('body').append($('#div_Loader'));//append loader to the body and display it
                $('#div_Loader').css('display', 'block');//shows loader

                //send data
                $.ajax({
                    method: "POST",
                    url: APIUrl + '/updateQuizQuestion?p_string_QuizQuestionXKey=' + QuizQuestion.XKey + '&p_string_SectionItemXKey=' + QuizQuestion.SectionItemXKey + '&p_string_KindOfQuestion=' + QuizQuestion.KindOfQuestion + '&p_string_RightAnswer=' + encodeURIComponent(RightAnswer) + '&p_string_RelatedLecture=' + RelatedLecture + '&p_int_TimeLimitInSeconds=' + TimeLimitInSeconds + '&p_int_ListNumber=' + QuizQuestion.ListNumber + '&p_string_Author=' + localStorage.getItem("LP_Session_Author"),
                    dataType: "json",
                    data: { '': Question },
                    success: function (data) {
                        // On success,
                        var answer = data;

                        if (answer === 0) {

                            //set new values
                            QuizQuestion.Question = Question;
                            QuizQuestion.RightAnswer = RightAnswer;
                            QuizQuestion.RelatedLecture = RelatedLecture;
                            QuizQuestion.TimeLimitInSeconds = TimeLimitInSeconds;
                            //end set new values

                            //update the UI
                            $('#span_QuizQuestionQuestionSummary_' + QuizQuestion.XKey).html(getSummaryOfSentence(getTextContentFromHTML(QuizQuestion.Question), 80));
                            //end of update the UI

                            showAlert('Updated', '#17aa1c');

                            processSectionItemAddQuizQuestion(SectionItemXKey);//close the form
                        }

                        if (answer === 1) {
                            showAlert('Error at server', '#c4453c');
                        }

                        if (answer === 3) {
                            showAlert('This QuizQuestion not longer exists and cannot be updated', '#c4453c');
                        }

                        $('#div_Loader').css('display', 'none');//hide loader
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        $('#div_Loader').css('display', 'none');//hide loader
                    }
                });
            }
            else {
                showAlert('Please complete the Quiz Question form', '#c4453c');
            }
        }
    }

    if (XMode === 'Multiple Choice') {
        if ($('#span_PreXMode_MultipleChoice_' + SectionItemXKey).text() === 'New') {
            var ValidationAnswer = validateQuizQuestion(SectionItem, XMode, $('#span_PreXMode_MultipleChoice_' + SectionItemXKey).text());

            if (ValidationAnswer === 0) {

                $('body').append($('#div_Loader'));//append loader to the body and display it
                $('#div_Loader').css('display', 'block');//shows loader

                //send data
                $.ajax({
                    method: "POST",
                    url: APIUrl + '/addQuizQuestion?p_string_SectionItemXKey=' + SectionItemXKey + '&p_string_KindOfQuestion=' + XMode + '&p_string_RightAnswer=' + encodeURIComponent(RightAnswer) + '&p_string_RelatedLecture=' + RelatedLecture + '&p_int_TimeLimitInSeconds=' + TimeLimitInSeconds + '&p_int_ListNumber=' + QuizQuestionListNumber + '&p_string_Author=' + localStorage.getItem("LP_Session_Author"),
                    dataType: "json",
                    data: { '': Question },
                    success: function (data) {
                        // On success,
                        var answer = data;//if succeded, the API returns the XKey of the new object, XKey length = 10

                        if (answer.length === 10) {
                            var QuizQuestion = {};//create new object

                            //set values
                            QuizQuestion.XKey = data;
                            QuizQuestion.SectionItemXKey = SectionItemXKey;
                            QuizQuestion.KindOfQuestion = XMode;
                            QuizQuestion.Question = Question;
                            QuizQuestion.RightAnswer = RightAnswer;
                            QuizQuestion.RelatedLecture = RelatedLecture;
                            QuizQuestion.TimeLimitInSeconds = TimeLimitInSeconds;
                            QuizQuestion.ListNumber = QuizQuestionListNumber;
                            QuizQuestion.QuestionChoices = [];//initialize
                            //end set values

                            //add QuestionChoicesPackage
                            $.ajax({
                                async: false,
                                method: "POST",
                                url: APIUrl + '/addQuestionChoices?p_string_QuizQuestionXKey=' + QuizQuestion.XKey + '&p_string_Author=' + localStorage.getItem("LP_Session_Author"),
                                dataType: "json",
                                data: { '': QuestionChoicesPackage },
                                success: function (data) {
                                    //on success,
                                    if (data === 0) {
                                        SectionItem.QuizQuestions.push(QuizQuestion);//push it to local buffer
                                        QuizQuestion.QuestionChoices = QuestionChoicesPackage;

                                        //update UI
                                        $('#ul_SectionItemQuizQuestions_' + SectionItemXKey).append("<li id=\"li_QuizQUestion_" + QuizQuestion.XKey + "\" class=\"ui-state-default\" quizquestionxkey=\"" + QuizQuestion.XKey + "\"><div class=\"LPQuestionSummary handle_Question\" onmouseover= \"$(this).next().css('visibility','visible');\" onmouseout= \"$(this).next().css('visibility','hidden');\"><strong id=\"strong_QuizQuestionListNumber_" + QuizQuestion.XKey + "\">" + QuizQuestion.ListNumber + ".</strong>&nbsp;<span id=\"span_QuizQuestionQuestionSummary_" + QuizQuestion.XKey + "\">" + getSummaryOfSentence(getTextContentFromHTML(QuizQuestion.Question), 80) + "</span>&nbsp;<span style=\"color:hsla(0, 2%, 27%, 0.45);\">" + QuizQuestion.KindOfQuestion + "</span></div><div class=\"SortableMenuToggle\" style=\"float:right;\" onmousemove=\"$(this).css('visibility', 'visible');\" onmouseout=\"$(this).css('visibility','hidden');\"><div type=\"button\" class=\"btn btn-default\" onclick=\"openQuizQuestion('" + QuizQuestion.XKey + "');\"><span class=\"glyphicon glyphicon-pencil\"></span></div><div type=\"button\" class=\"btn btn-default\" onclick=\"deleteQuizQuestion('" + SectionItem.XKey + "','" + QuizQuestion.XKey + "');\"><span class=\"glyphicon glyphicon-trash\"></span></div><div type=\"button\" class=\"btn btn-default LPDragandDrop handle_Question\"><span class=\"glyphicon glyphicon-menu-hamburger\"></span></div></div></li>");
                                        //end UI

                                        processSectionItemAddQuizQuestion(SectionItemXKey, XMode);//close the form

                                        checkSectionItemQuizQuestionsLength(SectionItem);

                                        if ($('#span_SectionItemExpandableOption_' + SectionItemXKey).hasClass('glyphicon-chevron-down'))
                                            $('#span_SectionItemExpandableOption_' + SectionItemXKey).click();//display SectionItem Content

                                        showAlert('Saved', '#17aa1c');
                                    }

                                    if (data === 1)
                                        showAlert('Error at server', '#c4453c');
                                },
                                error: function (jqXHR, textStatus, errorThrown) {
                                    //showAlert('Error: ' + textStatus);
                                }
                            });
                            //end of add QuestionChoicesPackage
                        }

                        if (answer === '1') {
                            showAlert('Error at server', '#c4453c');
                        }

                        if (answer === '2') {
                            showAlert('Quiz Question for this Quiz already exists', '#c4453c');
                        }

                        $('#div_Loader').css('display', 'none');//hide loader
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        $('#div_Loader').css('display', 'none');//hide loader
                    }
                });
            }
            else {
                if (ValidationAnswer === 1)
                    showAlert('Please complete the Quiz Question form, for each Answer, explain why is o isn`t the best answer', '#c4453c');
                if (ValidationAnswer === 2)
                    showAlert('Choose the right answer', '#c4453c');
                if (ValidationAnswer === 3)
                    showAlert('Please, enter at least 3 choices', '#c4453c');
            }
        }

        if ($('#span_PreXMode_MultipleChoice_' + SectionItemXKey).text() === 'Edit') {
            var ValidationAnswer = validateQuizQuestion(SectionItem, XMode, $('#span_PreXMode_MultipleChoice_' + SectionItemXKey).text());

            if (ValidationAnswer === 0) {

                //set new values
                QuizQuestion.SectionItemXKey = SectionItemXKey;
                QuizQuestion.KindOfQuestion = XMode;
                QuizQuestion.Question = Question;
                QuizQuestion.RightAnswer = RightAnswer;
                QuizQuestion.RelatedLecture = RelatedLecture;
                QuizQuestion.TimeLimitInSeconds = TimeLimitInSeconds;
                //end set new values

                $('body').append($('#div_Loader'));//append loader to the body and display it
                $('#div_Loader').css('display', 'block');//shows loader

                //send data
                $.ajax({
                    method: "POST",
                    url: APIUrl + '/updateQuizQuestion?p_string_QuizQuestionXKey=' + QuizQuestion.XKey + '&p_string_SectionItemXKey=' + QuizQuestion.SectionItemXKey + '&p_string_KindOfQuestion=' + QuizQuestion.KindOfQuestion + '&p_string_RightAnswer=' + encodeURIComponent(QuizQuestion.RightAnswer) + '&p_string_RelatedLecture=' + QuizQuestion.RelatedLecture + '&p_int_TimeLimitInSeconds=' + QuizQuestion.TimeLimitInSeconds + '&p_int_ListNumber=' + QuizQuestion.ListNumber + '&p_string_Author=' + localStorage.getItem("LP_Session_Author"),
                    dataType: "json",
                    data: { '': Question },
                    success: function (data) {
                        // On success,
                        var answer = data;

                        if (answer === 0) {

                            //add QuestionChoicesPackage
                            $.ajax({
                                async: false,
                                method: "POST",
                                url: APIUrl + '/addQuestionChoices?p_string_QuizQuestionXKey=' + QuizQuestion.XKey + '&p_string_Author=' + localStorage.getItem("LP_Session_Author"),
                                dataType: "json",
                                data: { '': QuestionChoicesPackage },
                                success: function (data) {
                                    //on success,
                                    if (data === 0) {
                                        QuizQuestion.QuestionChoices = QuestionChoicesPackage;

                                        //update the UI
                                        $('#span_QuizQuestionQuestionSummary_' + QuizQuestion.XKey).html(getSummaryOfSentence(getTextContentFromHTML(QuizQuestion.Question), 80));
                                        //end of update the UI

                                        showAlert('Updated', '#17aa1c');

                                        processSectionItemAddQuizQuestion(SectionItemXKey);//close the form
                                    }

                                    if (data === 1)
                                        showAlert('Error at server', '#c4453c');
                                },
                                error: function (jqXHR, textStatus, errorThrown) {
                                    //showAlert('Error: ' + textStatus);
                                }
                            });
                            //end of add QuestionChoicesPackage
                        }

                        if (answer === 1) {
                            showAlert('Error at server', '#c4453c');
                        }

                        if (answer === 3) {
                            showAlert('This QuizQuestion not longer exists and cannot be updated', '#c4453c');
                        }

                        $('#div_Loader').css('display', 'none');//hide loader
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        $('#div_Loader').css('display', 'none');//hide loader
                    }
                });
            }
            else {
                showAlert('Please complete the Quiz Question form, for each Answer, explain why is o isn`t the best answer', '#c4453c');
            }
        }
    }
}

function openQuizQuestion(QuizQuestionXKey) {
    var QuizQuestion = getQuizQuestion(QuizQuestionXKey);

    //load data to UI and show form
    if (QuizQuestion.KindOfQuestion === 'Single Answer') {
        tinyMCE.get('textarea_QuizQuestion_SingleAnswer_' + QuizQuestion.SectionItemXKey).setContent(QuizQuestion.Question);
        $('#textarea_QuizQuestion_RightAnswer_' + QuizQuestion.SectionItemXKey).val(QuizQuestion.RightAnswer);
        $('#select_RelatedLecture_SingleAnswer_' + QuizQuestionXKey.SectionItemXKey + ' option[value="' + QuizQuestion.RelatedLecture + '"]').prop('selected', true);
        $('#input_TimeLimit_SingleAnswer_' + QuizQuestion.SectionItemXKey).val(QuizQuestion.TimeLimitInSeconds);

        $('#span_QuizQuestionXKeyFor_SingleAnswer_' + QuizQuestion.SectionItemXKey).text(QuizQuestionXKey);
    }

    if (QuizQuestion.KindOfQuestion === 'Multiple Choice') {
        tinyMCE.get('textarea_QuizQuestion_MultipleChoice_' + QuizQuestion.SectionItemXKey).setContent(QuizQuestion.Question);

        //load QuestionChoices
        $('#div_MultipleChoices_' + QuizQuestion.SectionItemXKey).empty();

        $.each(QuizQuestion.QuestionChoices, function (index, QuestionChoice) {//loop collection
            addQuestionChoice(QuizQuestion.SectionItemXKey, QuestionChoice, QuizQuestion.RightAnswer);
        });
        //end load Question Choices

        $('#select_RelatedLecture_MultipleChoice_' + QuizQuestionXKey.SectionItemXKey + ' option[value="' + QuizQuestion.RelatedLecture + '"]').prop('selected', true);
        $('#input_TimeLimit_MultipleChoice_' + QuizQuestion.SectionItemXKey).val(QuizQuestion.TimeLimitInSeconds);

        $('#span_QuizQuestionXKeyFor_MultipleChoice_' + QuizQuestion.SectionItemXKey).text(QuizQuestionXKey);
    }

    if (QuizQuestion.KindOfQuestion === 'Single Answer') {
        $('#span_PreXMode_SingleAnswer_' + QuizQuestion.SectionItemXKey).text('Edit');
    }

    if (QuizQuestion.KindOfQuestion === 'Multiple Choice') {
        $('#span_PreXMode_MultipleChoice_' + QuizQuestion.SectionItemXKey).text('Edit');
    }

    processQuizQuestionTabHeaderX(QuizQuestion.SectionItemXKey);

    processQuizQuestionFormulary(QuizQuestion.SectionItemXKey, QuizQuestion.KindOfQuestion);

    $('#div_AddQuizQuestionFormulary_' + QuizQuestion.SectionItemXKey).css('display', 'block');
    //end load data to UI
}

function updateQuizQuestionsSorted(SectionItemXKey) {
    var NewQuizQuestionListNumber = 1;
    var QuizQuestionsForUpdate = [];

    $('#ul_SectionItemQuizQuestions_' + SectionItemXKey + ' li').each(function (index) {

        var QuizQuestion = getQuizQuestion($(this).attr('quizquestionxkey'));

        QuizQuestion.ListNumber = NewQuizQuestionListNumber;

        $('#strong_QuizQuestionListNumber_' + QuizQuestion.XKey).html(QuizQuestion.ListNumber);

        QuizQuestionsForUpdate.push(QuizQuestion);

        NewQuizQuestionListNumber++;
    });

    $('body').append($('#div_Loader'));//append and display loader
    $('#div_Loader').css('display', 'block');

    $.ajax({
        method: "POST",
        url: APIUrl + '/updateQuizQuestionsSorted?p_string_Author=' + localStorage.getItem("LP_Session_Author"),
        dataType: "json",
        data: { '': QuizQuestionsForUpdate },
        success: function (data) {
            //on success,
            if (data === 1)
                showAlert('Error at server', '#c4453c');

            if (data === 2)
                showAlert('A Quiz Question not longer exists and the update operation was canceled', '#c4453c');

            $('#div_Loader').css('display', 'none');//hide the loader
        },
        error: function (jqXHR, textStatus, errorThrown) {
            $('#div_Loader').css('display', 'none');//hide the loader
        }
    });
}

function deleteQuizQuestion(SectionItemXKey, QuizQuestionXKey) {
    if (confirm("You are about to remove a question. Are you sure you want to continue?") === true) {

        var SectionItem = getSectionItem(SectionItemXKey);

        $('body').append($('#div_Loader'));//append and display loader
        $('#div_Loader').css('display', 'block');

        $.getJSON(APIUrl + '/deleteQuizQuestion?p_string_QuizQuestionXKey=' + QuizQuestionXKey)
            .done(function (data) {
                // On success,
                var answer = data;

                if (answer === 0) {

                    //remove from UI
                    document.getElementById("li_QuizQUestion_" + QuizQuestionXKey).remove();
                    //end of remove from UI

                    //remove from  local array
                    for (var i = 0; i < CurriculumSections.length; i++) {
                        for (var j = 0; j < CurriculumSections[i].SectionItems.length; j++) {
                            for (var k = 0; k < CurriculumSections[i].SectionItems[j].QuizQuestions.length; k++) {
                                if (CurriculumSections[i].SectionItems[j].QuizQuestions[k].XKey === QuizQuestionXKey) {
                                    CurriculumSections[i].SectionItems[j].QuizQuestions.splice(k, 1);
                                    checkSectionItemQuizQuestionsLength(SectionItem);
                                    break;
                                }
                            }
                        }
                    }

                    showAlert('Deleted', '#17aa1c');
                }

                if (answer === 1) {
                    showAlert('Error at server', '#c4453c');
                }

                if (answer === 2) {
                    showAlert('This Quiz Question not longer exists and cannot be deleted', '#c4453c');
                }

                $('#div_Loader').css('display', 'none');//hide loader
            })
            .fail(function (jqXHR, textStatus, err) {
                $('#div_Loader').css('display', 'none');//hide loader
            });
    }
}
//-------

function initializeCourseLandingPageWizard() {
    if (CurrentWizardCourse.XKey !== '' && CanInitializeCourseLandingPage === true) {

        $('body').append($('#div_Loader'));//append and display loader
        $('#div_Loader').css('display', 'inline');

        $.getJSON(APIUrl + '/getCourseLandingPage?p_string_CourseXKey=' + CurrentWizardCourse.XKey)//get CourseLandingPage
            .done(function (data) {

                // On success,
                //if the CourseLandingPage exists the API returns a CourseLandingPage object, if not, it returns an int value
                if ($.isNumeric(data) === false) {
                    CourseLandingPage = data;

                    //get embeded objects
                    CourseLandingPage_Media_CourseImage = CourseLandingPage.CourseLandingPage_Media_CourseImage;

                    if (CourseLandingPage_Media_CourseImage) {
                        document.getElementById("img_CourseImage").src = WEBAPPDomainUrl + '/LecturepadCloud/Courses/' + CurrentWizardCourse.XKey + '/Landing Page/' + CourseLandingPage_Media_CourseImage.XFileName;
                        $('#span_CourseImage_XFileName').html(getSummaryOfSentence(CourseLandingPage_Media_CourseImage.XFileName, 25));
                    }

                    CourseLandingPage_Media_PromotionalVideo = CourseLandingPage.CourseLandingPage_Media_PromotionalVideo;

                    if (CourseLandingPage_Media_PromotionalVideo) {
                        $('#img_CourseLandingPage_PromotionalVideo').css('display', 'none');
                        $('#video_PromotionalVideo').css('display', 'block');
                        document.getElementById("video_PromotionalVideo").src = WEBAPPDomainUrl + '/LecturepadCloud/Courses/' + CurrentWizardCourse.XKey + '/Landing Page/' + CourseLandingPage_Media_PromotionalVideo.XFileName;
                        $('#span_PromotionalVideo_XFileName').html(getSummaryOfSentence(CourseLandingPage_Media_PromotionalVideo.XFileName, 25));
                    }

                    CourseLandingPage_Media_ClosedCaptions = CourseLandingPage.CourseLandingPage_Media_ClosedCaptions;

                    if (CourseLandingPage_Media_ClosedCaptions) {
                        $('#select_ClosedCaptionsXLanguage option[value="' + CourseLandingPage_Media_ClosedCaptions.XLanguage + '"]').prop('selected', true);
                        document.getElementById("track_ClosedCaptions").src = WEBAPPDomainUrl + '/LecturepadCloud/Courses/' + CurrentWizardCourse.XKey + '/Landing Page/' + CourseLandingPage_Media_ClosedCaptions.XFileName;
                        $('#span_ClosedCaptions_XFileName').html(getSummaryOfSentence(CourseLandingPage_Media_ClosedCaptions.XFileName, 25));
                    }
                    //end of get embeded objects

                    //update the UI
                    $('#input_Title').val(CourseLandingPage.Title);
                    $('#input_SubTitle').val(CourseLandingPage.SubTitle);
                    tinyMCE.get('textarea_XDescription').setContent(CourseLandingPage.XDescription);
                    $('#input_PrimaryTought').val(CourseLandingPage.PrimaryTought);
                    //end of update the UI

                    EditMode_CourseLandingPage = 'Edit';
                }

                if (data === 1)
                    showAlert('Error at server', '#c4453c');

                if (data === 2)
                    EditMode_CourseLandingPage = 'New';

                CanInitializeCourseLandingPage = false;

                $('#div_Loader').css('display', 'none');//hide the loader
            })
            .fail(function (jqXHR, textStatus, err) {
                $('#div_Loader').css('display', 'none');
            });
    }
}

function getDataFromCourseLandingPageUI() {
    Title = $.trim($('#input_Title').val());
    SubTitle = $.trim($('#input_SubTitle').val());
    XDescription = $.trim(tinyMCE.get('textarea_XDescription').getContent());
    PrimaryTought = $.trim($('#input_PrimaryTought').val());
}

function validateCourseLandingPageFormFields() {
    getDataFromCourseLandingPageUI();

    if (!Title || !SubTitle || !XDescription || !PrimaryTought)
        return 1;

    return 0;
}

function saveCourseLandingPage() {

    if (verifyWizardCourseIntegrity() === true) {
        if (EditMode_CourseLandingPage === 'New') {
            var ValidationAnswer = validateCourseLandingPageFormFields();

            if (ValidationAnswer === 0) {

                $('body').append($('#div_Loader'));//append loader to the body and display it
                $('#div_Loader').css('display', 'block');//shows loader

                //send data
                $.ajax({
                    method: "POST",
                    url: APIUrl + '/addCourseLandingPage?p_string_CourseXKey=' + CurrentWizardCourse.XKey + '&p_string_Title=' + Title + '&p_string_SubTitle=' + SubTitle + '&p_string_PrimaryTought=' + PrimaryTought + '&p_string_Author=' + localStorage.getItem("LP_Session_Author"),
                    dataType: "json",
                    data: { '': XDescription },
                    success: function (data) {
                        // On success,
                        var answer = data;//if succeded, the API returns the XKey of the new object, XKey length = 10

                        if (answer.length === 10) {
                            CourseLandingPage = {};//create new object

                            //set values
                            CourseLandingPage.XKey = data;
                            CourseLandingPage.CourseXKey = CurrentWizardCourse.XKey;
                            CourseLandingPage.Title = Title;
                            CourseLandingPage.SubTitle = SubTitle;
                            CourseLandingPage.XDescription = XDescription;
                            CourseLandingPage.PrimaryTought = PrimaryTought;
                            //end set values

                            EditMode_CourseLandingPage = 'Edit';//set for Edit

                            showAlert('Saved', '#17aa1c');
                        }

                        if (answer === '1') {
                            showAlert('Error at server', '#c4453c');
                        }

                        if (answer === '2') {
                            showAlert('CourseLandingPage for this Course already exists', '#c4453c');
                        }

                        $('#div_Loader').css('display', 'none');//hide loader
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        $('#div_Loader').css('display', 'none');//hide loader
                    }
                });
            }
            else {
                if (ValidationAnswer === 1)
                    showAlert('Please, complete the CourseLandingPage Form', '#c4453c');
            }

        }//----

        if (EditMode_CourseLandingPage === 'Edit') {

            var ValidationAnswer = validateCourseLandingPageFormFields();

            if (ValidationAnswer === 0) {

                $('body').append($('#div_Loader'));//append loader to the body and display it
                $('#div_Loader').css('display', 'block');

                //send data
                $.ajax({
                    method: "POST",
                    url: APIUrl + '/updateCourseLandingPage?p_string_CourseLandingPageXKey=' + CourseLandingPage.XKey + '&p_string_CourseXKey=' + CourseLandingPage.CourseXKey + '&p_string_Title=' + Title + '&p_string_SubTitle=' + SubTitle + '&p_string_PrimaryTought=' + PrimaryTought + '&p_string_Author=' + localStorage.getItem("LP_Session_Author"),
                    dataType: "json",
                    data: { '': XDescription },
                    success: function (data) {
                        // On success,
                        var answer = data;

                        if (answer === 0) {

                            //set new values
                            CourseLandingPage.Title = Title;
                            CourseLandingPage.SubTitle = SubTitle;
                            CourseLandingPage.XDescription = XDescription;
                            CourseLandingPage.PrimaryTought = PrimaryTought;
                            //end set new values

                            if (CourseWizardXMode === 'TeacherCourseWizard')
                            {
                                //update UI
                                $('#h2_CourseTitle').html(getFirstCharactersOfSentence(CourseLandingPage.Title, 70));
                                //end update UI
                            }

                            showAlert('Updated', '#17aa1c');
                        }

                        if (answer === 1) {
                            showAlert('Error at server','#c4453c');
                        }

                        if (answer === 3) {
                            showAlert('This CourseLandingPage not longer exists and cannot be updated', '#c4453c');
                        }

                        $('#div_Loader').css('display', 'none');//hide loader
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        $('#div_Loader').css('display', 'none');//hide loader
                    }
                });
            }
            else {
                if (ValidationAnswer === 1)
                    showAlert('Please, complete the CourseLandingPage Form', '#c4453c');
            }
        }
    }
}

function addCourseLandingPage_Media(CourseLandingPage_MediaXKey, XMediaName, XLanguage, file) {

    if (XMediaName === 'CourseImage') {
        CourseLandingPage_Media_CourseImage = {}; //create the object

        //set values
        CourseLandingPage_Media_CourseImage.XKey = CourseLandingPage_MediaXKey;
        CourseLandingPage_Media_CourseImage.CourseLandingPageXKey = CourseLandingPage.XKey;
        CourseLandingPage_Media_CourseImage.XMediaName = XMediaName;
        CourseLandingPage_Media_CourseImage.XLanguage = XLanguage;
        CourseLandingPage_Media_CourseImage.XFileName = file.name;
        //end set values

        //update UI
        previewCourseImage(file);
        //end update UI
    }

    if (XMediaName === 'PromotionalVideo') {

        CourseLandingPage_Media_PromotionalVideo = {}; //create the object

        //set values
        CourseLandingPage_Media_PromotionalVideo.XKey = CourseLandingPage_MediaXKey;
        CourseLandingPage_Media_PromotionalVideo.CourseLandingPageXKey = CourseLandingPage.XKey;
        CourseLandingPage_Media_PromotionalVideo.XMediaName = XMediaName;
        CourseLandingPage_Media_PromotionalVideo.XLanguage = XLanguage;
        CourseLandingPage_Media_PromotionalVideo.XFileName = file.name;
        //end set values

        //update UI
        previewPromotionalVideo(file);
        //end update UI
    }

    if (XMediaName === 'ClosedCaptions') {

        CourseLandingPage_Media_ClosedCaptions = {}; //create the object

        //set values
        CourseLandingPage_Media_ClosedCaptions.XKey = CourseLandingPage_MediaXKey;
        CourseLandingPage_Media_ClosedCaptions.CourseLandingPageXKey = CourseLandingPage.XKey;
        CourseLandingPage_Media_ClosedCaptions.XMediaName = XMediaName;
        CourseLandingPage_Media_ClosedCaptions.XLanguage = XLanguage;
        CourseLandingPage_Media_ClosedCaptions.XFileName = file.name;
        //end set values

        //update UI
        previewClosedCaptions(file);
        //end update UI
    }
}

function updateCourseImage(file) {
    CourseLandingPage_Media_CourseImage.XFileName = file.name;

    //update UI
    previewCourseImage(file);
    //end update UI
}

function previewCourseImage(file) {
    //update UI
    var oFReader = new FileReader();

    oFReader.onload = function (oFREvent) {
        document.getElementById("img_CourseImage").src = oFREvent.target.result;

        if (CourseWizardXMode === 'TeacherCourseWizard') {
            //update UI
            $('#div_CourseImage').css('background-image', 'url(' + oFREvent.target.result + ')');
            //end update UI
        }
    };

    oFReader.readAsDataURL(file);

    $('#span_CourseImage_XFileName').html(file.name);
    //end update UI
}

function uploadCourseImage(sender) {
    if (verifyWizardCourseIntegrity() === true) {
        if (!CourseLandingPage) {
            showAlert('Save the Course Landing info first and then upload the Course Image', '#c4453c');
        }
        else {
            if (!CourseLandingPage_Media_CourseImage) {
                alert('You dont have a Course Image file uploaded, please select a *.png or compatible file');

                $(sender).parent().find('.LPUploadMode').text("New CourseLandingPage_Media_CourseImage");

                document.getElementById("form_CourseImage").action = APIUrl + '/uploadCourseLandingPage_Media?p_string_CourseXKey=' + CurrentWizardCourse.XKey + '&p_string_CourseLandingPageXKey=' + CourseLandingPage.XKey + '&p_string_XMediaName=CourseImage&p_string_XLanguage=No Language' + '&p_string_Author=' + localStorage.getItem("LP_Session_Author");

                $('#input_CourseImage').click();
            }
            else {
                if (confirm('You have uploaded a Course Image file, do you want to replace it?') === true) {

                    $(sender).parent().find('.LPUploadMode').text("Update CourseLandingPage_Media_CourseImage");

                    document.getElementById("form_CourseImage").action = APIUrl + '/replaceCourseLandingPage_Media?p_string_CourseXKey=' + CurrentWizardCourse.XKey + '&p_string_CourseLandingPage_MediaXKey=' + CourseLandingPage_Media_CourseImage.XKey + '&p_string_XLanguage=No Language' + '&p_string_Author=' + localStorage.getItem("LP_Session_Author");

                    $('#input_CourseImage').click();
                }
            }
        }
    }
}

function updatePromotionalVideo(file) {
    CourseLandingPage_Media_PromotionalVideo.XFileName = file.name;

    //update UI
    previewPromotionalVideo(file);
    //end update UI
}

function previewPromotionalVideo(file) {
    //update UI
    var oFReader = new FileReader();

    oFReader.onload = function (oFREvent) {
        document.getElementById("video_PromotionalVideo").src = oFREvent.target.result;

        try {
            document.getElementById("video_PromotionalVideo").play();
            $('#img_CourseLandingPage_PromotionalVideo').css('display', 'none');
            $('#video_PromotionalVideo').css('display', 'block');
        }
        catch (err) {
            showAlert(err.message, '#c4453c');
        }
    };

    oFReader.readAsDataURL(file);

    $('#span_PromotionalVideo_XFileName').html(file.name);
    //end update UI
}

function uploadPromotionalVideo(sender) {
    if (verifyWizardCourseIntegrity() === true) {
        if (!CourseLandingPage) {
            showAlert('Save the Course Landing info first and then upload the Promotional Video', '#c4453c');
        }
        else {
            if (!CourseLandingPage_Media_PromotionalVideo) {
                alert('You dont have a Promotional Video file uploaded, please select a *.mp4 or compatible file');

                $(sender).parent().find('.LPUploadMode').text("New CourseLandingPage_Media_PromotionalVideo");

                document.getElementById("form_PromotionalVideo").action = APIUrl + '/uploadCourseLandingPage_Media?p_string_CourseXKey=' + CurrentWizardCourse.XKey + '&p_string_CourseLandingPageXKey=' + CourseLandingPage.XKey + '&p_string_XMediaName=PromotionalVideo' + '&p_string_XMediaName=CourseImage&p_string_XLanguage=No Language' + '&p_string_Author=' + localStorage.getItem("LP_Session_Author");

                $('#input_PromotionalVideo').click();
            }
            else {
                if (confirm('You have uploaded a Promotional Video file, do you want to replace it?') === true) {
                    $(sender).parent().find('.LPUploadMode').text("Update CourseLandingPage_Media_PromotionalVideo");

                    document.getElementById("form_PromotionalVideo").action = APIUrl + '/replaceCourseLandingPage_Media?p_string_CourseXKey=' + CurrentWizardCourse.XKey + '&p_string_CourseLandingPage_MediaXKey=' + CourseLandingPage_Media_PromotionalVideo.XKey + '&p_string_XMediaName=CourseImage&p_string_XLanguage=No Language' + '&p_string_Author=' + localStorage.getItem("LP_Session_Author");

                    $('#input_PromotionalVideo').click();
                }
            }
        }
    }
}

function updateClosedCaptions(file) {
    CourseLandingPage_Media_ClosedCaptions.XLanguage = CourseLandingPage_Media_XLanguage;
    CourseLandingPage_Media_ClosedCaptions.XFileName = file.name;

    //update UI
    previewClosedCaptions(file);
    //end update UI
}

function previewClosedCaptions(file) {
    //update UI
    var oFReader = new FileReader();

    oFReader.onload = function (oFREvent) {
        document.getElementById("track_ClosedCaptions").src = oFREvent.target.result;
    };

    oFReader.readAsDataURL(file);

    $('#span_ClosedCaptions_XFileName').html(file.name);
    //end update UI
}

function uploadClosedCaptions(sender) {
    if (verifyWizardCourseIntegrity() === true) {
        if (!CourseLandingPage) {
            showAlert('Save the Course Landing info first and then upload the Closed Captions', '#c4453c');
        }
        else {

            CourseLandingPage_Media_XLanguage = $('#select_ClosedCaptionsXLanguage option:selected').text();

            if (CourseLandingPage_Media_XLanguage === 'Select')
                showAlert('Select a language for the .vtt file', '#c4453c');
            else {
                if (!CourseLandingPage_Media_ClosedCaptions) {
                    showAlert('You dont have a VTT file uploaded, please select a *.vtt file', '#c4453c');

                    $(sender).parent().find('.LPUploadMode').text("New CourseLandingPage_Media_ClosedCaptions");

                    document.getElementById("form_ClosedCaptions").action = APIUrl + '/uploadCourseLandingPage_Media?p_string_CourseXKey=' + CurrentWizardCourse.XKey + '&p_string_CourseLandingPageXKey=' + CourseLandingPage.XKey + '&p_string_XMediaName=ClosedCaptions&p_string_XLanguage=' + CourseLandingPage_Media_XLanguage + '&p_string_Author=' + localStorage.getItem("LP_Session_Author");

                    $('#input_ClosedCaptions').click();
                }
                else {
                    if (confirm('You have uploaded a VTT file, do you want to replace it?') === true) {

                        $(sender).parent().find('.LPUploadMode').text("Update CourseLandingPage_Media_ClosedCaptions");

                        document.getElementById("form_ClosedCaptions").action = APIUrl + '/replaceCourseLandingPage_Media?p_string_CourseXKey=' + CurrentWizardCourse.XKey + '&p_string_CourseLandingPage_MediaXKey=' + CourseLandingPage_Media_ClosedCaptions.XKey + '&p_string_XMediaName=ClosedCaptions&p_string_XLanguage=' + CourseLandingPage_Media_XLanguage + '&p_string_Author=' + localStorage.getItem("LP_Session_Author");

                        $('#input_ClosedCaptions').click();
                    }
                }
            }
        }
    }
}

function initializeCoursePriceWizard() {
    if (CurrentWizardCourse.XKey !== '' && CanInitializeCoursePrice === true) {

        $('body').append($('#div_Loader'));//append and display loader
        $('#div_Loader').css('display', 'block');

        $.getJSON(APIUrl + '/getCoursePrice?p_string_CourseXKey=' + CurrentWizardCourse.XKey)//get CoursePrice
            .done(function (data) {

                // On success,
                //if the CoursePrice exists the API returns a CoursePrice object, if not, it returns an int value
                if ($.isNumeric(data) === false) {
                    CoursePrice = data;

                    //update the UI
                    if (CoursePrice.Price === 0)
                        $('#select_CoursePrice option[value="FREE"]').prop('selected', true);
                    else
                        $('#select_CoursePrice option[value="' + CoursePrice.Price + '"]').prop('selected', true);

                    $('#select_Currency option[value="' + CoursePrice.Currency + '"]').prop('selected', true);
                    //end of update the UI

                    EditMode_CoursePrice = 'Edit';
                }

                if (data === 1)
                    showAlert('Error at server', '#c4453c');

                if (data === 2)
                    EditMode_CoursePrice = 'New';

                CanInitializeCoursePrice = false;

                $('#div_Loader').css('display', 'none');//hide the loader
            })
            .fail(function (jqXHR, textStatus, err) {
                $('#div_Loader').css('display', 'none');
            });
    }
}

function getDataFromCoursePriceUI() {

    Price = $("#coupon-price").val();

    //Currency = $('#select_Currency option:selected').text();
}

function validateCoursePriceFormFields() {
    getDataFromCoursePriceUI();

    if (!$.isNumeric(Price))
        return 1;

    return 0;
}

function saveCoursePrice() {

    if (verifyWizardCourseIntegrity() === true) {
        if (EditMode_CoursePrice === 'New') {
            var ValidationAnswer = validateCoursePriceFormFields();

            if (ValidationAnswer === 0) {

                $('body').append($('#div_Loader'));//append loader to the body and display it
                $('#div_Loader').css('display', 'block');//shows loader
                //send data
                $.getJSON(APIUrl + '/addCoursePrice?p_string_CourseXKey=' + CurrentWizardCourse.XKey + '&p_double_Price=' + Price + '&p_string_Currency=' + Currency + '&p_string_Author=' + localStorage.getItem("LP_Session_Author"))
                    .done(function (data) {
                        // On success,
                        var answer = data;//if succeded, the API returns the XKey of the new object, XKey length = 10

                        if (answer.length === 10) {
                            CoursePrice = {};//create new object

                            //set values
                            CoursePrice.XKey = data;
                            CoursePrice.CourseXKey = CurrentWizardCourse.XKey;
                            CoursePrice.Price = Price;
                            CoursePrice.Currency = Currency;
                            //end set values

                            EditMode_CoursePrice = 'Edit';//set for Edit

                            showAlert('Saved', '#17aa1c');
                        }

                        if (answer === '1') {
                            showAlert('Error at server', '#c4453c');
                        }

                        if (answer === '2') {
                            showAlert('CoursePrice for this Course already exists', '#c4453c');
                        }

                        $('#div_Loader').css('display', 'none');//hide loader
                    })
                    .fail(function (jqXHR, textStatus, err) {
                        $('#div_Loader').css('display', 'none');
                    });

            }
            else {
                if (Answer === 1)
                    showAlert('Please, complete the CoursePrice Form', '#c4453c');
            }

        }//----

        if (EditMode_CoursePrice === 'Edit') {

            var ValidationAnswer = validateCoursePriceFormFields();

            if (ValidationAnswer === 0) {

                $('body').append($('#div_Loader'));//append loader to the body and display it
                $('#div_Loader').css('display', 'block');

                //send data
                $.getJSON(APIUrl + '/updateCoursePrice?p_string_CoursePriceXKey=' + CoursePrice.XKey + '&p_string_CourseXKey=' + CoursePrice.CourseXKey + '&p_double_Price=' + Price + '&p_string_Currency=' + Currency + '&p_string_Author=' + localStorage.getItem("LP_Session_Author"))
                    .done(function (data) {
                        // On success,
                        var answer = data;

                        if (answer === 0) {

                            //set new values
                            CoursePrice.Price = Price;
                            CoursePrice.Currency = Currency;
                            //end set new values

                            showAlert('Updated', '#17aa1c');
                        }

                        if (answer === 1) {
                            showAlert('Error at server', '#c4453c');
                        }

                        if (answer === 3) {
                            showAlert('This CoursePrice not longer exists and cannot be updated', '#c4453c');
                        }

                        $('#div_Loader').css('display', 'none');//hide loader
                    })
                    .fail(function (jqXHR, textStatus, err) {
                        $('#div_Loader').css('display', 'none');
                    });

            }
            else {
                if (ValidationAnswer === 1)
                    showAlert('Please, complete the CoursePrice Form', '#c4453c');
            }
        }
    }
}

function initializeCourseCouponWizard() {
    if (CurrentWizardCourse.XKey !== '' && CanInitializeCourseCoupon === true) {

        $('body').append($('#div_Loader'));//append and display loader
        $('#div_Loader').css('display', 'block');

        $.getJSON(APIUrl + '/getAllCourseCoupons?p_string_CourseXKey=' + CurrentWizardCourse.XKey)//get CourseCoupons
            .done(function (data) {
                $.each(data, function (index, CourseCoupon) {//loop collection

                    CourseCoupons.push(CourseCoupon);//insert into local buffer

                    //update UI
                    var Deadline_Temporal = '';

                    if (CourseCoupon.DeadLine !== 'null')
                        Deadline_Temporal = new Date(CourseCoupon.DeadLine).toISOString().split('T')[0];
                    else
                        Deadline_Temporal = 'No Deadline';

                    $('#table_CourseCoupons tbody').append("<tr id=\"tr_Coupon_" + CourseCoupon.XKey + "\"><td id=\"td_Coupon_" + CourseCoupon.XKey + "_Code\">" + CourseCoupon.Code + "</td><td id=\"td_Coupon_" + CourseCoupon.XKey + "_Link\">" + '<a>Link</a>' + "</td><td id=\"td_Coupon_" + CourseCoupon.XKey + "_DiscountedPrice\">" + CourseCoupon.DiscountedPrice + "</td><td id=\"td_Coupon_" + CourseCoupon.XKey + "_Remaining\">" + 'Remaining coupons' + "</td><td id=\"td_Coupon_" + CourseCoupon.XKey + "_Created\">" + new Date(CourseCoupon.CreationDateTime).toISOString().split('T')[0] + "</td><td id=\"td_Coupon_" + CourseCoupon.XKey + "_Deadline\">" + Deadline_Temporal + "</td><td id=\"td_Coupon_" + CourseCoupon.XKey + "_XStatus\">" + CourseCoupon.XStatus + "</td><td><button type=\"button\" class=\"btn btn-default\" onClick=\"openCourseCoupon('" + CourseCoupon.XKey + "')\"><span class=\"glyphicon glyphicon-pencil\"></span></button>&nbsp;<button type=\"button\" class=\"btn btn-default\" onClick=\"deleteCourseCoupon('" + CourseCoupon.XKey + "');\"><span class=\"glyphicon glyphicon-trash\"></span></button></td></tr>");
                    //end of update the UI
                });

                checkCourseCouponsLength();//validate UI

                //--get the initial CurrentCourseCoupon
                if (CourseCoupons.length > 0);
                {
                    CurrentCourseCoupon = CourseCoupons[0];
                }
                //--end of get the initial CurrentCourseCoupon

                CanInitializeCourseCoupon = false;

                $('#div_Loader').css('display', 'none');//hide the loader
            })
            .fail(function (jqXHR, textStatus, err) {
                $('#div_Loader').css('display', 'none');
            });
    }
}

function checkCourseCouponsLength()//validate UI
{
    if (CourseCoupons.length === 0) {
        //add 'No Data' message if there is no data
        if (document.getElementById("Not") === "undefinied" || document.getElementById("Not") === null)
            $('#table_CourseCoupons').append("<tr id=\"NotCoupons\"><td colspan= 8 style =\"text-align:center;\"><h2>Nothing to show</h2></td></tr>");
    }
    else {
        if (document.getElementById("Not") !== "undefinied" && document.getElementById("NotCoupons") !== null)
            $('#NotCoupons').remove();
    }
}

function getDataFromNewCourseCouponUI() {
    Code = $.trim($('#input_Code').val());
    DiscountedPrice = $('#input_DiscountedPrice').val();
    NumberOfCoupons = $('#input_NumberOfCoupons').val();

    if ($('#input_Deadline').val())
        DeadLine = $('#input_Deadline').val();
    else
        DeadLine = 'null';
}

function getDataFromEditCourseCouponUI() {
    Code = $.trim($('#input_CourseCouponCode_Edit').val());
    DiscountedPrice = $('#input_CourseCouponDiscountedPrice_Edit').val();
    NumberOfCoupons = $('#input_CourseCouponNumberOf_Edit').val();

    if ($('#input_CourseCouponDeadline_Edit').val())
        DeadLine = $('#input_CourseCouponDeadline_Edit').val();
    else
        DeadLine = 'null';

    if ($('#input_checkbox_CourseCouponXStatus').is(':checked'))
        CouponXStatus = 'Active';  // checked
    else
        CouponXStatus = 'UnActive';  // unchecked
}

function validateNewCourseCouponFormFields() {
    getDataFromNewCourseCouponUI();

    if (!CoursePrice)
        return -1;
    else
        if (CoursePrice.Price <= DiscountedPrice)
            return -2;

    if (!Code || !DiscountedPrice || !NumberOfCoupons)
        return 1;

    if ($.isNumeric(DiscountedPrice) === false || $.isNumeric(NumberOfCoupons) === false)
        return 2;

    if (Code.length < 6)
        return 3;

    if (!Code.match(/^[A-Z0-9._-]/))
        return 4;

    return 0;
}

function validateEditCourseCouponFormFields() {
    getDataFromEditCourseCouponUI();

    if (!Code || !DiscountedPrice || !NumberOfCoupons)
        return 1;

    if ($.isNumeric(DiscountedPrice) === false || $.isNumeric(NumberOfCoupons) === false)
        return 2;

    if (Code.length < 6)
        return 3;

    if (!Code.match(/^[A-Z0-9._-]/))
        return 4;

    return 0;
}

function getCurrentCourseCoupon(CouponCourseXKey) {
    //loop the local buffer and find the requested CourseCoupon
    for (var i = 0; i < CourseCoupons.length; i++) {
        if (CourseCoupons[i].XKey === CouponCourseXKey) {
            CurrentCourseCoupon = CourseCoupons[i];
            break;
        }
    }
}

function saveCourseCoupon() {

    if (verifyWizardCourseIntegrity() === true) {
        if (EditMode_CourseCoupon === 'New') {
            var ValidationAnswer = validateNewCourseCouponFormFields();

            if (ValidationAnswer === 0) {

                $('body').append($('#div_Loader'));//append and display loader
                $('#div_Loader').css('display', 'block');//shows loader

                //send data
                $.getJSON(APIUrl + '/addCourseCoupon?p_string_CourseXKey=' + CurrentWizardCourse.XKey + '&p_string_Code=' + Code + '&p_double_DiscountedPrice=' + DiscountedPrice + '&p_int_NumberOfCoupons=' + NumberOfCoupons + '&p_string_Deadline=' + DeadLine + '&p_string_XStatus=Active' + '&p_string_Author=' + localStorage.getItem("LP_Session_Author"))
                    .done(function (data) {
                        // On success,
                        var answer = data;//if succeded, the API returns the XKey of the new object, XKey length = 10

                        if (answer.length === 10) {
                            var CourseCoupon = {};//create new object

                            //set values
                            CourseCoupon.XKey = data;
                            CourseCoupon.Code = Code;
                            CourseCoupon.DiscountedPrice = DiscountedPrice;
                            CourseCoupon.NumberOfCoupons = NumberOfCoupons;
                            CourseCoupon.DeadLine = DeadLine;
                            CourseCoupon.XStatus = 'Active';
                            CourseCoupon.CreationDateTime = Date.now();
                            //end set values

                            CourseCoupons.push(CourseCoupon);//push it to local buffer

                            checkCourseCouponsLength();//validate UI

                            //update UI
                            var Deadline_Temporal = '';

                            if (DeadLine !== 'null')
                                Deadline_Temporal = new Date(CourseCoupon.DeadLine).toISOString().split('T')[0];
                            else
                                Deadline_Temporal = 'No Deadline';

                            $('#table_CourseCoupons tbody').append("<tr id=\"tr_Coupon_" + CourseCoupon.XKey + "\"><td id=\"td_Coupon_" + CourseCoupon.XKey + "_Code\">" + CourseCoupon.Code + "</td><td id=\"td_Coupon_" + CourseCoupon.XKey + "_Link\">" + '<a>Link</a>' + "</td><td id=\"td_Coupon_" + CourseCoupon.XKey + "_DiscountedPrice\">" + CourseCoupon.DiscountedPrice + "</td><td id=\"td_Coupon_" + CourseCoupon.XKey + "_Remaining\">" + 'Remaining coupons' + "</td><td id=\"td_Coupon_" + CourseCoupon.XKey + "_Created\">" + new Date(CourseCoupon.CreationDateTime).toISOString().split('T')[0] + "</td><td id=\"td_Coupon_" + CourseCoupon.XKey + "_Deadline\">" + Deadline_Temporal + "</td><td id=\"td_Coupon_" + CourseCoupon.XKey + "_XStatus\">" + CourseCoupon.XStatus + "</td><td><button type=\"button\" class=\"btn btn-default\" onClick=\"openCourseCoupon('" + CourseCoupon.XKey + "')\"><span class=\"glyphicon glyphicon-pencil\"></span></button><button type=\"button\" class=\"btn btn-default\" onClick=\"deleteCourseCoupon('" + CourseCoupon.XKey + "');\"><span class=\"glyphicon glyphicon-trash\"></span></button></td></tr>");
                            //end of update the UI

                            showAlert('Saved', '#17aa1c');
                        }

                        if (answer === '1') {
                            showAlert('Error at server', '#c4453c');
                        }

                        if (answer === '2') {
                            showAlert(CategoryXName + ' already exists', '#c4453c');
                        }

                        $('#div_Loader').css('display', 'none');//hide loader
                    })
                    .fail(function (jqXHR, textStatus, err) {
                        $('#div_Loader').css('display', 'none');
                    });
            }
            else {
                if (ValidationAnswer === -1)
                    showAlert('Please, set a Price for your course first, then you can add coupons', '#c4453c');
                if (ValidationAnswer === -2)
                    showAlert('The coupon price cannot be greater or equal than course price', '#c4453c');
                if (ValidationAnswer === 1)
                    showAlert('Please, complete the CourseCoupon Form', '#c4453c');
                if (ValidationAnswer === 2)
                    showAlert('Please, verify numeric fields', '#c4453c');
                if (ValidationAnswer === 3)
                    showAlert('Coupon Code has to be 6 to 20 length characters', '#c4453c');
                if (ValidationAnswer === 4)
                    showAlert('Code can only contain alphanumeric characters (A-Z, 0-9), periods ("."), dashes ("-") or underscores ("_"). All letters must be CAPITAL.', '#c4453c');
            }

        }//----

        if (EditMode_CourseCoupon === 'Edit') {

            var ValidationAnswer = validateEditCourseCouponFormFields();

            if (ValidationAnswer === 0) {

                $('#div_Modal_EditCourseCouponForm').append($('#div_Loader'));//append loader to the modal and display it
                $('#div_Loader').css('display', 'block');

                //send data
                $.getJSON(APIUrl + '/updateCourseCoupon?p_string_CourseCouponXKey=' + CurrentCourseCoupon.XKey + '&p_string_CourseXKey=' + CurrentCourseCoupon.CourseXKey + '&p_string_Code=' + Code + '&p_double_DiscountedPrice=' + DiscountedPrice + '&p_int_NumberOfCoupons=' + NumberOfCoupons + '&p_string_Deadline=' + DeadLine + '&p_string_XStatus=' + CouponXStatus + '&p_string_Author=' + localStorage.getItem("LP_Session_Author"))
                    .done(function (data) {
                        var answer = data;

                        if (answer === 0) {

                            //set new values
                            CurrentCourseCoupon.Code = Code;
                            CurrentCourseCoupon.DiscountedPrice = DiscountedPrice;
                            CurrentCourseCoupon.NumberOfCoupons = NumberOfCoupons;
                            CurrentCourseCoupon.DeadLine = DeadLine;
                            CurrentCourseCoupon.XStatus = CouponXStatus;
                            //end set new values

                            //update the UI
                            var Deadline_Temporal = '';

                            if (DeadLine !== 'null')
                                Deadline_Temporal = new Date(CurrentCourseCoupon.DeadLine).toISOString().split('T')[0];
                            else
                                Deadline_Temporal = 'No Deadline';

                            $('#td_Coupon_' + CurrentCourseCoupon.XKey + '_Code').html(CurrentCourseCoupon.Code);
                            $('#td_Coupon_' + CurrentCourseCoupon.XKey + '_DiscountedPrice').html(CurrentCourseCoupon.DiscountedPrice);
                            $('#td_Coupon_' + CurrentCourseCoupon.XKey + '_Remaining').html('Remaining coupons');
                            $('#td_Coupon_' + CurrentCourseCoupon.XKey + '_Deadline').html(Deadline_Temporal);
                            $('#td_Coupon_' + CurrentCourseCoupon.XKey + '_XStatus').html(CurrentCourseCoupon.XStatus);
                            //end of update the UI

                            showAlert('Updated', '#17aa1c');
                            $('#div_Modal_EditCourseCouponForm').modal('toggle');//hide modal
                        }

                        if (answer === 1) {
                            showAlert('Error at server', '#c4453c');
                        }

                        if (answer === 2) {
                            showAlert('Coupon Code already exists for this Course', '#c4453c');
                        }

                        if (answer === 3) {
                            showAlert('This CourseCoupon not longer exists and cannot be updated', '#c4453c');
                        }

                        $('#div_Loader').css('display', 'none');//hide loader
                    })
                    .fail(function (jqXHR, textStatus, err) {
                        $('#div_Loader').css('display', 'none');
                    });
            }
            else {
                if (ValidationAnswer === 1)
                    showAlert('Please, complete the CourseCoupon Form', '#c4453c');
                if (ValidationAnswer === 2)
                    showAlert('Please, verify numeric fields', '#c4453c');
                if (ValidationAnswer === 3)
                    showAlert('Coupon Code has to be 6 to 20 length characters', '#c4453c');
                if (ValidationAnswer === 4)
                    showAlert('Code can only contain alphanumeric characters (A-Z, 0-9), periods ("."), dashes ("-") or underscores ("_"). All letters must be CAPITAL.', '#c4453c');
            }
        }
    }
}

function openCourseCoupon(CourseCouponXKey) {

    getCurrentCourseCoupon(CourseCouponXKey);

    //load data to UI
    $('#input_CourseCouponCode_Edit').val(CurrentCourseCoupon.Code);
    $('#input_CourseCouponLink_Edit').val('http://lecturepad.com/coupons/' + CurrentCourseCoupon.Code);
    $('#input_CourseCouponDiscountedPrice_Edit').val(CurrentCourseCoupon.DiscountedPrice);
    $('#input_CourseCouponNumberOf_Edit').val(CurrentCourseCoupon.NumberOfCoupons);
    if (CurrentCourseCoupon.DeadLine !== 'null')
        $('#input_CourseCouponDeadline_Edit').val(new Date(CurrentCourseCoupon.DeadLine).toISOString().split('T')[0]);
    if (CurrentCourseCoupon.XStatus === 'Active')
        $('#input_checkbox_CourseCouponXStatus').prop('checked', true);
    else
        $('#input_checkbox_CourseCouponXStatus').prop('checked', false);
    //end of load data to UI

    $('#div_Modal_EditCourseCouponForm').modal();//shows modal
}

function deleteCourseCoupon(CourseCouponXKey) {
    if (confirm("Are you sure?") === true) {

        $('body').append($('#div_Loader'));//append and display loader
        $('#div_Loader').css('display', 'block');

        $.getJSON(APIUrl + '/deleteCourseCoupon?p_string_CourseCouponXKey=' + CourseCouponXKey)
            .done(function (data) {
                // On success,
                var answer = data;

                if (answer === 0) {

                    //remove from UI
                    document.getElementById("tr_Coupon_" + CourseCouponXKey).remove();
                    //end of remove from UI

                    //remove from  local array
                    for (var i = 0; i < CourseCoupons.length; i++) {
                        if (CourseCoupons[i].XKey === CourseCouponXKey)
                            CourseCoupons.splice(i, 1);
                    }

                    checkCourseCouponsLength();//validate UI

                    //set current element to null
                    if (CurrentCourseCoupon)
                        if (CurrentCourseCoupon.XKey === CourseCouponXKey)
                            CurrentCourseCoupon = null;

                    showAlert('Deleted', '#17aa1c');
                }

                if (answer === 1) {
                    showAlert('Error at server', '#c4453c');
                }

                if (answer === 2) {
                    showAlert('This Course Coupon not longer exists and cannot be deleted', '#c4453c');
                }

                $('#div_Loader').css('display', 'none');//hide loader
            })
            .fail(function (jqXHR, textStatus, err) {
                $('#div_Loader').css('display', 'none');//hide loader
            });
    }
}

function initializeAutomaticMessageWizard() {
    if (CurrentWizardCourse.XKey !== '' && CanInitializeAutomaticMessage === true) {

        $('body').append($('#div_Loader'));//append and display loader
        $('#div_Loader').css('display', 'inline');

        $.getJSON(APIUrl + '/getAutomaticMessage?p_string_CourseXKey=' + CurrentWizardCourse.XKey)//get AutomaticMessage
            .done(function (data) {

                // On success,
                //if the AutomaticMessage exists the API returns a AutomaticMessage object, if not, it returns an int value
                if ($.isNumeric(data) === false) {
                    AutomaticMessage = data;

                    //update the UI
                    $('#input_WelcomeMessage').val(AutomaticMessage.WelcomeMessage);
                    $('#input_CongratulationsMessage').val(AutomaticMessage.CongratulationsMessage);
                    //end of update the UI

                    EditMode_AutomaticMessage = 'Edit';
                }

                if (data === 1)
                    showAlert('Error at server', '#c4453c');

                if (data === 2)
                    EditMode_AutomaticMessage = 'New';

                CanInitializeAutomaticMessage = false;

                $('#div_Loader').css('display', 'none');//hide the loader
            })
            .fail(function (jqXHR, textStatus, err) {
                $('#div_Loader').css('display', 'none');
            });
    }
}

function getDataFromAutomaticMessageUI() {
    WelcomeMessage = $.trim($('#input_WelcomeMessage').val());
    CongratulationsMessage = $.trim($('#input_CongratulationsMessage').val());
}

function validateAutomaticMessageFormFields() {
    getDataFromAutomaticMessageUI();

    // if (!WelcomeMessage || !CongratulationsMessage) //Allow this module to accept empty values
    //return 1;

    return 0;
}

function saveAutomaticMessage() {
    if (verifyWizardCourseIntegrity() === true) {
        if (EditMode_AutomaticMessage === 'New') {
            var ValidationAnswer = validateAutomaticMessageFormFields();

            if (ValidationAnswer === 0) {

                $('body').append($('#div_Loader'));//append loader to the body and display it
                $('#div_Loader').css('display', 'block');//shows loader

                //send data
                $.getJSON(APIUrl + '/addAutomaticMessage?p_string_CourseXKey=' + CurrentWizardCourse.XKey + '&p_string_WelcomeMessage=' + WelcomeMessage + '&p_string_CongratulationsMessage=' + CongratulationsMessage + '&p_string_Author=' + localStorage.getItem("LP_Session_Author"))
                    .done(function (data) {
                        // On success,
                        var answer = data;//if succeded, the API returns the XKey of the new object, XKey length = 10

                        if (answer.length === 10) {
                            AutomaticMessage = {};//create new object

                            //set values
                            AutomaticMessage.XKey = data;
                            AutomaticMessage.CourseXKey = CurrentWizardCourse.XKey;
                            AutomaticMessage.WelcomeMessage = WelcomeMessage;
                            AutomaticMessage.CongratulationsMessage = CongratulationsMessage;
                            //end set values

                            EditMode_AutomaticMessage = 'Edit';//set for Edit

                            showAlert('Saved', '#17aa1c');
                        }

                        if (answer === '1') {
                            showAlert('Error at server', '#c4453c');
                        }

                        if (answer === '2') {
                            showAlert('AutomaticMessage for this Course already exists', '#c4453c');
                        }

                        $('#div_Loader').css('display', 'none');//hide loader
                    })
                    .fail(function (jqXHR, textStatus, err) {
                        $('#div_Loader').css('display', 'none');
                    });

            }
            else {
                if (ValidationAnswer === 1)
                    showAlert('Please, complete the AutomaticMessage Form', '#c4453c');
            }

        }//----

        if (EditMode_AutomaticMessage === 'Edit') {

            var ValidationAnswer = validateAutomaticMessageFormFields();

            if (ValidationAnswer === 0) {

                $('body').append($('#div_Loader'));//append loader to the body and display it
                $('#div_Loader').css('display', 'block');

                //send data
                $.getJSON(APIUrl + '/updateAutomaticMessage?p_string_AutomaticMessageXKey=' + AutomaticMessage.XKey + '&p_string_CourseXKey=' + AutomaticMessage.CourseXKey + '&p_string_WelcomeMessage=' + WelcomeMessage + '&p_string_CongratulationsMessage=' + CongratulationsMessage + '&p_string_Author=' + localStorage.getItem("LP_Session_Author"))
                    .done(function (data) {
                        // On success,
                        var answer = data;

                        if (answer === 0) {

                            //set new values
                            AutomaticMessage.WelcomeMessage = WelcomeMessage;
                            AutomaticMessage.CongratulationsMessage = CongratulationsMessage;
                            //end set new values

                            showAlert('Updated', '#17aa1c');
                        }

                        if (answer === 1) {
                            showAlert('Error at server', '#c4453c');
                        }

                        if (answer === 3) {
                            showAlert('This AutomaticMessage not longer exists and cannot be updated', '#c4453c');
                        }

                        $('#div_Loader').css('display', 'none');//hide loader
                    })
                    .fail(function (jqXHR, textStatus, err) {
                        $('#div_Loader').css('display', 'none');
                    });

            }
            else {
                if (ValidationAnswer === 1)
                    showAlert('Please, complete the AutomaticMessage Form', '#c4453c');
            }
        }
    }
}

function submitCourseForReview() {
    if (CurrentWizardCourse && CurrentWizardCourse.XKey !== 'X') {

        $('body').append($('#div_Loader'));//append loader to the body and display it
        $('#div_Loader').css('display', 'block');

        //send data
        $.getJSON(APIUrl + '/validateCourseForReview?p_string_CourseXKey=' + CurrentWizardCourse.XKey)
            .done(function (data) {
                // On success,
                var answer = data;

                if ($.isNumeric(data)) {
                    if (answer === 0) {
                        //Course has passed validations, so now upgrade it to Review status

                        var CourseNewXStatus = '';
                        var MessageText = '';

                        if (CurrentWizardCourse.XStatus === 'Draft') {
                            CourseNewXStatus = 'Review';
                            MessageText = 'Your course is ready for review, after send it, you will not be able to edit it, are you sure to continue?';
                        }

                        if (CurrentWizardCourse.XStatus === 'Updating') {
                            CourseNewXStatus = 'Updated';
                            MessageText = 'Your course is in Updating state, after send it, you will not be able to edit it, Lecturepad staff will review it. Are you sure to continue?';
                        }

                        if (confirm(MessageText) === true) {
                            CurrentWizardCourse.XStatus = CourseNewXStatus;

                            if (updateWizardCourse() === true) {

                                if (window.location.pathname === '/Page_AdminModule_Courses.html') {

                                    //get the course for review from API and update UI
                                    CoursesForReview.push(getCourse(CurrentWizardCourse.XKey));
                                    loadCoursesForReviewOnUI();
                                    //

                                    hardReset();
                                }

                                if (window.location.pathname === '/Page_TeacherModule_CourseWizard.html')
                                {
                                    window.location = 'Page_TeacherModule_Dashboard.html';
                                }
                              
                            }
                        }
                    }

                    if (answer === 2) {
                        showAlert('This Course not longer exists and cannot be validated', '#c4453c');
                    }
                }
                else {
                    $('#div_CourseErrorsContent').html(data);
                    $('#div_Modal_CourseValidationErrors').modal();
                }

                $('#div_Loader').css('display', 'none');//hide loader
            })
            .fail(function (jqXHR, textStatus, err) {
                $('#div_Loader').css('display', 'none');
            });
    }
    else {
        showAlert('Not enough data to review', '#c4453c');
    }
}

function getCourse(CourseXKey) {
    var CourseAnswer;

    $('body').append($('#div_Loader'));//append and display loader 
    $('#div_Loader').css('display', 'block');

    $.ajax({
        async: false,
        method: "GET",
        url: APIUrl + '/getCourse?p_string_CourseXKey=' + CourseXKey,
        dataType: "json",
        success: function (data) {
            // On success
            //if the course exists the API returns a Course object, if not, it returns an int value
            if ($.isNumeric(data) === false) {
                CourseAnswer = data;
            }

            if (data === 1)
                showAlert('Error at server', '#c4453c');

            if (data === 2)//means no Course Draft
            {
                showAlert('Course not exists anymore', '#c4453c');
            }

            $('#div_Loader').css('display', 'none');//hide loader
        },
        error: function (jqXHR, textStatus, errorThrown) {
            $('#div_Loader').css('display', 'none');//hide loader
        }
    });

    return CourseAnswer;
}

function previewWizardCourse() {
    window.location = 'Page_StudentModule_CourseDashboard.html?CourseXKey=' + CurrentWizardCourse.XKey + '&XMode=TeacherPreview';
}

//*******************************************End of Add Course Wizard Logic**************************************