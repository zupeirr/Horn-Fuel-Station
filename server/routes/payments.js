const express = require('express');
const router = express.Router();

// Mock Payment Processing
router.post('/process', async (req, res) => {
    try {
        const { amount, currency, method, transactionId } = req.body;

        console.log(`Processing mock payment for ${amount} ${currency} via ${method}...`);

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Simulate success/failure logic (90% success rate)
        const isSuccess = Math.random() < 0.9;

        if (isSuccess) {
            res.status(200).json({
                success: true,
                message: 'Payment processed successfully',
                gatewayReference: `MOCK-${Math.random().toString(36).substring(7).toUpperCase()}`,
                amount,
                currency,
                timestamp: new Date().toISOString()
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Payment failed at gateway',
                errorCode: 'INSUFFICIENT_FUNDS'
            });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
