var isDebugging = false;
var APIRoot = isDebugging ? 'http://localhost:54838' : 'http://api.livelearning.io';
var APIUrl = APIRoot + '/api/LiveLearningAPI';//API url
var WEBAPPDomainUrl = isDebugging ? "http://localhost:53297" : 'http://livelearning.io';


function getQueryVariable(variable) {
    var url = window.location;
    var query = url.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (pair[0] === variable) { return decodeURIComponent(pair[1]); }
    }
    return (false);
}

function validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

function showAlert(message, bgcolor) {
    var $messge = $("<span>" + message + "</span>");
    if (bgcolor == "#c4453c" || bgcolor == "error") {
        $messge.prepend("<i class='text-danger toast-icon fa fa-lg fa-times'></i>");
    }
    if (bgcolor == "#17aa1c" || bgcolor == "success") {
        $messge.prepend("<i class='text-success toast-icon fa fa-lg fa-check'></i>");
    }
    Materialize.toast($messge, 5000);
}

function getSummaryOfSentence(sentence, lengthX) {

    var Answer = "";

    if (sentence.length > lengthX) {
        var int_Axis = lengthX - 3;
        var int_PartSize = int_Axis / 2;
        //first part of summary
        for (int_Index = 0; int_Index < sentence.length; int_Index++) {
            if (int_Index < int_PartSize)
                Answer = Answer + sentence.charAt(int_Index);
            else
                break;
        }
        //add the dots
        Answer = Answer + " ... ";

        //second part of summary
        for (int_Index2 = (sentence.length - int_PartSize); int_Index2 < sentence.length; int_Index2++) {
            Answer = Answer + sentence.charAt(int_Index2);
        }
    }
    else
        Answer = sentence;

    return Answer;
}

function getFirstCharactersOfSentence(sentence, lengthX) {

    var Answer = "";

    if (sentence) {
        if (sentence.length > lengthX) {
            //first part of summary
            for (int_Index = 0; int_Index < sentence.length; int_Index++) {
                if (int_Index <= lengthX)
                    Answer = Answer + sentence.charAt(int_Index);
                else
                    break;
            }
            //add the dots
            Answer = Answer + " ... ";
        }
        else
            Answer = sentence;
    }

    return Answer;
}

//******************************Tabs Logic*************************************

function openTabOption(evt, TabName) {
    // Declare all variables
    var i, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(TabName).style.display = "block";
    evt.currentTarget.className += " active";
}

function openTabOptionV(evt, TabName) {
    // Declare all variables
    var i, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontentV");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinksV");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(TabName).style.display = "block";
    evt.currentTarget.className += " active";
}

function openTabOptionAuxiliar(evt, TabName) {
    // Declare all variables
    var i, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent_Auxiliar");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks_Auxiliar");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(TabName).style.display = "block";
    evt.currentTarget.className += " active";
}

//*******************************End Tabs logic******************************************

//***************************Sortable List Logic*************************************************
var SortableMenuToggled = false;

function initializeSorting() {
    $(".sortable").sortable({
        handle: '.handle',
        connectWith: ".connectedSortable",
        change: function (event, ui) {
            if ($(ui.item).attr('listgroup') === 'CurriculumSections')
                $($(ui.item).parent()).sortable("cancel");
        },
        update: function (event, ui) {
            if ($(ui.item).attr('listgroup') === 'SectionItems')
                updateSectionItemSorted('Sorted', $(ui.item).attr('sectionitemxkey'));
        },
    }).disableSelection();

    $(".sortable_Questions").sortable({
        handle: '.handle_Question',
        update: function (event, ui) {
            updateQuizQuestionsSorted($(ui.item).parent().attr('sectionitemxkey'));
        },
    }).disableSelection();
}

//***************************End Sortable List Logic*************************************************

//******************************Tinymce Editor Logic*************************************************
function initTinymceEditors() {
    if (typeof tinymce !== 'undefined') {
        tinymce.init({
            selector: '.Tinymce',
            height: 300,
            theme: 'modern',
            plugins: [
                'advlist autolink lists link image charmap print preview hr anchor pagebreak',
                'searchreplace wordcount visualblocks visualchars code fullscreen',
                'insertdatetime media nonbreaking save table contextmenu directionality',
                'emoticons template paste textcolor colorpicker textpattern imagetools codesample toc placeholder'
            ],
            toolbar: 'fullscreen',
            toolbar1: 'undo redo | insert | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image',
            toolbar2: 'print preview media | forecolor backcolor emoticons | codesample',
            image_advtab: true,
            content_css: '/css/bootstrap.css',
        })
    }
}

function initTinymceSimpleEditors() {
    if (typeof tinymce !== 'undefined') {
        tinymce.init({
            selector: '.TinymceSimple',
            menubar: false,
            plugins: [
                'advlist autolink lists link image charmap print preview anchor placeholder',
                'searchreplace visualblocks code fullscreen',
                'insertdatetime media table contextmenu paste code'
            ],
            toolbar: 'undo redo | insert | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image',
            content_css: '/css/bootstrap.css',
            init_instance_callback: "loadDataInTinymce"
        })
    }
}

function initTinymceSimplestEditors() {
    if (typeof tinymce !== 'undefined') {
        tinymce.init({
            selector: '.TinymceSimplest',
            menubar: false,
            plugins: [
                'link image placeholder'
            ],
            toolbar: 'undo redo | insert | styleselect | bold italic | bullist numlist | link image',
            content_css: '/css/bootstrap.css',
            init_instance_callback: "loadDataInTinymce"
        })
    }
}

function loadDataInTinymce(inst) {
    tinymce.get(inst.id).setContent($('#' + inst.id).val());
}

function getFlag(sentence, flag) {
    var Answer = '';
    var SubSentence = '';
    var WaitForApostrophe = false;

    for (int_Index = 0; int_Index < sentence.length; int_Index++) {

        if (WaitForApostrophe === false && sentence.charAt(int_Index) === "'") {
            WaitForApostrophe = true;
            continue;
        }

        if (WaitForApostrophe === true && sentence.charAt(int_Index) === "'") {
            WaitForApostrophe = false;
            continue;
        }

        if (WaitForApostrophe === true && sentence.charAt(int_Index) !== "'") {
            SubSentence = SubSentence + sentence.charAt(int_Index);//get SubSentence
            continue;
        }

        if (sentence.charAt(int_Index) !== '@')
            SubSentence = SubSentence + sentence.charAt(int_Index);//get SubSentence
        else {
            //analyse SubSentence
            var ValueTemporal = '';
            var WaitForFlag = true;
            var WaitForValue = false;

            for (int_Index2 = 0; int_Index2 < SubSentence.length; int_Index2++) {
                if (SubSentence.charAt(int_Index2) !== '?')
                    ValueTemporal = ValueTemporal + SubSentence.charAt(int_Index2);
                else {
                    if (WaitForFlag === true) {
                        if (ValueTemporal === flag) {
                            WaitForFlag = false;
                            WaitForValue = true;
                            ValueTemporal = '';
                            continue;
                        }
                    }

                    if (WaitForValue === true) {
                        Answer = ValueTemporal;
                        return Answer;
                    }
                }

                if (int_Index2 === SubSentence.length - 1)//validate before leave for loop
                {
                    if (WaitForValue === true) {
                        Answer = ValueTemporal;
                        return Answer;
                    }
                }
            }

            SubSentence = '';//reset for new flaq search
        }
    }

    return 'Unknown Parameter';
}