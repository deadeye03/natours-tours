export const hideAlert = () => {
    const el = document.querySelector('.alert');
    if (el) el.parentElement.removeChild(el);
}

//type of success or errror
export const showAlert = (type, msg) => {
    hideAlert()
    const markup = `<div class="alert alert--${type}">${msg}</div>`;
    document.body.insertAdjacentHTML('afterbegin', markup);

    window.setTimeout(hideAlert, 4000)
}