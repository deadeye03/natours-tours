import { login, logout,signUp ,resetPassword,newPassword} from './login';
import { updateData, updatePassword } from './updatingUserData';
import { bookTour } from './stripe';
import '@babel/polyfill';
document.addEventListener('DOMContentLoaded', () => {

    const signUpBtn = document.getElementById('sign__btn')
    const loginBgc = document.querySelector(".login__bgc");
    const userMessage = document.querySelector('.user__meassage');
    const loginForm = document.querySelector('.signin__form');
    const logoutBtn = document.querySelector('.nav__el--logout');
    const submitBtn = document.querySelector('.form-user-data');
    const savePassword = document.querySelector('.form-user-settings')
    const signUpForm=document.getElementById('signUp__form');
    const resetPasswordBtn=document.getElementById('reset');
    const newPasswordForm=document.querySelector('.new-password-form');
    const bookingBtn=document.getElementById('bookTour')
    let isSignUp = true;

    //Login and signup event handler.....
    function getTokenFromUrl() {
            const url = window.location.href; // Get the full URL
            console.log(url)
            const parts = url.split('/'); // Split the URL by '/'
            console.log(parts)          
            const token = parts[4].split('?')[0]; // Get the last part which should be the 
            console.log(token)
            return token;       
    }
    
    if (signUpBtn) {
        signUpBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // console.log('click')
            // console.log('hiii')
            if (isSignUp) {
                console.log('50%')
                loginBgc.style.left = '0%';
                loginBgc.style.borderTopLeftRadius = '20px';
                loginBgc.style.borderBottomLeftRadius = '20px';
                loginBgc.style.borderTopRightRadius = '0';
                loginBgc.style.borderBottomRightRadius = '0';
                signUpBtn.innerHTML = 'Sign in';
                const content = `
                <h1 class="head-pirmary">Welcome Back ! </h1>
                    <h4 class="message">To keep connected with us please login<br> with your personal info</h4>
            `
                userMessage.innerHTML = content
                isSignUp = false;
            }
            else {
                console.log('0')
                loginBgc.style.left = '50%';
                loginBgc.style.borderTopLeftRadius = '0';
                loginBgc.style.borderBottomLeftRadius = '0';
                loginBgc.style.borderTopRightRadius = '20px';
                loginBgc.style.borderBottomRightRadius = '20px';
                signUpBtn.innerHTML = 'Sign up';
                const content = `
                    <h1 class="head-pirmary">Hello , Friend! </h1>
                        <h4 class="message">Enter your personal details and  start<br> journey with us</h4>
                `
                userMessage.innerHTML = content
                isSignUp = true;

            }
        })

    }

    if (signUpForm) {
        signUpForm.addEventListener('submit',(e)=>{
            e.preventDefault();
            let data={
                name:document.getElementById('name').value,
                email:document.getElementById('signUp_mail').value,
                password:document.getElementById('signUp_password').value,
                confirmPassword:document.getElementById('password').value

            }
            signUp(data);
        })
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            let email = document.getElementById('login_mail').value;
            let password = document.getElementById('login_password').value;
            login(email, password)
        })

    }
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout)
    }
    if(resetPasswordBtn){
        resetPasswordBtn.addEventListener('click',(e)=>{
            e.preventDefault();
            let email=document.getElementById('userEmail').value;
            resetPassword(email)
        })
    }
    if(newPasswordForm){
        console.log('submit......')
        newPasswordForm.addEventListener('submit',(e)=>{
            e.preventDefault();
            console.log('submit')
            let token=getTokenFromUrl();
            let password=document.getElementById('newPass').value;
            let passwordConfirm=document.getElementById('newPassConf').value;
            newPassword(password,passwordConfirm,token)
        })
    }

    if (submitBtn) {
        submitBtn.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const photo = document.getElementById('photo').files[0];
            const form = new FormData();
            form.append('name', name);
            form.append('email', email);
            form.append('photo', photo);

            // Log FormData entries (for debugging)
            for (let [key, value] of form.entries()) {
                console.log(`${key}: ${value}`);
            }

            // Call the function to update data
            updateData(form);
        });
    }

    if (savePassword) {
        console.log('password')
        savePassword.addEventListener('submit', (e) => {
            e.preventDefault();
            let passwordCurrent = document.getElementById('password-current').value;
            let password = document.getElementById('password').value;
            let passwordConfirm = document.getElementById('password-confirm').value;
            updatePassword(passwordCurrent, password, passwordConfirm)
        })
    }

    if(bookingBtn){
        console.log('i am button')
        bookingBtn.addEventListener('click',(e)=>{
            e.target.textContent='Processing....'
            const {tourId}=e.target.dataset;
            bookTour(tourId)
            console.log(tourId)
        })
    }
})