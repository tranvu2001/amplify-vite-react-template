import axios from "axios";

const USER_API_URL = "https://y1hojj4tok.execute-api.ap-southeast-1.amazonaws.com/prod/users";

class UserServices {
    getAllUser() {
        return axios.get(USER_API_URL)
    }

    getUserById(userId) {
        return axios.get(USER_API_URL + '/' + userId)
    }

    createUser(user) {
        return axios.post(USER_API_URL, user)
    }

    updateUser(user, userId) {
        return axios.put(USER_API_URL + '/' + userId, user)
    }

    deleteUser(userId) {
        return axios.delete(USER_API_URL + '/' + userId)
    }
}

export default new UserServices()