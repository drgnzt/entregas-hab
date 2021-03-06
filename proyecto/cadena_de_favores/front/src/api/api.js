import jwt from 'jwt-decode';
import axios from 'axios';

const instance = axios.create({
    baseURL: process.env.VUE_APP_SERVER_URL,
});

export default {
    // Creo la función que hace el login
    login: function(email, password) {
        return instance.post('users/login/', {
                email,
                password
            })
            .then(response => {
                this.setAuthToken(response.data.data.token);
                this.setUserId(response.data.data.idUser);
                return response.data.data;
            })
            .catch((error) => {
                throw error.response.data.message;
            });
    },
    // Guardo el token
    setAuthToken: (token) => {
        instance.defaults.headers.common['Authorization'] = 'Bearer ' + token;
        localStorage.setItem('AUTH_TOKEN_KEY', token);
    },
     // Recupero el token
    getAuthToken: () => {
        return localStorage.getItem('AUTH_TOKEN_KEY');
    },
    // Guardo el Id del usuario logueado
    setUserId: (userId) => {
        // Por ahora pongo el userId en el localStorage
        return localStorage.setItem('USER', userId);
    },
    // Recuperar el ID del usuario logueado en el localstorage
    getUserId: () => {
        return localStorage.getItem('USER');
    },
    // Borra el token
    logout: () => {
        localStorage.removeItem('AUTH_TOKEN_KEY');
        localStorage.removeItem('USER');
        delete instance.defaults.headers.common['Authorization'];
    },    
    // Consigue la fecha de caducidad del token
    tokenExpiration: (encodedToken) => {
        let token = jwt(encodedToken);
        let date = new Date(0);

        if(!token.exp) {
            return null;
        }
        
        date.setUTCSeconds(token.exp);
        return date;
    },
    // Comprueba si el token está activo
    isExpired: function(token){
        let expirationDate = this.tokenExpiration(token);
        return expirationDate < new Date();
    },
    // Estoy logueado
    isLoggedIn: function() {
        let tokenExpired;
        let authToken;
        if (this.getAuthToken() !== null){
            console.log('token ok');
            authToken = this.getAuthToken();
            tokenExpired = this.isExpired(authToken);
        } else {
            authToken = false;
            tokenExpired = false;
        }
        return !!authToken && !tokenExpired;
    },
    // Resetear password
    resetPassword: function(recoverCode, newPassword) {
        return instance.post('users/reset-password', {
            recoverCode,
            newPassword
        })
        .then(response => {
            return response.data.data;
        })
        .catch((error) => {
            throw error.response.data.message;
        });
    },
    // Recuperar contraseña
    recoverPassword: function(email) {
        return instance.post('users/recover-password',
        {
            email,
        })
        .then(response => {
            return response.data.data;
        })
        .catch((error) => {
            throw error.response.data.message;
        });
    },
}
