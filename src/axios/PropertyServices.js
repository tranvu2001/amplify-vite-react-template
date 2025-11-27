import axios from "axios";

const PROPERTY_API_URL = "https://y1hojj4tok.execute-api.ap-southeast-1.amazonaws.com/prod/ptys";

class PropertyServices {
    getAllProperties() {
        return axios.get(PROPERTY_API_URL);
    }

    getPropertyById(propertyId) {
        return axios.get(PROPERTY_API_URL + "/" + propertyId);
    }

    createProperty(property) {
        return axios.post(PROPERTY_API_URL, property);
    }

    updateProperty(propertyId, property) {
        return axios.put(PROPERTY_API_URL + "/" + propertyId, property);
    }

    deleteProperty(propertyId) {
        return axios.delete(PROPERTY_API_URL + "/" + propertyId);
    }

    getPropertyType() {
        return [
            { id: "HOUSE", name: "House" },
            { id: "VILLA", name: "Villa" },
            { id: "LAND", name: "Land" },
            { id: "OFFICE", name: "Office" },
        ];
    }

    updateCoordinates(propertyId, payload) {
        return axios.patch(`/properties/${propertyId}/coordinates`, payload);
    }

    getImageUploadUrls(propertyId, filesMeta) {
        const url = `${PROPERTY_API_URL}/${propertyId}/upload-urls`;
        return axios.post(url, { files: filesMeta });
    }
}

export default new PropertyServices();
