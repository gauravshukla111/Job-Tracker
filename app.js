const sidebar = document.getElementById('sidebar');
const toggleBtn = document.getElementById('toggleBtn');
const company = document.getElementById('company');
const role = document.getElementById('role');
const status = document.getElementById('status');
const search = document.getElementById('search');
const sortSelect = document.getElementById('sort');

let jobs = JSON.parse(localStorage.getItem('jobs')) || [];
let chart1, chart2;

let filter = "All";
let sortType = "latest";

/* sidebar logic */
toggleBtn.onclick = ()=> sidebar.classList.toggle('collapsed');

/* save data */
function save(){
  
  localStorage.setItem('jobs', JSON.stringify(jobs));
  
}

/* navbar */
function navigate(page){
  document.querySelectorAll('section').forEach(s=>s.classList.remove('active'));

  if(page === 'home'){
    document.getElementById('homeSection').classList.add('active');
    drawCharts();
  }
  if(page === 'tracker'){
    document.getElementById('trackerSection').classList.add('active');
    render();
  }
}
navigate('home');

/* adding data logic */
document.getElementById('addBtn').onclick = ()=>{
  if(!company.value || !role.value) return alert("Fill fields");

  jobs.push({
    id:Date.now(),
    company:company.value,
    role:role.value,
    status:status.value
  });

  save();
  render();

  company.value='';
  role.value='';
};

/* filter button logic */
document.querySelectorAll('.filters button').forEach(btn=>{
  btn.onclick = ()=>{
    filter = btn.getAttribute('data');
    render();
  };
});

/* sort */

sortSelect.onchange = ()=>{
  sortType = sortSelect.value;
  render();
};

/* search data */

search.oninput = render;

/* sort logic */

function sortJobs(arr){
  if(sortType==="latest") return arr.sort((a,b)=>b.id-a.id);
  if(sortType==="oldest") return arr.sort((a,b)=>a.id-b.id);
  if(sortType==="company") return arr.sort((a,b)=>a.company.localeCompare(b.company));
  return arr;
}

/* render data */
function render(){
  document.querySelectorAll('.column').forEach(col=>{
    col.innerHTML = `<h3>${col.dataset.status}</h3>`;
  });

  let filtered = jobs.filter(j=>{
    return (filter==="All" || j.status===filter) &&
           j.company.toLowerCase().includes(search.value.toLowerCase());
  });

  filtered = sortJobs(filtered);

  filtered.forEach(j=>{
    const div = document.createElement('div');
    div.className='job';
    div.draggable=true;

    div.innerHTML=`<b>${j.company}</b><p>${j.role}</p>`;

    div.ondragstart = e=> e.dataTransfer.setData("id", j.id);

    document.querySelector(`.column[data-status="${j.status}"]`).appendChild(div);
  });

  stats();
}

/* drag */
document.querySelectorAll('.column').forEach(col=>{
  col.ondragover = e=>e.preventDefault();

  col.ondrop = e=>{
    const id = e.dataTransfer.getData("id");
    jobs = jobs.map(j=> j.id==id ? {...j,status:col.dataset.status} : j);
    save();
    render();
  };
});

/* stats */
function stats(){
  document.getElementById('total').innerText = jobs.length;
  document.getElementById('offers').innerText = jobs.filter(j=>j.status==="Offer").length;
  document.getElementById('rejected').innerText = jobs.filter(j=>j.status==="Rejected").length;
}

/* theme light/dark */
const themeBtn = document.getElementById('themeToggle');

themeBtn.onclick = ()=>{
  document.body.classList.toggle('light');

  if(document.body.classList.contains('light')){
    themeBtn.innerText = "🌞";
  } else {
    themeBtn.innerText = "🌙";
  }
};

/* convert into csv logic */
document.getElementById('exportCSV').onclick = ()=>{
  let csv = "Company,Role,Status\n";
  jobs.forEach(j=>{
    csv += `${j.company},${j.role},${j.status}\n`;
  });

  const blob = new Blob([csv]);
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = "jobs.csv";
  a.click();
};

/* chart */
function drawCharts(){
  const data = [
    jobs.filter(j=>j.status==="Applied").length,
    jobs.filter(j=>j.status==="Interview").length,
    jobs.filter(j=>j.status==="Offer").length,
    jobs.filter(j=>j.status==="Rejected").length
  ];

  if(chart1) chart1.destroy();
  if(chart2) chart2.destroy();

  chart1 = new Chart(document.getElementById('doughnutChart'),{
    type:'doughnut',
    data:{
      labels:["Applied","Interview","Offer","Rejected"],
      datasets:[{data}]
    },
    options:{responsive:true,maintainAspectRatio:false}
  });

  chart2 = new Chart(document.getElementById('barChart'),{
    type:'bar',
    data:{
      labels:["Applied","Interview","Offer","Rejected"],
      datasets:[{data}]
    },
    options:{responsive:true,maintainAspectRatio:false}
  });
}


render();