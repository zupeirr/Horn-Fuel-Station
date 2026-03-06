const { AuditLog } = require('../models');
const logger = require('../utils/logger');

/**
 * Middleware to log actions to the AuditLog database table
 * @param {string} action - The action being performed (e.g., 'CREATE_SALE')
 * @param {string} entityType - The type of entity being affected
 */
const auditLogger = (action, entityType) => {
    return async (req, res, next) => {
        // We wrap the original res.send to capture the response and log after completion
        const originalSend = res.send;
        
        res.send = function(body) {
            res.send = originalSend;
            const response = originalSend.call(this, body);
            
            // Only log successful actions (2xx status codes)
            if (res.statusCode >= 200 && res.statusCode < 300) {
                try {
                    const responseData = JSON.parse(body);
                    const entityId = responseData.id || null;
                    
                    AuditLog.create({
                        userId: req.user ? req.user.id : null,
                        action: action,
                        entityType: entityType,
                        entityId: entityId ? String(entityId) : null,
                        details: JSON.stringify({
                            params: req.params,
                            query: req.query,
                            body: req.body,
                            response: responseData
                        }),
                        ipAddress: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
                        userAgent: req.headers['user-agent']
                    }).catch(err => {
                        logger.error('Failed to create AuditLog entry', { error: err.message, action });
                    });
                } catch (e) {
                    // If body is not JSON or other parsing error, we still try to log a basic entry
                    AuditLog.create({
                        userId: req.user ? req.user.id : null,
                        action: action,
                        entityType: entityType,
                        details: `Response body was not JSON. Status: ${res.statusCode}`,
                        ipAddress: req.ip,
                        userAgent: req.headers['user-agent']
                    }).catch(err => {
                        logger.error('Failed to create basic AuditLog entry', { error: err.message, action });
                    });
                }
            }
            
            return response;
        };
        
        next();
    };
};

module.exports = auditLogger;
