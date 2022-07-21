import {
    Network
} from "@ikomida/components";

export async function getTermsOfUse() {
    const response = await Network.instance.get("/term/termsOfUse");
    if (response && response?.success) {
        return response?.data
    }
    return null;
}

export async function getPrivacyPolicy() {
    const response = await Network.instance.get("/term/privacyPolicy");
    if (response && response?.success) {
        return response?.data
    }
    return null;
}