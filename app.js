// Data produk
const products = [
  {id:1, name:'Abaya Rose', price:549000, img:'assets/abaya-rose.svg'},
  {id:2, name:'Hijab Maroon', price:149000, img:'assets/hijab-maroon.svg'},
  {id:3, name:'Kimono Gold', price:389000, img:'assets/kimono-gold.svg'},
  {id:4, name:'Thobe Cream', price:459000, img:'assets/thobe-cream.svg'},
  {id:5, name:'Jubah Sand', price:499000, img:'assets/jubah-sand.svg'},
  {id:6, name:'Set Arabesque', price:579000, img:'assets/set-arabesque.svg'},
];

// Helpers
const fmt = n => 'Rp' + n.toLocaleString('id-ID');
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

// State
let cart = JSON.parse(localStorage.getItem('na_cart')||'[]');

// Render products
function renderProducts(){
  const grid = $('#productGrid');
  grid.innerHTML = products.map(p => `
    <article class="card reveal">
      <img src="${p.img}" alt="${p.name}"/>
      <div class="info">
        <strong>${p.name}</strong>
        <span class="price">${fmt(p.price)}</span>
        <button class="btn add" data-id="${p.id}">Tambah ke Keranjang</button>
      </div>
    </article>
  `).join('');
}
renderProducts();

// Add to cart
function addToCart(id){
  const item = cart.find(i => i.id===id);
  if(item){ item.qty++; }
  else{
    const p = products.find(x => x.id===id);
    cart.push({id:p.id, name:p.name, price:p.price, qty:1});
  }
  persist();
  updateCartUI();
  openCart();
}

// Remove from cart / change qty
function changeQty(id, delta){
  const item = cart.find(i => i.id===id);
  if(!item) return;
  item.qty += delta;
  if(item.qty<=0) cart = cart.filter(i => i.id!==id);
  persist();
  updateCartUI();
}
function removeItem(id){
  cart = cart.filter(i => i.id!==id);
  persist();
  updateCartUI();
}

// Persist
function persist(){
  localStorage.setItem('na_cart', JSON.stringify(cart));
}

// Update badge/count + panel + checkout list
function updateCartUI(){
  // Count
  const count = cart.reduce((a,b)=>a+b.qty,0);
  $('#cartCount').textContent = count;

  // Panel list
  const list = $('#cartList');
  list.innerHTML = cart.map(i=>`
    <li style="display:flex;align-items:center;justify-content:space-between;gap:8px;border-bottom:1px dashed #eee;padding:8px 0">
      <div>
        <strong>${i.name}</strong>
        <div class="mini">${fmt(i.price)} × ${i.qty}</div>
      </div>
      <div style="display:flex;align-items:center;gap:6px">
        <button class="btn solid small" data-q="${i.id},-1">-</button>
        <button class="btn solid small" data-q="${i.id},1">+</button>
        <button class="btn small" data-r="${i.id}">Hapus</button>
      </div>
    </li>
  `).join('');

  // Panel total
  const total = cart.reduce((a,b)=>a + b.price*b.qty, 0);
  $('#panelTotal').textContent = fmt(total);

  // Checkout summary
  const ul = $('#cartItems');
  ul.innerHTML = cart.map(i=>`
    <li><span>${i.name} × ${i.qty}</span><span>${fmt(i.price*i.qty)}</span></li>
  `).join('');
  $('#cartTotal').textContent = fmt(total);
}
updateCartUI();

// Event: add to cart buttons
document.addEventListener('click', e => {
  const addBtn = e.target.closest('.add');
  if(addBtn){
    const id = +addBtn.dataset.id;
    addToCart(id);
  }
  const qtyBtn = e.target.closest('[data-q]');
  if(qtyBtn){
    const [id, d] = qtyBtn.dataset.q.split(',').map(Number);
    changeQty(id, d);
  }
  const delBtn = e.target.closest('[data-r]');
  if(delBtn){
    const id = +delBtn.dataset.r;
    removeItem(id);
  }
});

// Cart open/close
function openCart(){ $('#cartPanel').classList.add('open'); }
function closeCart(){ $('#cartPanel').classList.remove('open'); }
$('#cartButton').addEventListener('click', openCart);
$('#closeCart').addEventListener('click', closeCart);

// Clear cart
$('#clearCart').addEventListener('click', () => {
  cart = [];
  persist();
  updateCartUI();
});

// Checkout form
$('#checkoutForm').addEventListener('submit', e => {
  e.preventDefault();
  if(cart.length===0){ alert('Keranjang masih kosong.'); return; }
  const data = Object.fromEntries(new FormData(e.target).entries());
  const order = {
    store: 'Nur Arabia',
    items: cart,
    total: cart.reduce((a,b)=>a + b.price*b.qty, 0),
    customer: data,
    createdAt: new Date().toISOString()
  };
  // Simulate submit: open WhatsApp link prefilled (optional) or just alert
  const lines = [
    '*Order Nūr Arabia*',
    ...order.items.map(i => `- ${i.name} x ${i.qty} = ${fmt(i.price*i.qty)}`),
    `Total: ${fmt(order.total)}`,
    `Nama: ${order.customer.nama}`,
    `Alamat: ${order.customer.alamat}`
  ];
  const msg = encodeURIComponent(lines.join('\n'));
  // If user provided WA number, just show alert and keep it local
  alert('Terima kasih! Order Anda tercatat.\n\n' + lines.join('\n'));
  // Reset
  cart = []; persist(); updateCartUI(); e.target.reset();
});

// Slider
const slides = $$('.slide');
const dotsWrap = $('#dots');
let cur = 0; let timer = null;
function go(i){
  slides[cur].classList.remove('current');
  dotsWrap.children[cur]?.classList.remove('active');
  cur = (i+slides.length)%slides.length;
  slides[cur].classList.add('current');
  dotsWrap.children[cur]?.classList.add('active');
}
function next(){ go(cur+1); }
function prev(){ go(cur-1); }
$('#next').addEventListener('click', next);
$('#prev').addEventListener('click', prev);
slides.forEach((_,i)=>{
  const b = document.createElement('button');
  if(i===0) b.classList.add('active');
  b.addEventListener('click', ()=>go(i));
  dotsWrap.appendChild(b);
});
function autoplay(){
  clearInterval(timer);
  timer = setInterval(next, 4500);
}
autoplay();
$('#slider').addEventListener('mouseenter', ()=>clearInterval(timer));
$('#slider').addEventListener('mouseleave', autoplay);

// Reveal on scroll
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      e.target.style.transform = 'translateY(0)';
      e.target.style.opacity = '1';
      io.unobserve(e.target);
    }
  });
}, {threshold:.12});
setTimeout(()=>{
  $$('.reveal').forEach(el=>{
    el.style.transform='translateY(10px)';
    el.style.opacity='0';
    el.style.transition='opacity .6s, transform .6s';
    io.observe(el);
  });
}, 100);

// Audio controls
const bgm = document.getElementById('bgm');
const soundToggle = document.getElementById('soundToggle');
let playing = false;
soundToggle.addEventListener('click', ()=>{
  if(!playing){
    bgm.volume = 0.25;
    bgm.play();
    playing = true;
    soundToggle.textContent = '❚❚';
  }else{
    bgm.pause();
    playing = false;
    soundToggle.textContent = '♫';
  }
});

// Year
document.getElementById('year').textContent = new Date().getFullYear();
