import axios from "axios";

const USER_API_URL = "https://y1hojj4tok.execute-api.ap-southeast-1.amazonaws.com/prod/tnts";

class TenantServices {
    getAllUser() {
        return axios.get(USER_API_URL)
    }

    getUserById(tenantId) {
        return axios.get(USER_API_URL + '/' + tenantId)
    }

    createUser(user) {
        return axios.post(USER_API_URL, user)
    }

    updateUser(user, tenantId) {
        return axios.put(USER_API_URL + '/' + tenantId, user)
    }

    deleteUser(tenantId) {
        return axios.delete(USER_API_URL + '/' + tenantId)
    }
}

export default new TenantServices()