import { showAlert } from "./alerts";
export const login = async (email, password) => {
    console.log(email, password);
    try {
        const res = await fetch('/api/v1/users/login', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        })
        let response = await res.json();
        console.log(response)
        if (response.status === 'success') {
            showAlert('success', 'Logged in successfully')
            window.setTimeout(() => {
                location.assign('/');
            }, 1000)
        }
        else if (response.error.statusCode === 401) {
            showAlert('error', 'incorrect email address or password')

        }
    } catch (error) {

        console.log(error)
    }
}

export const logout = async () => {
    try {
        const res = await fetch('/api/v1/users/logout', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        let response = await res.json();
        console.log(response)
        if (response.status === 'success') {
            showAlert('success', 'Logged out successfully')
            window.setTimeout(() => {
                location.assign('/');
            }, 1500)
        }
        else if (response.error.statusCode === 401) {
            showAlert('error', 'Error During logout')

        }
    } catch (error) {
        console.log(error)
    }
}

export const signUp = async (data) => {
    console.log(data)
    try {
        const res = await fetch('/api/v1/users/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        let response = await res.json();
        if (res.ok) {
            showAlert('success', 'Account is created successfully')
            window.setTimeout(() => {
                location.assign('/login');
            }, 1500)
        }
        else if (response.error.code === 11000) {
            showAlert('error', 'This email is already exit enter another email')
        }
        else {
            showAlert('error', response.message.split(':')[2])
        }
    } catch (error) {
        console.log(error);
    }
}

export const resetPassword = async (email) => {
    console.log(email)
    try {
        const res = await fetch('/api/v1/users/forgotPassword', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        })
        let response = await res.json();
        if (res.ok) {
            showAlert('success', 'Reset password request send to Email successfylly')
            window.setTimeout(() => {
                location.assign('/login');
            }, 2500)
        }
        else if (response.error.code === 11000) {
            showAlert('error', 'This email is already exit enter another email')
        }
        else {
            response.message.split(':')[2] ? showAlert('error', response.message.split(':')[2]) : showAlert('error', response.message)
        }
    } catch (error) {
        console.log(error);
    }
}
export const newPassword = async (password, passwordConfirm, token) => {
    console.log(token)
    try {
        const res = await fetch(`/api/v1/users/resetPassword/${token}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ password, passwordConfirm })
        })
        let response = await res.json();
        console.log(response)
        if (res.ok) {
            showAlert('success', 'Password changed successfully')
            window.setTimeout(() => {
                location.assign('/login');
            }, 1500)
        }
        else if (response.error.code === 11000) {
            showAlert('error', 'This email is already exit enter another email')
        }
        else {
            response.message.split(':')[2] ? showAlert('error', response.message.split(':')[2]) : showAlert('error', response.message)

        }
    } catch (error) {
        console.log(error);
    }
}