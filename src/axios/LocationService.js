// src/services/LocationService.js
import axios from 'axios';

class LocationService {
    constructor() {
        this.api = axios.create({
            baseURL: 'https://provinces.open-api.vn/api/v2',
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
        return (Array.isArray(data) ? data : []).map(this.toOption);
    }

    async getWardsByProvince(provinceCode, { signal } = {}) {
        const data = await this.api.get(`/p/${provinceCode}?depth=2`, { signal });
        const wards = data?.wards ?? data?.communes ?? [];
        return wards.map(this.toOption);
    }

    async getAllWards({ signal } = {}) {
        const data = await this.api.get('/w/', { signal });
        return (Array.isArray(data) ? data : []).map(this.toOption);
    }

    async getWardDetail(code, { signal } = {}) {
        const data = await this.api.get(`/w/${code}`, { signal });
        return this.toOption(data);
    }

    async getProvincesRaw(cfg) { return this.api.get('/p/', cfg); }
    async getProvinceWithWardsRaw(code, cfg) { return this.api.get(`/p/${code}?depth=2`, cfg); }
    async getAllWardsRaw(cfg) { return this.api.get('/w/', cfg); }
    async getWardDetailRaw(code, cfg) { return this.api.get(`/w/${code}`, cfg); }

    async getDistrictsByProvince() { return []; }
    async getWardsByDistrict() { return []; }
}

export default new LocationService();
