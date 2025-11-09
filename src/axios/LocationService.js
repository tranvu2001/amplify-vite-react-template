// src/services/LocationService.js
import axios from 'axios';

class LocationService {
    constructor() {
        this.api = axios.create({
            baseURL: 'https://provinces.open-api.vn/api',
            timeout: 10000,
            headers: { Accept: 'application/json' },
        });
        
        this.api.interceptors.response.use(
            (res) => res.data,
            (err) => Promise.reject(err)
        );
    }
    
    toOption(v) {
        return { id: String(v.code), name: v.name, raw: v };
    }
    
    async getProvinces({ signal } = {}) {
        const data = await this.api.get('/p/', { signal });
        return data.map(this.toOption);
    }
    
    async getDistrictsByProvince(provinceCode, { signal } = {}) {
        const data = await this.api.get(`/p/${provinceCode}?depth=2`, { signal });
        return (data.districts ?? []).map(this.toOption);
    }
    
    async getWardsByDistrict(districtCode, { signal } = {}) {
        const data = await this.api.get(`/d/${districtCode}?depth=2`, { signal });
        return (data.wards ?? []).map(this.toOption);
    }
    
    async getProvincesRaw(cfg) { return this.api.get('/p/', cfg); }
    async getDistrictsRaw(code, cfg) { return this.api.get(`/p/${code}?depth=2`, cfg); }
    async getWardsRaw(code, cfg) { return this.api.get(`/d/${code}?depth=2`, cfg); }
}

export default new LocationService();
