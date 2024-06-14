export function saveUserToken(userToken) {
    localStorage.setItem("TOKEN", userToken);
}

export function getUserToken() {
    return localStorage.getItem("TOKEN");
}

export function clearUserToken() {
    return localStorage.removeItem("TOKEN");
}

//to save user name
export function getUserName() {
    return localStorage.getItem("UserName");
}

export function saveUserName(username) {
    localStorage.setItem("UserName", username);
}

export function clearUserName() {
    return localStorage.removeItem("UserName");
}

//to save user email
export function getUserEmail() {
    return localStorage.getItem("UserEmail");
}

export function saveUserEmail(userEmail) {
    localStorage.setItem("UserEmail", userEmail);
}

export function clearUserEmail() {
    return localStorage.removeItem("UserEmail");
}