import { useState, useEffect, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://fbetqfcvvjzjwyeykwze.supabase.co",
  "sb_publishable_3OZWFGZ6E9cNCfJiZM72Pg_EGemCXou"
);

const ADMIN_PIN = "3146";
const APP_NAME = "Rainbow Hitech Nursery";

const CATEGORIES = [
  "All",
  "🌳 Fruit Trees", "🌸 Flowering Plants", "🌿 Herbs & Medicinal",
  "🌴 Shade Trees", "🪴 Indoor Plants", "🌵 Succulents & Cactus",
  "🎋 Bamboo & Grass", "🧪 Fertilizers", "🪣 Pots & Planters",
  "🛠️ Gardening Tools", "🌱 Seeds & Bulbs", "🪨 Soil & Compost",
  "💧 Irrigation & Sprays", "🎀 Gift Plants", "📦 Other",
];
const UNITS = ["piece","kg","gram","liter","ml","bunch","pot","tray","bag","box","packet","set"];
const TYPES = ["Plant / Tree","Fertilizer","Pot / Planter","Tool","Seed / Bulb","Soil / Compost","Other"];

const getStatus = (s, min = 5) => s === 0 ? "Out of Stock" : s <= min ? "Low Stock" : "In Stock";
const sColor = (s) => s === "In Stock" ? "#4ade80" : s === "Low Stock" ? "#facc15" : "#f87171";
const sBg = (s) => s === "In Stock" ? "#052e16" : s === "Low Stock" ? "#1c1202" : "#1f0202";

export default function App() {
  const [role, setRole] = useState(null);
  const [pin, setPin] = useState("");
  const [pinErr, setPinErr] = useState(false);
  const [view, setView] = useState("dashboard");
  const [items, setItems] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [saleModal, setSaleModal] = useState(null);
  const [saleForm, setSaleForm] = useState({ qty:"", amount:"", note:"", customer:"" });
  const [editItem, setEditItem] = useState(null);
  const [addForm, setAddForm] = useState({ name:"", category:"🌳 Fruit Trees", type:"Plant / Tree", stock:"", price:"", unit:"piece", min_stock:"5", description:"" });
  const [restockModal, setRestockModal] = useState(null);
  const [restockQty, setRestockQty] = useState("");
  const [confirmDel, setConfirmDel] = useState(null);
  const [toast, setToast] = useState("");
  const [salesTab, setSalesTab] = useState("today");
  const [syncing, setSyncing] = useState(false);
  const [dbError, setDbError] = useState(false);

  const flash = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  useEffect(() => {
    if (!role) return;
    setLoading(true);

    supabase.from("inventory").select("*").order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) setDbError(true);
        if (data) setItems(data);
        setLoading(false);
      });

    supabase.from("sales").select("*").order("date", { ascending: false })
      .then(({ data }) => { if (data) setSales(data); });

    const inv = supabase.channel("inv")
      .on("postgres_changes", { event: "*", schema: "public", table: "inventory" }, () => {
        supabase.from("inventory").select("*").order("created_at", { ascending: false })
          .then(({ data }) => { if (data) setItems(data); });
      }).subscribe();

    const sal = supabase.channel("sal")
      .on("postgres_changes", { event: "*", schema: "public", table: "sales" }, () => {
        supabase.from("sales").select("*").order("date", { ascending: false })
          .then(({ data }) => { if (data) setSales(data); });
      }).subscribe();

    return () => { supabase.removeChannel(inv); supabase.removeChannel(sal); };
  }, [role]);

  const handleLogin = (r) => {
    if (r === "staff") { setRole("staff"); return; }
    if (pin === ADMIN_PIN) { setRole("admin"); setPinErr(false); }
    else { setPinErr(true); setPin(""); }
  };

  const handleAdd = async () => {
    if (!addForm.name || !addForm.stock || !addForm.price) { flash("❌ Fill all required fields!"); return; }
    setSyncing(true);
    const stock = parseInt(addForm.stock);
    const { error } = await supabase.from("inventory").insert({
      name: addForm.name, category: addForm.category, type: addForm.type,
      stock, price: parseFloat(addForm.price), unit: addForm.unit,
      min_stock: parseInt(addForm.min_stock) || 5,
      description: addForm.description,
      status: getStatus(stock, parseInt(addForm.min_stock) || 5),
      total_sold: 0, total_revenue: 0
    });
    setSyncing(false);
    if (error) { flash("❌ Error: " + error.message); return; }
    setAddForm({ name:"", category:"🌳 Fruit Trees", type:"Plant / Tree", stock:"", price:"", unit:"piece", min_stock:"5", description:"" });
    flash("✅ Product added & synced to all devices!"); setView("inventory");
  };

  const handleEdit = async () => {
    setSyncing(true);
    const stock = parseInt(editItem.stock);
    const { error } = await supabase.from("inventory").update({
      name: editItem.name, category: editItem.category, type: editItem.type,
      price: parseFloat(editItem.price), stock,
      min_stock: parseInt(editItem.min_stock) || 5,
      description: editItem.description, unit: editItem.unit,
      status: getStatus(stock, parseInt(editItem.min_stock) || 5)
    }).eq("id", editItem.id);
    setSyncing(false);
    if (error) { flash("❌ " + error.message); return; }
    setEditItem(null); flash("✅ Updated on all devices!");
  };

  const handleDelete = async (id) => {
    setSyncing(true);
    await supabase.from("inventory").delete().eq("id", id);
    setSyncing(false);
    setConfirmDel(null); flash("🗑 Removed from inventory.");
  };

  const handleRestock = async () => {
    const qty = parseInt(restockQty);
    if (!qty || qty <= 0) return;
    setSyncing(true);
    const newStock = restockModal.stock + qty;
    await supabase.from("inventory").update({
      stock: newStock, status: getStatus(newStock, restockModal.min_stock || 5)
    }).eq("id", restockModal.id);
    setSyncing(false);
    setRestockModal(null); setRestockQty("");
    flash(`✅ Added ${qty} units to stock!`);
  };

  const handleSale = async () => {
    const qty = parseInt(saleForm.qty);
    const amount = parseFloat(saleForm.amount);
    if (!qty || qty <= 0) { flash("❌ Enter valid quantity!"); return; }
    if (qty > saleModal.stock) { flash(`❌ Only ${saleModal.stock} in stock!`); return; }
    if (!amount || amount <= 0) { flash("❌ Enter amount received!"); return; }
    const unitPrice = parseFloat((amount / qty).toFixed(2));
    const regularTotal = qty * saleModal.price;
    const discount = parseFloat((regularTotal - amount).toFixed(2));
    setSyncing(true);
    const newStock = saleModal.stock - qty;
    const { error } = await supabase.from("sales").insert({
      item_id: saleModal.id, name: saleModal.name, category: saleModal.category,
      qty, amount, unit_price: unitPrice, regular_price: saleModal.price,
      regular_total: regularTotal, discount,
      note: saleForm.note, customer_name: saleForm.customer,
      sold_by: role, unit: saleModal.unit, date: new Date().toISOString()
    });
    if (!error) {
      await supabase.from("inventory").update({
        stock: newStock, status: getStatus(newStock, saleModal.min_stock || 5),
        total_sold: (saleModal.total_sold || 0) + qty,
        total_revenue: (saleModal.total_revenue || 0) + amount
      }).eq("id", saleModal.id);
    }
    setSyncing(false);
    if (error) { flash("❌ " + error.message); return; }
    setSaleModal(null); setSaleForm({ qty:"", amount:"", note:"", customer:"" });
    flash(`✅ Sale saved! ${qty} × ${saleModal.name} = ₹${amount}`);
  };

  const filtered = useMemo(() => items.filter(i =>
    (i.name?.toLowerCase().includes(search.toLowerCase()) || i.description?.toLowerCase().includes(search.toLowerCase())) &&
    (filterCat === "All" || i.category === filterCat)
  ), [items, search, filterCat]);

  const today = new Date().toDateString();
  const todaySales = sales.filter(s => new Date(s.date).toDateString() === today);
  const totalRev = sales.reduce((a, b) => a + (b.amount || 0), 0);
  const todayRev = todaySales.reduce((a, b) => a + (b.amount || 0), 0);
  const totalDisc = sales.reduce((a, b) => a + (b.discount || 0), 0);
  const totalVal = items.reduce((a, b) => a + (b.stock || 0) * (b.price || 0), 0);
  const lowItems = items.filter(i => i.status !== "In Stock");
  const displaySales = salesTab === "today" ? todaySales : sales;

  const st = {
    page: { minHeight:"100vh", background:"#040c04", color:"#e8f5e9", fontFamily:"'Georgia',serif" },
    header: { background:"linear-gradient(135deg,#061506,#040c04)", borderBottom:"1px solid #163d16", padding:"12px 14px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:50 },
    card: { background:"#081408", border:"1px solid #163d16", borderRadius:14, padding:14 },
    inp: { width:"100%", background:"#040c04", border:"1px solid #245224", borderRadius:10, color:"#e8f5e9", fontFamily:"inherit", fontSize:14, padding:"10px 12px", outline:"none" },
    sel: { width:"100%", background:"#040c04", border:"1px solid #245224", borderRadius:10, color:"#e8f5e9", fontFamily:"inherit", fontSize:14, padding:"10px 12px", outline:"none" },
    lbl: { fontSize:10, color:"#4ade80", fontWeight:700, display:"block", marginBottom:5, letterSpacing:1, textTransform:"uppercase", fontFamily:"'DM Sans',sans-serif" },
    btn: (bg,bc,col) => ({ background:bg, border:`1px solid ${bc}`, borderRadius:9, color:col, fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:600, padding:"9px 14px", cursor:"pointer" }),
    ovr: { position:"fixed", inset:0, background:"rgba(0,0,0,0.9)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:12, overflowY:"auto" },
    tag: (col) => ({ background:`${col}18`, color:col, border:`1px solid ${col}40`, borderRadius:20, padding:"2px 9px", fontSize:10, fontFamily:"'DM Sans',sans-serif", fontWeight:600, display:"inline-block" }),
  };

  // LOGIN SCREEN
  if (!role) return (
    <div style={{ ...st.page, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');*{box-sizing:border-box;}input:focus,select:focus{border-color:#4ade80!important;}button{transition:all 0.15s;}button:active{transform:scale(0.97);}`}</style>
      <div style={{ width:"100%", maxWidth:360, textAlign:"center" }}>
        <div style={{ fontSize:56, marginBottom:8 }}>🌿</div>
        <div style={{ fontSize:22, fontWeight:800, color:"#4ade80", lineHeight:1.2 }}>{APP_NAME}</div>
        <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:"#3d7a3d", marginBottom:28 }}>Nursery & Garden Store Manager</div>
        <button onClick={() => handleLogin("staff")} style={{ ...st.btn("#061506","#245224","#a3d9a3"), width:"100%", padding:16, fontSize:15, marginBottom:10, borderRadius:14, textAlign:"left", display:"flex", alignItems:"center", gap:12 }}>
          <span style={{ fontSize:30 }}>👨‍💼</span>
          <div><div style={{ fontWeight:700 }}>Staff Login</div><div style={{ fontSize:11, color:"#3d7a3d", fontWeight:400 }}>View stock & record sales only</div></div>
        </button>
        <div style={st.card}>
          <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10, color:"#4ade80", fontWeight:700, marginBottom:10, letterSpacing:1 }}>🔐 ADMIN LOGIN</div>
          <input type="password" placeholder="Enter PIN" value={pin}
            onChange={e => { setPin(e.target.value); setPinErr(false); }}
            onKeyDown={e => e.key === "Enter" && handleLogin("admin")}
            style={{ ...st.inp, fontSize:24, textAlign:"center", letterSpacing:12, marginBottom:8 }} />
          {pinErr && <div style={{ color:"#f87171", fontSize:12, marginBottom:8, fontFamily:"'DM Sans',sans-serif" }}>❌ Wrong PIN! Try again.</div>}
          <button onClick={() => handleLogin("admin")} style={{ ...st.btn("#14532d","#4ade80","#4ade80"), width:"100%", padding:12 }}>🔓 Unlock Admin Access</button>
        </div>
      </div>
    </div>
  );

  const navItems = [
    { key:"dashboard", icon:"🏠", label:"Home" },
    { key:"inventory", icon:"🌳", label:"Stock" },
    ...(role === "admin" ? [{ key:"add", icon:"➕", label:"Add" }] : []),
    { key:"sales", icon:"💵", label:"Sales" },
    ...(role === "admin" ? [{ key:"reports", icon:"📊", label:"Report" }] : []),
  ];

  return (
    <div style={st.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        input,select,textarea{outline:none;} input:focus,select:focus,textarea:focus{border-color:#4ade80!important;}
        button{transition:all 0.15s;cursor:pointer;} button:active{transform:scale(0.97);}
        ::-webkit-scrollbar{width:4px;} ::-webkit-scrollbar-thumb{background:#245224;border-radius:3px;}
      `}</style>

      {toast && <div style={{ position:"fixed", top:14, left:"50%", transform:"translateX(-50%)", zIndex:9999, background:"#0a2010", border:"1px solid #4ade80", borderRadius:10, padding:"10px 18px", color:"#bbf7d0", fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:600, whiteSpace:"nowrap", boxShadow:"0 4px 20px rgba(74,222,128,0.2)" }}>{toast}</div>}
      {syncing && <div style={{ position:"fixed", bottom:80, right:12, zIndex:200, background:"#0a1a2e", border:"1px solid #60a5fa", borderRadius:8, padding:"5px 11px", color:"#60a5fa", fontFamily:"'DM Sans',sans-serif", fontSize:11 }}>🔄 Syncing...</div>}

      {/* Header */}
      <div style={st.header}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:20 }}>🌱</span>
          <div>
            <div style={{ fontSize:13, fontWeight:800, color:"#4ade80" }}>{APP_NAME}</div>
            <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:9, color:"#3d7a3d" }}>
              {role === "admin" ? "👑 Admin" : "👨‍💼 Staff"} · 🟢 Live Sync ON
            </div>
          </div>
        </div>
        <div style={{ display:"flex", gap:6, alignItems:"center" }}>
          {lowItems.length > 0 && <span style={st.tag("#facc15")}>⚠️ {lowItems.length} low</span>}
          <button onClick={() => { setRole(null); setPin(""); }} style={{ ...st.btn("#1a0808","#5a1a1a","#f87171"), fontSize:11, padding:"5px 10px" }}>Logout</button>
        </div>
      </div>

      <div style={{ padding:"14px 12px 88px", maxWidth:680, margin:"0 auto" }}>

        {/* DASHBOARD */}
        {view === "dashboard" && (
          <div>
            <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:"#3d7a3d", marginBottom:2 }}>
              {new Date().toLocaleDateString("en-IN",{ weekday:"long", day:"numeric", month:"long", year:"numeric" })}
            </div>
            <div style={{ fontSize:18, fontWeight:700, color:"#bbf7d0", marginBottom:12 }}>
              {new Date().getHours() < 12 ? "Good Morning" : "Good Afternoon"} {role === "admin" ? "👑" : "👨‍💼"}
            </div>

            <div style={{ ...st.card, marginBottom:10, background:"linear-gradient(135deg,#0a2010,#081408)", borderColor:"#245224" }}>
              <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:9, color:"#4ade80", fontWeight:700, letterSpacing:1, marginBottom:8 }}>📅 TODAY'S SUMMARY</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
                <div><div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:9, color:"#3d7a3d" }}>Revenue</div><div style={{ fontSize:20, fontWeight:800, color:"#4ade80" }}>₹{todayRev.toLocaleString()}</div></div>
                <div><div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:9, color:"#3d7a3d" }}>Transactions</div><div style={{ fontSize:20, fontWeight:800, color:"#60a5fa" }}>{todaySales.length}</div></div>
                <div><div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:9, color:"#3d7a3d" }}>Units Sold</div><div style={{ fontSize:20, fontWeight:800, color:"#fbbf24" }}>{todaySales.reduce((a,b)=>a+b.qty,0)}</div></div>
              </div>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
              {[
                { l:"Total Products", v:items.length, i:"🌱", col:"#4ade80" },
                { l:"Total Stock", v:items.reduce((a,b)=>a+(b.stock||0),0).toLocaleString(), i:"📦", col:"#60a5fa" },
                { l:"Stock Value", v:`₹${(totalVal/1000).toFixed(1)}k`, i:"💰", col:"#fbbf24" },
                { l:"All Time Revenue", v:`₹${(totalRev/1000).toFixed(1)}k`, i:"📈", col:"#a78bfa" },
              ].map((x,i) => (
                <div key={i} style={{ ...st.card, display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ fontSize:22 }}>{x.i}</div>
                  <div>
                    <div style={{ fontSize:18, fontWeight:800, color:x.col }}>{x.v}</div>
                    <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10, color:"#3d7a3d" }}>{x.l}</div>
                  </div>
                </div>
              ))}
            </div>

            {lowItems.length > 0 && (
              <div style={{ ...st.card, borderColor:"#7f3500", marginBottom:10 }}>
                <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:9, color:"#facc15", fontWeight:700, letterSpacing:1, marginBottom:8 }}>⚠️ NEEDS RESTOCKING ({lowItems.length} items)</div>
                {lowItems.map(i => (
                  <div key={i.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"7px 0", borderBottom:"1px solid #163d16" }}>
                    <div>
                      <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:600, color:"#e8f5e9" }}>{i.name}</div>
                      <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10, color:"#3d7a3d" }}>{i.category}</div>
                    </div>
                    <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                      <span style={st.tag(sColor(i.status))}>{i.stock} left</span>
                      {role === "admin" && (
                        <button onClick={() => { setRestockModal(i); setRestockQty(""); }}
                          style={{ ...st.btn("#0a2010","#245224","#4ade80"), fontSize:11, padding:"4px 9px" }}>+ Stock</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {todaySales.length > 0 && (
              <div style={st.card}>
                <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:9, color:"#4ade80", fontWeight:700, letterSpacing:1, marginBottom:8 }}>🕐 RECENT SALES TODAY</div>
                {todaySales.slice(0, 5).map(s2 => (
                  <div key={s2.id} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:"1px solid #163d16" }}>
                    <div>
                      <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:600, color:"#e8f5e9" }}>{s2.name}</div>
                      <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10, color:"#3d7a3d" }}>
                        {s2.qty} {s2.unit} · {s2.customer_name || "Walk-in"} · {s2.sold_by === "admin" ? "👑" : "👨‍💼"}
                      </div>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontFamily:"'DM Sans',sans-serif", fontWeight:700, color:"#fbbf24" }}>₹{s2.amount}</div>
                      {s2.discount > 0 && <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10, color:"#f87171" }}>-₹{s2.discount} off</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {dbError && (
              <div style={{ ...st.card, borderColor:"#7f1d1d", marginTop:10 }}>
                <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:"#f87171" }}>
                  ⚠️ Database connection issue. Check your internet connection.
                </div>
              </div>
            )}
          </div>
        )}

        {/* INVENTORY */}
        {view === "inventory" && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
              <div style={{ fontSize:18, fontWeight:700, color:"#bbf7d0" }}>🌳 Stock Inventory</div>
              {role === "admin" && <button onClick={() => setView("add")} style={st.btn("#14532d","#4ade80","#4ade80")}>+ Add New</button>}
            </div>
            <div style={{ display:"flex", gap:8, marginBottom:10, flexWrap:"wrap" }}>
              <input placeholder="🔍 Search products..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...st.inp, flex:1, minWidth:130 }} />
              <select value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{ ...st.sel, width:"auto", maxWidth:170 }}>
                {CATEGORIES.map(x => <option key={x}>{x}</option>)}
              </select>
            </div>
            <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10, color:"#3d7a3d", marginBottom:8 }}>
              {filtered.length} products · {loading ? "Loading..." : "Live ✅"}
            </div>
            {loading ? (
              <div style={{ textAlign:"center", padding:50, color:"#3d7a3d", fontFamily:"'DM Sans',sans-serif" }}>🌿 Loading...</div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {filtered.map(item => (
                  <div key={item.id} style={{ ...st.card, borderLeft:`3px solid ${sColor(item.status)}` }}>
                    <div style={{ marginBottom:8 }}>
                      <div style={{ fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:15, color:"#e8f5e9" }}>{item.name}</div>
                      <div style={{ display:"flex", gap:5, marginTop:4, flexWrap:"wrap" }}>
                        <span style={st.tag("#60a5fa")}>{item.category}</span>
                        <span style={st.tag("#a78bfa")}>{item.type}</span>
                        <span style={{ ...st.tag(sColor(item.status)), background:sBg(item.status) }}>{item.status}</span>
                      </div>
                      {item.description && <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:"#3d7a3d", marginTop:4 }}>{item.description}</div>}
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:6, marginBottom:10 }}>
                      {[
                        { l:"Stock", v:`${item.stock} ${item.unit}s`, col:sColor(item.status) },
                        { l:"MRP", v:`₹${item.price}`, col:"#fbbf24" },
                        { l:"Value", v:`₹${((item.stock||0)*(item.price||0)).toLocaleString()}`, col:"#60a5fa" },
                        { l:"Total Sold", v:`${item.total_sold||0}`, col:"#a78bfa" },
                      ].map((d,i) => (
                        <div key={i}>
                          <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:9, color:"#3d7a3d", textTransform:"uppercase" }}>{d.l}</div>
                          <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:700, color:d.col }}>{d.v}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                      <button onClick={() => { setSaleModal(item); setSaleForm({ qty:"", amount:"", note:"", customer:"" }); }}
                        style={{ ...st.btn("#052e16","#166534","#4ade80"), flex:1 }}>💵 Record Sale</button>
                      {role === "admin" && <>
                        <button onClick={() => { setRestockModal(item); setRestockQty(""); }} style={st.btn("#0a1a2e","#1e3a6e","#60a5fa")}>📦</button>
                        <button onClick={() => setEditItem({ ...item })} style={st.btn("#1a0a2e","#3d1e6e","#a78bfa")}>✏️</button>
                        <button onClick={() => setConfirmDel(item)} style={st.btn("#1f0202","#7f1d1d","#f87171")}>🗑</button>
                      </>}
                    </div>
                  </div>
                ))}
                {filtered.length === 0 && (
                  <div style={{ textAlign:"center", padding:40, color:"#3d7a3d", fontFamily:"'DM Sans',sans-serif" }}>No products found 🌾</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ADD NEW */}
        {view === "add" && role === "admin" && (
          <div>
            <div style={{ fontSize:18, fontWeight:700, color:"#bbf7d0", marginBottom:14 }}>➕ Add New Product</div>
            <div style={{ ...st.card, display:"flex", flexDirection:"column", gap:12 }}>
              {[
                { l:"Product Name *", k:"name", t:"text", p:"e.g. Mango Tree / NPK Fertilizer" },
                { l:"MRP / Price per Unit (₹) *", k:"price", t:"number", p:"e.g. 500" },
                { l:"Stock Quantity *", k:"stock", t:"number", p:"e.g. 100" },
                { l:"Low Stock Alert at (qty)", k:"min_stock", t:"number", p:"e.g. 5" },
              ].map(f => (
                <div key={f.k}>
                  <label style={st.lbl}>{f.l}</label>
                  <input type={f.t} placeholder={f.p} value={addForm[f.k]}
                    onChange={e => setAddForm(p => ({ ...p, [f.k]: e.target.value }))} style={st.inp} />
                </div>
              ))}
              {[
                { l:"Category", k:"category", opts:CATEGORIES.filter(x => x !== "All") },
                { l:"Product Type", k:"type", opts:TYPES },
                { l:"Unit of Measurement", k:"unit", opts:UNITS },
              ].map(f => (
                <div key={f.k}>
                  <label style={st.lbl}>{f.l}</label>
                  <select value={addForm[f.k]} onChange={e => setAddForm(p => ({ ...p, [f.k]: e.target.value }))} style={st.sel}>
                    {f.opts.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              ))}
              <div>
                <label style={st.lbl}>Description (optional)</label>
                <textarea value={addForm.description}
                  onChange={e => setAddForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Variety, size, special notes..." rows={2}
                  style={{ ...st.inp, resize:"vertical" }} />
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={handleAdd} style={{ ...st.btn("#14532d","#4ade80","#4ade80"), flex:1, padding:13, fontSize:15 }}>✅ Add to Inventory</button>
                <button onClick={() => setView("inventory")} style={st.btn("#1a1a1a","#245224","#3d7a3d")}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* SALES LOG */}
        {view === "sales" && (
          <div>
            <div style={{ fontSize:18, fontWeight:700, color:"#bbf7d0", marginBottom:12 }}>💵 Sales Log</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:12 }}>
              {[
                { l:"Today", v:`₹${todayRev.toLocaleString()}`, s:`${todaySales.length} sales`, col:"#4ade80" },
                { l:"All Time", v:`₹${totalRev.toLocaleString()}`, s:`${sales.length} sales`, col:"#fbbf24" },
                { l:"Discounts", v:`₹${totalDisc.toLocaleString()}`, s:"given off", col:"#f87171" },
              ].map((x,i) => (
                <div key={i} style={st.card}>
                  <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:9, color:"#3d7a3d", textTransform:"uppercase" }}>{x.l}</div>
                  <div style={{ fontSize:16, fontWeight:800, color:x.col }}>{x.v}</div>
                  <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:9, color:"#3d7a3d" }}>{x.s}</div>
                </div>
              ))}
            </div>
            <div style={{ display:"flex", gap:8, marginBottom:12 }}>
              {["today","all"].map(t => (
                <button key={t} onClick={() => setSalesTab(t)}
                  style={{ ...st.btn(salesTab===t?"#14532d":"#081408", salesTab===t?"#4ade80":"#245224", salesTab===t?"#4ade80":"#3d7a3d"), flex:1 }}>
                  {t === "today" ? "📅 Today" : "📋 All Sales"}
                </button>
              ))}
            </div>
            {displaySales.length === 0
              ? <div style={{ ...st.card, textAlign:"center", color:"#3d7a3d", fontFamily:"'DM Sans',sans-serif", padding:36 }}>No sales recorded yet</div>
              : <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {displaySales.map(s2 => (
                  <div key={s2.id} style={st.card}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                      <div style={{ fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:14, color:"#e8f5e9" }}>{s2.name}</div>
                      <div style={{ fontFamily:"'DM Sans',sans-serif", fontWeight:800, fontSize:16, color:"#4ade80" }}>₹{s2.amount}</div>
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:5, marginBottom:6 }}>
                      <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:"#3d7a3d" }}>📦 Qty: <span style={{ color:"#e8f5e9", fontWeight:600 }}>{s2.qty} {s2.unit}s</span></div>
                      <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:"#3d7a3d" }}>💲 Rate: <span style={{ color:"#fbbf24", fontWeight:600 }}>₹{s2.unit_price}/{s2.unit}</span></div>
                      <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:"#3d7a3d" }}>🏷️ MRP: <span style={{ color:"#e8f5e9" }}>₹{s2.regular_total}</span></div>
                      {s2.discount > 0 && <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:"#f87171" }}>🎟️ Disc: -₹{s2.discount}</div>}
                    </div>
                    <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                      {s2.customer_name && <span style={st.tag("#60a5fa")}>👤 {s2.customer_name}</span>}
                      <span style={st.tag(s2.sold_by==="admin"?"#fbbf24":"#a78bfa")}>{s2.sold_by==="admin"?"👑 Admin":"👨‍💼 Staff"}</span>
                      <span style={st.tag("#3d7a3d")}>🕐 {new Date(s2.date).toLocaleString("en-IN",{hour:"2-digit",minute:"2-digit",day:"numeric",month:"short"})}</span>
                    </div>
                    {s2.note && <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:"#3d7a3d", marginTop:5, fontStyle:"italic" }}>📝 {s2.note}</div>}
                  </div>
                ))}
              </div>}
          </div>
        )}

        {/* REPORTS */}
        {view === "reports" && role === "admin" && (
          <div>
            <div style={{ fontSize:18, fontWeight:700, color:"#bbf7d0", marginBottom:14 }}>📊 Business Reports</div>
            <div style={{ ...st.card, marginBottom:10 }}>
              <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:9, color:"#4ade80", fontWeight:700, letterSpacing:1, marginBottom:10 }}>🏆 TOP SELLING PRODUCTS</div>
              {[...items].sort((a,b)=>(b.total_sold||0)-(a.total_sold||0)).slice(0,5).map((item,idx) => (
                <div key={item.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"7px 0", borderBottom:"1px solid #163d16" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:16, fontWeight:800, color:["#fbbf24","#9ca3af","#c97c3a","#4ade80","#4ade80"][idx] }}>#{idx+1}</div>
                    <div>
                      <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:600, color:"#e8f5e9" }}>{item.name}</div>
                      <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10, color:"#3d7a3d" }}>{item.category}</div>
                    </div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontFamily:"'DM Sans',sans-serif", fontWeight:700, color:"#4ade80" }}>{item.total_sold||0} sold</div>
                    <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10, color:"#fbbf24" }}>₹{(item.total_revenue||0).toLocaleString()}</div>
                  </div>
                </div>
              ))}
              {items.length === 0 && <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:"#3d7a3d" }}>No products yet</div>}
            </div>

            <div style={{ ...st.card, marginBottom:10 }}>
              <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:9, color:"#4ade80", fontWeight:700, letterSpacing:1, marginBottom:10 }}>👥 SALES BY ROLE</div>
              {["admin","staff"].map(r => {
                const rS = sales.filter(s => s.sold_by === r);
                const rR = rS.reduce((a,b) => a + b.amount, 0);
                return (
                  <div key={r} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid #163d16" }}>
                    <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:"#e8f5e9" }}>{r==="admin"?"👑 Admin":"👨‍💼 Staff"}</div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontFamily:"'DM Sans',sans-serif", fontWeight:700, color:"#4ade80" }}>₹{rR.toLocaleString()}</div>
                      <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10, color:"#3d7a3d" }}>{rS.length} transactions</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={st.card}>
              <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:9, color:"#4ade80", fontWeight:700, letterSpacing:1, marginBottom:10 }}>📂 STOCK BY CATEGORY</div>
              {CATEGORIES.filter(x => x !== "All").map(cat => {
                const ci = items.filter(i => i.category === cat);
                if (!ci.length) return null;
                return (
                  <div key={cat} style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom:"1px solid #163d16" }}>
                    <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:"#e8f5e9" }}>{cat}</div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:"#60a5fa" }}>{ci.reduce((a,b)=>a+b.stock,0)} units</div>
                      <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10, color:"#fbbf24" }}>₹{ci.reduce((a,b)=>a+(b.stock*b.price),0).toLocaleString()}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <div style={{ position:"fixed", bottom:0, left:0, right:0, background:"#040c04", borderTop:"1px solid #163d16", display:"flex", justifyContent:"space-around", padding:"6px 0 8px", zIndex:50 }}>
        {navItems.map(n => (
          <button key={n.key} onClick={() => setView(n.key)} style={{ background:view===n.key?"#0f2e0f":"transparent", border:view===n.key?"1px solid #245224":"1px solid transparent", borderRadius:10, padding:"6px 10px", color:view===n.key?"#4ade80":"#3d7a3d", display:"flex", flexDirection:"column", alignItems:"center", gap:2, fontFamily:"'DM Sans',sans-serif", fontSize:9, fontWeight:600, minWidth:48 }}>
            <span style={{ fontSize:18 }}>{n.icon}</span>{n.label}
          </button>
        ))}
      </div>

      {/* SALE MODAL */}
      {saleModal && (
        <div style={st.ovr}>
          <div style={{ ...st.card, width:"100%", maxWidth:400, maxHeight:"92vh", overflowY:"auto" }}>
            <div style={{ fontSize:16, fontWeight:700, color:"#bbf7d0", marginBottom:4 }}>💵 Record Sale</div>
            <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:"#3d7a3d", marginBottom:4 }}>
              {saleModal.name} · MRP: <span style={{ color:"#fbbf24" }}>₹{saleModal.price}/{saleModal.unit}</span>
            </div>
            <span style={{ ...st.tag(sColor(saleModal.status)), marginBottom:14 }}>{saleModal.stock} {saleModal.unit}s in stock</span>
            <div style={{ display:"flex", flexDirection:"column", gap:12, marginTop:10 }}>
              <div>
                <label style={st.lbl}>Quantity Sold * ({saleModal.unit}s)</label>
                <input type="number" min="1" max={saleModal.stock} placeholder={`Max: ${saleModal.stock}`}
                  value={saleForm.qty} onChange={e => setSaleForm(p => ({ ...p, qty:e.target.value }))} style={{ ...st.inp, fontSize:20 }} />
              </div>
              <div>
                <label style={st.lbl}>Total Amount Received (₹) *</label>
                <input type="number" placeholder="Actual amount customer paid"
                  value={saleForm.amount} onChange={e => setSaleForm(p => ({ ...p, amount:e.target.value }))} style={{ ...st.inp, fontSize:20 }} />
                <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10, color:"#3d7a3d", marginTop:3 }}>Can be less than MRP if discount given</div>
              </div>

              {saleForm.qty && saleForm.amount && parseInt(saleForm.qty) > 0 && parseFloat(saleForm.amount) > 0 && (
                <div style={{ background:"#0a2010", border:"1px solid #245224", borderRadius:10, padding:12 }}>
                  <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:9, color:"#4ade80", fontWeight:700, letterSpacing:1, marginBottom:8 }}>📊 SALE SUMMARY</div>
                  {[
                    { l:"Quantity", v:`${saleForm.qty} ${saleModal.unit}s` },
                    { l:"MRP Total", v:`₹${(parseInt(saleForm.qty)*saleModal.price).toLocaleString()}` },
                    { l:"Amount Charged", v:`₹${parseFloat(saleForm.amount).toLocaleString()}`, col:"#4ade80" },
                    { l:"Rate per unit", v:`₹${(parseFloat(saleForm.amount)/parseInt(saleForm.qty)).toFixed(2)}`, col:"#fbbf24" },
                    ...(parseInt(saleForm.qty)*saleModal.price - parseFloat(saleForm.amount) > 0
                      ? [{ l:"Discount Given", v:`₹${(parseInt(saleForm.qty)*saleModal.price - parseFloat(saleForm.amount)).toFixed(2)}`, col:"#f87171" }] : []),
                  ].map((r,i) => (
                    <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"3px 0" }}>
                      <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:"#3d7a3d" }}>{r.l}</span>
                      <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:700, color:r.col||"#e8f5e9" }}>{r.v}</span>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label style={st.lbl}>Customer Name (optional)</label>
                <input type="text" placeholder="e.g. Ramesh Kumar / Walk-in"
                  value={saleForm.customer} onChange={e => setSaleForm(p => ({ ...p, customer:e.target.value }))} style={st.inp} />
              </div>
              <div>
                <label style={st.lbl}>Note / Remark (optional)</label>
                <input type="text" placeholder="e.g. Bulk order, special discount..."
                  value={saleForm.note} onChange={e => setSaleForm(p => ({ ...p, note:e.target.value }))} style={st.inp} />
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={handleSale} style={{ ...st.btn("#14532d","#4ade80","#4ade80"), flex:1, padding:13, fontSize:14 }}>✅ Confirm Sale</button>
                <button onClick={() => setSaleModal(null)} style={st.btn("#1a1a1a","#245224","#3d7a3d")}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editItem && (
        <div style={st.ovr}>
          <div style={{ ...st.card, width:"100%", maxWidth:380, maxHeight:"92vh", overflowY:"auto" }}>
            <div style={{ fontSize:16, fontWeight:700, color:"#bbf7d0", marginBottom:14 }}>✏️ Edit Product</div>
            {[{l:"Name",k:"name",t:"text"},{l:"Price/MRP (₹)",k:"price",t:"number"},{l:"Stock Qty",k:"stock",t:"number"},{l:"Low Stock Alert",k:"min_stock",t:"number"}].map(f => (
              <div key={f.k} style={{ marginBottom:10 }}>
                <label style={st.lbl}>{f.l}</label>
                <input type={f.t} value={editItem[f.k]||""} onChange={e => setEditItem(p => ({ ...p, [f.k]:e.target.value }))} style={st.inp} />
              </div>
            ))}
            {[{l:"Category",k:"category",opts:CATEGORIES.filter(x=>x!=="All")},{l:"Type",k:"type",opts:TYPES},{l:"Unit",k:"unit",opts:UNITS}].map(f => (
              <div key={f.k} style={{ marginBottom:10 }}>
                <label style={st.lbl}>{f.l}</label>
                <select value={editItem[f.k]||""} onChange={e => setEditItem(p => ({ ...p, [f.k]:e.target.value }))} style={st.sel}>
                  {f.opts.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
            <div style={{ marginBottom:14 }}>
              <label style={st.lbl}>Description</label>
              <textarea value={editItem.description||""} onChange={e => setEditItem(p => ({ ...p, description:e.target.value }))} rows={2} style={{ ...st.inp, resize:"vertical" }} />
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={handleEdit} style={{ ...st.btn("#14532d","#4ade80","#4ade80"), flex:1 }}>✅ Save Changes</button>
              <button onClick={() => setEditItem(null)} style={st.btn("#1a1a1a","#245224","#3d7a3d")}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* RESTOCK MODAL */}
      {restockModal && (
        <div style={st.ovr}>
          <div style={{ ...st.card, width:"100%", maxWidth:340 }}>
            <div style={{ fontSize:16, fontWeight:700, color:"#bbf7d0", marginBottom:6 }}>📦 Add Stock</div>
            <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:"#3d7a3d", marginBottom:14 }}>
              {restockModal.name} · Current stock: <span style={{ color:"#4ade80" }}>{restockModal.stock} {restockModal.unit}s</span>
            </div>
            <label style={st.lbl}>Quantity to Add</label>
            <input type="number" min="1" placeholder="e.g. 50" value={restockQty}
              onChange={e => setRestockQty(e.target.value)}
              style={{ ...st.inp, fontSize:22, marginBottom:10 }} />
            {restockQty && parseInt(restockQty) > 0 && (
              <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:"#4ade80", marginBottom:14 }}>
                New total will be: <strong>{restockModal.stock + parseInt(restockQty)} {restockModal.unit}s</strong>
              </div>
            )}
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={handleRestock} style={{ ...st.btn("#14532d","#4ade80","#4ade80"), flex:1 }}>✅ Add to Stock</button>
              <button onClick={() => setRestockModal(null)} style={st.btn("#1a1a1a","#245224","#3d7a3d")}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {confirmDel && (
        <div style={st.ovr}>
          <div style={{ ...st.card, width:"100%", maxWidth:320, textAlign:"center" }}>
            <div style={{ fontSize:36, marginBottom:8 }}>⚠️</div>
            <div style={{ fontSize:15, fontWeight:700, color:"#f87171", marginBottom:6 }}>Delete Product?</div>
            <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:"#3d7a3d", marginBottom:18 }}>
              Remove <strong style={{ color:"#e8f5e9" }}>{confirmDel.name}</strong> from inventory permanently?
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={() => handleDelete(confirmDel.id)} style={{ ...st.btn("#1f0202","#7f1d1d","#f87171"), flex:1 }}>Yes, Delete</button>
              <button onClick={() => setConfirmDel(null)} style={{ ...st.btn("#081408","#245224","#3d7a3d"), flex:1 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
