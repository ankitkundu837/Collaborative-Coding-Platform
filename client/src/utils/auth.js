export function saveToken(token) {

    localStorage.setItem("token", token);

}
export function getToken() {

    return localStorage.getItem("token");

}
export function removeToken() {

    localStorage.removeItem("token");

}
export function saveUser(user){

    localStorage.setItem(

        "user",

        JSON.stringify(user)

    );

}
export function getUser(){

    const user = localStorage.getItem("user");

    if(!user){

        return null;

    }

    return JSON.parse(user);

}
export function removeUser(){

    localStorage.removeItem("user");

}