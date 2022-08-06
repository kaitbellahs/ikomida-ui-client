import {
    Network,
    Types
} from "@ikomida/components";

export async function getTermsOfUse() {
    const response = await Network.instance.get(`/term/${Types.TermTypes.TERM_OF_USE_CLIENT}`);
    if (response && response?.success) {
        return response?.data
    }
    return null;
}

export async function getTermOfUse() {
    const response = await Network.instance.get(`/termID/${Types.TermTypes.TERM_OF_USE_CLIENT}`);
    if (response && response?.success) {
        return response?.data
    }
    return null;
}

export async function getPrivacyPolicy() {
    const response = await Network.instance.get(`/term/${Types.TermTypes.PRIVACY_POLICY}`);
    if (response && response?.success) {
        return response?.data
    }
    return null;
}