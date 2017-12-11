function initializeUploadWidget() {
    
    // Initialize the jQuery File Upload plugin
    $('.upload').fileupload({
        // This function is called when a file is added to the queue;
        // either via the browse button, or via drag/drop:
        add: function (e, data) {
            
            // Calculate the completion percentage of the upload
            var progress = parseInt(data.loaded / data.total * 100, 10);

            $(this).find('.LPUploadControlFileName').html(getSummaryOfSentence(data.files[0].name, 20) + ' (' + formatFileSize(data.files[0].size) + ')');
            $(this).find('.LPUploadCancel').css('display', 'block');

            // Listen for clicks on the cancel icon
            $(this).find('.LPUploadCancel').click(function () {

                jqXHR.abort();

                $(this).find('.myBar').css('background-color', 'red');
            });

            $(this).find('.myBar').css('width', 0 + '%');
            $(this).find('.myBar').css('background-color', '#4CAF50');
            //----

            var jqXHR;

            // Automatically upload the file once it is added to the queue
            if ($(this).find('.LPUploadMode2').length === 0)
                jqXHR = data.submit();
            else {
                
                if ($(this).find('.LPUploadMode2').text() === 'Submit Later') {
                    
                    if ($(this).find('.LPUploadMode3').html() === 'Photo')
                    {
                        UploadEventControler = data;//upload the file later
                        previewXUserPhoto(data.files[0]);
                    }
                    if ($(this).find('.LPUploadMode3').html() === 'Wallpaper') {
                        UploadEventControler_Wallpaper = data;//upload the file later
                        previewXUserWallpaper(data.files[0]);
                    }
                    
                    $(this).find('.LPUploadCancel').css('display', 'none');
                }
            }
        },

        progress: function (e, data) {

            // Calculate the completion percentage of the upload
            var progress = parseInt(data.loaded / data.total * 100, 10);

            //----
            $(this).find('.myBar').css('width', progress + '%');

            if (progress === 100) {

                $(this).find('.LPUploadCancel').css('display', 'none');

                $(this).find('.LPUploadControlFileName').html('We are processing file....');
            }
        },

        done: function (e, data) {

            //----
            if ($(this).find('.LPUploadMode').text() === 'New TestVideo_Video') {
                addTestVideo_Video(data.jqXHR.getResponseHeader("TestVideo_VideoXKey"), data.files[0]);
            }

            if ($(this).find('.LPUploadMode').text() === 'Update TestVideo_Video') {
                updateTestVideo_Video(data.files[0]);
            }

            if ($(this).find('.LPUploadMode').text() === 'New SectionItemContent') {
                addSectionItemContent(data.jqXHR.getResponseHeader("SectionItemContentXKey"), $(this).find('.SectionItemXKey').text(), data.files[0].name, data.jqXHR.getResponseHeader("SectionItemContentAuxiliarContent"), data.files[0]);
            }

            if ($(this).find('.LPUploadMode').text() === 'Update SectionItemContent') {
                updateSectionItemContent($(this).find('.SectionItemXKey').text(), data.files[0].name, data.jqXHR.getResponseHeader("SectionItemContentAuxiliarContent"), data.files[0]);
            }

            if ($(this).find('.LPUploadMode').text() === 'New SectionItemVideoCaption') {
                addSectionItemVideoCaption(data.jqXHR.getResponseHeader("SectionItemVideoCaptionXKey"), $(this).find('.SectionItemXKey').text(), data.files[0].name);
            }

            if ($(this).find('.LPUploadMode').text() === 'New SectionItemResource') {
                addSectionItemResource(data.jqXHR.getResponseHeader("SectionItemResourceXKey"), $(this).find('.SectionItemXKey').text(), data.files[0].name);
            }
            
            if ($(this).find('.LPUploadMode').text() === 'New CourseLandingPage_Media_CourseImage') {
                addCourseLandingPage_Media(data.jqXHR.getResponseHeader("CourseLandingPage_MediaXKey"), 'CourseImage', 'No Language', data.files[0]);
            }

            if ($(this).find('.LPUploadMode').text() === 'Update CourseLandingPage_Media_CourseImage') {
                updateCourseImage(data.files[0]);
            }

            if ($(this).find('.LPUploadMode').text() === 'New CourseLandingPage_Media_PromotionalVideo') {
                addCourseLandingPage_Media(data.jqXHR.getResponseHeader("CourseLandingPage_MediaXKey"), 'PromotionalVideo', 'No Language', data.files[0]);
            }

            if ($(this).find('.LPUploadMode').text() === 'Update CourseLandingPage_Media_PromotionalVideo') {
                updatePromotionalVideo(data.files[0]);
            }

            if ($(this).find('.LPUploadMode').text() === 'New CourseLandingPage_Media_ClosedCaptions') {
                addCourseLandingPage_Media(data.jqXHR.getResponseHeader("CourseLandingPage_MediaXKey"), 'ClosedCaptions', CourseLandingPage_Media_XLanguage, data.files[0]);
            }

            if ($(this).find('.LPUploadMode').text() === 'Update CourseLandingPage_Media_ClosedCaptions')
                updateClosedCaptions(data.files[0], CourseLandingPage_Media_XLanguage);

            if ($(this).find('.LPUploadMode').text() === 'New XUserPhoto') {
                addXUserPhoto(data.jqXHR.getResponseHeader("XUserPhotoXKey"), data.files[0]);
            }

            if ($(this).find('.LPUploadMode').text() === 'Update XUserPhoto') {
                updateXUserPhoto(data.files[0]);
            }

            if ($(this).find('.LPUploadMode').text() === 'New XUserWallpaper') {
                addXUserWallpaper(data.jqXHR.getResponseHeader("XUserWallpaperXKey"), data.files[0]);
            }

            if ($(this).find('.LPUploadMode').text() === 'Update XUserWallpaper') {
                updateXUserWallpaper(data.files[0]);
            }

            if ($(this).find('.LPUploadMode').text() === 'New XUserPhoto _A') {
                finalizeSaveXUser_New(data.jqXHR.getResponseHeader("XUserXKey"), data.jqXHR.getResponseHeader("XUserPhotoXKey"), data.files[0]);
            }

            if ($(this).find('.LPUploadMode').text() === 'Update XUserPhoto _A') {
                finalizeSaveXUser_Edit(data.files[0]);
            }

            if ($(this).find('.LPUploadMode').text() === 'New XUserWallpaper _A') {
                finalizeSaveXUser_New_Wallpaper(data.jqXHR.getResponseHeader("XUserXKey"), data.jqXHR.getResponseHeader("XUserWallpaperXKey"), data.files[0]);
            }

            if ($(this).find('.LPUploadMode').text() === 'Update XUserWallpaper _A') {
                finalizeSaveXUser_Edit_Wallpaper(data.files[0]);
            }
            //----
        },

        fail: function (e, data) {

            $(this).find('.myBar').css('background-color', 'red');

            alert('Error uploading ' + data.jqXHR.getResponseHeader("ErrorDetails"));
            
            if ($(this).find('.LPUploadMode').text() === 'New XUserPhoto _A') {
                finalizeSaveXUser_Error();
            }

            if ($(this).find('.LPUploadMode').text() === 'New XUserWallpaper _A') {
                finalizeSaveXUser_Error();
            }
        }
    });


    // Prevent the default action when a file is dropped on the window
    $(document).on('drop dragover', function (e) {
        e.preventDefault();
    });

    // Helper function that formats the file sizes
    function formatFileSize(bytes) {
        if (typeof bytes !== 'number') {
            return '';
        }

        if (bytes >= 1000000000) {
            return (bytes / 1000000000).toFixed(2) + ' GB';
        }

        if (bytes >= 1000000) {
            return (bytes / 1000000).toFixed(2) + ' MB';
        }

        return (bytes / 1000).toFixed(2) + ' KB';
    }
}

window.onload = initializeUploadWidget();