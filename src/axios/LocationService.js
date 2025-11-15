// src/services/LocationService.js
import axios from 'axios';
import { LocationClient, SearchPlaceIndexForTextCommand } from '@aws-sdk/client-location';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-providers';

const REGION = 'ap-southeast-1';
const IDENTITY_POOL_ID = 'ap-southeast-1:fa2ef108-06d9-47ae-a216-dcdeb35f8359';
const PLACE_INDEX = 'explore.place.Grab';

const locationClient = new LocationClient({
    region: REGION,
    credentials: fromCognitoIdentityPool({
        identityPoolId: IDENTITY_POOL_ID,
        clientConfig: { region: REGION },
    }),
});

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

    // ===== Geocode địa chỉ → lat/lng (client) =====
    async geocodeAddress({ address, wardName, provinceName }) {
        const fullAddress = `${address}, ${wardName}, ${provinceName}, Việt Nam`;

        const cmd = new SearchPlaceIndexForTextCommand({
            IndexName: PLACE_INDEX,
            Text: fullAddress,
            MaxResults: 1,
            FilterCountries: ['VNM'],
        });

        const res = await locationClient.send(cmd);
        const first = res.Results?.[0];
        if (!first || !first.Place?.Geometry?.Point) return null;

        const [lng, lat] = first.Place.Geometry.Point;
        return { lat, lng, raw: first };
    }
}

export default new LocationService();
