import { showAlert } from "./alerts";
export const updateData = async (data) => {
        console.log(data)
    try {
        const res = await fetch('/api/v1/users/updateMe', {
            method: 'PATCH',
            // headers: {
            //     'Content-Type': 'application/json'
            // },
            body: data
        })
        const response = await res.json();
        console.log(response)
        if (res.ok) {
            showAlert('success', 'Data upadated successfully')
            window.setTimeout(()=>{
                location.assign('/me');

            },1500)
        }
        else {
            response.message.split(':')[2]!=undefined?showAlert('error', response.message.split(':')[2]):showAlert('error', response.message)
            // showAlert('error', response.message.split(':')[2])
        }
    }
    catch (err) {
        console.log(err.response)
        showAlert('error', err.message)
    }
}

export const updatePassword = async (passwordCurrent, password, passwordConfirm) => {
    console.log(passwordCurrent, password, passwordConfirm)
    try {
        const res = await fetch('/api/v1/users/updateMyPassword', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ passwordCurrent, password, passwordConfirm })
        })
        const response = await res.json();
        // console.log(response)
        if (res.ok) {
            showAlert('success', 'Password upadated successfully')
            window.setTimeout(() => {
                location.assign('/me');

            }, 1000)
        }
        else {
            let msg=response.message.split(':')[2];
            msg ? showAlert('error', response.message.split(':')[2]) : showAlert('error', response.message)
            // showAlert('error',response.message)
        }
    }
    catch (err) {
        // console.log(err.response,"/////////")
        console.log(err)
        showAlert('error', err)
    }
}