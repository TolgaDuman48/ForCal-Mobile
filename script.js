const supabaseUrl =
  "https://cmdbhaepecnwpohrhrpm.supabase.co";

const supabaseKey =
  "sb_publishable_sa-LoFmpE84BZL3gYnxJFg_8Vwje970";

const supabaseClient =
  window.supabase.createClient(
    supabaseUrl,
    supabaseKey
  );

const hotels = [
  { id:"pera", name:"The Marmara Pera", rooms:205 },
  { id:"camlica", name:"The Marmara Çamlıca", rooms:87 },
  { id:"suadiye", name:"The Marmara Suadiye", rooms:32 }
];

const months = [
  "Ocak","Şubat","Mart","Nisan","Mayıs","Haziran",
  "Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"
];

const now = new Date();
const currentMonth = now.getMonth();
const currentYear = now.getFullYear();

const state = {
  hotel:"pera",
  month:currentMonth,

  mtdOcc:85.96,
  mtdAdr:114.28,

  romOcc:58.05,
  romAdr:114.24,

  ooo:62,

  targetOcc:85,
  targetAdr:115
};

const app = document.getElementById("app");

function monthDays(month){
  return new Date(currentYear, month + 1, 0).getDate();
}

function mtdDays(month){
  if(month === currentMonth){
    return Math.max(now.getDate() - 1, 0);
  }

  if(month > currentMonth){
    return 0;
  }

  return monthDays(month);
}

function money(v){
  if(!isFinite(v)) return "-";

  return "€" + Number(v).toLocaleString(
    "tr-TR",
    {
      minimumFractionDigits:2,
      maximumFractionDigits:2
    }
  );
}

function num(v){
  if(!isFinite(v)) return "-";
  return Math.round(v).toLocaleString("tr-TR");
}

function pct(v){
  if(!isFinite(v)) return "-";
  return v.toFixed(2) + "%";
}

function parseInputValue(value){
  return Number(
    String(value)
      .replace(",", ".")
  );
}

function calc(){

  const hotel =
    hotels.find(h => h.id === state.hotel);

  const mdays =
    monthDays(state.month);

  const mtd =
    mtdDays(state.month);

  const remaining =
    mdays - mtd;

  const grossInventory =
    hotel.rooms * mdays;

  const monthlyOoo =
    Number(state.ooo || 0);

  const dailyOoo =
    mdays > 0
      ? monthlyOoo / mdays
      : 0;

  const mtdOoo =
    dailyOoo * mtd;

  const romOoo =
    dailyOoo * remaining;

  const netInventory =
    grossInventory - monthlyOoo;

  const mtdCap =
    (hotel.rooms * mtd) - mtdOoo;

  const romCap =
    (hotel.rooms * remaining) - romOoo;

  const mtdSold =
    mtdCap * Number(state.mtdOcc) / 100;

  const mtdRevenue =
    mtdSold * Number(state.mtdAdr);

  const romRn =
    romCap * Number(state.romOcc) / 100;

  const romRevenue =
    romRn * Number(state.romAdr);

  const sellableRemainingRn =
    romCap - romRn;

  const targetRn =
    netInventory * Number(state.targetOcc) / 100;

  const targetRevenue =
    targetRn * Number(state.targetAdr);

  const requiredRn =
    targetRn - mtdSold;

  const requiredRevenue =
    targetRevenue - mtdRevenue;

  const requiredAdr =
    requiredRn > 0
      ? requiredRevenue / requiredRn
      : 0;

  const requiredOcc =
    romCap > 0
      ? requiredRn / romCap * 100
      : 0;

  let pickupRn =
    requiredRn - romRn;

  let pickupRevenue =
    requiredRevenue - romRevenue;

  let pickupAdr =
    pickupRn > 0
      ? pickupRevenue / pickupRn
      : 0;

  let pickupPerDay =
    remaining > 0
      ? pickupRn / remaining
      : 0;

  const otbRn =
    mtdSold + romRn;

  const otbRevenue =
    mtdRevenue + romRevenue;

  const otbOcc =
    netInventory > 0
      ? otbRn / netInventory * 100
      : 0;

  const otbAdr =
    otbRn > 0
      ? otbRevenue / otbRn
      : 0;

  const achieved =
    pickupRn <= 0;

  const impossible =
    pickupRn > sellableRemainingRn ||
    requiredOcc > 100;

  if(achieved){
    pickupRn = 0;
    pickupRevenue = 0;
    pickupAdr = 0;
    pickupPerDay = 0;
  }

  return {
    hotel,
    mdays,
    mtd,
    remaining,

    grossInventory,
    monthlyOoo,
    netInventory,

    mtdCap,
    romCap,

    targetRn,
    targetRevenue,

    requiredRn,
    requiredAdr,
    requiredOcc,

    pickupRn,
    pickupAdr,
    pickupPerDay,
    pickupRevenue,

    romRn,
    romRevenue,
    sellableRemainingRn,

    otbOcc,
    otbAdr,
    otbRevenue,

    achieved,
    impossible
  };
}

function render(){

  const c = calc();

  app.innerHTML = `
  
    <div class="title">
      ForCal
    </div>

    <div class="subtitle">
      Revenue Forecast Tool
    </div>

    <div class="card">

      <div class="grid-2">

        <div class="input-group">
          <div class="label">Hotel</div>

          <select onchange="update('hotel', this.value)">

            ${hotels.map(h => `
              <option
                value="${h.id}"
                ${state.hotel === h.id ? "selected" : ""}
              >
                ${h.name}
              </option>
            `).join("")}

          </select>
        </div>

        <div class="input-group">
          <div class="label">Month</div>

          <select onchange="update('month', Number(this.value))">

            ${months.map((m,i) => `
              <option
                value="${i}"
                ${state.month === i ? "selected" : ""}
              >
                ${m}
              </option>
            `).join("")}

          </select>
        </div>

      </div>

    </div>

    <div class="grid-2">

      <div class="kpi-card">
        <div class="kpi-title">Status</div>

        <div class="status ${
          c.achieved
            ? "success"
            : c.impossible
            ? "warning"
            : ""
        }">

          ${
            c.achieved
              ? "Achieved"
              : c.impossible
              ? "Impossible"
              : "On Track"
          }

        </div>
      </div>

      <div class="kpi-card">
        <div class="kpi-title">Pickup RN</div>
        <div class="kpi-value">
          ${c.achieved ? "0" : c.impossible ? "-" : num(c.pickupRn)}
        </div>
      </div>     

      <div class="kpi-card">
        <div class="kpi-title">Pickup ADR</div>
        <div class="kpi-value">
          ${c.achieved ? "0" : c.impossible ? "-" : money(c.pickupAdr)}
        </div>
      </div>

      <div class="kpi-card">
        <div class="kpi-title">Pickup / Day</div>
        <div class="kpi-value">
          ${c.achieved ? "0" : c.impossible ? "-" : c.pickupPerDay.toFixed(1)}
        </div>
      </div>

    </div>

    <div class="card">

      <div class="section-title">
        Inputs
      </div>

      ${input("MTD OCC %","mtdOcc",state.mtdOcc)}
      ${input("MTD ADR","mtdAdr",state.mtdAdr)}

      ${input("ROM OCC %","romOcc",state.romOcc)}
      ${input("ROM ADR","romAdr",state.romAdr)}

      ${input("Monthly OOO RN","ooo",state.ooo)}

      ${input("Target OCC %","targetOcc",state.targetOcc)}
      ${input("Target ADR","targetAdr",state.targetAdr)}

    </div>

    <div class="card">

      <div class="section-title">
        Results
      </div>

      <div class="result-list">

        ${result("OTB OCC", pct(c.otbOcc))}
        ${result("OTB ADR", money(c.otbAdr))}
        ${result("OTB Revenue", money(c.otbRevenue))}

        ${result("Required ROM RN", num(c.requiredRn))}
        ${result("Required ROM ADR", money(c.requiredAdr))}
        ${result("Required ROM OCC", pct(c.requiredOcc))}

        ${result("ROM RN", num(c.romRn))}
        ${result("ROM Revenue", money(c.romRevenue))}
        ${result("Sellable Remaining RN", num(c.sellableRemainingRn))}

        ${result("Pickup Needed RN", c.achieved ? "0" : c.impossible ? "-" : num(c.pickupRn))}
        ${result("Pickup ADR Needed", c.achieved ? "0" : c.impossible ? "-" : money(c.pickupAdr))}
        ${result("Pickup Revenue Needed", c.achieved ? "0" : c.impossible ? "-" : money(c.pickupRevenue))}

        ${result("Gross Inventory", num(c.grossInventory))}
        ${result("Monthly OOO RN", num(c.monthlyOoo))}
        ${result("Net Inventory", num(c.netInventory))}

        ${result("Estimated RN", num(c.targetRn))}
        ${result("Estimated ADR", money(state.targetAdr))}
        ${result("Estimated Revenue", money(c.targetRevenue))}

      </div>
            <div class="footer-credit">
  Copyright Tolga Duman<span class="tm">c</span> 2026
</div>

    </div>
  
  `;
}

function input(label, field, value){

  return `
    <div class="input-group">

      <div class="label">
        ${label}
      </div>

      <input
        type="text"
        inputmode="decimal"
        pattern="[0-9]*[.,]?[0-9]*"
        value="${value}"
        data-field="${field}"
        onchange="handleMobileChange(this, '${field}')"
      >

    </div>
  `;
}

function result(label, value){

  return `
  
    <div class="result-item">

      <div class="result-label">
        ${label}
      </div>

      <div class="result-value">
        ${value}
      </div>

    </div>
  
  `;
}

async function saveToCloud() {
  const payload = {
    hotel_id: state.hotel,
    month_index: state.month,
    mtd_occ: state.mtdOcc,
    mtd_adr: state.mtdAdr,
    rom_occ: state.romOcc,
    rom_adr: state.romAdr,
    ooo_rn: state.ooo,
    target_occ: state.targetOcc,
    target_adr: state.targetAdr,
    updated_at: new Date().toISOString()
  };

  const { error } = await supabaseClient
    .from("forecast_inputs")
    .upsert(payload, {
      onConflict: "hotel_id,month_index"
    });

  if (error) {
    console.error("Save error:", error);
  }
}

async function loadFromCloud() {
  const { data, error } = await supabaseClient
    .from("forecast_inputs")
    .select("*")
    .eq("hotel_id", state.hotel)
    .eq("month_index", state.month)
    .maybeSingle();

  if (error) {
    console.error("Load error:", error);
    return;
  }

  if (data) {
    state.mtdOcc = Number(data.mtd_occ);
    state.mtdAdr = Number(data.mtd_adr);
    state.romOcc = Number(data.rom_occ);
    state.romAdr = Number(data.rom_adr);
    state.ooo = Number(data.ooo_rn);
    state.targetOcc = Number(data.target_occ);
    state.targetAdr = Number(data.target_adr);
  }

  render();
}

async function update(field, value){

  state[field] = value;

  render();

  if(field === "hotel" || field === "month"){
    await loadFromCloud();
  } else {
    await saveToCloud();
  }
}

function handleMobileNext(event, el, field){

  if(event.key === "Enter"){

    event.preventDefault();

    update(
      field,
      parseInputValue(el.value)
    );

    const inputs =
      Array.from(
        document.querySelectorAll("input")
      );

    const currentIndex =
      inputs.indexOf(el);

    const nextInput =
      inputs[currentIndex + 1];

    if(nextInput){

      setTimeout(() => {

        nextInput.focus();
        nextInput.select();

      }, 150);
    }
  }
}

function handleMobileChange(el, field){

  update(
    field,
    parseInputValue(el.value)
  );

  const inputs =
    Array.from(document.querySelectorAll("input"));

  const currentIndex =
    inputs.indexOf(el);

  const nextInput =
    inputs[currentIndex + 1];

  if(nextInput){
    setTimeout(() => {
      nextInput.focus();
      nextInput.select();
    }, 250);
  }
  
  
}
render();
loadFromCloud();
