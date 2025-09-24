const axios = require('axios');

const productApi = process.env.PRODUCT_API_IP || "http://localhost:8000";
const orderApi = process.env.ORDER_API_IP || "http://localhost:8001";

console.log("Using Product API at:", productApi);
console.log("Using Order API at:", orderApi);

// Increase timeout for CI/AKS environments
jest.setTimeout(60000);

// Helper function to wait for service with retries
const waitForService = async (url, maxRetries = 10) => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await axios.get(url, { timeout: 5000 });
            if (response.status === 200) {
                console.log(`✅ Service at ${url} is ready`);
                return true;
            }
        } catch (error) {
            console.log(`⏳ Attempt ${i + 1}/${maxRetries}: Service at ${url} not ready, retrying...`);
            if (i < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
    }
    console.log(`❌ Service at ${url} failed to become ready after ${maxRetries} attempts`);
    return false;
};

describe('Production API Integration Tests', () => {
    // Wait for services to be ready before running tests
    beforeAll(async () => {
        console.log('🔄 Waiting for services to be ready...');
        const productReady = await waitForService(`${productApi}/health`);
        const orderReady = await waitForService(`${orderApi}/health`);
        
        if (!productReady || !orderReady) {
            throw new Error('Services failed to become ready within timeout period');
        }
    });

    test('Product service health', async () => {
        try {
            const res = await axios.get(`${productApi}/health`, { 
                timeout: 10000,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            expect(res.status).toBe(200);
            expect(res.data.service).toBe('product-service');
        } catch (error) {
            console.error('Product service health check failed:', error.message);
            if (error.code) console.error('Error code:', error.code);
            throw error;
        }
    });

    test('Order service health', async () => {
        try {
            const res = await axios.get(`${orderApi}/health`, { 
                timeout: 10000,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            expect(res.status).toBe(200);
            expect(res.data.service).toBe('order-service');
        } catch (error) {
            console.error('Order service health check failed:', error.message);
            if (error.code) console.error('Error code:', error.code);
            throw error;
        }
    });

    test('Create, get, and delete a product', async () => {
        const newProduct = { 
            name: "Test Product", 
            description: "Test", 
            price: 9.99, 
            stock_quantity: 10 
        };
        
        let productId = null;
        
        try {
            console.log('📦 Creating product...');
            const createRes = await axios.post(`${productApi}/products`, newProduct, {
                timeout: 15000,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            expect(createRes.status).toBe(201);
            productId = createRes.data.product_id;
            expect(productId).toBeTruthy();
            console.log(`✅ Product created with ID: ${productId}`);

            console.log('📋 Fetching product...');
            const getRes = await axios.get(`${productApi}/products/${productId}`, {
                timeout: 10000,
                headers: {
                    'Accept': 'application/json'
                }
            });
            expect(getRes.status).toBe(200);
            expect(getRes.data.name).toBe(newProduct.name);
            console.log('✅ Product fetched successfully');

        } catch (error) {
            console.error('Product CRUD test failed:', error.message);
            if (error.response) {
                console.error('Response status:', error.response.status);
                console.error('Response data:', error.response.data);
            }
            throw error;
        } finally {
            // Cleanup - always attempt to delete the product
            if (productId) {
                try {
                    console.log(`🗑️ Cleaning up product ${productId}...`);
                    const deleteRes = await axios.delete(`${productApi}/products/${productId}`, {
                        timeout: 10000
                    });
                    expect(deleteRes.status).toBe(204);
                    console.log('✅ Product deleted successfully');
                } catch (err) {
                    console.warn(`⚠️ Cleanup failed for product ${productId}:`, err.message);
                    // Don't fail the test due to cleanup issues
                }
            }
        }
    });

    test('Create an order and deduct stock', async () => {
        const newProduct = { 
            name: "Order Test Product", 
            description: "Test", 
            price: 19.99, 
            stock_quantity: 5 
        };
        
        let productId = null;
        
        try {
            console.log('📦 Creating product for order test...');
            const createRes = await axios.post(`${productApi}/products`, newProduct, {
                timeout: 15000,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            expect(createRes.status).toBe(201);
            productId = createRes.data.product_id;
            console.log(`✅ Product created with ID: ${productId}`);

            const order = {
                user_id: 1, 
                shipping_address: "123 Test St",
                items: [{ 
                    product_id: productId, 
                    quantity: 2, 
                    price_at_purchase: 19.99 
                }]
            };

            console.log('🛒 Creating order...');
            const orderRes = await axios.post(`${orderApi}/orders`, order, {
                timeout: 15000,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            expect(orderRes.status).toBe(201);
            expect(orderRes.data.status).toBe('confirmed');
            console.log('✅ Order created successfully');

            // Verify stock deduction
            console.log('📋 Verifying stock deduction...');
            const productAfter = await axios.get(`${productApi}/products/${productId}`, {
                timeout: 10000,
                headers: {
                    'Accept': 'application/json'
                }
            });
            expect(productAfter.data.stock_quantity).toBe(newProduct.stock_quantity - 2);
            console.log('✅ Stock deduction verified');

        } catch (error) {
            console.error('Order integration test failed:', error.message);
            if (error.response) {
                console.error('Response status:', error.response.status);
                console.error('Response data:', error.response.data);
            }
            throw error;
        } finally {
            // Cleanup
            if (productId) {
                try {
                    console.log(`🗑️ Cleaning up product ${productId}...`);
                    await axios.delete(`${productApi}/products/${productId}`, {
                        timeout: 10000
                    });
                    console.log('✅ Product cleanup completed');
                } catch (err) {
                    console.warn(`⚠️ Cleanup failed for product ${productId}:`, err.message);
                    // Don't fail the test due to cleanup issues
                }
            }
        }
    });
});