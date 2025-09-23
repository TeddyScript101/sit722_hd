const axios = require('axios');

const productApi = process.env.PRODUCT_API_IP || "http://localhost:8000";
const orderApi = process.env.ORDER_API_IP || "http://localhost:8001";

describe('Production API Integration Tests', () => {
    test('Product service health', async () => {
        const res = await axios.get(`${productApi}/health`);
        expect(res.status).toBe(200);
        expect(res.data.service).toBe('product-service');
    });

    test('Order service health', async () => {
        const res = await axios.get(`${orderApi}/health`);
        expect(res.status).toBe(200);
        expect(res.data.service).toBe('order-service');
    });

    test('Create, get, and delete a product', async () => {
        const newProduct = { name: "Test Product", description: "Test", price: 9.99, stock_quantity: 10 };
        const createRes = await axios.post(`${productApi}/products/`, newProduct);
        expect(createRes.status).toBe(201);
        const productId = createRes.data.product_id;

        const getRes = await axios.get(`${productApi}/products/${productId}`);
        expect(getRes.data.name).toBe(newProduct.name);

        const deleteRes = await axios.delete(`${productApi}/products/${productId}`);
        expect(deleteRes.status).toBe(204);
    });

    test('Create an order and deduct stock', async () => {
        const newProduct = { name: "Order Test Product", description: "Test", price: 19.99, stock_quantity: 5 };
        const createRes = await axios.post(`${productApi}/products/`, newProduct);
        const productId = createRes.data.product_id;

        const order = {
            user_id: 1,
            shipping_address: "123 Test St",
            items: [{ product_id: productId, quantity: 2, price_at_purchase: 19.99 }]
        };

        const orderRes = await axios.post(`${orderApi}/orders/`, order);
        expect(orderRes.status).toBe(201);
        expect(orderRes.data.status).toBe('confirmed');

        // Cleanup: delete product
        await axios.delete(`${productApi}/products/${productId}`);
    });
});
