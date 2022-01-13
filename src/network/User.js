import {Utils} from "@tian/components";

const addresses = [{
    id: "11",
    cep: "00000-000",
    address: "Av. alguma coisa, 235",
    complement: "casa minha",
    neighborhood: "Jd. dos doidos",
    city: "Taboão da Serra",
    stat: "SP",
    active: true
}, {
    id: "22",
    cep: "22222-222",
    address: "Av. outra locura, 123",
    complement: "casa dele",
    neighborhood: "Parque dos anjos",
    city: "Taboão da Serra",
    stat: "SP",
    active: false
}];
export async function GetAddress() {
    return new Promise(resolve => setTimeout(resolve, Utils.Numbers.Random(500, 5000), addresses));
}