let slides=document.querySelectorAll('.slide');
let current=0;
function showSlide(i){ slides[current].classList.remove('active'); current=(i+slides.length)%slides.length; slides[current].classList.add('active'); }
document.querySelector('.next').onclick=()=>showSlide(current+1);
document.querySelector('.prev').onclick=()=>showSlide(current-1);
setInterval(()=>showSlide(current+1),5000);
