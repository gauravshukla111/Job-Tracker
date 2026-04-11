const sidebar = document.getElementById('sidebar');
const toggleBtn = document.getElementById('toggleBtn');

const company = document.getElementById('company');
const role = document.getElementById('role');
const status = document.getElementById('status');

let jobs = JSON.parse(localStorage.getItem('jobs')) || [];
let filter = "All";
let chartInstance = null;

/* SIDEBAR */
toggleBtn.onclick = ()=> sidebar.classList.toggle('collapsed');

/* SAVE */
function save(){
  localStorage.setItem('jobs', JSON.stringify(jobs));
}

/* NAVIGATION */
function navigate(page){
  document.querySelectorAll('section').forEach(s=>s.classList.remove('active'));

  if(page === 'home'){
    document.getElementById('homeSection').classList.add('active');
    drawChart();
  }
  if(page === 'tracker'){
    document.getElementById('trackerSection').classList.add('active');
    render();
  }
}
navigate('home');

/* ADD */
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

/* RENDER */
function render(){
  document.querySelectorAll('.column').forEach(col=>{
    col.innerHTML = `<h3>${col.dataset.data}</h3>`;
  });

  jobs.forEach(j=>{
    if(filter==="All" || j.status===filter){

      const div = document.createElement('div');
      div.className='job';
      div.draggable=true;

      div.innerHTML=`
        <b>${j.company}</b>
        <p>${j.role}</p>
      `;

      div.ondragstart = e=> e.dataTransfer.setData("id", j.id);

      document.querySelector(`.column[data="${j.status}"]`).appendChild(div);
    }
  });

  stats();
}

/* DRAG */
document.querySelectorAll('.column').forEach(col=>{
  col.ondragover = e=>e.preventDefault();

  col.ondrop = e=>{
    const id = e.dataTransfer.getData("id");
    jobs = jobs.map(j=> j.id==id ? {...j,status:col.dataset.data} : j);
    save();
    render();
  };
});

/* STATS */
function stats(){
  document.getElementById('total').innerText = jobs.length;
  document.getElementById('offers').innerText = jobs.filter(j=>j.status==="Offer").length;
  document.getElementById('rejected').innerText = jobs.filter(j=>j.status==="Rejected").length;
}

/* THEME */
document.getElementById('themeToggle').onclick = ()=>{
  document.body.classList.toggle('light');
};

/* CSV */
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

/* CHART FIX (IMPORTANT) */
function drawChart(){
  const ctx = document.getElementById('chart');

  if(chartInstance){
    chartInstance.destroy();
  }

  chartInstance = new Chart(ctx,{
    type:'doughnut',
    data:{
      labels:["Applied","Interview","Offer","Rejected"],
       datasets:[{
        data:[
          jobs.filter(j=>j.status==="Applied").length,
          jobs.filter(j=>j.status==="Interview").length,
          jobs.filter(j=>j.status==="Offer").length,
          jobs.filter(j=>j.status==="Rejected").length
        ]
      }]
    }
  });
}

/* INIT */
render();