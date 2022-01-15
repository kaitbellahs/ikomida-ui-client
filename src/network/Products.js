import {
    Network
} from "@tian/components";

const items = [{
        title: "Massas",
        items: [{
                title: "Massa doida cheia de recheio",
                description: "Bla bla bla bla Bla bla bla bla",
                serves: 5,
                price: 33.5,
                src: "https://static-images.ifood.com.br/image/upload/t_low/pratos/8917d352-a201-4a8b-a84d-a61219baebc6/202007221530_kMPP_f.jpg",
                weight: 1.5,
                quantity: 10
            },
            {
                title: "Massa mais doida ainda",
                description: "Bla bla bla bla Bla bla bla bla Bla bla bla bla Bla bla bla bla Bla bla bla bla Bla bla bla bla 1",
                serves: 2,
                price: 33.5,
                oldPrice: 47,
                src: "https://static-images.ifood.com.br/image/upload/t_low/pratos/8917d352-a201-4a8b-a84d-a61219baebc6/202007221530_kMPP_f.jpg",
                weight: 0.3,
                quantity: 10
            },
        ],
    },
    {
        title: "Porções",
        items: [{
                title: "Carne no capricho",
                description: "Bla bla bla bla Bla bla bla bla",
                serves: 2,
                price: 33.5,
                oldPrice: 47,
                src: "https://static-images.ifood.com.br/image/upload/t_low/pratos/8917d352-a201-4a8b-a84d-a61219baebc6/202007221530_kMPP_f.jpg",
                weight: 1,
                quantity: 10
            },
            {
                title: "Carne ao molho do chefe",
                description: "Bla bla bla bla Bla bla bla bla Bla bla bla bla Bla bla bla bla Bla bla bla bla Bla bla bla bla 1",
                serves: 2,
                price: 33.5,
                oldPrice: 47,
                src: "https://static-images.ifood.com.br/image/upload/t_low/pratos/8917d352-a201-4a8b-a84d-a61219baebc6/202007221530_kMPP_f.jpg",
                weight: 1,
                quantity: 10
            },
        ],
    },
    {
        title: "cervejas",
        items: [{
                title: "Cerveja alguma coisa",
                description: "Bla bla bla bla Bla bla bla bla",
                serves: 2,
                price: 33.5,
                oldPrice: 47,
                src: "https://static-images.ifood.com.br/image/upload/t_low/pratos/8917d352-a201-4a8b-a84d-a61219baebc6/202007221530_kMPP_f.jpg",
                weight: 1,
                quantity: 10
            },
            {
                title: "Cerveja outra coisa",
                description: "Bla bla bla bla Bla bla bla bla Bla bla bla bla Bla bla bla bla Bla bla bla bla Bla bla bla bla 1",
                serves: 2,
                price: 33.5,
                oldPrice: 47,
                src: "https://static-images.ifood.com.br/image/upload/t_low/pratos/8917d352-a201-4a8b-a84d-a61219baebc6/202007221530_kMPP_f.jpg",
                weight: 1,
                quantity: 10
            },
        ],
    },
];

export async function all() {
    return Network.get("http://localhost:1988/products", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IktoYWxpZCIsImlhdCI6MTY0MjE5ODgwNywiZXhwIjoxNjQ0NzkwODA3fQ.8_qwD_J0YLRjcNcfPZXWcsJNov68XT80h7c7Uvaz0wo");
}

export function search(query) {
    return items.map(section => {
        return {
            title: section.title,
            items: section.items.filter(item => {
                if (typeof item == "object") {
                    return item.title.toLowerCase().includes(query.toLowerCase()) || item.description.toLowerCase().includes(query.toLowerCase());
                } else {
                    return true;
                }
            })
        };
    }).filter(item => item.items.length > 0);
}