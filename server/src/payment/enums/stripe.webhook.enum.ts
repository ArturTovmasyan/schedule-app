enum StripeWebhook {
    PAYMENT_SUCCEEDED = 'invoice.payment_succeeded',
    SUBSCRIPTION_DELETE = 'customer.subscription.deleted',
    PAYMENT_FAILED = 'payment_intent.payment_failed',
}

export default StripeWebhook;
