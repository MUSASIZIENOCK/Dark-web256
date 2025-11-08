// Ambient canvas + small particle system + minimal interactivity
(function(){
  const canvas = document.getElementById('ambientCanvas');
  const ctx = canvas.getContext('2d');
  let w = canvas.width = innerWidth;
  let h = canvas.height = innerHeight;
  const particles = [];

  function rand(min,max){ return Math.random()*(max-min)+min; }
  function resize(){ w = canvas.width = innerWidth; h = canvas.height = innerHeight; }
  addEventListener('resize', resize);

  for(let i=0;i<80;i++){
    particles.push({
      x: rand(0,w), y: rand(0,h), s: rand(0.3,1.6), v: rand(0.1,0.6)
    });
  }

  function frame(){
    ctx.clearRect(0,0,w,h);
    // faint scanlines
    ctx.fillStyle = 'rgba(0,0,0,0.02)';
    for(let y=0;y<h;y+=6) ctx.fillRect(0,y,w,1);

    particles.forEach(p=>{
      p.x += Math.cos(p.v)*0.4;
      p.y += p.v;
      if(p.y>h) { p.y = -10; p.x = rand(0,w); }
      ctx.beginPath();
      ctx.fillStyle = 'rgba(180,255,255,0.06)';
      ctx.arc(p.x,p.y,p.s,0,Math.PI*2);
      ctx.fill();
    });

    requestAnimationFrame(frame);
  }
  frame();

  // Minimal Stripe + checkout flow
  const STRIPE_PUBLISHABLE = "pk_test_REPLACE_ME"; // replace with your publishable key
  const stripe = STRIPE_PUBLISHABLE ? Stripe(STRIPE_PUBLISHABLE) : null;

  const startBtn = document.getElementById('startPayment');
  const confirmBtn = document.getElementById('confirmPayment');
  const paymentStatus = document.getElementById('paymentStatus');
  const paymentActions = document.getElementById('paymentActions');

  startBtn && startBtn.addEventListener('click', async () => {
    if(!stripe){
      paymentStatus.innerText = "Stripe publishable key not configured. Replace in main.js.";
      return;
    }
    paymentStatus.innerText = "Preparing secure checkout...";

    try{
      const res = await fetch('/create-payment-intent', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ amount:10000 })});
      const data = await res.json();
      if(data.error){ paymentStatus.innerText = "Server error: " + data.error; return; }

      // Create minimal card element using Stripe Elements (we'll mount it to #cardElement)
      const elements = stripe.elements();
      const style = { base: { color: '#fff', fontFamily: 'Courier, monospace', fontSize:'16px', '::placeholder': { color: '#9aa0a6' } } };
      const card = elements.create('card', { style });
      document.getElementById('cardElement').innerHTML = "";
      card.mount('#cardElement');

      paymentStatus.innerText = "Enter card details and confirm payment.";
      paymentActions.style.display = 'block';

      confirmBtn.onclick = async () => {
        paymentStatus.innerText = "Processing payment — do not close the window.";
        const {error, paymentIntent} = await stripe.confirmCardPayment(data.clientSecret, { payment_method: { card }});
        if(error){
          paymentStatus.innerText = "Payment failed: " + error.message;
        } else if(paymentIntent && paymentIntent.status === 'succeeded'){
          paymentStatus.innerHTML = "<strong>Payment successful.</strong> Membership unlocked. Check your inbox for confirmation.";
          // Here you would call your server to mark user as paid or create an account.
        } else {
          paymentStatus.innerText = "Payment status: " + paymentIntent.status;
        }
      };

    } catch(e){
      console.error(e);
      paymentStatus.innerText = "Unexpected error preparing payment.";
    }
  });

  // Sneak Peek button creates vibration of glitch text
  document.getElementById('sneakPeek')?.addEventListener('click', () => {
    const g = document.querySelector('.glitch');
    g.classList.add('pulse');
    setTimeout(()=>g.classList.remove('pulse'), 500);
  });

})();
