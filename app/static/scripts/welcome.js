function showFullWidthBox(action) {
    document.querySelector('.full-width-box').style.display = 'block';
    document.querySelector('.function-buttons button:nth-child(1)').onclick = function () {
        redirectPage(action, 'user');
    };
    document.querySelector('.function-buttons button:nth-child(2)').onclick = function () {
        redirectPage(action, 'driver');
    };
}

function hideFullWidthBox() {
    document.querySelector('.full-width-box').style.display = 'none';
}

function redirectPage(action, role) {
    const url = `/${action}?role=${role}`;
    window.location.href = url;
}