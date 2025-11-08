// Minimal Express server with Stripe PaymentIntent creation
require('dotenv').config();
const express = require('express');
const path = require('path');
const Stripe = require('stripe');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

const stripeSecret = process.env.STRIPE_SECRET_KEY;
if(!stripeSecret){
  console.warn('⚠️ STRIPE_SECRET_KEY not set in .env — payment endpoints will error.');
}
const stripe = Stripe(stripeSecret || 'sk_test_dummy');

app.post('/create-payment-intent', async (req, res) => {
  try{
    const { amount } = req.body;
    // Validate amount on server (don't trust client)
    const chargeAmount = 10000; // $100.00 in cents (fixed)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: chargeAmount,
      currency: 'usd',
      payment_method_types: ['card'],
      description: 'DarkWeb Membership — $100',
    });
    return res.json({ clientSecret: paymentIntent.client_secret });
  }catch(err){
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 4242;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
