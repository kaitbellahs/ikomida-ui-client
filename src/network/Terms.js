import {
    Network
} from "@ikomida/components";

export async function getTermsOfUse() {
    const response = await Network.instance.get("/term/TermOfUseVendor");
    if (response && response?.success) {
        return response?.data
    }
    return null;
}

export async function getTermOfUse() {
    //TOD: -- change to client
    const response = await Network.instance.get("/termID/TermOfUseVendor");
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