/* ====== EDIT THESE ====== */
const WA = "923295412126";   // WhatsApp number, country code first, no + or spaces
const PRODUCTS = [
 {id:1,n:"Tomatoes",u:"Per kg",p:120,c:"Vegetables",i:"Tomato.jpg"},
 {id:2,n:"Potatoes",u:"Per kg",p:90,c:"Vegetables",i:"Potato.jpg"},
 {id:3,n:"Onions",u:"Per kg",p:110,c:"Vegetables",i:"Onion.jpg"},
 {id:4,n:"Spinach",u:"Per bunch",p:40,c:"Vegetables",i:"Spainch.jpg"},
 {id:5,n:"Bananas",u:"Per dozen",p:180,c:"Fruits",i:"Banana.jpg"},
 {id:6,n:"Apples",u:"Per kg",p:320,c:"Fruits",i:"Apple.jpg"},
 {id:7,n:"Oranges",u:"Per kg",p:260,c:"Fruits",i:"Orange.jpg"},
 {id:8,n:"Full cream milk",u:"1 litre",p:220,c:"Dairy and eggs",i:"Milk.jpg"},
 {id:9,n:"Farm eggs",u:"Per dozen",p:340,c:"Dairy and eggs",i:"Egg.jpg"},
 {id:10,n:"Yogurt",u:"1 kg",p:260,c:"Dairy and eggs",i:"Yougurt.jpg"},
 {id:11,n:"Basmati rice",u:"5 kg bag",p:1850,c:"Pantry staples",i:"Basbati.jpg"},
 {id:12,n:"Cooking oil",u:"3 litre",p:1650,c:"Pantry staples",i:"Oil.jpg"}
];
/* ======================== */
const CATS = ["All","Fruits","Vegetables","Dairy and eggs","Pantry staples"];
const rs = n => "Rs. " + n.toLocaleString("en-US");
let cart = {};
try { cart = JSON.parse(localStorage.getItem("hamza_cart") || "{}"); } catch(e) {}
const save = () => { try { localStorage.setItem("hamza_cart", JSON.stringify(cart)); } catch(e) {} };
const $ = s => document.querySelector(s);

/* shared header, cart drawer, footer */
const page = document.body.dataset.page;
const nav = [["index.html","Home","home"],["shop.html","Shop","shop"],["about.html","About","about"]]
  .map(l => `<a href="${l[0]}" class="${page===l[2]?"on":""}">${l[1]}</a>`).join("");
$("#site-header").innerHTML = `<header><div class="wrap bar">
  <a href="index.html" class="logo">Hamza's <span>Store</span></a>
  <nav id="nav">${nav}</nav>
  <button class="cart-btn" id="open-cart">Cart <b id="count">0</b></button>
  <button class="menu-btn" id="menu" aria-label="Open menu">Menu</button></div></header>`;
$("#site-footer").innerHTML = `<footer><div class="wrap"><span>&copy; ${new Date().getFullYear()} Hamza's Store. All rights reserved.</span><span>Fresh groceries, every day.</span></div></footer>
<div class="veil" id="veil"></div>
<aside id="cart" aria-label="Shopping cart"><header><h2>Your cart</h2><button class="x" id="close-cart" aria-label="Close cart">&times;</button></header>
<div id="items"></div>
<div class="foot"><div class="total"><span>Total</span><span id="total">Rs. 0</span></div>
<a class="btn btn-red" id="order" target="_blank" rel="noopener">Order on WhatsApp</a>
<button class="btn btn-line" id="clear">Clear cart</button></div></aside>
<div class="toast" id="toast" role="status"></div>`;

function toast(t){const e=$("#toast");e.textContent=t;e.classList.add("on");clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove("on"),1600)}
function openCart(o){$("#cart").classList.toggle("on",o);$("#veil").classList.toggle("on",o)}
function find(id){return PRODUCTS.find(p=>p.id==id)}

function drawCart(){
  const ids = Object.keys(cart); let total=0, count=0;
  $("#items").innerHTML = ids.length ? ids.map(id=>{
    const p=find(id), q=cart[id]; total+=p.p*q; count+=q;
    return `<div class="item"><div><strong>${p.n}</strong><div class="unit">${p.u} &times; ${rs(p.p)}</div>
    <div class="qty"><button data-d="-1" data-id="${id}" aria-label="Less">&minus;</button><span>${q}</span><button data-d="1" data-id="${id}" aria-label="More">+</button></div></div>
    <div style="text-align:right"><strong>${rs(p.p*q)}</strong><br><button class="rm" data-rm="${id}">Remove</button></div></div>`;
  }).join("") : `<p class="empty">Your cart is empty. Add something fresh from the shop.</p>`;
  $("#count").textContent = count; $("#total").textContent = rs(total);
  const lines = ids.map(id=>`- ${find(id).n} (${find(id).u}) x ${cart[id]} = ${rs(find(id).p*cart[id])}`).join("\n");
  $("#order").href = ids.length ? `https://wa.me/${WA}?text=` + encodeURIComponent(`Hello Hamza's Store, I want to order:\n${lines}\nTotal: ${rs(total)}`) : "#";
}
function add(id){cart[id]=(cart[id]||0)+1;save();drawCart();toast(find(id).n+" added to cart")}
function change(id,d){cart[id]+=d;if(cart[id]<=0)delete cart[id];save();drawCart()}

$("#open-cart").onclick=()=>openCart(true);
$("#close-cart").onclick=$("#veil").onclick=()=>openCart(false);
$("#clear").onclick=()=>{cart={};save();drawCart()};
$("#menu").onclick=()=>$("#nav").classList.toggle("open");
$("#items").onclick=e=>{const b=e.target;
  if(b.dataset.d)change(b.dataset.id,+b.dataset.d); if(b.dataset.rm){delete cart[b.dataset.rm];save();drawCart()}};
$("#order").onclick=e=>{if(!Object.keys(cart).length){e.preventDefault();toast("Add items first")}};
document.addEventListener("keydown",e=>{if(e.key==="Escape")openCart(false)});
document.addEventListener("click",e=>{if(e.target.dataset.add)add(e.target.dataset.add)});

function card(p){return `<article class="prod"><div class="pic"><img src="Pictures/${p.i}" alt="${p.n}" onerror="this.style.visibility='hidden'"></div>
<div class="info"><h3>${p.n}</h3><p class="unit">${p.u}</p><div class="row"><span class="price">${rs(p.p)}</span>
<button class="add" data-add="${p.id}">Add to cart</button></div></div></article>`}

/* featured on home */
if($("#featured")) $("#featured").innerHTML = PRODUCTS.filter(p=>[1,5,8,11].includes(p.id)).map(card).join("");

/* shop page: search + filters */
if($("#grid")){
  let cat = new URLSearchParams(location.search).get("cat") || "All", q = "";
  const show = () => {
    $("#chips").innerHTML = CATS.map(c=>`<button class="chip ${c===cat?"on":""}" data-cat="${c}">${c}</button>`).join("");
    const list = PRODUCTS.filter(p=>(cat==="All"||p.c===cat)&&p.n.toLowerCase().includes(q));
    $("#grid").innerHTML = list.length ? list.map(card).join("") : "";
    $("#none").hidden = list.length>0;
  };
  $("#chips").onclick=e=>{if(e.target.dataset.cat){cat=e.target.dataset.cat;show()}};
  $("#search").oninput=e=>{q=e.target.value.trim().toLowerCase();show()};
  show();
}
drawCart();