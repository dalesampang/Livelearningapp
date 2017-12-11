var __PDF_DOC,
    __CURRENT_PAGE,
    __TOTAL_PAGES,
    __PAGE_RENDERING_IN_PROGRESS = 0,
    __CANVAS = $('#pdf-canvas').get(0),
    __CANVAS_CTX = __CANVAS.getContext('2d');

var pdfScale = 0; // make pdfScale a global variable
var ZoomEnabled = false;

$(document).ready(function () {
    __CANVAS.width = document.documentElement.clientWidth / 2;
});

function showPDF(pdf_url) {
    $('#div_LoaderAmazing').css('display', 'block');

    PDFJS.getDocument({ url: pdf_url }).then(function (pdf_doc) {
        __PDF_DOC = pdf_doc;
        __TOTAL_PAGES = __PDF_DOC.numPages;

        // Hide pdf loader, show pdf container
        $('#div_LoaderAmazing').css('display', 'none');
        $("#pdf-contents").show();
        $("#pdf-total-pages").text(__TOTAL_PAGES);
        showPage(1);
    }).catch(function (error) {
        $('#div_LoaderAmazing').css('display', 'none');
        alert(error.message);
    });;
}

function showPage(page_no) {
    __PAGE_RENDERING_IN_PROGRESS = 1;
    __CURRENT_PAGE = page_no;

    // Disable buttons while page is being loaded
    $("#pdf-next, #pdf-prev").attr('disabled', 'disabled');
    $("#pdf-zoomin, #pdf-zoomout").attr('disabled', 'disabled');
    $("#pdf-canvas").hide();   //During page render
    $('#div_LoaderAmazing').css('display', 'block');
    $("#pdf-current-page").val(page_no);

    // Fetch the page
    __PDF_DOC.getPage(page_no).then(function (page) {

        if (!pdfScale)
            pdfScale = __CANVAS.width / page.getViewport(1).width;

        var viewport = page.getViewport(pdfScale);

        // Set canvas height
        __CANVAS.height = viewport.height;

        __CANVAS.width = viewport.width;
          
        var renderContext = {
            canvasContext: __CANVAS_CTX,
            viewport: viewport
        };

        // Render page contents in the canvas
        page.render(renderContext).then(function () {
            __PAGE_RENDERING_IN_PROGRESS = 0;

            $("#pdf-next, #pdf-prev").removeAttr('disabled');
            $("#pdf-zoomin, #pdf-zoomout").removeAttr('disabled');

            $("#pdf-canvas").show(); // Show the canvas
            $('#div_LoaderAmazing').css('display', 'none');
        });
    });
}

// Previous page
$("#pdf-prev").on('click', function () {
    if (__CURRENT_PAGE != 1)
        showPage(--__CURRENT_PAGE);
});

// Next page
$("#pdf-next").on('click', function () {
    if (__CURRENT_PAGE != __TOTAL_PAGES)
        showPage(++__CURRENT_PAGE);
});

//Zoom in
$("#pdf-zoomin").on('click', function () {
    pdfScale = pdfScale + 0.25;
    showPage(__CURRENT_PAGE);
    ZoomEnabled = true;
});

//Zoom out
$("#pdf-zoomout").on('click', function () {
    if (pdfScale <= 0.25) {
        return;
    }
    pdfScale = pdfScale - 0.25;
    showPage(__CURRENT_PAGE);
    ZoomEnabled = true;
});