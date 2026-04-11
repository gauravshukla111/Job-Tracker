const sidebar = document.getElementById('sidebar');
const toggleBtn = document.getElementById('toggleBtn');

const company = document.getElementById('company');
const role = document.getElementById('role');
const status = document.getElementById('status');

let jobs = JSON.parse(localStorage.getItem('jobs')) || [];
let chart1, chart2;

toggleBtn.onclick = ()=> sidebar.classList.toggle('collapsed');

function save(){
  localStorage.setItem('jobs', JSON.stringify(jobs));
}

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

function render(){
  document.querySelectorAll('.column').forEach(col=>{
    col.innerHTML = `<h3>${col.dataset.status}</h3>`;
  });

  jobs.forEach(j=>{
    const div = document.createElement('div');
    div.className='job';
    div.draggable=true;

    div.innerHTML=`<b>${j.company}</b><p>${j.role}</p>`;

    div.ondragstart = e=> e.dataTransfer.setData("id", j.id);

    document.querySelector(`.column[data-status="${j.status}"]`).appendChild(div);
  });

  stats();
}

document.querySelectorAll('.column').forEach(col=>{
  col.ondragover = e=>e.preventDefault();

  col.ondrop = e=>{
    const id = e.dataTransfer.getData("id");
    jobs = jobs.map(j=> j.id==id ? {...j,status:col.dataset.status} : j);
    save();
    render();
  };
});

function stats(){
  document.getElementById('total').innerText = jobs.length;
  document.getElementById('offers').innerText = jobs.filter(j=>j.status==="Offer").length;
  document.getElementById('rejected').innerText = jobs.filter(j=>j.status==="Rejected").length;
}

document.getElementById('themeToggle').onclick = ()=>{
  document.body.classList.toggle('light');
};

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

/* 🔥 FINAL CHART FIX */
function drawCharts(){
  const data = [
    jobs.filter(j=>j.status==="Applied").length,
    jobs.filter(j=>j.status==="Interview").length,
    jobs.filter(j=>j.status==="Offer").length,
    jobs.filter(j=>j.status==="Rejected").length
  ];

  if(chart1) chart1.destroy();
  if(chart2) chart2.destroy();

  const ctx = document.getElementById('barChart').getContext('2d');
  const gradient = ctx.createLinearGradient(0,0,0,300);
  gradient.addColorStop(0,"#6366f1");
  gradient.addColorStop(1,"#22c55e");

  chart1 = new Chart(document.getElementById('doughnutChart'),{
    type:'doughnut',
    data:{
      labels:["Applied","Interview","Offer","Rejected"],
      datasets:[{
        data:data,
        backgroundColor:["#6366f1","#22c55e","#f59e0b","#ef4444"],
        borderWidth:0
      }]
    },
    options:{
      responsive:true,
      maintainAspectRatio:false,
      cutout:"65%"
    }
  });

  chart2 = new Chart(document.getElementById('barChart'),{
    type:'bar',
    data:{
      labels:["Applied","Interview","Offer","Rejected"],
      datasets:[{
        data:data,
        backgroundColor:gradient,
        borderRadius:8
      }]
    },
    options:{
      responsive:true,
      maintainAspectRatio:false
    }
  });
}

render();