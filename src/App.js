import { useState, useEffect, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

const ADMIN_PIN = process.env.REACT_APP_ADMIN_PIN || "3146";
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

// Full price list from PDF
const PRICE_LIST = [
  // Fruit Plants
  { name: "Nimbu (Lemon) — Large", category: "🌳 Fruit Trees", price: 450, salePrice: 420 },
  { name: "Nimbu (Lemon) — Medium", category: "🌳 Fruit Trees", price: 250, salePrice: 220 },
  { name: "Nimbu (Lemon) — Small", category: "🌳 Fruit Trees", price: 150, salePrice: 130 },
  { name: "China Nimbu (China Lemon)", category: "🌳 Fruit Trees", price: 150, salePrice: 130 },
  { name: "Thailand Mango", category: "🌳 Fruit Trees", price: 1200, salePrice: 800 },
  { name: "Apple", category: "🌳 Fruit Trees", price: 350, salePrice: 320 },
  { name: "Naspati (Pear)", category: "🌳 Fruit Trees", price: 350, salePrice: 320 },
  { name: "Jamun (Kg-10 size)", category: "🌳 Fruit Trees", price: 350, salePrice: 320 },
  { name: "Jamun Hybrid", category: "🌳 Fruit Trees", price: 250, salePrice: 220 },
  { name: "Narial Bada (Coconut — large)", category: "🌳 Fruit Trees", price: 450, salePrice: 400 },
  { name: "Narial Chota (Coconut — small)", category: "🌳 Fruit Trees", price: 250, salePrice: 220 },
  { name: "Lichi (Lychee)", category: "🌳 Fruit Trees", price: 250, salePrice: 220 },
  { name: "Chiku (Sapota)", category: "🌳 Fruit Trees", price: 250, salePrice: 220 },
  { name: "Bada Chiku (Sapota — large)", category: "🌳 Fruit Trees", price: 500, salePrice: 450 },
  { name: "Bair / Ber — Lala & Hara", category: "🌳 Fruit Trees", price: 250, salePrice: 220 },
  { name: "Awala (Amla)", category: "🌳 Fruit Trees", price: 250, salePrice: 220 },
  { name: "Anar (Pomegranate)", category: "🌳 Fruit Trees", price: 250, salePrice: 200 },
  { name: "Santra (Orange)", category: "🌳 Fruit Trees", price: 250, salePrice: 220 },
  { name: "Mosami (Sweet Lime)", category: "🌳 Fruit Trees", price: 250, salePrice: 220 },
  { name: "Sarifa (Custard Apple)", category: "🌳 Fruit Trees", price: 250, salePrice: 200 },
  { name: "Dragon Fruit", category: "🌳 Fruit Trees", price: 150, salePrice: 120 },
  { name: "Sahatut (Mulberry)", category: "🌳 Fruit Trees", price: 200, salePrice: 150 },
  { name: "Kaju (Cashew)", category: "🌳 Fruit Trees", price: 250, salePrice: 220 },
  { name: "Faisa / Falsha (Falsa)", category: "🌳 Fruit Trees", price: 250, salePrice: 220 },
  { name: "Gulab Jamun (fruit plant)", category: "🌳 Fruit Trees", price: 250, salePrice: 220 },
  { name: "Kathal (Jackfruit)", category: "🌳 Fruit Trees", price: 250, salePrice: 220 },
  { name: "Anjir (Fig)", category: "🌳 Fruit Trees", price: 250, salePrice: 220 },
  { name: "Grapes", category: "🌳 Fruit Trees", price: 200, salePrice: 150 },
  { name: "Avocado", category: "🌳 Fruit Trees", price: 800, salePrice: 600 },
  { name: "Bara-Masa Mango (all-season)", category: "🌳 Fruit Trees", price: 250, salePrice: 200 },
  { name: "Guava — Size 1", category: "🌳 Fruit Trees", price: 250, salePrice: 220 },
  { name: "Guava — Size 2", category: "🌳 Fruit Trees", price: 200, salePrice: 180 },
  { name: "Guava — Size 3", category: "🌳 Fruit Trees", price: 150, salePrice: 120 },
  { name: "Kela (Banana)", category: "🌳 Fruit Trees", price: 80, salePrice: 60 },
  { name: "Supadi (Areca / Betel Nut)", category: "🌳 Fruit Trees", price: 150, salePrice: 120 },
  { name: "Pista Badam (Pistachio Almond)", category: "🌳 Fruit Trees", price: 120, salePrice: 80 },
  // Spice & Herb
  { name: "Tej Pata (Bay Leaf)", category: "🌿 Herbs & Medicinal", price: 100, salePrice: 70 },
  { name: "Garam Masala Plant", category: "🌿 Herbs & Medicinal", price: 200, salePrice: 150 },
  { name: "Golki", category: "🌿 Herbs & Medicinal", price: 150, salePrice: 130 },
  { name: "Dalchini (Cinnamon)", category: "🌿 Herbs & Medicinal", price: 200, salePrice: 150 },
  { name: "Asoka (Ashoka)", category: "🌿 Herbs & Medicinal", price: 100, salePrice: 80 },
  { name: "Bell Hybrid", category: "🌿 Herbs & Medicinal", price: 250, salePrice: 220 },
  { name: "Bell Desi", category: "🌿 Herbs & Medicinal", price: 30, salePrice: 30 },
  { name: "Neem", category: "🌿 Herbs & Medicinal", price: 30, salePrice: 30 },
  { name: "Kadi Pata (Curry Leaf)", category: "🌿 Herbs & Medicinal", price: 30, salePrice: 30 },
  { name: "Chatni Patta", category: "🌿 Herbs & Medicinal", price: 60, salePrice: 60 },
  { name: "Lal Chandan (Red Sandalwood)", category: "🌿 Herbs & Medicinal", price: 200, salePrice: 150 },
  // Timber
  { name: "Sagwan (Teak) — Size 1", category: "🌴 Shade Trees", price: 30, salePrice: 25 },
  { name: "Sagwan (Teak) — Size 2", category: "🌴 Shade Trees", price: 60, salePrice: 50 },
  { name: "Sagwan (Teak) — Size 3", category: "🌴 Shade Trees", price: 80, salePrice: 80 },
  { name: "Mahogni (Mahogany) — Size 1", category: "🌴 Shade Trees", price: 80, salePrice: 60 },
  { name: "Mahogni (Mahogany) — Size 2", category: "🌴 Shade Trees", price: 30, salePrice: 25 },
  { name: "Malasion-Sall", category: "🌴 Shade Trees", price: 30, salePrice: 30 },
  { name: "Kadam", category: "🌴 Shade Trees", price: 80, salePrice: 60 },
  // Indoor
  { name: "Cactus", category: "🌵 Succulents & Cactus", price: 450, salePrice: 350 },
  { name: "Diffenbachia", category: "🪴 Indoor Plants", price: 150, salePrice: 130 },
  { name: "Lal Aglonima (Red Aglaonema)", category: "🪴 Indoor Plants", price: 150, salePrice: 130 },
  { name: "Hara Aglonima (Green Aglaonema)", category: "🪴 Indoor Plants", price: 150, salePrice: 120 },
  { name: "Copy Aglonima", category: "🪴 Indoor Plants", price: 100, salePrice: 80 },
  { name: "Red Musenda (Mussaenda)", category: "🌸 Flowering Plants", price: 200, salePrice: 150 },
  { name: "Pink / White Musenda", category: "🌸 Flowering Plants", price: 150, salePrice: 130 },
  { name: "White Ficus", category: "🪴 Indoor Plants", price: 130, salePrice: 90 },
  { name: "Son of India", category: "🪴 Indoor Plants", price: 80, salePrice: 60 },
  { name: "Proton Bengoiri (Bengal Croton)", category: "🪴 Indoor Plants", price: 140, salePrice: 100 },
  { name: "Desi Croton", category: "🪴 Indoor Plants", price: 100, salePrice: 60 },
  { name: "Rongan", category: "🪴 Indoor Plants", price: 100, salePrice: 80 },
  { name: "Belli", category: "🪴 Indoor Plants", price: 80, salePrice: 60 },
  { name: "Moli", category: "🪴 Indoor Plants", price: 80, salePrice: 60 },
  { name: "Dresina (Dracaena)", category: "🪴 Indoor Plants", price: 120, salePrice: 80 },
  { name: "Rubber Plant", category: "🪴 Indoor Plants", price: 150, salePrice: 120 },
  { name: "Mor Pank (Peacock Feather Plant)", category: "🪴 Indoor Plants", price: 130, salePrice: 90 },
  { name: "Bada Mor", category: "🪴 Indoor Plants", price: 350, salePrice: 300 },
  { name: "Jade Plant (Chota)", category: "🌵 Succulents & Cactus", price: 80, salePrice: 60 },
  { name: "Jade Plant (Bada)", category: "🌵 Succulents & Cactus", price: 150, salePrice: 130 },
  { name: "Oxygen Plant", category: "🪴 Indoor Plants", price: 150, salePrice: 130 },
  { name: "Safelara", category: "🪴 Indoor Plants", price: 120, salePrice: 100 },
  { name: "Snake Plant", category: "🪴 Indoor Plants", price: 120, salePrice: 100 },
  { name: "Spider Plant", category: "🪴 Indoor Plants", price: 80, salePrice: 60 },
  { name: "Lucky Bamboo (potted)", category: "🎋 Bamboo & Grass", price: 40, salePrice: 40 },
  // Palms
  { name: "Ariko Palm (Areca Palm)", category: "🪴 Indoor Plants", price: 140, salePrice: 120 },
  { name: "Lal Ariko Palm (Lipstick Palm)", category: "🪴 Indoor Plants", price: 450, salePrice: 400 },
  { name: "China Palm", category: "🪴 Indoor Plants", price: 150, salePrice: 120 },
  { name: "Fonix Palm (Phoenix Palm)", category: "🪴 Indoor Plants", price: 150, salePrice: 130 },
  { name: "Nolina Palm", category: "🪴 Indoor Plants", price: 150, salePrice: 130 },
  { name: "Fostel Palm (Chota)", category: "🪴 Indoor Plants", price: 120, salePrice: 100 },
  { name: "Fostel Palm (Bada)", category: "🪴 Indoor Plants", price: 800, salePrice: 600 },
  { name: "Bottle Palm (Chota)", category: "🪴 Indoor Plants", price: 200, salePrice: 150 },
  { name: "Bottle Palm (Bada)", category: "🪴 Indoor Plants", price: 800, salePrice: 600 },
  { name: "Golden Jhaw (Golden Juniper)", category: "🪴 Indoor Plants", price: 150, salePrice: 130 },
  { name: "Table Kamini", category: "🌸 Flowering Plants", price: 150, salePrice: 130 },
  { name: "Crismas (Christmas Plant)", category: "🎀 Gift Plants", price: 150, salePrice: 120 },
  { name: "Ticoma (Tecoma)", category: "🌸 Flowering Plants", price: 130, salePrice: 80 },
  // Flowering
  { name: "Mendivilla (Mandevilla)", category: "🌸 Flowering Plants", price: 150, salePrice: 120 },
  { name: "Gargo Jamuna", category: "🌸 Flowering Plants", price: 120, salePrice: 80 },
  { name: "Mini Alaminda", category: "🌸 Flowering Plants", price: 120, salePrice: 80 },
  { name: "Bada Alaminda", category: "🌸 Flowering Plants", price: 120, salePrice: 100 },
  { name: "Tagger (Tagar)", category: "🌸 Flowering Plants", price: 120, salePrice: 80 },
  { name: "Double Tagger", category: "🌸 Flowering Plants", price: 150, salePrice: 120 },
  { name: "Mini Tagger", category: "🌸 Flowering Plants", price: 120, salePrice: 80 },
  { name: "Canal (Canna)", category: "🌸 Flowering Plants", price: 60, salePrice: 40 },
  { name: "Rakhi Bell", category: "🌸 Flowering Plants", price: 120, salePrice: 100 },
  { name: "Raat Rani (Night Jasmine)", category: "🌸 Flowering Plants", price: 120, salePrice: 80 },
  { name: "Grandraj Phool (Gardenia)", category: "🌸 Flowering Plants", price: 150, salePrice: 120 },
  { name: "Rajnigandha (Tuberose)", category: "🌸 Flowering Plants", price: 80, salePrice: 60 },
  { name: "Rain Lilli (Rain Lily)", category: "🌸 Flowering Plants", price: 50, salePrice: 40 },
  { name: "Kamini (Chota)", category: "🌸 Flowering Plants", price: 100, salePrice: 80 },
  { name: "Kamini (Bada)", category: "🌸 Flowering Plants", price: 200, salePrice: 150 },
  { name: "First Love", category: "🌸 Flowering Plants", price: 120, salePrice: 100 },
  { name: "Ulhud Hybrid (Jowa)", category: "🌸 Flowering Plants", price: 130, salePrice: 110 },
  { name: "Ulhud Desi", category: "🌸 Flowering Plants", price: 120, salePrice: 80 },
  { name: "Bleeding Heart", category: "🌸 Flowering Plants", price: 100, salePrice: 80 },
  { name: "Harsingar (Hybrid)", category: "🌸 Flowering Plants", price: 150, salePrice: 120 },
  { name: "Harsingar (Desi)", category: "🌸 Flowering Plants", price: 80, salePrice: 60 },
  { name: "Aprajita (Butterfly Pea)", category: "🌸 Flowering Plants", price: 60, salePrice: 30 },
  { name: "Tipu China (China Rose)", category: "🌸 Flowering Plants", price: 120, salePrice: 80 },
  { name: "Aloevera", category: "🌿 Herbs & Medicinal", price: 30, salePrice: 30 },
  { name: "Sami", category: "🌸 Flowering Plants", price: 40, salePrice: 40 },
  // Climbers
  { name: "Madhumalti — Lat (climbing)", category: "🌸 Flowering Plants", price: 120, salePrice: 100 },
  { name: "Madhumalti — Jhadi (bush)", category: "🌸 Flowering Plants", price: 120, salePrice: 100 },
  { name: "Money Plant — White / Red", category: "🪴 Indoor Plants", price: 60, salePrice: 60 },
  { name: "Money Plant — Green", category: "🪴 Indoor Plants", price: 50, salePrice: 50 },
  { name: "Hanging Basket Plant", category: "🎀 Gift Plants", price: 450, salePrice: 300 },
  // Pots & accessories
  { name: "(POT) Arelio Ball Golden", category: "🪣 Pots & Planters", price: 150, salePrice: 130 },
  { name: "(POT) Paccket Arelio Ball Golden", category: "🪣 Pots & Planters", price: 120, salePrice: 80 },
  { name: "Mitti Gamla (Clay Pot)", category: "🪣 Pots & Planters", price: 220, salePrice: 220 },
  { name: "Deepak Gamla — No. 16", category: "🪣 Pots & Planters", price: 320, salePrice: 300 },
  { name: "Deepak Gamla — No. 18", category: "🪣 Pots & Planters", price: 350, salePrice: 320 },
  { name: "Kachva Khad (Compost / Manure)", category: "🪨 Soil & Compost", price: 250, salePrice: 250 },
];

const getStatus = (s, min = 5) => s === 0 ? "Out of Stock" : s <= min ? "Low Stock" : "In Stock";
const sColor = (s) => s === "In Stock" ? "#4ade80" : s === "Low Stock" ? "#facc15" : "#f87171";
const sBg = (s) => s === "In Stock" ? "#052e16" : s === "Low Stock" ? "#1c1202" : "#1f0202";

// UPI QR generator using QR code API
function generateUPIQR(upiId, name, amount, note) {
  const upiString = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(name)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note || "Plant Purchase")}`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiString)}`;
}

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
  const [saleForm, setSaleForm] = useState({ qty: "", amount: "", note: "", customer: "" });
  const [editItem, setEditItem] = useState(null);
  const [addForm, setAddForm] = useState({ name: "", category: "🌳 Fruit Trees", type: "Plant / Tree", stock: "", price: "", unit: "piece", min_stock: "5", description: "", track_stock: true });
  const [restockModal, setRestockModal] = useState(null);
  const [restockQty, setRestockQty] = useState("");
  const [confirmDel, setConfirmDel] = useState(null);
  const [confirmDelSale, setConfirmDelSale] = useState(null);
  const [toast, setToast] = useState("");
  const [salesTab, setSalesTab] = useState("today");
  const [syncing, setSyncing] = useState(false);
  const [dbError, setDbError] = useState(false);

  // UPI / Billing states
  const [settings, setSettings] = useState({ upiId: "", ownerName: "Rainbow Hitech Nursery", ownerPhone: "" });
  const [showSettings, setShowSettings] = useState(false);
  const [settingsForm, setSettingsForm] = useState({ upiId: "", ownerName: "", ownerPhone: "" });

  // Quick Bill (QR) states
  const [billView, setBillView] = useState("list"); // list | build | qr
  const [billSearch, setBillSearch] = useState("");
  const [billItems, setBillItems] = useState([]); // [{name, price, qty, amount}]
  const [billCustomer, setBillCustomer] = useState({ name: "", phone: "" });
  const [qrAmount, setQrAmount] = useState("");
  const [qrNote, setQrNote] = useState("");
  const [showQR, setShowQR] = useState(false);
  const [addPriceListModal, setAddPriceListModal] = useState(null); // product from price list
  const [addCustomProductModal, setAddCustomProductModal] = useState(false);
  const [customProduct, setCustomProduct] = useState({ name: "", price: "", qty: "1" });
  const [modalQty, setModalQty] = useState(1);
  const [modalPrice, setModalPrice] = useState(0);

  // Reset modal quantity/price whenever a new price-list item is opened
  useEffect(() => {
    if (addPriceListModal) {
      setModalQty(1);
      setModalPrice(addPriceListModal.salePrice || addPriceListModal.price);
    }
  }, [addPriceListModal]);

  const flash = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  // Load settings from localStorage
  useEffect(() => {
    try {
      const s = localStorage.getItem("rhn_settings");
      if (s) { const p = JSON.parse(s); setSettings(p); setSettingsForm(p); }
    } catch (e) {}
  }, []);

  const saveSettings = () => {
    setSettings(settingsForm);
    localStorage.setItem("rhn_settings", JSON.stringify(settingsForm));
    setShowSettings(false);
    flash("✅ Settings saved!");
  };

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
    if (!addForm.name || !addForm.price) { flash("❌ Fill name and price!"); return; }
    if (addForm.track_stock && !addForm.stock) { flash("❌ Enter stock quantity!"); return; }
    setSyncing(true);
    const stock = addForm.track_stock ? parseInt(addForm.stock) : null;
    const { error } = await supabase.from("inventory").insert({
      name: addForm.name, category: addForm.category, type: addForm.type,
      stock, price: parseFloat(addForm.price), unit: addForm.unit,
      min_stock: parseInt(addForm.min_stock) || 5,
      description: addForm.description,
      track_stock: addForm.track_stock,
      status: addForm.track_stock ? getStatus(stock, parseInt(addForm.min_stock) || 5) : "In Stock",
      total_sold: 0, total_revenue: 0
    });
    setSyncing(false);
    if (error) { flash("❌ Error: " + error.message); return; }
    setAddForm({ name: "", category: "🌳 Fruit Trees", type: "Plant / Tree", stock: "", price: "", unit: "piece", min_stock: "5", description: "", track_stock: true });
    flash("✅ Product added!"); setView("inventory");
  };

  const handleEdit = async () => {
    setSyncing(true);
    const stock = editItem.track_stock ? parseInt(editItem.stock) : null;
    const { error } = await supabase.from("inventory").update({
      name: editItem.name, category: editItem.category, type: editItem.type,
      price: parseFloat(editItem.price), stock,
      min_stock: parseInt(editItem.min_stock) || 5,
      description: editItem.description, unit: editItem.unit,
      track_stock: editItem.track_stock,
      status: editItem.track_stock ? getStatus(stock, parseInt(editItem.min_stock) || 5) : "In Stock"
    }).eq("id", editItem.id);
    setSyncing(false);
    if (error) { flash("❌ " + error.message); return; }
    setEditItem(null); flash("✅ Updated!");
  };

  const handleDelete = async (id) => {
    setSyncing(true);
    await supabase.from("inventory").delete().eq("id", id);
    setSyncing(false);
    setConfirmDel(null); flash("🗑 Removed.");
  };

  const handleRestock = async () => {
    const qty = parseInt(restockQty);
    if (!qty || qty <= 0) return;
    setSyncing(true);
    const newStock = (restockModal.stock || 0) + qty;
    await supabase.from("inventory").update({
      stock: newStock, status: getStatus(newStock, restockModal.min_stock || 5),
      track_stock: true
    }).eq("id", restockModal.id);
    setSyncing(false);
    setRestockModal(null); setRestockQty("");
    flash(`✅ Added ${qty} units!`);
  };

  const handleSale = async () => {
    const qty = parseInt(saleForm.qty);
    const amount = parseFloat(saleForm.amount);
    if (!qty || qty <= 0) { flash("❌ Enter valid quantity!"); return; }
    if (saleModal.track_stock && qty > saleModal.stock) { flash(`❌ Only ${saleModal.stock} in stock!`); return; }
    if (!amount || amount <= 0) { flash("❌ Enter amount received!"); return; }
    const unitPrice = parseFloat((amount / qty).toFixed(2));
    const regularTotal = qty * saleModal.price;
    const discount = parseFloat((regularTotal - amount).toFixed(2));
    setSyncing(true);
    const { error } = await supabase.from("sales").insert({
      item_id: saleModal.id, name: saleModal.name, qty, unit: saleModal.unit,
      amount, unit_price: unitPrice, regular_total: regularTotal,
      discount: Math.max(0, discount), note: saleForm.note,
      customer_name: saleForm.customer, sold_by: role, date: new Date().toISOString(),
    });
    if (!error && saleModal.track_stock) {
      const newStock = saleModal.stock - qty;
      await supabase.from("inventory").update({
        stock: newStock, status: getStatus(newStock, saleModal.min_stock || 5),
        total_sold: (saleModal.total_sold || 0) + qty,
        total_revenue: (saleModal.total_revenue || 0) + amount
      }).eq("id", saleModal.id);
    } else if (!error) {
      await supabase.from("inventory").update({
        total_sold: (saleModal.total_sold || 0) + qty,
        total_revenue: (saleModal.total_revenue || 0) + amount
      }).eq("id", saleModal.id);
    }
    setSyncing(false);
    if (error) { flash("❌ " + error.message); return; }
    setSaleModal(null); setSaleForm({ qty: "", amount: "", note: "", customer: "" });
    flash(`✅ Sale saved! ${qty} × ${saleModal.name} = ₹${amount}`);
  };

  const handleDeleteSale = async (sale) => {
    setSyncing(true);
    const item = items.find(i => i.id === sale.item_id);
    if (item && item.track_stock) {
      const restoredStock = item.stock + sale.qty;
      await supabase.from("inventory").update({
        stock: restoredStock,
        status: getStatus(restoredStock, item.min_stock || 5),
        total_sold: Math.max(0, (item.total_sold || 0) - sale.qty),
        total_revenue: Math.max(0, (item.total_revenue || 0) - sale.amount),
      }).eq("id", item.id);
    }
    await supabase.from("sales").delete().eq("id", sale.id);
    setSyncing(false);
    setConfirmDelSale(null);
    flash("🗑 Sale deleted & stock restored!");
  };

  // Bill builder helpers
  const billTotal = billItems.reduce((a, b) => a + b.amount, 0);

  const addToBill = (product, qty, price) => {
    const amount = parseFloat((qty * price).toFixed(2));
    setBillItems(prev => {
      const existing = prev.findIndex(x => x.name === product.name);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { ...updated[existing], qty: updated[existing].qty + qty, amount: updated[existing].amount + amount };
        return updated;
      }
      return [...prev, { name: product.name, price, qty, amount }];
    });
    setAddPriceListModal(null);
    flash(`✅ Added ${product.name}`);
  };

  const updateBillItem = (idx, field, val) => {
    setBillItems(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: val };
      if (field === "qty" || field === "price") {
        updated[idx].amount = parseFloat(((updated[idx].qty || 0) * (updated[idx].price || 0)).toFixed(2));
      }
      if (field === "amount") {
        updated[idx].amount = parseFloat(val) || 0;
      }
      return updated;
    });
  };

  const removeBillItem = (idx) => {
    setBillItems(prev => prev.filter((_, i) => i !== idx));
  };

  const buildBillText = (paymentMethod = "upi") => {
    const lines = [
      `🌿 *${settings.ownerName || APP_NAME}*`,
      `📅 ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`,
      billCustomer.name ? `👤 Customer: ${billCustomer.name}` : "",
      billCustomer.phone ? `📞 ${billCustomer.phone}` : "",
      `─────────────────`,
      ...billItems.map(i => `• ${i.name} × ${i.qty} = ₹${i.amount}`),
      `─────────────────`,
      `💰 *Total: ₹${parseFloat(qrAmount || billTotal).toLocaleString()}*`,
      qrNote ? `📝 ${qrNote}` : "",
      ``,
      paymentMethod === "cash" ? `✅ Payment via Cash` : `✅ Payment via UPI`,
      paymentMethod === "upi" && settings.upiId ? `UPI: ${settings.upiId}` : "",
    ].filter(Boolean).join("\n");
    return lines;
  };

  const openWhatsApp = (paymentMethod = "upi") => {
    const text = buildBillText(paymentMethod);
    const phone = settings.ownerPhone ? settings.ownerPhone.replace(/\D/g, "") : "";
    const url = phone
      ? `https://wa.me/91${phone}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const openCustomerWhatsApp = (paymentMethod = "upi") => {
    if (!billCustomer.phone) { flash("❌ Enter customer phone first!"); return; }
    const text = buildBillText(paymentMethod);
    const phone = billCustomer.phone.replace(/\D/g, "");
    window.open(`https://wa.me/91${phone}?text=${encodeURIComponent(text)}`, "_blank");
  };

  const filtered = useMemo(() => items.filter(i =>
    (i.name?.toLowerCase().includes(search.toLowerCase()) || i.description?.toLowerCase().includes(search.toLowerCase())) &&
    (filterCat === "All" || i.category === filterCat)
  ), [items, search, filterCat]);

  const filteredPriceList = useMemo(() =>
    PRICE_LIST.filter(p => p.name.toLowerCase().includes(billSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(billSearch.toLowerCase()))
  , [billSearch]);

  const today = new Date().toDateString();
  const todaySales = sales.filter(s => new Date(s.date).toDateString() === today);
  const totalRev = sales.reduce((a, b) => a + (b.amount || 0), 0);
  const todayRev = todaySales.reduce((a, b) => a + (b.amount || 0), 0);
  const totalDisc = sales.reduce((a, b) => a + (b.discount || 0), 0);
  const totalVal = items.filter(i => i.track_stock).reduce((a, b) => a + (b.stock || 0) * (b.price || 0), 0);
  const lowItems = items.filter(i => i.track_stock && i.status !== "In Stock");
  const displaySales = salesTab === "today" ? todaySales : sales;

  const st = {
    page: { minHeight: "100vh", background: "#040c04", color: "#e8f5e9", fontFamily: "'Georgia',serif" },
    header: { background: "linear-gradient(135deg,#061506,#040c04)", borderBottom: "1px solid #163d16", padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 },
    card: { background: "#081408", border: "1px solid #163d16", borderRadius: 14, padding: 14 },
    inp: { width: "100%", background: "#040c04", border: "1px solid #245224", borderRadius: 10, color: "#e8f5e9", fontFamily: "inherit", fontSize: 14, padding: "10px 12px", outline: "none" },
    sel: { width: "100%", background: "#040c04", border: "1px solid #245224", borderRadius: 10, color: "#e8f5e9", fontFamily: "inherit", fontSize: 14, padding: "10px 12px", outline: "none" },
    lbl: { fontSize: 10, color: "#4ade80", fontWeight: 700, display: "block", marginBottom: 5, letterSpacing: 1, textTransform: "uppercase", fontFamily: "'DM Sans',sans-serif" },
    btn: (bg, bc, col) => ({ background: bg, border: `1px solid ${bc}`, borderRadius: 9, color: col, fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 600, padding: "9px 14px", cursor: "pointer" }),
    ovr: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 12, overflowY: "auto" },
    tag: (col) => ({ background: `${col}18`, color: col, border: `1px solid ${col}40`, borderRadius: 20, padding: "2px 9px", fontSize: 10, fontFamily: "'DM Sans',sans-serif", fontWeight: 600, display: "inline-block" }),
  };

  // LOGIN
  if (!role) return (
    <div style={{ ...st.page, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');*{box-sizing:border-box;}input:focus,select:focus{border-color:#4ade80!important;}button{transition:all 0.15s;}button:active{transform:scale(0.97);}`}</style>
      <div style={{ width: "100%", maxWidth: 360, textAlign: "center" }}>
        <div style={{ fontSize: 56, marginBottom: 8 }}>🌿</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#4ade80", lineHeight: 1.2 }}>{APP_NAME}</div>
        <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#3d7a3d", marginBottom: 28 }}>Nursery & Garden Store Manager</div>
        <button onClick={() => handleLogin("staff")} style={{ ...st.btn("#061506", "#245224", "#a3d9a3"), width: "100%", padding: 16, fontSize: 15, marginBottom: 10, borderRadius: 14, textAlign: "left", display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 30 }}>👨‍💼</span>
          <div><div style={{ fontWeight: 700 }}>Staff Login</div><div style={{ fontSize: 11, color: "#3d7a3d", fontWeight: 400 }}>View stock, record sales & billing</div></div>
        </button>
        <div style={st.card}>
          <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, color: "#4ade80", fontWeight: 700, marginBottom: 10, letterSpacing: 1 }}>🔐 ADMIN LOGIN</div>
          <input type="password" placeholder="Enter PIN" value={pin}
            onChange={e => { setPin(e.target.value); setPinErr(false); }}
            onKeyDown={e => e.key === "Enter" && handleLogin("admin")}
            style={{ ...st.inp, fontSize: 24, textAlign: "center", letterSpacing: 12, marginBottom: 8 }} />
          {pinErr && <div style={{ color: "#f87171", fontSize: 12, marginBottom: 8, fontFamily: "'DM Sans',sans-serif" }}>❌ Wrong PIN!</div>}
          <button onClick={() => handleLogin("admin")} style={{ ...st.btn("#14532d", "#4ade80", "#4ade80"), width: "100%", padding: 12 }}>🔓 Unlock Admin</button>
        </div>
      </div>
    </div>
  );

  const navItems = [
    { key: "dashboard", icon: "🏠", label: "Home" },
    { key: "inventory", icon: "🌳", label: "Stock" },
    ...(role === "admin" ? [{ key: "add", icon: "➕", label: "Add" }] : []),
    { key: "billing", icon: "📲", label: "Bill" },
    { key: "sales", icon: "💵", label: "Sales" },
    ...(role === "admin" ? [{ key: "reports", icon: "📊", label: "Report" }] : []),
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

      {toast && <div style={{ position: "fixed", top: 14, left: "50%", transform: "translateX(-50%)", zIndex: 9999, background: "#0a2010", border: "1px solid #4ade80", borderRadius: 10, padding: "10px 18px", color: "#bbf7d0", fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", boxShadow: "0 4px 20px rgba(74,222,128,0.2)" }}>{toast}</div>}
      {syncing && <div style={{ position: "fixed", bottom: 80, right: 12, zIndex: 200, background: "#0a1a2e", border: "1px solid #60a5fa", borderRadius: 8, padding: "5px 11px", color: "#60a5fa", fontFamily: "'DM Sans',sans-serif", fontSize: 11 }}>🔄 Syncing...</div>}

      {/* Header */}
      <div style={st.header}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 20 }}>🌱</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#4ade80" }}>{APP_NAME}</div>
            <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, color: "#3d7a3d" }}>
              {role === "admin" ? "👑 Admin" : "👨‍💼 Staff"} · 🟢 Live
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {lowItems.length > 0 && <span style={st.tag("#facc15")}>⚠️ {lowItems.length}</span>}
          {role === "admin" && (
            <button onClick={() => { setSettingsForm({ ...settings }); setShowSettings(true); }}
              style={{ ...st.btn("#0a1a2e", "#1e3a6e", "#60a5fa"), fontSize: 11, padding: "5px 10px" }}>⚙️</button>
          )}
          <button onClick={() => { setRole(null); setPin(""); }} style={{ ...st.btn("#1a0808", "#5a1a1a", "#f87171"), fontSize: 11, padding: "5px 10px" }}>Logout</button>
        </div>
      </div>

      <div style={{ padding: "14px 12px 88px", maxWidth: 680, margin: "0 auto" }}>

        {/* DASHBOARD */}
        {view === "dashboard" && (
          <div>
            <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#3d7a3d", marginBottom: 2 }}>
              {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#bbf7d0", marginBottom: 12 }}>
              {new Date().getHours() < 12 ? "Good Morning" : "Good Afternoon"} {role === "admin" ? "👑" : "👨‍💼"}
            </div>
            {!settings.upiId && (
              <div style={{ ...st.card, borderColor: "#f59e0b", marginBottom: 10, display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 24 }}>⚠️</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 700, color: "#fbbf24" }}>UPI ID not set!</div>
                  <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#92400e" }}>Set your UPI ID to generate payment QR codes</div>
                </div>
                {role === "admin" && <button onClick={() => { setSettingsForm({ ...settings }); setShowSettings(true); }} style={{ ...st.btn("#1c1000", "#f59e0b", "#fbbf24"), fontSize: 11, padding: "5px 10px" }}>Set Now</button>}
              </div>
            )}
            <div style={{ ...st.card, marginBottom: 10, background: "linear-gradient(135deg,#0a2010,#081408)", borderColor: "#245224" }}>
              <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, color: "#4ade80", fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>📅 TODAY'S SUMMARY</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                <div><div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, color: "#3d7a3d" }}>Revenue</div><div style={{ fontSize: 20, fontWeight: 800, color: "#4ade80" }}>₹{todayRev.toLocaleString()}</div></div>
                <div><div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, color: "#3d7a3d" }}>Sales</div><div style={{ fontSize: 20, fontWeight: 800, color: "#60a5fa" }}>{todaySales.length}</div></div>
                <div><div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, color: "#3d7a3d" }}>Units</div><div style={{ fontSize: 20, fontWeight: 800, color: "#fbbf24" }}>{todaySales.reduce((a, b) => a + b.qty, 0)}</div></div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
              {[
                { l: "Total Products", v: items.length, i: "🌱", col: "#4ade80" },
                { l: "Stock Value", v: `₹${(totalVal / 1000).toFixed(1)}k`, i: "💰", col: "#fbbf24" },
                { l: "All Time Revenue", v: `₹${(totalRev / 1000).toFixed(1)}k`, i: "📈", col: "#a78bfa" },
                { l: "Price List Items", v: PRICE_LIST.length, i: "📋", col: "#60a5fa" },
              ].map((x, i) => (
                <div key={i} style={{ ...st.card, display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ fontSize: 22 }}>{x.i}</div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: x.col }}>{x.v}</div>
                    <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, color: "#3d7a3d" }}>{x.l}</div>
                  </div>
                </div>
              ))}
            </div>
            {/* Quick Bill CTA */}
            <button onClick={() => { setView("billing"); setBillView("list"); }}
              style={{ ...st.btn("linear-gradient(135deg,#0a2e1a,#061a0e)", "#4ade80", "#4ade80"), width: "100%", padding: 16, borderRadius: 14, marginBottom: 10, display: "flex", alignItems: "center", gap: 12, fontSize: 15 }}>
              <span style={{ fontSize: 28 }}>📲</span>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontWeight: 700 }}>Quick Bill + UPI QR</div>
                <div style={{ fontSize: 11, color: "#3d7a3d", fontWeight: 400 }}>Build bill → Generate QR → Send on WhatsApp</div>
              </div>
              <span style={{ marginLeft: "auto", fontSize: 20 }}>→</span>
            </button>
            {lowItems.length > 0 && (
              <div style={{ ...st.card, borderColor: "#7f3500", marginBottom: 10 }}>
                <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, color: "#facc15", fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>⚠️ LOW STOCK ({lowItems.length})</div>
                {lowItems.slice(0, 4).map(i => (
                  <div key={i.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: "1px solid #163d16" }}>
                    <div>
                      <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 600, color: "#e8f5e9" }}>{i.name}</div>
                      <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, color: "#3d7a3d" }}>{i.category}</div>
                    </div>
                    <span style={st.tag(sColor(i.status))}>{i.stock} left</span>
                  </div>
                ))}
              </div>
            )}
            {todaySales.length > 0 && (
              <div style={st.card}>
                <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, color: "#4ade80", fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>🕐 RECENT SALES</div>
                {todaySales.slice(0, 4).map(s2 => (
                  <div key={s2.id} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #163d16" }}>
                    <div>
                      <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 600, color: "#e8f5e9" }}>{s2.name}</div>
                      <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, color: "#3d7a3d" }}>{s2.qty} {s2.unit} · {s2.customer_name || "Walk-in"}</div>
                    </div>
                    <div style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 700, color: "#fbbf24" }}>₹{s2.amount}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* INVENTORY */}
        {view === "inventory" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#bbf7d0" }}>🌳 Stock Inventory</div>
              {role === "admin" && <button onClick={() => setView("add")} style={st.btn("#14532d", "#4ade80", "#4ade80")}>+ Add New</button>}
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
              <input placeholder="🔍 Search..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...st.inp, flex: 1, minWidth: 130 }} />
              <select value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{ ...st.sel, width: "auto", maxWidth: 170 }}>
                {CATEGORIES.map(x => <option key={x}>{x}</option>)}
              </select>
            </div>
            <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, color: "#3d7a3d", marginBottom: 8 }}>
              {filtered.length} products · {loading ? "Loading..." : "Live ✅"}
            </div>
            {loading ? (
              <div style={{ textAlign: "center", padding: 50, color: "#3d7a3d", fontFamily: "'DM Sans',sans-serif" }}>🌿 Loading...</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {filtered.map(item => (
                  <div key={item.id} style={{ ...st.card, borderLeft: `3px solid ${item.track_stock ? sColor(item.status) : "#a78bfa"}` }}>
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 15, color: "#e8f5e9" }}>{item.name}</div>
                      <div style={{ display: "flex", gap: 5, marginTop: 4, flexWrap: "wrap" }}>
                        <span style={st.tag("#60a5fa")}>{item.category}</span>
                        {item.track_stock
                          ? <span style={{ ...st.tag(sColor(item.status)), background: sBg(item.status) }}>{item.status}</span>
                          : <span style={st.tag("#a78bfa")}>📋 No Stock Track</span>
                        }
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6, marginBottom: 10 }}>
                      <div>
                        <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, color: "#3d7a3d" }}>STOCK</div>
                        <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 700, color: item.track_stock ? sColor(item.status) : "#a78bfa" }}>
                          {item.track_stock ? `${item.stock} ${item.unit}s` : "—"}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, color: "#3d7a3d" }}>MRP</div>
                        <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 700, color: "#fbbf24" }}>₹{item.price}</div>
                      </div>
                      <div>
                        <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, color: "#3d7a3d" }}>SOLD</div>
                        <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 700, color: "#a78bfa" }}>{item.total_sold || 0}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <button onClick={() => { setSaleModal(item); setSaleForm({ qty: "", amount: "", note: "", customer: "" }); }}
                        style={{ ...st.btn("#052e16", "#166534", "#4ade80"), flex: 1 }}>💵 Record Sale</button>
                      {role === "admin" && <>
                        {item.track_stock && <button onClick={() => { setRestockModal(item); setRestockQty(""); }} style={st.btn("#0a1a2e", "#1e3a6e", "#60a5fa")}>📦</button>}
                        <button onClick={() => setEditItem({ ...item })} style={st.btn("#1a0a2e", "#3d1e6e", "#a78bfa")}>✏️</button>
                        <button onClick={() => setConfirmDel(item)} style={st.btn("#1f0202", "#7f1d1d", "#f87171")}>🗑</button>
                      </>}
                    </div>
                  </div>
                ))}
                {filtered.length === 0 && (
                  <div style={{ textAlign: "center", padding: 40, color: "#3d7a3d", fontFamily: "'DM Sans',sans-serif" }}>No products found 🌾</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ADD NEW */}
        {view === "add" && role === "admin" && (
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#bbf7d0", marginBottom: 14 }}>➕ Add New Product</div>
            <div style={{ ...st.card, display: "flex", flexDirection: "column", gap: 12 }}>
              {/* Stock tracking toggle */}
              <div style={{ ...st.card, borderColor: addForm.track_stock ? "#245224" : "#3d1e6e", padding: 12 }}>
                <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#e8f5e9", marginBottom: 8 }}>📦 Stock Tracking</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => setAddForm(p => ({ ...p, track_stock: true }))}
                    style={{ ...st.btn(addForm.track_stock ? "#14532d" : "#081408", addForm.track_stock ? "#4ade80" : "#245224", addForm.track_stock ? "#4ade80" : "#3d7a3d"), flex: 1, fontSize: 12 }}>
                    ✅ Track Stock
                  </button>
                  <button onClick={() => setAddForm(p => ({ ...p, track_stock: false }))}
                    style={{ ...st.btn(!addForm.track_stock ? "#1a0a2e" : "#081408", !addForm.track_stock ? "#a78bfa" : "#245224", !addForm.track_stock ? "#a78bfa" : "#3d7a3d"), flex: 1, fontSize: 12 }}>
                    📋 Name & Price Only
                  </button>
                </div>
                <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, color: "#3d7a3d", marginTop: 6 }}>
                  {addForm.track_stock ? "Stock will reduce on each sale" : "No stock count — just name & price for billing"}
                </div>
              </div>

              <div>
                <label style={st.lbl}>Product Name *</label>
                <input type="text" placeholder="e.g. Thailand Mango" value={addForm.name}
                  onChange={e => {
                    const val = e.target.value;
                    setAddForm(p => ({ ...p, name: val }));
                    // Auto-fill price from price list
                    const match = PRICE_LIST.find(pl => pl.name.toLowerCase() === val.toLowerCase());
                    if (match) setAddForm(p => ({ ...p, name: val, price: match.price.toString(), category: match.category }));
                  }} style={st.inp} />
              </div>
              <div>
                <label style={st.lbl}>MRP / Price (₹) *</label>
                <input type="number" placeholder="e.g. 250" value={addForm.price}
                  onChange={e => setAddForm(p => ({ ...p, price: e.target.value }))} style={st.inp} />
              </div>
              {addForm.track_stock && (
                <>
                  <div>
                    <label style={st.lbl}>Stock Quantity *</label>
                    <input type="number" placeholder="e.g. 50" value={addForm.stock}
                      onChange={e => setAddForm(p => ({ ...p, stock: e.target.value }))} style={st.inp} />
                  </div>
                  <div>
                    <label style={st.lbl}>Low Stock Alert at</label>
                    <input type="number" placeholder="e.g. 5" value={addForm.min_stock}
                      onChange={e => setAddForm(p => ({ ...p, min_stock: e.target.value }))} style={st.inp} />
                  </div>
                </>
              )}
              {[
                { l: "Category", k: "category", opts: CATEGORIES.filter(x => x !== "All") },
                { l: "Unit", k: "unit", opts: UNITS },
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
                  placeholder="Variety, size, notes..." rows={2}
                  style={{ ...st.inp, resize: "vertical" }} />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={handleAdd} style={{ ...st.btn("#14532d", "#4ade80", "#4ade80"), flex: 1, padding: 13, fontSize: 15 }}>✅ Add to Inventory</button>
                <button onClick={() => setView("inventory")} style={st.btn("#1a1a1a", "#245224", "#3d7a3d")}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════ BILLING / QR VIEW ═══════════════ */}
        {view === "billing" && (
          <div>
            {/* Sub-nav */}
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              {[
                { k: "list", l: "📋 Products", icon: "📋" },
                { k: "build", l: "🧾 Bill", icon: "🧾" },
                { k: "qr", l: "📲 QR & Pay", icon: "📲" },
              ].map(t => (
                <button key={t.k} onClick={() => setBillView(t.k)}
                  style={{ ...st.btn(billView === t.k ? "#0a2e1a" : "#081408", billView === t.k ? "#4ade80" : "#245224", billView === t.k ? "#4ade80" : "#3d7a3d"), flex: 1, fontSize: 12, padding: "8px 4px" }}>
                  {t.l} {t.k === "build" && billItems.length > 0 ? `(${billItems.length})` : ""}
                </button>
              ))}
            </div>

            {/* PRODUCT LIST for billing */}
            {billView === "list" && (
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#bbf7d0", marginBottom: 10 }}>📋 Select Products</div>
                <input placeholder="🔍 Search plant or category..." value={billSearch}
                  onChange={e => setBillSearch(e.target.value)}
                  style={{ ...st.inp, marginBottom: 10 }} />

                {/* Custom product */}
                <button onClick={() => setAddCustomProductModal(true)}
                  style={{ ...st.btn("#0a1a2e", "#1e3a6e", "#60a5fa"), width: "100%", marginBottom: 14, padding: 12, fontSize: 13 }}>
                  ➕ Add Custom Product (not in list)
                </button>

                {/* From inventory */}
                {items.length > 0 && (
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, color: "#4ade80", fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>📦 YOUR INVENTORY</div>
                    {items.filter(i => i.name?.toLowerCase().includes(billSearch.toLowerCase())).slice(0, 5).map(item => (
                      <div key={item.id} style={{ ...st.card, marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "center", padding: 10 }}>
                        <div>
                          <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 600, color: "#e8f5e9" }}>{item.name}</div>
                          <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#fbbf24" }}>₹{item.price}/{item.unit}</div>
                        </div>
                        <button onClick={() => setAddPriceListModal({ ...item, fromInventory: true })}
                          style={{ ...st.btn("#14532d", "#4ade80", "#4ade80"), fontSize: 12, padding: "6px 12px" }}>Add</button>
                      </div>
                    ))}
                  </div>
                )}

                {/* From price list */}
                <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, color: "#60a5fa", fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>📋 PRICE LIST ({PRICE_LIST.length} items)</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {filteredPriceList.map((p, i) => (
                    <div key={i} style={{ ...st.card, display: "flex", justifyContent: "space-between", alignItems: "center", padding: 10 }}>
                      <div>
                        <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 600, color: "#e8f5e9" }}>{p.name}</div>
                        <div style={{ display: "flex", gap: 6, marginTop: 2 }}>
                          <span style={st.tag("#60a5fa")}>{p.category}</span>
                          <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#fbbf24" }}>₹{p.price}</span>
                          <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#4ade80" }}>Sale: ₹{p.salePrice}</span>
                        </div>
                      </div>
                      <button onClick={() => setAddPriceListModal(p)}
                        style={{ ...st.btn("#14532d", "#4ade80", "#4ade80"), fontSize: 12, padding: "6px 12px" }}>Add</button>
                    </div>
                  ))}
                </div>
                {billItems.length > 0 && (
                  <button onClick={() => setBillView("build")}
                    style={{ ...st.btn("linear-gradient(135deg,#0a2e1a,#061a0e)", "#4ade80", "#4ade80"), width: "100%", marginTop: 10, padding: 14, fontSize: 14 }}>
                    🧾 View Bill ({billItems.length} items · ₹{billTotal}) →
                  </button>
                )}
              </div>
            )}

            {/* BILL BUILDER */}
            {billView === "build" && (
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#bbf7d0", marginBottom: 12 }}>🧾 Bill Summary</div>
                {billItems.length === 0 ? (
                  <div style={{ ...st.card, textAlign: "center", padding: 40, color: "#3d7a3d", fontFamily: "'DM Sans',sans-serif" }}>
                    No items added yet<br />
                    <button onClick={() => setBillView("list")} style={{ ...st.btn("#081408", "#4ade80", "#4ade80"), marginTop: 12 }}>← Add Products</button>
                  </div>
                ) : (
                  <>
                    {/* Customer details */}
                    <div style={{ ...st.card, marginBottom: 10 }}>
                      <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, color: "#4ade80", fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>👤 CUSTOMER DETAILS</div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <div style={{ flex: 1 }}>
                          <label style={st.lbl}>Name *</label>
                          <input type="text" placeholder="Customer name" value={billCustomer.name}
                            onChange={e => setBillCustomer(p => ({ ...p, name: e.target.value }))} style={st.inp} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={st.lbl}>Phone (optional)</label>
                          <input type="tel" placeholder="10-digit number" value={billCustomer.phone}
                            onChange={e => setBillCustomer(p => ({ ...p, phone: e.target.value }))} style={st.inp} />
                        </div>
                      </div>
                    </div>

                    {/* Items */}
                    <div style={{ ...st.card, marginBottom: 10 }}>
                      <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, color: "#4ade80", fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>🛒 ITEMS</div>
                      {billItems.map((item, idx) => (
                        <div key={idx} style={{ padding: "10px 0", borderBottom: "1px solid #163d16" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                            <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 600, color: "#e8f5e9" }}>{item.name}</div>
                            <button onClick={() => removeBillItem(idx)} style={{ ...st.btn("#1f0202", "#7f1d1d", "#f87171"), fontSize: 11, padding: "3px 8px" }}>✕</button>
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
                            <div>
                              <label style={st.lbl}>Qty</label>
                              <input type="number" min="1" value={item.qty}
                                onChange={e => updateBillItem(idx, "qty", parseFloat(e.target.value) || 1)}
                                style={{ ...st.inp, fontSize: 16, textAlign: "center" }} />
                            </div>
                            <div>
                              <label style={st.lbl}>Price/unit (₹)</label>
                              <input type="number" value={item.price}
                                onChange={e => updateBillItem(idx, "price", parseFloat(e.target.value) || 0)}
                                style={{ ...st.inp, fontSize: 16, textAlign: "center" }} />
                            </div>
                            <div>
                              <label style={st.lbl}>Amount (₹)</label>
                              <input type="number" value={item.amount}
                                onChange={e => updateBillItem(idx, "amount", e.target.value)}
                                style={{ ...st.inp, fontSize: 16, textAlign: "center", borderColor: "#fbbf24" }} />
                            </div>
                          </div>
                        </div>
                      ))}
                      <button onClick={() => setBillView("list")}
                        style={{ ...st.btn("#081408", "#245224", "#3d7a3d"), width: "100%", marginTop: 10, fontSize: 12 }}>+ Add More Items</button>
                    </div>

                    {/* Total & override */}
                    <div style={{ ...st.card, marginBottom: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                        <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: "#e8f5e9" }}>Auto Total</div>
                        <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 20, fontWeight: 800, color: "#4ade80" }}>₹{billTotal.toLocaleString()}</div>
                      </div>
                      <div>
                        <label style={st.lbl}>Final Amount to Collect (₹) — editable</label>
                        <input type="number" placeholder={`Default: ₹${billTotal}`}
                          value={qrAmount} onChange={e => setQrAmount(e.target.value)}
                          style={{ ...st.inp, fontSize: 22, textAlign: "center", borderColor: "#fbbf24" }} />
                        <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, color: "#3d7a3d", marginTop: 4 }}>
                          Edit to give discount (e.g. ₹{billTotal} → ₹{Math.max(0, billTotal - 20)})
                        </div>
                      </div>
                      {qrAmount && parseFloat(qrAmount) < billTotal && (
                        <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#f87171", marginTop: 6 }}>
                          🎟️ Discount: ₹{(billTotal - parseFloat(qrAmount)).toFixed(0)} off
                        </div>
                      )}
                      <div style={{ marginTop: 10 }}>
                        <label style={st.lbl}>Note / Purpose (appears on QR)</label>
                        <input type="text" placeholder="e.g. Plant purchase — Mango 2 pcs"
                          value={qrNote} onChange={e => setQrNote(e.target.value)} style={st.inp} />
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => {
                        if (!billCustomer.name) { flash("❌ Enter customer name first!"); return; }
                        if (!settings.upiId) { flash("❌ UPI ID not set! Go to ⚙️ Settings first."); return; }
                        setBillView("qr");
                      }}
                        style={{ ...st.btn("linear-gradient(135deg,#0a2e1a,#061a0e)", "#4ade80", "#4ade80"), flex: 1, padding: 16, fontSize: 14 }}>
                        📲 Generate UPI QR →
                      </button>
                      <button onClick={() => {
                        if (!billCustomer.name) { flash("❌ Enter customer name first!"); return; }
                        openWhatsApp("cash");
                        flash("✅ Cash bill sent to WhatsApp!");
                      }}
                        style={{ ...st.btn("linear-gradient(135deg,#1c1502,#2e1f04)", "#fbbf24", "#fbbf24"), flex: 1, padding: 16, fontSize: 14 }}>
                        💵 Cash → Send Bill
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* QR & PAYMENT */}
            {billView === "qr" && (
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#bbf7d0", marginBottom: 12 }}>📲 UPI Payment QR</div>
                {/* Bill receipt */}
                <div style={{ ...st.card, marginBottom: 12, background: "linear-gradient(135deg,#0a2e1a,#040c04)", borderColor: "#4ade80" }}>
                  <div style={{ textAlign: "center", marginBottom: 10 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "#4ade80" }}>🌿 {settings.ownerName || APP_NAME}</div>
                    <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#3d7a3d" }}>
                      {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                    </div>
                  </div>
                  <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#3d7a3d", marginBottom: 8 }}>
                    👤 <span style={{ color: "#e8f5e9", fontWeight: 600 }}>{billCustomer.name}</span>
                    {billCustomer.phone && <span> · 📞 {billCustomer.phone}</span>}
                  </div>
                  <div style={{ borderTop: "1px dashed #245224", paddingTop: 8, marginBottom: 8 }}>
                    {billItems.map((item, idx) => (
                      <div key={idx} style={{ display: "flex", justifyContent: "space-between", padding: "3px 0" }}>
                        <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#e8f5e9" }}>{item.name} × {item.qty}</span>
                        <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#fbbf24", fontWeight: 600 }}>₹{item.amount}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ borderTop: "1px dashed #245224", paddingTop: 8 }}>
                    {qrAmount && parseFloat(qrAmount) < billTotal && (
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#3d7a3d" }}>MRP Total</span>
                        <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#3d7a3d", textDecoration: "line-through" }}>₹{billTotal}</span>
                      </div>
                    )}
                    {qrAmount && parseFloat(qrAmount) < billTotal && (
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#f87171" }}>Discount</span>
                        <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#f87171" }}>- ₹{(billTotal - parseFloat(qrAmount)).toFixed(0)}</span>
                      </div>
                    )}
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 16, fontWeight: 800, color: "#4ade80" }}>TOTAL</span>
                      <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 20, fontWeight: 800, color: "#4ade80" }}>₹{parseFloat(qrAmount || billTotal).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* QR Code */}
                <div style={{ ...st.card, textAlign: "center", marginBottom: 12 }}>
                  <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, color: "#4ade80", fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>
                    📲 SCAN TO PAY · GPay / PhonePe / Paytm
                  </div>
                  <img
                    src={generateUPIQR(settings.upiId, settings.ownerName || APP_NAME, parseFloat(qrAmount || billTotal), qrNote || `${billCustomer.name} - Plant Purchase`)}
                    alt="UPI QR"
                    style={{ width: 220, height: 220, borderRadius: 12, border: "3px solid #4ade80", background: "white", padding: 4 }}
                  />
                  <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 700, color: "#4ade80", marginTop: 10 }}>
                    ₹{parseFloat(qrAmount || billTotal).toLocaleString()}
                  </div>
                  <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, color: "#3d7a3d", marginTop: 2 }}>UPI: {settings.upiId}</div>
                  <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, color: "#3d7a3d" }}>{settings.ownerName}</div>
                </div>

                {/* Regenerate with custom amount */}
                <div style={{ ...st.card, marginBottom: 12 }}>
                  <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, color: "#facc15", fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>🔄 REGENERATE QR WITH DIFFERENT AMOUNT</div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input type="number" placeholder={`Current: ₹${parseFloat(qrAmount || billTotal)}`}
                      value={qrAmount} onChange={e => setQrAmount(e.target.value)}
                      style={{ ...st.inp, flex: 1, fontSize: 18, textAlign: "center", borderColor: "#facc15" }} />
                    <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#3d7a3d" }}>QR updates<br />instantly ↑</div>
                  </div>
                </div>

                {/* WhatsApp buttons */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
                  <button onClick={openWhatsApp}
                    style={{ ...st.btn("#052e16", "#25d366", "#25d366"), width: "100%", padding: 14, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <span style={{ fontSize: 20 }}>💬</span> Send Bill to My WhatsApp
                  </button>
                  {billCustomer.phone && (
                    <button onClick={openCustomerWhatsApp}
                      style={{ ...st.btn("#052016", "#4ade80", "#4ade80"), width: "100%", padding: 14, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                      <span style={{ fontSize: 20 }}>📤</span> Send Bill to Customer WhatsApp
                    </button>
                  )}
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => setBillView("build")} style={{ ...st.btn("#081408", "#245224", "#3d7a3d"), flex: 1 }}>← Edit Bill</button>
                  <button onClick={() => {
                    setBillItems([]); setBillCustomer({ name: "", phone: "" });
                    setQrAmount(""); setQrNote(""); setBillView("list");
                    flash("✅ Bill cleared!");
                  }} style={{ ...st.btn("#1f0202", "#7f1d1d", "#f87171"), flex: 1 }}>🗑 New Bill</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SALES LOG */}
        {view === "sales" && (
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#bbf7d0", marginBottom: 12 }}>💵 Sales Log</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
              {[
                { l: "Today", v: `₹${todayRev.toLocaleString()}`, s: `${todaySales.length} sales`, col: "#4ade80" },
                { l: "All Time", v: `₹${totalRev.toLocaleString()}`, s: `${sales.length} sales`, col: "#fbbf24" },
                { l: "Discounts", v: `₹${totalDisc.toLocaleString()}`, s: "given off", col: "#f87171" },
              ].map((x, i) => (
                <div key={i} style={st.card}>
                  <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, color: "#3d7a3d", textTransform: "uppercase" }}>{x.l}</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: x.col }}>{x.v}</div>
                  <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, color: "#3d7a3d" }}>{x.s}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              {["today", "all"].map(t => (
                <button key={t} onClick={() => setSalesTab(t)}
                  style={{ ...st.btn(salesTab === t ? "#14532d" : "#081408", salesTab === t ? "#4ade80" : "#245224", salesTab === t ? "#4ade80" : "#3d7a3d"), flex: 1 }}>
                  {t === "today" ? "📅 Today" : "📋 All Sales"}
                </button>
              ))}
            </div>
            {displaySales.length === 0
              ? <div style={{ ...st.card, textAlign: "center", color: "#3d7a3d", fontFamily: "'DM Sans',sans-serif", padding: 36 }}>No sales yet</div>
              : <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {displaySales.map(s2 => (
                  <div key={s2.id} style={st.card}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <div style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 14, color: "#e8f5e9" }}>{s2.name}</div>
                      <div style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 800, fontSize: 16, color: "#4ade80" }}>₹{s2.amount}</div>
                    </div>
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 6 }}>
                      <span style={st.tag("#60a5fa")}>📦 {s2.qty} {s2.unit}s</span>
                      {s2.customer_name && <span style={st.tag("#60a5fa")}>👤 {s2.customer_name}</span>}
                      <span style={st.tag(s2.sold_by === "admin" ? "#fbbf24" : "#a78bfa")}>{s2.sold_by === "admin" ? "👑" : "👨‍💼"} {s2.sold_by}</span>
                      <span style={st.tag("#3d7a3d")}>🕐 {new Date(s2.date).toLocaleString("en-IN", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" })}</span>
                      {s2.discount > 0 && <span style={st.tag("#f87171")}>🎟️ -₹{s2.discount} off</span>}
                    </div>
                    {s2.note && <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#3d7a3d", fontStyle: "italic" }}>📝 {s2.note}</div>}
                    {role === "admin" && (
                      <button onClick={() => setConfirmDelSale(s2)} style={{ ...st.btn("#1f0202", "#7f1d1d", "#f87171"), fontSize: 11, padding: "4px 10px", marginTop: 8 }}>🗑 Delete</button>
                    )}
                  </div>
                ))}
              </div>}
          </div>
        )}

        {/* REPORTS */}
        {view === "reports" && role === "admin" && (
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#bbf7d0", marginBottom: 14 }}>📊 Business Reports</div>
            <div style={{ ...st.card, marginBottom: 10 }}>
              <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, color: "#4ade80", fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>🏆 TOP SELLING</div>
              {[...items].sort((a, b) => (b.total_sold || 0) - (a.total_sold || 0)).slice(0, 5).map((item, idx) => (
                <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: "1px solid #163d16" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 16, fontWeight: 800, color: ["#fbbf24", "#9ca3af", "#c97c3a", "#4ade80", "#4ade80"][idx] }}>#{idx + 1}</div>
                    <div>
                      <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 600, color: "#e8f5e9" }}>{item.name}</div>
                      <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, color: "#3d7a3d" }}>{item.category}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 700, color: "#4ade80" }}>{item.total_sold || 0} sold</div>
                    <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, color: "#fbbf24" }}>₹{(item.total_revenue || 0).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ ...st.card, marginBottom: 10 }}>
              <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, color: "#4ade80", fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>📂 STOCK BY CATEGORY</div>
              {CATEGORIES.filter(x => x !== "All").map(cat => {
                const ci = items.filter(i => i.category === cat);
                if (!ci.length) return null;
                return (
                  <div key={cat} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #163d16" }}>
                    <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#e8f5e9" }}>{cat}</div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#60a5fa" }}>
                        {ci.filter(i => i.track_stock).reduce((a, b) => a + (b.stock || 0), 0)} tracked units
                      </div>
                      <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, color: "#fbbf24" }}>
                        ₹{ci.filter(i => i.track_stock).reduce((a, b) => a + ((b.stock || 0) * b.price), 0).toLocaleString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#040c04", borderTop: "1px solid #163d16", display: "flex", justifyContent: "space-around", padding: "6px 0 8px", zIndex: 50 }}>
        {navItems.map(n => (
          <button key={n.key} onClick={() => setView(n.key)} style={{ background: view === n.key ? "#0f2e0f" : "transparent", border: view === n.key ? "1px solid #245224" : "1px solid transparent", borderRadius: 10, padding: "6px 10px", color: view === n.key ? "#4ade80" : "#3d7a3d", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, fontFamily: "'DM Sans',sans-serif", fontSize: 9, fontWeight: 600, minWidth: 44 }}>
            <span style={{ fontSize: 18 }}>{n.icon}</span>{n.label}
          </button>
        ))}
      </div>

      {/* ═══ SETTINGS MODAL ═══ */}
      {showSettings && (
        <div style={st.ovr}>
          <div style={{ ...st.card, width: "100%", maxWidth: 380 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#bbf7d0", marginBottom: 14 }}>⚙️ Settings</div>
            {[
              { l: "Your UPI ID *", k: "upiId", t: "text", p: "e.g. 9876543210@ybl" },
              { l: "Business Name", k: "ownerName", t: "text", p: "Rainbow Hitech Nursery" },
              { l: "Your WhatsApp Number", k: "ownerPhone", t: "tel", p: "10-digit number" },
            ].map(f => (
              <div key={f.k} style={{ marginBottom: 12 }}>
                <label style={st.lbl}>{f.l}</label>
                <input type={f.t} placeholder={f.p} value={settingsForm[f.k] || ""}
                  onChange={e => setSettingsForm(p => ({ ...p, [f.k]: e.target.value }))} style={st.inp} />
              </div>
            ))}
            <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, color: "#3d7a3d", marginBottom: 14 }}>
              UPI ID is used to generate payment QR codes. Set it once, works for all bills.
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={saveSettings} style={{ ...st.btn("#14532d", "#4ade80", "#4ade80"), flex: 1, padding: 12 }}>✅ Save Settings</button>
              <button onClick={() => setShowSettings(false)} style={st.btn("#1a1a1a", "#245224", "#3d7a3d")}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ ADD TO BILL MODAL (from price list) ═══ */}
      {addPriceListModal && (
        <div style={st.ovr}>
          <div style={{ ...st.card, width: "100%", maxWidth: 360 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#bbf7d0", marginBottom: 4 }}>➕ Add to Bill</div>
            <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, fontWeight: 600, color: "#e8f5e9", marginBottom: 2 }}>{addPriceListModal.name}</div>
            {addPriceListModal.salePrice && (
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <span style={st.tag("#fbbf24")}>MRP ₹{addPriceListModal.price}</span>
                <span style={st.tag("#4ade80")}>Sale ₹{addPriceListModal.salePrice}</span>
              </div>
            )}
            {(() => {
              return (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div>
                    <label style={st.lbl}>Quantity</label>
                    <input type="number" min="1" value={modalQty}
                      onChange={e => setModalQty(parseFloat(e.target.value) || 1)}
                      style={{ ...st.inp, fontSize: 22, textAlign: "center" }} />
                  </div>
                  <div>
                    <label style={st.lbl}>Price per unit (₹)</label>
                    <input type="number" value={modalPrice}
                      onChange={e => setModalPrice(parseFloat(e.target.value) || 0)}
                      style={{ ...st.inp, fontSize: 22, textAlign: "center", borderColor: "#fbbf24" }} />
                  </div>
                  <div style={{ ...st.card, textAlign: "center" }}>
                    <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#3d7a3d" }}>Total for this item</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "#4ade80" }}>₹{(modalQty * modalPrice).toFixed(0)}</div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => addToBill(addPriceListModal, modalQty, modalPrice)}
                      style={{ ...st.btn("#14532d", "#4ade80", "#4ade80"), flex: 1, padding: 12 }}>✅ Add to Bill</button>
                    <button onClick={() => setAddPriceListModal(null)} style={st.btn("#1a1a1a", "#245224", "#3d7a3d")}>Cancel</button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ═══ ADD CUSTOM PRODUCT MODAL ═══ */}
      {addCustomProductModal && (
        <div style={st.ovr}>
          <div style={{ ...st.card, width: "100%", maxWidth: 360 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#bbf7d0", marginBottom: 14 }}>➕ Custom Product</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div>
                <label style={st.lbl}>Product Name *</label>
                <input type="text" placeholder="e.g. Special Mango Variety" value={customProduct.name}
                  onChange={e => setCustomProduct(p => ({ ...p, name: e.target.value }))} style={st.inp} />
              </div>
              <div>
                <label style={st.lbl}>Price per unit (₹) *</label>
                <input type="number" placeholder="e.g. 350" value={customProduct.price}
                  onChange={e => setCustomProduct(p => ({ ...p, price: e.target.value }))} style={{ ...st.inp, fontSize: 20, textAlign: "center" }} />
              </div>
              <div>
                <label style={st.lbl}>Quantity</label>
                <input type="number" min="1" value={customProduct.qty}
                  onChange={e => setCustomProduct(p => ({ ...p, qty: e.target.value }))} style={{ ...st.inp, fontSize: 20, textAlign: "center" }} />
              </div>
              {customProduct.price && customProduct.qty && (
                <div style={{ ...st.card, textAlign: "center" }}>
                  <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#3d7a3d" }}>Total</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#4ade80" }}>₹{(parseFloat(customProduct.price) * parseInt(customProduct.qty)).toFixed(0)}</div>
                </div>
              )}
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => {
                  if (!customProduct.name || !customProduct.price) { flash("❌ Fill name and price!"); return; }
                  addToBill({ name: customProduct.name }, parseInt(customProduct.qty) || 1, parseFloat(customProduct.price));
                  setCustomProduct({ name: "", price: "", qty: "1" });
                  setAddCustomProductModal(false);
                }} style={{ ...st.btn("#14532d", "#4ade80", "#4ade80"), flex: 1, padding: 12 }}>✅ Add to Bill</button>
                <button onClick={() => setAddCustomProductModal(false)} style={st.btn("#1a1a1a", "#245224", "#3d7a3d")}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SALE MODAL */}
      {saleModal && (
        <div style={st.ovr}>
          <div style={{ ...st.card, width: "100%", maxWidth: 400, maxHeight: "92vh", overflowY: "auto" }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#bbf7d0", marginBottom: 4 }}>💵 Record Sale</div>
            <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#3d7a3d", marginBottom: 4 }}>
              {saleModal.name} · MRP: <span style={{ color: "#fbbf24" }}>₹{saleModal.price}/{saleModal.unit}</span>
            </div>
            {saleModal.track_stock && <span style={{ ...st.tag(sColor(saleModal.status)), marginBottom: 14 }}>{saleModal.stock} {saleModal.unit}s in stock</span>}
            {!saleModal.track_stock && <span style={st.tag("#a78bfa")}>📋 No stock tracking</span>}
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 10 }}>
              <div>
                <label style={st.lbl}>Quantity Sold *</label>
                <input type="number" min="1" max={saleModal.track_stock ? saleModal.stock : undefined}
                  value={saleForm.qty} onChange={e => setSaleForm(p => ({ ...p, qty: e.target.value }))} style={{ ...st.inp, fontSize: 20 }} />
              </div>
              <div>
                <label style={st.lbl}>Amount Received (₹) *</label>
                <input type="number" placeholder="Actual amount paid"
                  value={saleForm.amount} onChange={e => setSaleForm(p => ({ ...p, amount: e.target.value }))} style={{ ...st.inp, fontSize: 20 }} />
              </div>
              {saleForm.qty && saleForm.amount && parseInt(saleForm.qty) > 0 && parseFloat(saleForm.amount) > 0 && (
                <div style={{ background: "#0a2010", border: "1px solid #245224", borderRadius: 10, padding: 12 }}>
                  <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, color: "#4ade80", fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>📊 SUMMARY</div>
                  {[
                    { l: "Qty", v: `${saleForm.qty} ${saleModal.unit}s` },
                    { l: "MRP Total", v: `₹${(parseInt(saleForm.qty) * saleModal.price).toLocaleString()}` },
                    { l: "Charged", v: `₹${parseFloat(saleForm.amount).toLocaleString()}`, col: "#4ade80" },
                    ...(parseInt(saleForm.qty) * saleModal.price - parseFloat(saleForm.amount) > 0
                      ? [{ l: "Discount", v: `₹${(parseInt(saleForm.qty) * saleModal.price - parseFloat(saleForm.amount)).toFixed(2)}`, col: "#f87171" }] : []),
                  ].map((r, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "3px 0" }}>
                      <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#3d7a3d" }}>{r.l}</span>
                      <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 700, color: r.col || "#e8f5e9" }}>{r.v}</span>
                    </div>
                  ))}
                </div>
              )}
              <div>
                <label style={st.lbl}>Customer Name</label>
                <input type="text" placeholder="Walk-in / Name" value={saleForm.customer}
                  onChange={e => setSaleForm(p => ({ ...p, customer: e.target.value }))} style={st.inp} />
              </div>
              <div>
                <label style={st.lbl}>Note</label>
                <input type="text" placeholder="Optional remark" value={saleForm.note}
                  onChange={e => setSaleForm(p => ({ ...p, note: e.target.value }))} style={st.inp} />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={handleSale} style={{ ...st.btn("#14532d", "#4ade80", "#4ade80"), flex: 1, padding: 13, fontSize: 14 }}>✅ Confirm Sale</button>
                <button onClick={() => setSaleModal(null)} style={st.btn("#1a1a1a", "#245224", "#3d7a3d")}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editItem && (
        <div style={st.ovr}>
          <div style={{ ...st.card, width: "100%", maxWidth: 380, maxHeight: "92vh", overflowY: "auto" }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#bbf7d0", marginBottom: 14 }}>✏️ Edit Product</div>
            {/* Stock tracking toggle */}
            <div style={{ marginBottom: 12 }}>
              <label style={st.lbl}>Stock Tracking</label>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setEditItem(p => ({ ...p, track_stock: true }))}
                  style={{ ...st.btn(editItem.track_stock ? "#14532d" : "#081408", editItem.track_stock ? "#4ade80" : "#245224", editItem.track_stock ? "#4ade80" : "#3d7a3d"), flex: 1, fontSize: 12 }}>✅ Track Stock</button>
                <button onClick={() => setEditItem(p => ({ ...p, track_stock: false }))}
                  style={{ ...st.btn(!editItem.track_stock ? "#1a0a2e" : "#081408", !editItem.track_stock ? "#a78bfa" : "#245224", !editItem.track_stock ? "#a78bfa" : "#3d7a3d"), flex: 1, fontSize: 12 }}>📋 Name & Price Only</button>
              </div>
            </div>
            {[{ l: "Name", k: "name", t: "text" }, { l: "Price/MRP (₹)", k: "price", t: "number" },
            ...(editItem.track_stock ? [{ l: "Stock Qty", k: "stock", t: "number" }, { l: "Low Stock Alert", k: "min_stock", t: "number" }] : [])
            ].map(f => (
              <div key={f.k} style={{ marginBottom: 10 }}>
                <label style={st.lbl}>{f.l}</label>
                <input type={f.t} value={editItem[f.k] || ""} onChange={e => setEditItem(p => ({ ...p, [f.k]: e.target.value }))} style={st.inp} />
              </div>
            ))}
            {[{ l: "Category", k: "category", opts: CATEGORIES.filter(x => x !== "All") }, { l: "Unit", k: "unit", opts: UNITS }].map(f => (
              <div key={f.k} style={{ marginBottom: 10 }}>
                <label style={st.lbl}>{f.l}</label>
                <select value={editItem[f.k] || ""} onChange={e => setEditItem(p => ({ ...p, [f.k]: e.target.value }))} style={st.sel}>
                  {f.opts.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
            <div style={{ marginBottom: 14 }}>
              <label style={st.lbl}>Description</label>
              <textarea value={editItem.description || ""} onChange={e => setEditItem(p => ({ ...p, description: e.target.value }))} rows={2} style={{ ...st.inp, resize: "vertical" }} />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={handleEdit} style={{ ...st.btn("#14532d", "#4ade80", "#4ade80"), flex: 1 }}>✅ Save</button>
              <button onClick={() => setEditItem(null)} style={st.btn("#1a1a1a", "#245224", "#3d7a3d")}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* RESTOCK MODAL */}
      {restockModal && (
        <div style={st.ovr}>
          <div style={{ ...st.card, width: "100%", maxWidth: 340 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#bbf7d0", marginBottom: 6 }}>📦 Add Stock</div>
            <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#3d7a3d", marginBottom: 14 }}>
              {restockModal.name} · Current: <span style={{ color: "#4ade80" }}>{restockModal.stock} {restockModal.unit}s</span>
            </div>
            <label style={st.lbl}>Quantity to Add</label>
            <input type="number" min="1" value={restockQty} onChange={e => setRestockQty(e.target.value)}
              style={{ ...st.inp, fontSize: 22, marginBottom: 10 }} />
            {restockQty && parseInt(restockQty) > 0 && (
              <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#4ade80", marginBottom: 14 }}>
                New total: <strong>{(restockModal.stock || 0) + parseInt(restockQty)} {restockModal.unit}s</strong>
              </div>
            )}
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={handleRestock} style={{ ...st.btn("#14532d", "#4ade80", "#4ade80"), flex: 1 }}>✅ Add Stock</button>
              <button onClick={() => setRestockModal(null)} style={st.btn("#1a1a1a", "#245224", "#3d7a3d")}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE SALE CONFIRM */}
      {confirmDelSale && (
        <div style={st.ovr}>
          <div style={{ ...st.card, width: "100%", maxWidth: 340, textAlign: "center" }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>🗑️</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#f87171", marginBottom: 6 }}>Delete Sale?</div>
            <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#3d7a3d", marginBottom: 14 }}>
              <strong style={{ color: "#e8f5e9" }}>{confirmDelSale.name}</strong> · ₹{confirmDelSale.amount}
              {confirmDelSale.qty && <div style={{ color: "#facc15", fontSize: 11, marginTop: 4 }}>⚠️ Stock will restore by {confirmDelSale.qty} units</div>}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => handleDeleteSale(confirmDelSale)} style={{ ...st.btn("#1f0202", "#7f1d1d", "#f87171"), flex: 1 }}>Yes, Delete</button>
              <button onClick={() => setConfirmDelSale(null)} style={{ ...st.btn("#081408", "#245224", "#3d7a3d"), flex: 1 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE PRODUCT CONFIRM */}
      {confirmDel && (
        <div style={st.ovr}>
          <div style={{ ...st.card, width: "100%", maxWidth: 320, textAlign: "center" }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>⚠️</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#f87171", marginBottom: 6 }}>Delete Product?</div>
            <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#3d7a3d", marginBottom: 18 }}>
              Remove <strong style={{ color: "#e8f5e9" }}>{confirmDel.name}</strong> permanently?
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => handleDelete(confirmDel.id)} style={{ ...st.btn("#1f0202", "#7f1d1d", "#f87171"), flex: 1 }}>Yes, Delete</button>
              <button onClick={() => setConfirmDel(null)} style={{ ...st.btn("#081408", "#245224", "#3d7a3d"), flex: 1 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
