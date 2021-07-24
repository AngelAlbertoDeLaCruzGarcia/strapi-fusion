'use strict';
const stripe = require("stripe")(
    "sk_test_51JC94SGdHkP1fGSR84ckYUHaYnDiARe0tUIVrjn01zhtOntoZbGVdgX4Y0wfyCohu66Yf6YE5JpcUJBNqWwyOgkK00DcRD8gnG"
);
module.exports = {
    async create(ctx) {
        const { stripeToken, products, idUser, addressShipping } = ctx.request.body;
        let totalPayment = 0;
        products.forEach((product) => {
          totalPayment += product.priceDesc * product.quantityCart;
        });
    
        const charge = await stripe.charges.create({
          amount: totalPayment * 100,
          currency: "mxn",
          source: stripeToken,
          description: `ID Usuario: ${idUser}`,
        });
        console.log(charge);
        let createOrder = [];
        for await (const product of products) 
        {
            const data = {
                product: product._id,
                user: idUser,
                totalPayment: totalPayment,
                productsPayment: product.priceDesc * product.quantityCart,
                quantity: product.quantityCart,
                idPayment: charge.id,
                addressShipping,
            };
            const validData = await strapi.entityValidator.validateEntityCreation(strapi.models.order,data);
            const entry = await strapi.query("orders").create(validData);
            createOrder.push(entry);
            const data2 = {
                quantity:product.quantity - product.quantityCart
            }
            const en = await strapi.query('products').update({_id:product._id},data2);
            console.log(en);
        }
        return createOrder;
    },
};
