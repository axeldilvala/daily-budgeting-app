import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid
} from "recharts";

/* ---------------------------------------------------------
   DATA
--------------------------------------------------------- */

const DEFAULT_CATEGORY_GROUPS = {
  "HOME": ["Mortgage", "Insurance", "Repairs", "Services", "Utilities"],
  "DAILY LIVING": ["Groceries", "Transfers", "Laundry", "Food", "Treat food", "Purchases", "Dining out"],
  "TRANSPORTATION": ["Gas/fuel", "Insurance", "Repairs", "Car wash/detailing services", "Parking", "Public transportation"],
  "ENTERTAINMENT": ["Cable TV", "Video/DVD rentals", "Movies/plays", "Concerts/clubs"],
  "HEALTH": ["Health club dues", "Insurance", "Prescriptions", "Over-the-counter drugs", "Co-payments/out-of-pocket", "Veterinarians/pet medicines", "Life insurance"],
  "VACATIONS": ["Fare", "Accommodations", "Souvenirs", "Pet boarding", "Rental car"],
  "RECREATION": ["Gym fees", "Sports equipment", "Team dues", "Toys/child gear"],
  "DUES/SUBSCRIPTION": ["Magazines", "Newspapers", "Internet connection", "Public radio", "Public television", "Religious organizations", "Charity"],
  "PERSONAL": ["Clothing", "Gifts", "Salon/barber", "Books", "Music (CDs, etc.)"],
  "FINANCIAL OBLIGATIONS": ["Installments", "Income tax (additional)", "Other obligations"],
  "CREDIT CARD": ["Subscriptions", "Dining out", "Clothing", "Internet", "Installments", "Other"],
  "INVESTMENTS": ["Stocks", "Forex", "Mutual Funds", "RDN Top-up"],
};

const DEFAULT_INCOME_CATEGORIES = ["Wages", "Cash leftovers", "Bank cash leftovers", "Transfers", "Incoming Transfers", "Dividends", "Investment Withdrawal"];

// Cash / bank accounts — real money you hold. Each maps to an opening
// balance; the live balance is opening + income in − expenses out −
// card payments made from it. Editable from the Cards tab.
const DEFAULT_ACCOUNTS = {
  "BCA Account": 0,
  "Cash": 0,
  "Other": 0,
};

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/* ---------------------------------------------------------
   TRANSLATIONS
   Covers navigation and the tabs used most day-to-day
   (Overview, Add, Entries) plus the full Help tab. Manage,
   Cards, and Data stay English-first for now — flagged to the
   person so it's not a silent gap.
--------------------------------------------------------- */

const STRINGS = {
  en: {
    nav: { overview: "Overview", categories: "Categories", entries: "Entries", add: "Add", manage: "Manage", cards: "Cards", data: "Data", help: "Help" },
    common: { save: "Save", cancel: "Cancel", delete: "Delete", add: "Add", edit: "Edit", wholeYear: "Whole Year" },
    overview: {
      netCashFlow: "NET CASH FLOW",
      income: "Income",
      expenses: "Expenses",
      vsLastMonth: "VS LAST MONTH",
      topCategory: "TOP CATEGORY",
      incomeVsExpense: "INCOME VS EXPENSE — ALL MONTHS",
      spendingByGroup: "SPENDING BY GROUP",
      noExpenses: "No expenses logged this month yet.",
      accountsBalance: "ACCOUNTS — CURRENT BALANCE",
      accountsHint: "Opening balance + income in − spending & card payments out. Set opening balances on the Cards tab.",
      investmentsBalance: "INVESTMENTS — CURRENT BALANCE",
      realizedThisMonth: "Realized this month",
      realizedThisYear: "Realized this year",
      emptyTitle: "Nothing logged yet",
      emptyBody: "Add your first income or expense entry and your overview will build itself from there.",
      emptyCta: "Go to Add",
    },
    addEntry: {
      expense: "Expense",
      income: "Income",
      description: "DESCRIPTION",
      descPlaceholderExpense: "e.g. Gojek lunch",
      descPlaceholderIncome: "e.g. Monthly wages",
      amount: "AMOUNT (IDR)",
      date: "DATE",
      group: "GROUP",
      category: "CATEGORY",
      incomeCategory: "INCOME CATEGORY",
      withdrawingFrom: "WITHDRAWING FROM",
      closesPosition: "This closes out the position",
      closesPositionHint: "Nothing left invested here — any gap to the tracked balance is logged as a realized gain or loss.",
      fundSource: "FUND SOURCE",
      fundSourceHint: "The account this was paid from, or the card it was charged to.",
      depositTo: "DEPOSIT TO",
      depositToHint: "This income is added to this account's balance.",
      paidFrom: "PAID FROM",
      addExpense: "Add expense",
      addIncome: "Add income",
      errName: "Give this entry a name.",
      errAmount: "Enter an amount greater than zero.",
      errDate: "Pick a date.",
      errDepositTo: "Pick an account for this income to land in.",
    },
    entries: {
      all: "All",
      expense: "Expense",
      income: "Income",
      noEntries: (label) => `No entries for ${label}.`,
    },
    categories: {
      expenses: "Expenses",
      income: "Income",
      hint: "Tap a group to see it broken down month to month, side by side.",
      category: "CATEGORY",
      total: "Total",
      emptyTitle: "Nothing to break down yet",
      emptyBody: "Once you've logged a few entries, this tab will lay them out month by month, category by category.",
    },
    manage: {
      expenseGroups: "Expense groups",
      income: "Income",
      hint: "Tap a name to rename it — renaming updates it everywhere, including past entries. Deleting only removes it from new entries; existing entries keep their history.",
      categoryCount: (n) => `${n} categor${n === 1 ? "y" : "ies"}`,
      entryCount: (n) => `${n} entries`,
      addGroup: "Add group",
      newGroupPlaceholder: "New group name…",
      addCategoryPlaceholder: "Add category…",
      addIncomeCategoryPlaceholder: "Add income category…",
    },
    cards: {
      hint: "Balance owed = everything spent with that card as source, minus payments logged against it. Tap a limit or a card's name to edit it. Use \"Adjust balance\" for spending that never got logged as its own entry — like a forgotten subscription charge.",
      owedNow: "owed right now",
      overLimit: (amt) => `Over limit by ${amt}`,
      available: (amt) => `${amt} available`,
      entriesUseCard: (n) => `${n} entries use this card`,
      adjustBalance: "Adjust balance (untracked spending)",
      increaseBalance: "Increase balance",
      decreaseBalance: "Decrease balance",
      amountPlaceholder: "Amount (IDR)",
      notePlaceholder: "Note (e.g. forgotten Spotify subscription)",
      saveAdjustment: "Save adjustment",
      noCardsTitle: "No cards yet",
      noCardsBody: "Add one below to start tracking its limit and balance.",
      addCard: "Add card",
      newCard: "New card",
      cardNamePlaceholder: "Card name (e.g. GoPayLater)",
      limitPlaceholder: "Limit (IDR)",
      logPayment: "Log a payment",
      card: "CARD",
      amount: "AMOUNT (IDR)",
      date: "DATE",
      logPaymentBtn: "Log payment",
      logPaymentHint: "This settles the card balance shown above and reduces the account you paid from. It won't affect your income/expense totals or Net Cash Flow, since the spending itself was already counted when you made each purchase.",
      paidFrom: "PAID FROM",
      accountsTitle: "Accounts",
      accountsHint: "Your real cash and bank balances. Tap the big number to set an account to exactly what it holds right now. It then updates on its own as you log income, spending, and card payments. \"Opening balance\" is the finer control — the amount before your first logged entry.",
      openingBalanceLabel: "Opening balance",
      liveBalanceLabel: "balance now",
      tapToEdit: "tap to set",
      accountEntries: (n) => `${n} entries touch this account`,
      addAccount: "Add account",
      newAccount: "New account",
      accountNamePlaceholder: "Account name (e.g. Jago Pocket)",
      openingPlaceholder: "Opening balance (IDR)",
    },
    data: {
      exportTitle: "Export your data",
      exportBody: (n) => `Downloads all ${n} entries as a single file. Use this to move your data to another device, or just to keep a backup.`,
      exportBtn: "Download backup (.json)",
      importTitle: "Import data",
      importBody: "Pick a backup file exported from this app on another device.",
      chooseFile: "Choose file…",
      entriesFound: (n) => `${n} entries found`,
      fromFile: (name) => `From "${name}". Merge adds only entries you don't already have. Replace wipes everything currently on this device first.`,
      mergeBtn: "Merge with existing data",
      replaceBtn: "Replace everything instead",
      footerNote: "Your data lives only on this device's browser storage. Exporting regularly is the safest way to keep a copy — clearing your browser's site data would otherwise erase everything with no way to recover it.",
    },
    help: {
      title: "How this app works",
      subtitle: "A quick reference for the rules baked into this app.",
      sections: [
        {
          h: "Getting started",
          body: "Use Add to log income or expenses as they happen. Overview gives you the big picture; Entries shows a raw list; Categories breaks everything down month by month.",
        },
        {
          h: "Credit cards: log once, at purchase",
          body: "When you buy something on a credit card, log it the day you buy it — not the day you pay the bill. Paying the bill later isn't a second expense; it's settling a debt you already counted. Logging both would double-count the same money.",
        },
        {
          h: "Installments",
          body: "Spread the cost across the months it actually bills, not as one lump sum on purchase day — same logic as your rent or car payment showing up every month.",
        },
        {
          h: "Investments: buying vs withdrawing",
          body: "Buying stocks, mutual funds, forex, or topping up RDN is logged as an Expense under INVESTMENTS. Pulling money back out is logged as Income → Investment Withdrawal. Toggle \"This closes out the position\" only when you're fully exiting — it tells the app to treat any gap from the tracked balance as a realized gain or loss.",
        },
        {
          h: "Credit card limits",
          body: "Balance owed = everything spent on that card minus payments you've logged against it. If something was charged to a card without you logging it (a forgotten subscription, for example), use \"Adjust balance\" on the Cards tab instead of trying to force it through a normal entry.",
        },
        {
          h: "Accounts: your real cash",
          body: "Each account (BCA, Cash, etc.) has an opening balance you set once on the Cards tab — what you held before your first logged entry. Its live balance then moves on its own: income logged to it adds, expenses paid from it subtract, and card payments made from it subtract. Logging a card payment asks which account it came from so that money actually leaves your balance.",
        },
        {
          h: "Deleting a category",
          body: "Removes it from future dropdowns only. Every past entry keeps its original label — nothing in your history changes or disappears.",
        },
        {
          h: "Renaming a category",
          body: "Updates every past entry that used it, so your history stays consistent under the new name.",
        },
        {
          h: "Your data",
          body: "Everything is stored only on this device's browser. It won't sync to your other devices automatically — use the Data tab to export a backup and import it elsewhere.",
        },
      ],
    },
  },
  id: {
    nav: { overview: "Ringkasan", categories: "Kategori", entries: "Transaksi", add: "Tambah", manage: "Kelola", cards: "Kartu", data: "Data", help: "Bantuan" },
    common: { save: "Simpan", cancel: "Batal", delete: "Hapus", add: "Tambah", edit: "Ubah", wholeYear: "Satu Tahun" },
    overview: {
      netCashFlow: "ARUS KAS BERSIH",
      income: "Pemasukan",
      expenses: "Pengeluaran",
      vsLastMonth: "VS BULAN LALU",
      topCategory: "KATEGORI TERBESAR",
      incomeVsExpense: "PEMASUKAN VS PENGELUARAN — SEMUA BULAN",
      spendingByGroup: "PENGELUARAN PER GRUP",
      noExpenses: "Belum ada pengeluaran bulan ini.",
      accountsBalance: "REKENING — SALDO SAAT INI",
      accountsHint: "Saldo awal + pemasukan masuk − belanja & pembayaran kartu keluar. Atur saldo awal di tab Kartu.",
      investmentsBalance: "INVESTASI — SALDO SAAT INI",
      realizedThisMonth: "Realisasi bulan ini",
      realizedThisYear: "Realisasi tahun ini",
      emptyTitle: "Belum ada catatan",
      emptyBody: "Tambahkan pemasukan atau pengeluaran pertamamu, dan ringkasan ini akan otomatis terisi.",
      emptyCta: "Buka Tambah",
    },
    addEntry: {
      expense: "Pengeluaran",
      income: "Pemasukan",
      description: "KETERANGAN",
      descPlaceholderExpense: "contoh: Makan siang Gojek",
      descPlaceholderIncome: "contoh: Gaji bulanan",
      amount: "JUMLAH (IDR)",
      date: "TANGGAL",
      group: "GRUP",
      category: "KATEGORI",
      incomeCategory: "KATEGORI PEMASUKAN",
      withdrawingFrom: "TARIK DARI",
      closesPosition: "Ini menutup posisi investasi",
      closesPositionHint: "Tidak ada sisa investasi di sini — selisih dari saldo yang tercatat akan dicatat sebagai untung atau rugi terealisasi.",
      fundSource: "SUMBER DANA",
      fundSourceHint: "Rekening asal pembayaran, atau kartu yang dipakai.",
      depositTo: "MASUK KE REKENING",
      depositToHint: "Pemasukan ini ditambahkan ke saldo rekening ini.",
      paidFrom: "DIBAYAR DARI",
      addExpense: "Tambah pengeluaran",
      addIncome: "Tambah pemasukan",
      errName: "Beri nama untuk catatan ini.",
      errAmount: "Masukkan jumlah lebih dari nol.",
      errDate: "Pilih tanggal.",
      errDepositTo: "Pilih rekening tujuan pemasukan ini.",
    },
    entries: {
      all: "Semua",
      expense: "Pengeluaran",
      income: "Pemasukan",
      noEntries: (label) => `Belum ada catatan untuk ${label}.`,
    },
    categories: {
      expenses: "Pengeluaran",
      income: "Pemasukan",
      hint: "Ketuk sebuah grup untuk melihat rinciannya per bulan, berdampingan.",
      category: "KATEGORI",
      total: "Total",
      emptyTitle: "Belum ada yang bisa dirinci",
      emptyBody: "Setelah kamu mencatat beberapa transaksi, tab ini akan menyusunnya per bulan, per kategori.",
    },
    manage: {
      expenseGroups: "Grup pengeluaran",
      income: "Pemasukan",
      hint: "Ketuk nama untuk mengubahnya — perubahan nama akan diterapkan di mana saja, termasuk catatan lama. Menghapus hanya menghilangkannya dari pilihan baru; catatan lama tetap menyimpan riwayatnya.",
      categoryCount: (n) => `${n} kategori`,
      entryCount: (n) => `${n} catatan`,
      addGroup: "Tambah grup",
      newGroupPlaceholder: "Nama grup baru…",
      addCategoryPlaceholder: "Tambah kategori…",
      addIncomeCategoryPlaceholder: "Tambah kategori pemasukan…",
    },
    cards: {
      hint: "Saldo terutang = semua yang dibelanjakan dengan kartu itu dikurangi pembayaran yang sudah dicatat. Ketuk limit atau nama kartu untuk mengubahnya. Gunakan \"Adjust balance\" untuk pengeluaran yang belum sempat dicatat sebagai transaksi — misalnya langganan yang kelupaan.",
      owedNow: "terutang saat ini",
      overLimit: (amt) => `Melebihi limit ${amt}`,
      available: (amt) => `${amt} tersedia`,
      entriesUseCard: (n) => `${n} catatan memakai kartu ini`,
      adjustBalance: "Adjust balance (pengeluaran tak tercatat)",
      increaseBalance: "Tambah saldo",
      decreaseBalance: "Kurangi saldo",
      amountPlaceholder: "Jumlah (IDR)",
      notePlaceholder: "Catatan (contoh: langganan Spotify yang kelupaan)",
      saveAdjustment: "Simpan penyesuaian",
      noCardsTitle: "Belum ada kartu",
      noCardsBody: "Tambahkan satu di bawah untuk mulai melacak limit dan saldonya.",
      addCard: "Tambah kartu",
      newCard: "Kartu baru",
      cardNamePlaceholder: "Nama kartu (contoh: GoPayLater)",
      limitPlaceholder: "Limit (IDR)",
      logPayment: "Catat pembayaran",
      card: "KARTU",
      amount: "JUMLAH (IDR)",
      date: "TANGGAL",
      logPaymentBtn: "Catat pembayaran",
      logPaymentHint: "Ini melunasi saldo kartu di atas dan mengurangi rekening yang kamu pakai untuk membayar. Tidak memengaruhi total pemasukan/pengeluaran atau Arus Kas Bersih, karena belanjanya sendiri sudah tercatat saat kamu membeli.",
      paidFrom: "DIBAYAR DARI",
      accountsTitle: "Rekening",
      accountsHint: "Saldo tunai dan bank aslimu. Ketuk angka besarnya untuk menyetel rekening ke jumlah yang benar-benar ada sekarang. Setelah itu saldo berubah sendiri seiring kamu mencatat pemasukan, belanja, dan pembayaran kartu. \"Saldo awal\" adalah kontrol lebih detail — jumlah sebelum catatan pertamamu.",
      openingBalanceLabel: "Saldo awal",
      liveBalanceLabel: "saldo saat ini",
      tapToEdit: "ketuk untuk mengatur",
      accountEntries: (n) => `${n} catatan memakai rekening ini`,
      addAccount: "Tambah rekening",
      newAccount: "Rekening baru",
      accountNamePlaceholder: "Nama rekening (contoh: Jago Pocket)",
      openingPlaceholder: "Saldo awal (IDR)",
    },
    data: {
      exportTitle: "Ekspor datamu",
      exportBody: (n) => `Mengunduh semua ${n} catatan sebagai satu file. Gunakan ini untuk memindahkan datamu ke perangkat lain, atau sekadar menyimpan cadangan.`,
      exportBtn: "Unduh cadangan (.json)",
      importTitle: "Impor data",
      importBody: "Pilih file cadangan yang diekspor dari aplikasi ini di perangkat lain.",
      chooseFile: "Pilih file…",
      entriesFound: (n) => `${n} catatan ditemukan`,
      fromFile: (name) => `Dari "${name}". Merge hanya menambahkan catatan yang belum kamu punya. Replace akan menghapus semua yang ada di perangkat ini terlebih dahulu.`,
      mergeBtn: "Gabungkan dengan data yang ada",
      replaceBtn: "Ganti semuanya",
      footerNote: "Data hanya tersimpan di browser perangkat ini. Mengekspor secara berkala adalah cara paling aman untuk menyimpan cadangan — menghapus data situs di browser akan menghapus semuanya tanpa bisa dipulihkan.",
    },
    help: {
      title: "Cara kerja aplikasi ini",
      subtitle: "Panduan singkat tentang aturan-aturan di dalam aplikasi ini.",
      sections: [
        {
          h: "Mulai dari mana",
          body: "Gunakan Tambah untuk mencatat pemasukan atau pengeluaran saat terjadi. Ringkasan menunjukkan gambaran besar; Transaksi menampilkan daftar mentah; Kategori merinci semuanya per bulan.",
        },
        {
          h: "Kartu kredit: catat sekali, saat beli",
          body: "Saat belanja pakai kartu kredit, catat pada hari kamu belanja — bukan pada hari kamu bayar tagihan. Membayar tagihan nanti bukan pengeluaran kedua; itu hanya melunasi utang yang sudah tercatat. Kalau dicatat dua kali, uang yang sama akan terhitung dua kali.",
        },
        {
          h: "Cicilan",
          body: "Sebar biayanya ke bulan-bulan saat tagihan benar-benar muncul, jangan dicatat sekaligus di hari beli — sama seperti cicilan kos atau mobil yang muncul tiap bulan.",
        },
        {
          h: "Investasi: beli vs tarik",
          body: "Beli saham, reksadana, forex, atau top-up RDN dicatat sebagai Pengeluaran di grup INVESTMENTS. Menarik uang kembali dicatat sebagai Pemasukan → Investment Withdrawal. Aktifkan \"Ini menutup posisi investasi\" hanya kalau kamu benar-benar keluar sepenuhnya — ini memberi tahu aplikasi untuk mencatat selisih dari saldo yang tercatat sebagai untung atau rugi terealisasi.",
        },
        {
          h: "Limit kartu kredit",
          body: "Saldo terutang = semua yang dibelanjakan dengan kartu itu dikurangi pembayaran yang sudah kamu catat. Kalau ada tagihan yang masuk ke kartu tanpa sempat dicatat (misalnya langganan yang kelupaan), gunakan \"Adjust balance\" di tab Kartu, bukan dipaksakan lewat catatan biasa.",
        },
        {
          h: "Rekening: uang aslimu",
          body: "Setiap rekening (BCA, Cash, dll.) punya saldo awal yang kamu atur sekali di tab Kartu — jumlah yang kamu punya sebelum catatan pertama. Saldo saat ini lalu bergerak sendiri: pemasukan ke rekening itu menambah, pengeluaran dari rekening itu mengurangi, dan pembayaran kartu dari rekening itu mengurangi. Saat mencatat pembayaran kartu, aplikasi menanyakan rekening asalnya supaya uang itu benar-benar keluar dari saldomu.",
        },
        {
          h: "Menghapus kategori",
          body: "Hanya menghilangkannya dari pilihan ke depan. Setiap catatan lama tetap memakai label aslinya — riwayatmu tidak berubah atau hilang.",
        },
        {
          h: "Mengubah nama kategori",
          body: "Memperbarui semua catatan lama yang memakainya, jadi riwayatmu tetap konsisten dengan nama barunya.",
        },
        {
          h: "Data kamu",
          body: "Semua data hanya tersimpan di browser perangkat ini. Tidak otomatis tersinkron ke perangkat lain — gunakan tab Data untuk mengekspor cadangan dan mengimpornya di perangkat lain.",
        },
      ],
    },
  },
};

const SEED_TRANSACTIONS = [];

/* ---------------------------------------------------------
   HELPERS
--------------------------------------------------------- */

const fmtIDR = (n) => {
  const v = Math.round(n || 0);
  const neg = v < 0;
  const s = Math.abs(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return (neg ? "-Rp " : "Rp ") + s;
};

const fmtShort = (n) => {
  const v = Math.round(n || 0);
  const abs = Math.abs(v);
  if (abs >= 1000000) return (v / 1000000).toFixed(abs >= 10000000 ? 0 : 1) + "jt";
  if (abs >= 1000) return (v / 1000).toFixed(0) + "rb";
  return v.toString();
};

const monthKey = (dateStr) => dateStr ? dateStr.slice(0, 7) : "";
const monthLabel = (mk) => {
  if (!mk) return "";
  const [y, m] = mk.split("-");
  return MONTH_LABELS[parseInt(m, 10) - 1] + " " + y;
};
const monthLabelShort = (mk) => {
  if (!mk) return "";
  const m = mk.split("-")[1];
  return MONTH_LABELS[parseInt(m, 10) - 1];
};
const yearOf = (mk) => (mk ? mk.slice(0, 4) : "");
const yearsFromMonths = (months) => {
  const set = new Set(months.map(yearOf));
  return Array.from(set).sort();
};

const uid = () => "t-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);

const todayISO = () => new Date().toISOString().slice(0, 10);

/* ---------------------------------------------------------
   INVESTMENT BALANCE ENGINE
   Walks all investment-related transactions in date order and
   tracks a running balance per investment category. A withdrawal
   flagged "closesPosition" wipes that category's balance to 0 and
   records the gap to/from the tracked balance as a realized gain
   or loss for that month.
--------------------------------------------------------- */

function computeInvestments(transactions) {
  const relevant = transactions
    .filter(
      (t) =>
        (t.type === "expense" && t.group === "INVESTMENTS") ||
        (t.type === "income" && t.category === "Investment Withdrawal")
    )
    .slice()
    .sort((a, b) => (a.date > b.date ? 1 : a.date < b.date ? -1 : 0));

  const balances = {};
  const ensure = (c) => {
    if (!(c in balances)) balances[c] = 0;
  };
  relevant.forEach((t) => {
    if (t.type === "expense") ensure(t.category);
    else ensure(t.investmentCategory || "Uncategorized");
  });
  const realizedEvents = []; // { date, mk, category, amount }

  relevant.forEach((t) => {
    if (t.type === "expense") {
      balances[t.category] = (balances[t.category] || 0) + t.amount;
    } else {
      const cat = t.investmentCategory || "Uncategorized";
      if (t.closesPosition) {
        const before = balances[cat] || 0;
        const realized = t.amount - before;
        balances[cat] = 0;
        realizedEvents.push({ date: t.date, mk: monthKey(t.date), category: cat, amount: realized });
      } else {
        balances[cat] = (balances[cat] || 0) - t.amount;
      }
    }
  });

  const total = Object.values(balances).reduce((a, b) => a + b, 0);
  return { balances, total, realizedEvents };
}

/* ---------------------------------------------------------
   CREDIT CARD BALANCE ENGINE
   Balance owed on a card = everything spent with that card as
   source, minus every "payment" logged against it. Payments are
   their own transaction type so they never affect income/expense
   totals or Net Cash Flow — they only settle a debt.
--------------------------------------------------------- */

function computeCardBalances(transactions, cardNames) {
  const balances = {};
  cardNames.forEach((c) => (balances[c] = 0));
  transactions.forEach((t) => {
    if (!(t.source in balances)) return;
    if (t.type === "expense") balances[t.source] += t.amount;
    else if (t.type === "payment") balances[t.source] -= t.amount;
    else if (t.type === "adjustment") balances[t.source] += t.direction === "decrease" ? -t.amount : t.amount;
  });
  return balances;
}

/* ---------------------------------------------------------
   ACCOUNT BALANCE ENGINE
   Live balance of a cash/bank account = its opening balance,
   plus every income received into it, minus every expense paid
   from it, minus every card payment made from it. Card payments
   carry the card in `source` (so the card's owed balance still
   drops) and the paying account in `fromAccount`.
--------------------------------------------------------- */

function computeAccountBalances(transactions, accounts) {
  const opening = accounts || {};
  const balances = {};
  Object.keys(opening).forEach((a) => (balances[a] = opening[a] || 0));
  transactions.forEach((t) => {
    if (t.type === "income" && t.source in balances) balances[t.source] += t.amount;
    else if (t.type === "expense" && t.source in balances) balances[t.source] -= t.amount;
    else if (t.type === "payment" && t.fromAccount && t.fromAccount in balances) {
      balances[t.fromAccount] -= t.amount;
    }
  });
  const total = Object.values(balances).reduce((a, b) => a + b, 0);
  return { balances, total };
}

/* ---------------------------------------------------------
   STORAGE
--------------------------------------------------------- */

const STORAGE_KEY = "axel-budget-transactions-v1";
const CATEGORY_STORAGE_KEY = "axel-budget-category-groups-v1";
const INCOME_CATEGORY_STORAGE_KEY = "axel-budget-income-categories-v1";
const CARD_LIMIT_STORAGE_KEY = "axel-budget-card-limits-v1";
const ACCOUNT_STORAGE_KEY = "axel-budget-accounts-v1";
const LANG_STORAGE_KEY = "axel-budget-lang-v1";

const DEFAULT_CARD_LIMITS = {
  "Credit Card BCA": 7000000,
  "SPayLater": 18900000,
  "YUP": 2000000,
};

/* ---------------------------------------------------------
   STORAGE
   Data lives only in this browser's localStorage — nothing is
   sent anywhere. Use the Data tab in-app to export/import a
   backup and move data between devices.
--------------------------------------------------------- */

async function loadTransactions() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // storage unavailable or empty
  }
  return null;
}

async function saveTransactions(txns) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(txns));
  } catch (e) {
    console.error("save failed", e);
  }
}

async function loadJSON(key) {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // storage unavailable or empty
  }
  return null;
}

async function saveJSON(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("save failed", e);
  }
}

/* ---------------------------------------------------------
   SMALL UI PRIMITIVES
--------------------------------------------------------- */

function Pill({ children, tone = "ink" }) {
  const tones = {
    ink: { background: "var(--ink)", color: "var(--paper)" },
    lime: { background: "var(--lime)", color: "var(--ink)" },
    blue: { background: "var(--blue)", color: "var(--paper)" },
    outline: { background: "transparent", color: "var(--ink)", border: "1.5px solid var(--ink)" },
  };
  return (
    <span
      style={{
        ...tones[tone],
        display: "inline-flex",
        alignItems: "center",
        padding: "5px 14px",
        borderRadius: 999,
        fontSize: 12.5,
        fontWeight: 700,
        letterSpacing: "0.01em",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

function IconPlus(props) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" {...props}>
      <path d="M8 2.5V13.5M2.5 8H13.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function IconArrowUp(props) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" {...props}>
      <path d="M8 13V3M8 3L3.5 7.5M8 3L12.5 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconArrowDown(props) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" {...props}>
      <path d="M8 3V13M8 13L3.5 8.5M8 13L12.5 8.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconTrash(props) {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" {...props}>
      <path d="M3 4.5H13M6 4.5V2.8C6 2.36 6.36 2 6.8 2H9.2C9.64 2 10 2.36 10 2.8V4.5M6.8 7.5V11.5M9.2 7.5V11.5M4 4.5L4.6 12.7C4.64 13.28 5.12 13.7 5.7 13.7H10.3C10.88 13.7 11.36 13.28 11.4 12.7L12 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ---------------------------------------------------------
   ROOT APP
--------------------------------------------------------- */

export default function App() {
  const [transactions, setTransactions] = useState(null);
  const [categoryGroups, setCategoryGroups] = useState(null);
  const [incomeCategories, setIncomeCategories] = useState(null);
  const [cardLimits, setCardLimits] = useState(null);
  const [accounts, setAccounts] = useState(null);
  const [lang, setLang] = useState(null);
  const [tab, setTab] = useState("overview");
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  useEffect(() => {
    (async () => {
      const stored = await loadTransactions();
      if (stored && stored.length) {
        setTransactions(stored);
      } else {
        setTransactions(SEED_TRANSACTIONS);
        await saveTransactions(SEED_TRANSACTIONS);
      }

      const storedCats = await loadJSON(CATEGORY_STORAGE_KEY);
      if (storedCats && Object.keys(storedCats).length) {
        setCategoryGroups(storedCats);
      } else {
        setCategoryGroups(DEFAULT_CATEGORY_GROUPS);
        await saveJSON(CATEGORY_STORAGE_KEY, DEFAULT_CATEGORY_GROUPS);
      }

      const storedIncome = await loadJSON(INCOME_CATEGORY_STORAGE_KEY);
      if (storedIncome && storedIncome.length) {
        setIncomeCategories(storedIncome);
      } else {
        setIncomeCategories(DEFAULT_INCOME_CATEGORIES);
        await saveJSON(INCOME_CATEGORY_STORAGE_KEY, DEFAULT_INCOME_CATEGORIES);
      }

      const storedLimits = await loadJSON(CARD_LIMIT_STORAGE_KEY);
      if (storedLimits && Object.keys(storedLimits).length) {
        setCardLimits(storedLimits);
      } else {
        setCardLimits(DEFAULT_CARD_LIMITS);
        await saveJSON(CARD_LIMIT_STORAGE_KEY, DEFAULT_CARD_LIMITS);
      }

      const storedAccounts = await loadJSON(ACCOUNT_STORAGE_KEY);
      if (storedAccounts && Object.keys(storedAccounts).length) {
        setAccounts(storedAccounts);
      } else {
        setAccounts(DEFAULT_ACCOUNTS);
        await saveJSON(ACCOUNT_STORAGE_KEY, DEFAULT_ACCOUNTS);
      }

      const storedLang = await loadJSON(LANG_STORAGE_KEY);
      setLang(storedLang === "en" || storedLang === "id" ? storedLang : "en");
    })();
  }, []);

  const months = useMemo(() => {
    if (!transactions) return [];
    const set = new Set(transactions.map((t) => monthKey(t.date)));
    return Array.from(set).sort();
  }, [transactions]);

  useEffect(() => {
    if (months.length && !selectedMonth) setSelectedMonth(months[months.length - 1]);
  }, [months]);

  const showToast = (msg) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2400);
  };

  const addTransaction = async (t) => {
    const next = [...transactions, { ...t, id: uid() }].sort((a, b) => (a.date < b.date ? 1 : -1));
    setTransactions(next);
    await saveTransactions(next);
    showToast("Entry added");
  };

  const deleteTransaction = async (id) => {
    const next = transactions.filter((t) => t.id !== id);
    setTransactions(next);
    await saveTransactions(next);
    showToast("Entry removed");
  };

  const importTransactions = async (incoming, mode) => {
    let next;
    if (mode === "replace") {
      next = incoming.slice().sort((a, b) => (a.date < b.date ? 1 : -1));
    } else {
      const byId = new Map(transactions.map((t) => [t.id, t]));
      let added = 0;
      incoming.forEach((t) => {
        if (!byId.has(t.id)) {
          byId.set(t.id, t);
          added += 1;
        }
      });
      next = Array.from(byId.values()).sort((a, b) => (a.date < b.date ? 1 : -1));
      setTransactions(next);
      await saveTransactions(next);
      showToast(added > 0 ? `Imported ${added} new entr${added === 1 ? "y" : "ies"}` : "Nothing new to import");
      return;
    }
    setTransactions(next);
    await saveTransactions(next);
    showToast(`Replaced with ${next.length} entries`);
  };

  /* ---- category management ---- */

  const updateCategoryGroups = async (next) => {
    setCategoryGroups(next);
    await saveJSON(CATEGORY_STORAGE_KEY, next);
  };

  const updateIncomeCategories = async (next) => {
    setIncomeCategories(next);
    await saveJSON(INCOME_CATEGORY_STORAGE_KEY, next);
  };

  const addGroup = async (name) => {
    const clean = name.trim();
    if (!clean || categoryGroups[clean]) {
      showToast("That group already exists");
      return false;
    }
    await updateCategoryGroups({ ...categoryGroups, [clean]: [] });
    showToast(`Added group "${clean}"`);
    return true;
  };

  const renameGroup = async (oldName, newName) => {
    const clean = newName.trim();
    if (!clean || clean === oldName || categoryGroups[clean]) {
      showToast("Pick a different name");
      return false;
    }
    const next = {};
    Object.keys(categoryGroups).forEach((g) => {
      next[g === oldName ? clean : g] = categoryGroups[g];
    });
    await updateCategoryGroups(next);
    const updatedTxns = transactions.map((t) => (t.group === oldName ? { ...t, group: clean } : t));
    setTransactions(updatedTxns);
    await saveTransactions(updatedTxns);
    showToast(`Renamed to "${clean}"`);
    return true;
  };

  const deleteGroup = async (name) => {
    const next = { ...categoryGroups };
    delete next[name];
    await updateCategoryGroups(next);
    showToast(`Deleted group "${name}"`);
  };

  const addCategory = async (group, name) => {
    const clean = name.trim();
    const existing = categoryGroups[group] || [];
    if (!clean || existing.includes(clean)) {
      showToast("That category already exists");
      return false;
    }
    await updateCategoryGroups({ ...categoryGroups, [group]: [...existing, clean] });
    showToast(`Added "${clean}"`);
    return true;
  };

  const renameCategory = async (group, oldName, newName) => {
    const clean = newName.trim();
    const existing = categoryGroups[group] || [];
    if (!clean || clean === oldName || existing.includes(clean)) {
      showToast("Pick a different name");
      return false;
    }
    const next = { ...categoryGroups, [group]: existing.map((c) => (c === oldName ? clean : c)) };
    await updateCategoryGroups(next);
    const updatedTxns = transactions.map((t) =>
      t.group === group && t.category === oldName ? { ...t, category: clean } : t
    );
    setTransactions(updatedTxns);
    await saveTransactions(updatedTxns);
    showToast(`Renamed to "${clean}"`);
    return true;
  };

  const deleteCategory = async (group, name) => {
    const existing = categoryGroups[group] || [];
    await updateCategoryGroups({ ...categoryGroups, [group]: existing.filter((c) => c !== name) });
    showToast(`Deleted "${name}"`);
  };

  const addIncomeCategory = async (name) => {
    const clean = name.trim();
    if (!clean || incomeCategories.includes(clean)) {
      showToast("That category already exists");
      return false;
    }
    await updateIncomeCategories([...incomeCategories, clean]);
    showToast(`Added "${clean}"`);
    return true;
  };

  const renameIncomeCategory = async (oldName, newName) => {
    const clean = newName.trim();
    if (!clean || clean === oldName || incomeCategories.includes(clean)) {
      showToast("Pick a different name");
      return false;
    }
    const next = incomeCategories.map((c) => (c === oldName ? clean : c));
    await updateIncomeCategories(next);
    const updatedTxns = transactions.map((t) =>
      t.type === "income" && t.category === oldName ? { ...t, category: clean } : t
    );
    setTransactions(updatedTxns);
    await saveTransactions(updatedTxns);
    showToast(`Renamed to "${clean}"`);
    return true;
  };

  const deleteIncomeCategory = async (name) => {
    await updateIncomeCategories(incomeCategories.filter((c) => c !== name));
    showToast(`Deleted "${name}"`);
  };

  const countUsage = (group, category) =>
    transactions.filter((t) => t.group === group && t.category === category).length;

  /* ---- credit card management ---- */

  const addPayment = async (payment) => {
    const entry = {
      ...payment,
      type: "payment",
      group: "CC PAYMENT",
      category: "Payment",
      id: uid(),
    };
    const next = [...transactions, entry].sort((a, b) => (a.date < b.date ? 1 : -1));
    setTransactions(next);
    await saveTransactions(next);
    showToast("Payment logged");
  };

  const addAdjustment = async (adjustment) => {
    const entry = {
      ...adjustment,
      type: "adjustment",
      group: "CC ADJUSTMENT",
      category: "Adjustment",
      id: uid(),
    };
    const next = [...transactions, entry].sort((a, b) => (a.date < b.date ? 1 : -1));
    setTransactions(next);
    await saveTransactions(next);
    showToast("Balance adjusted");
  };

  const updateCardLimit = async (card, amount) => {
    const next = { ...cardLimits, [card]: amount };
    setCardLimits(next);
    await saveJSON(CARD_LIMIT_STORAGE_KEY, next);
    showToast("Limit updated");
  };

  const addCard = async (name, limit) => {
    const clean = name.trim();
    if (!clean || cardLimits[clean]) {
      showToast("That card already exists");
      return false;
    }
    const next = { ...cardLimits, [clean]: limit };
    setCardLimits(next);
    await saveJSON(CARD_LIMIT_STORAGE_KEY, next);
    showToast(`Added "${clean}"`);
    return true;
  };

  const renameCard = async (oldName, newName) => {
    const clean = newName.trim();
    if (!clean || clean === oldName || cardLimits[clean]) {
      showToast("Pick a different name");
      return false;
    }
    const next = {};
    Object.keys(cardLimits).forEach((c) => {
      next[c === oldName ? clean : c] = cardLimits[c];
    });
    setCardLimits(next);
    await saveJSON(CARD_LIMIT_STORAGE_KEY, next);
    const updatedTxns = transactions.map((t) => (t.source === oldName ? { ...t, source: clean } : t));
    setTransactions(updatedTxns);
    await saveTransactions(updatedTxns);
    showToast(`Renamed to "${clean}"`);
    return true;
  };

  const deleteCard = async (name) => {
    const next = { ...cardLimits };
    delete next[name];
    setCardLimits(next);
    await saveJSON(CARD_LIMIT_STORAGE_KEY, next);
    showToast(`Deleted "${name}"`);
  };

  const countSourceUsage = (source) =>
    transactions.filter((t) => t.source === source || t.fromAccount === source).length;

  /* ---- account management ---- */

  const updateAccountOpening = async (name, amount) => {
    const next = { ...accounts, [name]: amount };
    setAccounts(next);
    await saveJSON(ACCOUNT_STORAGE_KEY, next);
    showToast("Balance updated");
  };

  const addAccount = async (name, opening) => {
    const clean = name.trim();
    if (!clean || clean in accounts) {
      showToast("That account already exists");
      return false;
    }
    const next = { ...accounts, [clean]: opening || 0 };
    setAccounts(next);
    await saveJSON(ACCOUNT_STORAGE_KEY, next);
    showToast(`Added "${clean}"`);
    return true;
  };

  const renameAccount = async (oldName, newName) => {
    const clean = newName.trim();
    if (!clean || clean === oldName || clean in accounts) {
      showToast("Pick a different name");
      return false;
    }
    const next = {};
    Object.keys(accounts).forEach((a) => {
      next[a === oldName ? clean : a] = accounts[a];
    });
    setAccounts(next);
    await saveJSON(ACCOUNT_STORAGE_KEY, next);
    const updatedTxns = transactions.map((tx) => {
      let out = tx;
      if (tx.source === oldName) out = { ...out, source: clean };
      if (tx.fromAccount === oldName) out = { ...out, fromAccount: clean };
      return out;
    });
    setTransactions(updatedTxns);
    await saveTransactions(updatedTxns);
    showToast(`Renamed to "${clean}"`);
    return true;
  };

  const deleteAccount = async (name) => {
    if (Object.keys(accounts).length <= 1) {
      showToast("Keep at least one account");
      return;
    }
    const next = { ...accounts };
    delete next[name];
    setAccounts(next);
    await saveJSON(ACCOUNT_STORAGE_KEY, next);
    showToast(`Deleted "${name}"`);
  };

  const setLanguage = async (next) => {
    setLang(next);
    await saveJSON(LANG_STORAGE_KEY, next);
  };

  if (!transactions || !categoryGroups || !incomeCategories || !cardLimits || !accounts || !lang) {
    return (
      <Shell>
        <div style={{ padding: 60, textAlign: "center", color: "var(--muted)", fontWeight: 600 }}>
          Loading your budget…
        </div>
      </Shell>
    );
  }

  const t = STRINGS[lang];

  return (
    <Shell>
      <Header tab={tab} setTab={setTab} lang={lang} setLang={setLanguage} t={t} />
      <div style={{ padding: "0 20px 100px" }}>
        {tab === "overview" && (
          <Overview transactions={transactions} months={months} categoryGroups={categoryGroups} accounts={accounts} t={t} setTab={setTab} />
        )}
        {tab === "add" && (
          <AddEntry
            onAdd={addTransaction}
            months={months}
            categoryGroups={categoryGroups}
            incomeCategories={incomeCategories}
            cardLimits={cardLimits}
            accounts={accounts}
            t={t}
          />
        )}
        {tab === "categories" && (
          <CategoryMatrix
            transactions={transactions}
            months={months}
            categoryGroups={categoryGroups}
            incomeCategories={incomeCategories}
            t={t}
          />
        )}
        {tab === "entries" && (
          <EntryList
            transactions={transactions}
            months={months}
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
            onDelete={deleteTransaction}
            t={t}
          />
        )}
        {tab === "manage" && (
          <ManageCategories
            categoryGroups={categoryGroups}
            incomeCategories={incomeCategories}
            countUsage={countUsage}
            onAddGroup={addGroup}
            onRenameGroup={renameGroup}
            onDeleteGroup={deleteGroup}
            onAddCategory={addCategory}
            onRenameCategory={renameCategory}
            onDeleteCategory={deleteCategory}
            onAddIncomeCategory={addIncomeCategory}
            onRenameIncomeCategory={renameIncomeCategory}
            onDeleteIncomeCategory={deleteIncomeCategory}
            t={t}
          />
        )}
        {tab === "data" && <DataTab transactions={transactions} onImport={importTransactions} showToast={showToast} t={t} />}
        {tab === "cards" && (
          <CardsTab
            transactions={transactions}
            cardLimits={cardLimits}
            accounts={accounts}
            countSourceUsage={countSourceUsage}
            onAddPayment={addPayment}
            onAddAdjustment={addAdjustment}
            onUpdateLimit={updateCardLimit}
            onAddCard={addCard}
            onRenameCard={renameCard}
            onDeleteCard={deleteCard}
            onUpdateAccountOpening={updateAccountOpening}
            onAddAccount={addAccount}
            onRenameAccount={renameAccount}
            onDeleteAccount={deleteAccount}
            t={t}
          />
        )}
        {tab === "help" && <HelpTab t={t} />}
      </div>
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            background: "var(--ink)",
            color: "var(--paper)",
            padding: "12px 22px",
            borderRadius: 999,
            fontWeight: 700,
            fontSize: 13.5,
            boxShadow: "0 8px 24px rgba(20,22,26,0.25)",
            zIndex: 50,
          }}
        >
          {toast}
        </div>
      )}
    </Shell>
  );
}

/* ---------------------------------------------------------
   SHELL / THEME
--------------------------------------------------------- */

function Shell({ children }) {
  // Mouse wheel → horizontal scroll for the pill strips (month/year pickers,
  // the category matrix). On touch you swipe; a plain mouse has no easy way
  // to scroll these sideways, so translate vertical wheel into scrollLeft
  // whenever the pointer is over an overflowing strip.
  useEffect(() => {
    const onWheel = (e) => {
      const strip = e.target.closest && e.target.closest(".no-scrollbar");
      if (!strip) return;
      if (strip.scrollWidth <= strip.clientWidth) return;
      if (e.deltaY === 0 || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      e.preventDefault();
      strip.scrollLeft += e.deltaY;
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, []);

  return (
    <div
      style={{
        "--ink": "#14161A",
        "--paper": "#EFEDF5",
        "--white": "#FFFFFF",
        "--blue": "#2E44F2",
        "--blue-deep": "#1E2FB8",
        "--lime": "#D3FF4D",
        "--muted": "#6B6E7A",
        "--line": "rgba(20,22,26,0.10)",
        "--red": "#E5484D",
        fontFamily: "'Space Grotesk', 'Inter', -apple-system, sans-serif",
        background: "var(--paper)",
        minHeight: "100vh",
        color: "var(--ink)",
        width: "100%",
        maxWidth: 820,
        margin: "0 auto",
        position: "relative",
      }}
    >
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; }
        input, select, button { font-family: inherit; }
        input:focus, select:focus { outline: none; }
        ::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        /* On mouse/trackpad devices, give the horizontal pill strips a real
           scrollbar so they're not swipe-only. */
        @media (hover: hover) and (pointer: fine) {
          .no-scrollbar { scrollbar-width: thin; scrollbar-color: rgba(20,22,26,0.25) transparent; }
          .no-scrollbar::-webkit-scrollbar { display: block; height: 8px; }
          .no-scrollbar::-webkit-scrollbar-thumb { background: rgba(20,22,26,0.22); border-radius: 999px; }
          .no-scrollbar::-webkit-scrollbar-track { background: transparent; }
        }
      `}</style>
      {children}
    </div>
  );
}

/* ---------------------------------------------------------
   HEADER + TABS
--------------------------------------------------------- */

function Header({ tab, setTab, lang, setLang, t }) {
  const tabs = [
    { id: "overview", label: t.nav.overview },
    { id: "categories", label: t.nav.categories },
    { id: "entries", label: t.nav.entries },
    { id: "add", label: t.nav.add },
    { id: "manage", label: t.nav.manage },
    { id: "cards", label: t.nav.cards },
    { id: "data", label: t.nav.data },
    { id: "help", label: t.nav.help },
  ];
  return (
    <div style={{ position: "sticky", top: 0, zIndex: 10, background: "var(--paper)", paddingTop: 22 }}>
      <div style={{ padding: "0 20px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, letterSpacing: "-0.01em", lineHeight: 1.15 }}>
              Daily
              <br />
              <span style={{ position: "relative", display: "inline-block" }}>
                Budgeting
                <svg
                  width="120"
                  height="10"
                  viewBox="0 0 120 10"
                  style={{ position: "absolute", left: 0, bottom: -6 }}
                >
                  <path d="M2 7C28 2 92 2 118 7" stroke="var(--lime)" strokeWidth="4" strokeLinecap="round" fill="none" />
                </svg>
              </span>
            </h1>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", marginTop: 10 }}>by Axel Dilvala</div>
          </div>
          <div style={{ display: "flex", borderRadius: 999, background: "var(--white)", padding: 3, flexShrink: 0 }}>
            {["en", "id"].map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                style={{
                  padding: "6px 12px",
                  borderRadius: 999,
                  border: "none",
                  fontWeight: 700,
                  fontSize: 11.5,
                  cursor: "pointer",
                  background: lang === l ? "var(--ink)" : "transparent",
                  color: lang === l ? "var(--white)" : "var(--muted)",
                  textTransform: "uppercase",
                }}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div
        className="no-scrollbar"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          padding: "18px 20px 14px",
          overflowX: "auto",
        }}
      >
        {tabs.map((tb) => (
          <button
            key={tb.id}
            onClick={() => setTab(tb.id)}
            style={{
              padding: "9px 16px",
              borderRadius: 999,
              border: "none",
              fontWeight: 700,
              fontSize: 13.5,
              cursor: "pointer",
              flexShrink: 0,
              background: tab === tb.id ? "var(--blue)" : "var(--white)",
              color: tab === tb.id ? "var(--white)" : "var(--ink)",
              transition: "background 0.15s ease",
            }}
          >
            {tb.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   CARD PRIMITIVE
--------------------------------------------------------- */

function Card({ children, tone = "white", style }) {
  const bg = tone === "ink" ? "var(--ink)" : tone === "blue" ? "var(--blue)" : tone === "lime" ? "var(--lime)" : "var(--white)";
  const color = tone === "ink" || tone === "blue" ? "var(--white)" : "var(--ink)";
  return (
    <div
      style={{
        background: bg,
        color,
        borderRadius: 20,
        padding: 20,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ---------------------------------------------------------
   OVERVIEW TAB
--------------------------------------------------------- */

function YearPicker({ years, selectedYear, setSelectedYear }) {
  if (years.length <= 1) return null;
  return (
    <div className="no-scrollbar" style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
      {years.map((y) => (
        <button
          key={y}
          onClick={() => setSelectedYear(y)}
          style={{
            flexShrink: 0,
            padding: "7px 16px",
            borderRadius: 999,
            border: "none",
            background: y === selectedYear ? "var(--lime)" : "var(--white)",
            color: "var(--ink)",
            fontWeight: 700,
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          {y}
        </button>
      ))}
    </div>
  );
}

function MonthPicker({ months, selectedMonth, setSelectedMonth, includeAll, wholeYearLabel }) {
  return (
    <div className="no-scrollbar" style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
      {includeAll && (
        <button
          onClick={() => setSelectedMonth("ALL")}
          style={{
            flexShrink: 0,
            padding: "8px 14px",
            borderRadius: 999,
            border: "ALL" === selectedMonth ? "none" : "1.5px solid var(--line)",
            background: "ALL" === selectedMonth ? "var(--blue)" : "transparent",
            color: "ALL" === selectedMonth ? "var(--white)" : "var(--ink)",
            fontWeight: 700,
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          {wholeYearLabel || "Whole Year"}
        </button>
      )}
      {months.map((mk) => (
        <button
          key={mk}
          onClick={() => setSelectedMonth(mk)}
          style={{
            flexShrink: 0,
            padding: "8px 14px",
            borderRadius: 999,
            border: mk === selectedMonth ? "none" : "1.5px solid var(--line)",
            background: mk === selectedMonth ? "var(--ink)" : "transparent",
            color: mk === selectedMonth ? "var(--white)" : "var(--ink)",
            fontWeight: 700,
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          {monthLabelShort(mk)}
        </button>
      ))}
    </div>
  );
}

function periodLabel(mk, year, wholeYearLabel) {
  return mk === "ALL" ? `${wholeYearLabel || "Whole Year"} ${year || ""}`.trim() : monthLabel(mk);
}

function Overview({ transactions, months, accounts, t, setTab }) {
  const years = useMemo(() => yearsFromMonths(months), [months]);
  const [year, setYear] = useState(null);
  useEffect(() => {
    if (years.length && !year) setYear(years[years.length - 1]);
  }, [years]);

  const monthsInYear = useMemo(() => months.filter((mk) => yearOf(mk) === year), [months, year]);

  const [period, setPeriod] = useState(null);
  useEffect(() => {
    if (monthsInYear.length) setPeriod(monthsInYear[monthsInYear.length - 1]);
  }, [year, monthsInYear.length]);
  const selectedMonth = period || "ALL";
  const setSelectedMonth = setPeriod;

  const handleYearChange = (y) => {
    setYear(y);
    setPeriod(null);
  };

  const monthTxns = useMemo(
    () =>
      transactions.filter((t) =>
        selectedMonth === "ALL" ? yearOf(monthKey(t.date)) === year : monthKey(t.date) === selectedMonth
      ),
    [transactions, selectedMonth, year]
  );

  const income = monthTxns.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expense = monthTxns.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const net = income - expense;

  const prevIdx = monthsInYear.indexOf(selectedMonth) - 1;
  const prevMonth = prevIdx >= 0 ? monthsInYear[prevIdx] : null;
  const prevExpense = prevMonth
    ? transactions.filter((t) => monthKey(t.date) === prevMonth && t.type === "expense").reduce((s, t) => s + t.amount, 0)
    : null;
  const expenseDelta = prevExpense != null && prevExpense > 0 ? ((expense - prevExpense) / prevExpense) * 100 : null;

  const chartData = useMemo(() => {
    return monthsInYear.map((mk) => {
      const rows = transactions.filter((t) => monthKey(t.date) === mk);
      const inc = rows.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
      const exp = rows.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
      return { month: monthLabelShort(mk), income: inc, expense: exp, mk };
    });
  }, [transactions, monthsInYear]);

  const groupTotals = useMemo(() => {
    const totals = {};
    monthTxns.filter((t) => t.type === "expense").forEach((t) => {
      totals[t.group] = (totals[t.group] || 0) + t.amount;
    });
    return Object.entries(totals).sort((a, b) => b[1] - a[1]);
  }, [monthTxns]);


  const topCategory = groupTotals[0];

  const accountData = useMemo(
    () => computeAccountBalances(transactions, accounts),
    [transactions, accounts]
  );

  const investments = useMemo(() => computeInvestments(transactions), [transactions]);
  const realizedFiltered = investments.realizedEvents.filter((e) =>
    selectedMonth === "ALL" ? yearOf(e.mk) === year : e.mk === selectedMonth
  );
  const realizedThisMonth = realizedFiltered.reduce((s, e) => s + e.amount, 0);
  const hasRealizedThisMonth = realizedFiltered.length > 0;

  if (transactions.length === 0) {
    return (
      <div style={{ paddingTop: 60, textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{t.overview.emptyTitle}</div>
        <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600, lineHeight: 1.6, maxWidth: 280, margin: "0 auto 18px" }}>
          {t.overview.emptyBody}
        </div>
        <button
          onClick={() => setTab && setTab("add")}
          style={{
            padding: "12px 22px", borderRadius: 999, border: "none", background: "var(--blue)",
            color: "var(--white)", fontWeight: 700, fontSize: 13.5, cursor: "pointer",
          }}
        >
          {t.overview.emptyCta}
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingTop: 4 }}>
      <YearPicker years={years} selectedYear={year} setSelectedYear={handleYearChange} />
      <MonthPicker months={monthsInYear} selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth} includeAll wholeYearLabel={t.common.wholeYear} />

      <Card tone="ink" style={{ position: "relative", overflow: "hidden" }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, opacity: 0.65, marginBottom: 6 }}>
          {t.overview.netCashFlow} — {periodLabel(selectedMonth, year, t.common.wholeYear).toUpperCase()}
        </div>
        <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
          {fmtIDR(net)}
        </div>
        <div style={{ display: "flex", gap: 20, marginTop: 16 }}>
          <div>
            <div style={{ fontSize: 11.5, opacity: 0.6, fontWeight: 600, marginBottom: 2 }}>{t.overview.income}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--lime)" }}>{fmtIDR(income)}</div>
          </div>
          <div>
            <div style={{ fontSize: 11.5, opacity: 0.6, fontWeight: 600, marginBottom: 2 }}>{t.overview.expenses}</div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{fmtIDR(expense)}</div>
          </div>
        </div>
        <svg width="120" height="120" viewBox="0 0 120 120" style={{ position: "absolute", right: -20, top: -20, opacity: 0.9 }}>
          <circle cx="60" cy="60" r="50" fill="none" stroke="var(--lime)" strokeWidth="2" opacity="0.35" />
        </svg>
      </Card>

      {Object.keys(accountData.balances).length > 0 && (
        <Card>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--muted)", marginBottom: 6 }}>
            {t.overview.accountsBalance}
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 14, color: accountData.total < 0 ? "var(--red)" : "var(--ink)" }}>
            {fmtIDR(accountData.total)}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {Object.keys(accountData.balances).map((name) => {
              const bal = accountData.balances[name] || 0;
              return (
                <div key={name} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600 }}>
                  <span>{name}</span>
                  <span style={{ color: bal < 0 ? "var(--red)" : "var(--ink)", fontWeight: 700 }}>{fmtIDR(bal)}</span>
                </div>
              );
            })}
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, lineHeight: 1.5, marginTop: 12 }}>
            {t.overview.accountsHint}
          </div>
        </Card>
      )}

      <div style={{ display: "flex", gap: 12 }}>
        <Card style={{ flex: 1, padding: 16 }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--muted)", marginBottom: 6 }}>{t.overview.vsLastMonth}</div>
          {expenseDelta == null ? (
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--muted)" }}>—</div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 4, color: expenseDelta > 0 ? "var(--red)" : "#2E9B5B" }}>
              {expenseDelta > 0 ? <IconArrowUp /> : <IconArrowDown />}
              <span style={{ fontSize: 17, fontWeight: 700 }}>{Math.abs(expenseDelta).toFixed(0)}%</span>
            </div>
          )}
        </Card>
        <Card style={{ flex: 1, padding: 16 }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--muted)", marginBottom: 6 }}>{t.overview.topCategory}</div>
          {topCategory ? (
            <>
              <div style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 2 }}>{topCategory[0]}</div>
              <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600 }}>{fmtShort(topCategory[1])}</div>
            </>
          ) : (
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--muted)" }}>—</div>
          )}
        </Card>
      </div>

      <Card>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--muted)", marginBottom: 14 }}>
          {t.overview.incomeVsExpense}
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} barGap={3} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--line)" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fontWeight: 600, fill: "var(--muted)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "var(--muted)" }} axisLine={false} tickLine={false} tickFormatter={fmtShort} width={40} />
            <Tooltip
              formatter={(v) => fmtIDR(v)}
              contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 8px 24px rgba(20,22,26,0.15)", fontSize: 12.5, fontWeight: 600 }}
            />
            <Bar dataKey="income" fill="#D3FF4D" radius={[4, 4, 0, 0]} maxBarSize={12} />
            <Bar dataKey="expense" fill="#2E44F2" radius={[4, 4, 0, 0]} maxBarSize={12} />
          </BarChart>
        </ResponsiveContainer>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: "#D3FF4D" }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)" }}>{t.overview.income}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: "#2E44F2" }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)" }}>{t.overview.expenses}</span>
          </div>
        </div>
      </Card>

      <Card>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--muted)", marginBottom: 14 }}>
          {t.overview.spendingByGroup} — {periodLabel(selectedMonth, year, t.common.wholeYear).toUpperCase()}
        </div>
        {groupTotals.length === 0 && (
          <div style={{ fontSize: 13.5, color: "var(--muted)", fontWeight: 600, padding: "10px 0" }}>
            {t.overview.noExpenses}
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {groupTotals.map(([group, amount]) => {
            const pct = expense > 0 ? (amount / expense) * 100 : 0;
            return (
              <div key={group}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
                  <span>{group}</span>
                  <span style={{ color: "var(--muted)", fontWeight: 600 }}>{fmtIDR(amount)}</span>
                </div>
                <div style={{ height: 8, borderRadius: 999, background: "var(--paper)", overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: "var(--blue)", borderRadius: 999 }} />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card tone="blue">
        <div style={{ fontSize: 12.5, fontWeight: 700, opacity: 0.75, marginBottom: 6 }}>{t.overview.investmentsBalance}</div>
        <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 14 }}>{fmtIDR(investments.total)}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {Object.keys(investments.balances).map((cat) => (
            <div key={cat} style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, fontWeight: 600, opacity: 0.9 }}>
              <span>{cat}</span>
              <span>{fmtShort(investments.balances[cat] || 0)}</span>
            </div>
          ))}
        </div>
        {hasRealizedThisMonth && (
          <div
            style={{
              marginTop: 14, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.2)",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}
          >
            <span style={{ fontSize: 12.5, fontWeight: 700, opacity: 0.8 }}>
              {selectedMonth === "ALL" ? t.overview.realizedThisYear : t.overview.realizedThisMonth}
            </span>
            <span style={{ fontSize: 15, fontWeight: 700, color: realizedThisMonth >= 0 ? "var(--lime)" : "#FF9D9D" }}>
              {realizedThisMonth >= 0 ? "+" : ""}
              {fmtIDR(realizedThisMonth)}
            </span>
          </div>
        )}
      </Card>
    </div>
  );
}


/* ---------------------------------------------------------
   CATEGORY MATRIX TAB
--------------------------------------------------------- */

function CategoryMatrix({ transactions, months, categoryGroups, incomeCategories, t }) {
  const groupOrder = Object.keys(categoryGroups);
  const [openGroups, setOpenGroups] = useState(() => new Set([groupOrder[0]]));
  const [view, setView] = useState("expense");

  const years = useMemo(() => yearsFromMonths(months), [months]);
  const [year, setYear] = useState(null);
  useEffect(() => {
    if (years.length && !year) setYear(years[years.length - 1]);
  }, [years]);
  const monthsInYear = useMemo(() => months.filter((mk) => yearOf(mk) === year), [months, year]);

  const data = useMemo(() => {
    const map = {};
    transactions.forEach((t) => {
      if (t.type !== view) return;
      const mk = monthKey(t.date);
      const group = t.type === "income" ? "INCOME" : t.group;
      const cat = t.category;
      map[group] = map[group] || {};
      map[group][cat] = map[group][cat] || {};
      map[group][cat][mk] = (map[group][cat][mk] || 0) + t.amount;
    });
    return map;
  }, [transactions, view]);

  const groupsToShow = view === "income" ? ["INCOME"] : groupOrder;

  const toggle = (g) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      next.has(g) ? next.delete(g) : next.add(g);
      return next;
    });
  };

  const groupMonthTotal = (group, mk) => {
    const cats = data[group];
    if (!cats) return 0;
    return Object.values(cats).reduce((s, byMonth) => s + (byMonth[mk] || 0), 0);
  };

  const grandTotal = (group) => monthsInYear.reduce((s, mk) => s + groupMonthTotal(group, mk), 0);

  const rowTotalInYear = (group, cat) => {
    const rowData = (data[group] && data[group][cat]) || {};
    return monthsInYear.reduce((s, mk) => s + (rowData[mk] || 0), 0);
  };

  if (transactions.length === 0) {
    return (
      <div style={{ paddingTop: 60, textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🗂️</div>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{t.categories.emptyTitle}</div>
        <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600, lineHeight: 1.6, maxWidth: 280, margin: "0 auto" }}>
          {t.categories.emptyBody}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingTop: 4 }}>
      <YearPicker years={years} selectedYear={year} setSelectedYear={setYear} />
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={() => setView("expense")}
          style={{
            flex: 1, padding: "10px 0", borderRadius: 12, border: "none", fontWeight: 700, fontSize: 13.5, cursor: "pointer",
            background: view === "expense" ? "var(--blue)" : "var(--white)", color: view === "expense" ? "var(--white)" : "var(--ink)",
          }}
        >
          {t.categories.expenses}
        </button>
        <button
          onClick={() => setView("income")}
          style={{
            flex: 1, padding: "10px 0", borderRadius: 12, border: "none", fontWeight: 700, fontSize: 13.5, cursor: "pointer",
            background: view === "income" ? "var(--blue)" : "var(--white)", color: view === "income" ? "var(--white)" : "var(--ink)",
          }}
        >
          {t.categories.income}
        </button>
      </div>

      <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600, padding: "0 2px" }}>
        {t.categories.hint}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {groupsToShow.map((group) => {
          const isOpen = openGroups.has(group);
          const total = grandTotal(group);
          if (total === 0 && view === "expense") {
            // still show, but visually muted — skip fully empty groups for income view noise
          }
          const cats = view === "income" ? incomeCategories : categoryGroups[group];

          return (
            <Card key={group} style={{ padding: 0, overflow: "hidden" }}>
              <button
                onClick={() => toggle(group)}
                style={{
                  width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "16px 18px", background: "transparent", border: "none", cursor: "pointer", textAlign: "left",
                }}
              >
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 700 }}>{group}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600, marginTop: 2 }}>{fmtIDR(total)} total</div>
                </div>
                <div
                  style={{
                    width: 26, height: 26, borderRadius: 999, background: "var(--paper)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transform: isOpen ? "rotate(45deg)" : "none", transition: "transform 0.15s ease", flexShrink: 0,
                  }}
                >
                  <IconPlus />
                </div>
              </button>

              {isOpen && (
                <div style={{ overflowX: "auto" }} className="no-scrollbar">
                  <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 12 }}>
                    <thead>
                      <tr style={{ borderTop: "1px solid var(--line)" }}>
                        <th
                          style={{
                            textAlign: "left", padding: "10px 18px", fontWeight: 700, color: "var(--muted)",
                            position: "sticky", left: 0, background: "var(--white)", minWidth: 130, fontSize: 11,
                          }}
                        >
                          {t.categories.category}
                        </th>
                        {monthsInYear.map((mk) => (
                          <th key={mk} style={{ textAlign: "right", padding: "10px 12px", fontWeight: 700, color: "var(--muted)", minWidth: 78, fontSize: 11 }}>
                            {monthLabelShort(mk)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {cats.map((cat) => {
                        const rowData = (data[group] && data[group][cat]) || {};
                        const rowTotal = rowTotalInYear(group, cat);
                        if (rowTotal === 0) return null;
                        return (
                          <tr key={cat} style={{ borderTop: "1px solid var(--line)" }}>
                            <td style={{ padding: "10px 18px", fontWeight: 600, position: "sticky", left: 0, background: "var(--white)" }}>
                              {cat}
                            </td>
                            {monthsInYear.map((mk) => (
                              <td key={mk} style={{ textAlign: "right", padding: "10px 12px", fontWeight: 600, color: rowData[mk] ? "var(--ink)" : "var(--line)" }}>
                                {rowData[mk] ? fmtShort(rowData[mk]) : "–"}
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                      <tr style={{ borderTop: "1.5px solid var(--ink)" }}>
                        <td style={{ padding: "10px 18px", fontWeight: 700, position: "sticky", left: 0, background: "var(--white)" }}>{t.categories.total}</td>
                        {monthsInYear.map((mk) => (
                          <td key={mk} style={{ textAlign: "right", padding: "10px 12px", fontWeight: 700 }}>
                            {fmtShort(groupMonthTotal(group, mk))}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}


/* ---------------------------------------------------------
   ENTRY LIST TAB
--------------------------------------------------------- */

function EntryList({ transactions, months, selectedMonth, setSelectedMonth, onDelete, t }) {
  const [filter, setFilter] = useState("all");
  const [confirmId, setConfirmId] = useState(null);

  const years = useMemo(() => yearsFromMonths(months), [months]);
  const [year, setYear] = useState(null);
  useEffect(() => {
    if (years.length && !year) setYear(yearOf(selectedMonth) || years[years.length - 1]);
  }, [years]);

  const monthsInYear = useMemo(() => months.filter((mk) => yearOf(mk) === year), [months, year]);

  const handleYearChange = (y) => {
    setYear(y);
    const inYear = months.filter((mk) => yearOf(mk) === y);
    if (inYear.length) setSelectedMonth(inYear[inYear.length - 1]);
  };

  const rows = useMemo(() => {
    return transactions
      .filter((t) => monthKey(t.date) === selectedMonth)
      .filter((t) => filter === "all" || t.type === filter)
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [transactions, selectedMonth, filter]);

  const filterLabels = { all: t.entries.all, expense: t.entries.expense, income: t.entries.income };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingTop: 4 }}>
      <YearPicker years={years} selectedYear={year} setSelectedYear={handleYearChange} />
      <MonthPicker months={monthsInYear} selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth} />

      <div style={{ display: "flex", gap: 8 }}>
        {["all", "expense", "income"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "7px 14px", borderRadius: 999, border: "none", fontWeight: 700, fontSize: 12.5, cursor: "pointer",
              background: filter === f ? "var(--ink)" : "var(--white)", color: filter === f ? "var(--white)" : "var(--ink)",
            }}
          >
            {filterLabels[f]}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {rows.length === 0 && (
          <Card style={{ textAlign: "center", color: "var(--muted)", fontWeight: 600, fontSize: 13.5 }}>
            {t.entries.noEntries(monthLabel(selectedMonth))}
          </Card>
        )}
        {rows.map((t) => (
          <Card key={t.id} style={{ padding: 14, display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 38, height: 38, borderRadius: 12, flexShrink: 0,
                background: t.type === "income" ? "var(--lime)" : "var(--paper)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              {t.type === "income" ? <IconArrowDown style={{ transform: "rotate(180deg)" }} /> : <IconArrowUp style={{ transform: "rotate(180deg)" }} />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {t.name}
              </div>
              <div style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 600, marginTop: 2 }}>
                {t.date} · {t.category}
                {t.investmentCategory ? ` (${t.investmentCategory}${t.closesPosition ? ", closed" : ""})` : ""}
              </div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: t.type === "income" ? "#2E9B5B" : "var(--ink)" }}>
                {t.type === "income" ? "+" : "-"}{fmtShort(t.amount)}
              </div>
            </div>
            {confirmId === t.id ? (
              <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                <button
                  onClick={() => { onDelete(t.id); setConfirmId(null); }}
                  style={{ background: "var(--red)", color: "white", border: "none", borderRadius: 8, padding: "6px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}
                >
                  Delete
                </button>
                <button
                  onClick={() => setConfirmId(null)}
                  style={{ background: "var(--paper)", border: "none", borderRadius: 8, padding: "6px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmId(t.id)}
                style={{ background: "transparent", border: "none", color: "var(--muted)", cursor: "pointer", padding: 6, flexShrink: 0 }}
              >
                <IconTrash />
              </button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}


/* ---------------------------------------------------------
   ADD ENTRY TAB
--------------------------------------------------------- */

function AddEntry({ onAdd, months, categoryGroups, incomeCategories, cardLimits, accounts, t }) {
  const groupOrder = Object.keys(categoryGroups);
  const investmentCategories = categoryGroups["INVESTMENTS"] || [];
  const accountNames = Object.keys(accounts || {});
  const cardNames = Object.keys(cardLimits);
  const [type, setType] = useState("expense");
  const [date, setDate] = useState(todayISO());
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [group, setGroup] = useState(groupOrder[0] || "");
  const [category, setCategory] = useState((categoryGroups[groupOrder[0]] || [])[0] || "");
  const [incomeCategory, setIncomeCategory] = useState(incomeCategories[0] || "");
  const [investmentCategory, setInvestmentCategory] = useState(investmentCategories[0] || "");
  const [closesPosition, setClosesPosition] = useState(false);
  const [source, setSource] = useState(accountNames[0] || "");
  const [error, setError] = useState("");

  // Expenses can be funded from an account or charged to a card. Income can
  // only land in a real account — a credit card isn't somewhere money arrives.
  const sourceOptions = type === "income" ? accountNames : [...accountNames, ...cardNames];

  const handleGroupChange = (g) => {
    setGroup(g);
    setCategory((categoryGroups[g] || [])[0] || "");
  };

  const changeType = (next) => {
    setType(next);
    if (next === "income" && !accountNames.includes(source)) {
      setSource(accountNames[0] || "");
    }
  };

  const reset = () => {
    setName("");
    setAmount("");
  };

  const submit = () => {
    const amt = parseFloat(String(amount).replace(/[^0-9.]/g, ""));
    if (!name.trim()) { setError(t.addEntry.errName); return; }
    if (!amt || amt <= 0) { setError(t.addEntry.errAmount); return; }
    if (!date) { setError(t.addEntry.errDate); return; }
    setError("");
    if (type === "income" && !accountNames.includes(source)) {
      setError(t.addEntry.errDepositTo);
      return;
    }
    const entry = {
      date,
      name: name.trim(),
      amount: amt,
      type,
      group: type === "income" ? "INCOME" : group,
      category: type === "income" ? incomeCategory : category,
      source,
    };
    if (type === "income" && incomeCategory === "Investment Withdrawal") {
      entry.investmentCategory = investmentCategory;
      entry.closesPosition = closesPosition;
    }
    onAdd(entry);
    reset();
    setClosesPosition(false);
  };

  const inputStyle = {
    width: "100%",
    padding: "13px 14px",
    borderRadius: 12,
    border: "1.5px solid var(--line)",
    background: "var(--white)",
    fontSize: 14.5,
    fontWeight: 600,
    color: "var(--ink)",
  };
  const labelStyle = { fontSize: 12, fontWeight: 700, color: "var(--muted)", marginBottom: 6, display: "block" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingTop: 4 }}>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={() => changeType("expense")}
          style={{
            flex: 1, padding: "13px 0", borderRadius: 14, border: "none", fontWeight: 700, fontSize: 14, cursor: "pointer",
            background: type === "expense" ? "var(--ink)" : "var(--white)", color: type === "expense" ? "var(--white)" : "var(--ink)",
          }}
        >
          {t.addEntry.expense}
        </button>
        <button
          onClick={() => changeType("income")}
          style={{
            flex: 1, padding: "13px 0", borderRadius: 14, border: "none", fontWeight: 700, fontSize: 14, cursor: "pointer",
            background: type === "income" ? "var(--lime)" : "var(--white)", color: "var(--ink)",
          }}
        >
          {t.addEntry.income}
        </button>
      </div>

      <Card style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <label style={labelStyle}>{t.addEntry.description}</label>
          <input
            style={inputStyle}
            placeholder={type === "income" ? t.addEntry.descPlaceholderIncome : t.addEntry.descPlaceholderExpense}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>{t.addEntry.amount}</label>
            <input style={inputStyle} placeholder="0" inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>{t.addEntry.date}</label>
            <input style={inputStyle} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>

        {type === "expense" ? (
          <>
            <div>
              <label style={labelStyle}>{t.addEntry.group}</label>
              <select style={inputStyle} value={group} onChange={(e) => handleGroupChange(e.target.value)}>
                {groupOrder.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>{t.addEntry.category}</label>
              <select style={inputStyle} value={category} onChange={(e) => setCategory(e.target.value)}>
                {(categoryGroups[group] || []).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </>
        ) : (
          <>
            <div>
              <label style={labelStyle}>{t.addEntry.incomeCategory}</label>
              <select style={inputStyle} value={incomeCategory} onChange={(e) => setIncomeCategory(e.target.value)}>
                {incomeCategories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {incomeCategory === "Investment Withdrawal" && (
              <>
                <div>
                  <label style={labelStyle}>{t.addEntry.withdrawingFrom}</label>
                  <select style={inputStyle} value={investmentCategory} onChange={(e) => setInvestmentCategory(e.target.value)}>
                    {investmentCategories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => setClosesPosition((v) => !v)}
                  style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "12px 14px",
                    borderRadius: 12, border: "1.5px solid var(--line)", background: closesPosition ? "var(--paper)" : "var(--white)",
                    cursor: "pointer", textAlign: "left",
                  }}
                >
                  <div
                    style={{
                      width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                      border: "1.5px solid var(--ink)", background: closesPosition ? "var(--blue)" : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    {closesPosition && (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{t.addEntry.closesPosition}</div>
                    <div style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 600, marginTop: 1 }}>
                      {t.addEntry.closesPositionHint}
                    </div>
                  </div>
                </button>
              </>
            )}
          </>
        )}

        <div>
          <label style={labelStyle}>{type === "income" ? t.addEntry.depositTo : t.addEntry.fundSource}</label>
          <select style={inputStyle} value={source} onChange={(e) => setSource(e.target.value)}>
            {sourceOptions.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <div style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 600, marginTop: 6 }}>
            {type === "income" ? t.addEntry.depositToHint : t.addEntry.fundSourceHint}
          </div>
        </div>

        {error && <div style={{ color: "var(--red)", fontSize: 12.5, fontWeight: 700 }}>{error}</div>}

        <button
          onClick={submit}
          style={{
            marginTop: 4, padding: "15px 0", borderRadius: 14, border: "none", cursor: "pointer",
            background: "var(--blue)", color: "var(--white)", fontWeight: 700, fontSize: 15,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}
        >
          <IconPlus /> {type === "income" ? t.addEntry.addIncome : t.addEntry.addExpense}
        </button>
      </Card>
    </div>
  );
}

/* ---------------------------------------------------------
   DATA TAB — EXPORT / IMPORT
--------------------------------------------------------- */

function downloadJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function DataTab({ transactions, onImport, showToast, t }) {
  const fileInputRef = useRef(null);
  const [pending, setPending] = useState(null); // { entries, filename }
  const [parseError, setParseError] = useState("");

  const handleExport = () => {
    const stamp = todayISO();
    downloadJSON(transactions, `daily-budgeting-backup-${stamp}.json`);
    showToast("Backup downloaded");
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setParseError("");
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (!Array.isArray(parsed)) throw new Error("not an array");
        const valid = parsed.filter((t) => t && t.id && t.date && t.name != null && typeof t.amount === "number");
        if (valid.length === 0) throw new Error("no valid entries");
        setPending({ entries: valid, filename: file.name });
      } catch (err) {
        setParseError("Couldn't read that file — make sure it's a backup exported from this app.");
        setPending(null);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const confirmImport = async (mode) => {
    if (!pending) return;
    await onImport(pending.entries, mode);
    setPending(null);
  };

  const cardStyle = { display: "flex", flexDirection: "column", gap: 12 };
  const btnPrimary = {
    padding: "14px 0", borderRadius: 14, border: "none", cursor: "pointer",
    background: "var(--blue)", color: "var(--white)", fontWeight: 700, fontSize: 14.5,
    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
  };
  const btnOutline = {
    padding: "12px 0", borderRadius: 14, border: "1.5px solid var(--ink)", cursor: "pointer",
    background: "transparent", color: "var(--ink)", fontWeight: 700, fontSize: 13.5,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingTop: 4 }}>
      <Card style={cardStyle}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{t.data.exportTitle}</div>
          <div style={{ fontSize: 12.5, color: "var(--muted)", fontWeight: 600, lineHeight: 1.5 }}>
            {t.data.exportBody(transactions.length)}
          </div>
        </div>
        <button onClick={handleExport} style={btnPrimary}>
          {t.data.exportBtn}
        </button>
      </Card>

      <Card style={cardStyle}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{t.data.importTitle}</div>
          <div style={{ fontSize: 12.5, color: "var(--muted)", fontWeight: 600, lineHeight: 1.5 }}>
            {t.data.importBody}
          </div>
        </div>
        <input ref={fileInputRef} type="file" accept="application/json,.json" onChange={handleFileChange} style={{ display: "none" }} />
        <button onClick={() => fileInputRef.current && fileInputRef.current.click()} style={btnOutline}>
          {t.data.chooseFile}
        </button>
        {parseError && <div style={{ color: "var(--red)", fontSize: 12.5, fontWeight: 700 }}>{parseError}</div>}
      </Card>

      {pending && (
        <Card tone="ink" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{t.data.entriesFound(pending.entries.length)}</div>
            <div style={{ fontSize: 12.5, opacity: 0.75, fontWeight: 600, lineHeight: 1.5 }}>
              {t.data.fromFile(pending.filename)}
            </div>
          </div>
          <button onClick={() => confirmImport("merge")} style={{ ...btnPrimary, background: "var(--lime)", color: "var(--ink)" }}>
            {t.data.mergeBtn}
          </button>
          <button
            onClick={() => confirmImport("replace")}
            style={{ ...btnOutline, borderColor: "rgba(255,255,255,0.4)", color: "var(--white)" }}
          >
            {t.data.replaceBtn}
          </button>
          <button onClick={() => setPending(null)} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.6)", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>
            {t.common.cancel}
          </button>
        </Card>
      )}

      <div style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 600, padding: "0 4px", lineHeight: 1.6 }}>
        {t.data.footerNote}
      </div>
    </div>
  );
}
/* ---------------------------------------------------------
   MANAGE CATEGORIES TAB
--------------------------------------------------------- */

function InlineTextRow({ value, onSave, onDelete, usageCount, placeholder }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const commit = () => {
    const clean = draft.trim();
    if (clean && clean !== value) onSave(clean);
    setEditing(false);
  };

  if (editing) {
    return (
      <div style={{ display: "flex", gap: 6, alignItems: "center", padding: "10px 0" }}>
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") { setDraft(value); setEditing(false); }
          }}
          onBlur={commit}
          style={{
            flex: 1, padding: "8px 10px", borderRadius: 8, border: "1.5px solid var(--blue)",
            fontSize: 13.5, fontWeight: 600,
          }}
        />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", gap: 8 }}>
      <button
        onClick={() => setEditing(true)}
        style={{ background: "none", border: "none", textAlign: "left", flex: 1, cursor: "pointer", padding: 0 }}
      >
        <span style={{ fontSize: 13.5, fontWeight: 600 }}>{value}</span>
        {usageCount > 0 && (
          <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, marginLeft: 8 }}>
            {usageCount} entr{usageCount === 1 ? "y" : "ies"}
          </span>
        )}
      </button>
      {confirmDelete ? (
        <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
          <button
            onClick={() => onDelete()}
            style={{ background: "var(--red)", color: "white", border: "none", borderRadius: 8, padding: "5px 9px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}
          >
            Delete
          </button>
          <button
            onClick={() => setConfirmDelete(false)}
            style={{ background: "var(--paper)", border: "none", borderRadius: 8, padding: "5px 9px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setConfirmDelete(true)}
          style={{ background: "transparent", border: "none", color: "var(--muted)", cursor: "pointer", padding: 4, flexShrink: 0 }}
        >
          <IconTrash />
        </button>
      )}
    </div>
  );
}

function AddRow({ placeholder, onAdd }) {
  const [value, setValue] = useState("");
  const submit = () => {
    const clean = value.trim();
    if (!clean) return;
    onAdd(clean);
    setValue("");
  };
  return (
    <div style={{ display: "flex", gap: 8, paddingTop: 10 }}>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        placeholder={placeholder}
        style={{
          flex: 1, padding: "9px 12px", borderRadius: 10, border: "1.5px solid var(--line)",
          fontSize: 13, fontWeight: 600, background: "var(--paper)",
        }}
      />
      <button
        onClick={submit}
        style={{
          width: 38, height: 38, borderRadius: 10, border: "none", background: "var(--ink)", color: "var(--white)",
          display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0,
        }}
      >
        <IconPlus />
      </button>
    </div>
  );
}

function ManageCategories({
  categoryGroups,
  incomeCategories,
  countUsage,
  onAddGroup,
  onRenameGroup,
  onDeleteGroup,
  onAddCategory,
  onRenameCategory,
  onDeleteCategory,
  onAddIncomeCategory,
  onRenameIncomeCategory,
  onDeleteIncomeCategory,
  t,
}) {
  const [view, setView] = useState("expense");
  const [openGroups, setOpenGroups] = useState(() => new Set());
  const [confirmDeleteGroup, setConfirmDeleteGroup] = useState(null);
  const [addingGroup, setAddingGroup] = useState(false);

  const groupOrder = Object.keys(categoryGroups);

  const toggle = (g) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      next.has(g) ? next.delete(g) : next.add(g);
      return next;
    });
  };

  const groupUsage = (g) => (categoryGroups[g] || []).reduce((s, c) => s + countUsage(g, c), 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingTop: 4 }}>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={() => setView("expense")}
          style={{
            flex: 1, padding: "10px 0", borderRadius: 12, border: "none", fontWeight: 700, fontSize: 13.5, cursor: "pointer",
            background: view === "expense" ? "var(--blue)" : "var(--white)", color: view === "expense" ? "var(--white)" : "var(--ink)",
          }}
        >
          {t.manage.expenseGroups}
        </button>
        <button
          onClick={() => setView("income")}
          style={{
            flex: 1, padding: "10px 0", borderRadius: 12, border: "none", fontWeight: 700, fontSize: 13.5, cursor: "pointer",
            background: view === "income" ? "var(--blue)" : "var(--white)", color: view === "income" ? "var(--white)" : "var(--ink)",
          }}
        >
          {t.manage.income}
        </button>
      </div>

      <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600, padding: "0 2px" }}>
        {t.manage.hint}
      </div>

      {view === "expense" ? (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {groupOrder.map((group) => {
              const isOpen = openGroups.has(group);
              const cats = categoryGroups[group] || [];
              const usage = groupUsage(group);
              return (
                <Card key={group} style={{ padding: 0, overflow: "hidden" }}>
                  <div style={{ display: "flex", alignItems: "center", padding: "14px 16px 14px 18px", gap: 8 }}>
                    <button
                      onClick={() => toggle(group)}
                      style={{ flex: 1, background: "none", border: "none", textAlign: "left", cursor: "pointer", padding: 0, minWidth: 0 }}
                    >
                      <InlineGroupLabel
                        value={group}
                        onSave={(next) => onRenameGroup(group, next)}
                      />
                      <div style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 600, marginTop: 2 }}>
                        {t.manage.categoryCount(cats.length)} · {t.manage.entryCount(usage)}
                      </div>
                    </button>
                    {confirmDeleteGroup === group ? (
                      <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                        <button
                          onClick={() => { onDeleteGroup(group); setConfirmDeleteGroup(null); }}
                          style={{ background: "var(--red)", color: "white", border: "none", borderRadius: 8, padding: "6px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}
                        >
                          {t.common.delete}
                        </button>
                        <button
                          onClick={() => setConfirmDeleteGroup(null)}
                          style={{ background: "var(--paper)", border: "none", borderRadius: 8, padding: "6px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}
                        >
                          {t.common.cancel}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteGroup(group)}
                        style={{ background: "transparent", border: "none", color: "var(--muted)", cursor: "pointer", padding: 4, flexShrink: 0 }}
                      >
                        <IconTrash />
                      </button>
                    )}
                    <button
                      onClick={() => toggle(group)}
                      style={{
                        width: 26, height: 26, borderRadius: 999, background: "var(--paper)", border: "none",
                        display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                        transform: isOpen ? "rotate(45deg)" : "none", transition: "transform 0.15s ease", flexShrink: 0,
                      }}
                    >
                      <IconPlus />
                    </button>
                  </div>

                  {isOpen && (
                    <div style={{ padding: "0 18px 16px", borderTop: "1px solid var(--line)" }}>
                      {cats.map((cat) => (
                        <InlineTextRow
                          key={cat}
                          value={cat}
                          usageCount={countUsage(group, cat)}
                          onSave={(next) => onRenameCategory(group, cat, next)}
                          onDelete={() => onDeleteCategory(group, cat)}
                        />
                      ))}
                      <AddRow placeholder={t.manage.addCategoryPlaceholder} onAdd={(name) => onAddCategory(group, name)} />
                    </div>
                  )}
                </Card>
              );
            })}
          </div>

          <Card>
            {addingGroup ? (
              <AddRow
                placeholder={t.manage.newGroupPlaceholder}
                onAdd={async (name) => {
                  const ok = await onAddGroup(name);
                  if (ok) setAddingGroup(false);
                }}
              />
            ) : (
              <button
                onClick={() => setAddingGroup(true)}
                style={{
                  width: "100%", padding: "12px 0", borderRadius: 12, border: "1.5px dashed var(--line)",
                  background: "transparent", color: "var(--ink)", fontWeight: 700, fontSize: 13.5, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                }}
              >
                <IconPlus /> {t.manage.addGroup}
              </button>
            )}
          </Card>
        </>
      ) : (
        <Card>
          {incomeCategories.map((cat) => (
            <InlineTextRow
              key={cat}
              value={cat}
              usageCount={countUsage("INCOME", cat)}
              onSave={(next) => onRenameIncomeCategory(cat, next)}
              onDelete={() => onDeleteIncomeCategory(cat)}
            />
          ))}
          <AddRow placeholder={t.manage.addIncomeCategoryPlaceholder} onAdd={onAddIncomeCategory} />
        </Card>
      )}
    </div>
  );
}

function InlineGroupLabel({ value, onSave }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const commit = (e) => {
    e.stopPropagation();
    const clean = draft.trim();
    if (clean && clean !== value) onSave(clean);
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        autoFocus
        value={draft}
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit(e);
          if (e.key === "Escape") { setDraft(value); setEditing(false); }
        }}
        onBlur={commit}
        style={{
          padding: "6px 8px", borderRadius: 8, border: "1.5px solid var(--blue)",
          fontSize: 13.5, fontWeight: 700, width: "100%",
        }}
      />
    );
  }

  return (
    <span
      onClick={(e) => { e.stopPropagation(); setEditing(true); }}
      style={{ fontSize: 13.5, fontWeight: 700 }}
    >
      {value}
    </span>
  );
}
/* ---------------------------------------------------------
   CARDS TAB — CREDIT LIMITS & PAYMENTS
--------------------------------------------------------- */

function CardLimitRow({ card, limit, onSave }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(limit));

  const commit = () => {
    const num = parseFloat(String(draft).replace(/[^0-9.]/g, ""));
    if (num && num > 0 && num !== limit) onSave(num);
    setEditing(false);
  };

  if (editing) {
    return (
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <input
          autoFocus
          inputMode="numeric"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && commit()}
          onBlur={commit}
          style={{
            width: 130, padding: "6px 8px", borderRadius: 8, border: "1.5px solid var(--blue)",
            fontSize: 12.5, fontWeight: 700, textAlign: "right",
          }}
        />
      </div>
    );
  }

  return (
    <button
      onClick={() => { setDraft(String(limit)); setEditing(true); }}
      style={{ background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: 12.5, fontWeight: 700, color: "var(--muted)" }}
    >
      Limit {fmtIDR(limit)}
    </button>
  );
}

function CardNameLabel({ card, onSave }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(card);

  const commit = () => {
    const clean = draft.trim();
    if (clean && clean !== card) onSave(clean);
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") { setDraft(card); setEditing(false); }
        }}
        onBlur={commit}
        style={{ padding: "5px 8px", borderRadius: 8, border: "1.5px solid var(--blue)", fontSize: 14, fontWeight: 700 }}
      />
    );
  }

  return (
    <button onClick={() => setEditing(true)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", textAlign: "left" }}>
      <span style={{ fontSize: 14, fontWeight: 700 }}>{card}</span>
    </button>
  );
}

function AdjustBalanceForm({ card, onAddAdjustment, onClose, t }) {
  const [amount, setAmount] = useState("");
  const [direction, setDirection] = useState("increase");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(todayISO());
  const [error, setError] = useState("");

  const inputStyle = {
    width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid var(--line)",
    background: "var(--paper)", fontSize: 13.5, fontWeight: 600, color: "var(--ink)",
  };

  const submit = () => {
    const amt = parseFloat(String(amount).replace(/[^0-9.]/g, ""));
    if (!amt || amt <= 0) { setError(t.addEntry.errAmount); return; }
    setError("");
    onAddAdjustment({
      source: card,
      amount: amt,
      direction,
      date,
      name: note.trim() || (direction === "increase" ? `Untracked spending — ${card}` : `Balance correction — ${card}`),
    });
    onClose();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingTop: 10, borderTop: "1px solid var(--line)", marginTop: 4 }}>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={() => setDirection("increase")}
          style={{
            flex: 1, padding: "8px 0", borderRadius: 10, border: "none", fontWeight: 700, fontSize: 12.5, cursor: "pointer",
            background: direction === "increase" ? "var(--ink)" : "var(--paper)", color: direction === "increase" ? "var(--white)" : "var(--ink)",
          }}
        >
          {t.cards.increaseBalance}
        </button>
        <button
          onClick={() => setDirection("decrease")}
          style={{
            flex: 1, padding: "8px 0", borderRadius: 10, border: "none", fontWeight: 700, fontSize: 12.5, cursor: "pointer",
            background: direction === "decrease" ? "var(--ink)" : "var(--paper)", color: direction === "decrease" ? "var(--white)" : "var(--ink)",
          }}
        >
          {t.cards.decreaseBalance}
        </button>
      </div>
      <input
        placeholder={t.cards.amountPlaceholder}
        inputMode="numeric"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        style={inputStyle}
      />
      <input
        placeholder={t.cards.notePlaceholder}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        style={inputStyle}
      />
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle} />
      {error && <div style={{ color: "var(--red)", fontSize: 12, fontWeight: 700 }}>{error}</div>}
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={submit}
          style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "none", background: "var(--blue)", color: "var(--white)", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
        >
          {t.cards.saveAdjustment}
        </button>
        <button
          onClick={onClose}
          style={{ padding: "10px 16px", borderRadius: 10, border: "none", background: "var(--paper)", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
        >
          {t.common.cancel}
        </button>
      </div>
    </div>
  );
}

function CreditCardCard({ card, limit, balance, usage, onUpdateLimit, onRenameCard, onDeleteCard, onAddAdjustment, t }) {
  const pct = limit > 0 ? Math.min((balance / limit) * 100, 100) : 0;
  const overLimit = balance > limit;
  const nearLimit = !overLimit && pct >= 80;
  const barColor = overLimit ? "var(--red)" : nearLimit ? "#E8A93B" : "var(--blue)";
  const available = limit - balance;
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [adjusting, setAdjusting] = useState(false);

  return (
    <Card style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <CardNameLabel card={card} onSave={(next) => onRenameCard(card, next)} />
          <div style={{ fontSize: 20, fontWeight: 700, marginTop: 4 }}>{fmtIDR(balance)}</div>
          <div style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 600, marginTop: 2 }}>
            {t.cards.owedNow}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
          <CardLimitRow card={card} limit={limit} onSave={(v) => onUpdateLimit(card, v)} />
          {confirmDelete ? (
            <div style={{ display: "flex", gap: 4 }}>
              <button
                onClick={() => onDeleteCard(card)}
                style={{ background: "var(--red)", color: "white", border: "none", borderRadius: 8, padding: "5px 9px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}
              >
                {t.common.delete}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                style={{ background: "var(--paper)", border: "none", borderRadius: 8, padding: "5px 9px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}
              >
                {t.common.cancel}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              style={{ background: "transparent", border: "none", color: "var(--muted)", cursor: "pointer", padding: 2 }}
            >
              <IconTrash />
            </button>
          )}
        </div>
      </div>

      <div style={{ height: 8, borderRadius: 999, background: "var(--paper)", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: barColor, borderRadius: 999 }} />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 600 }}>
        <span style={{ color: overLimit ? "var(--red)" : "var(--muted)" }}>
          {overLimit ? t.cards.overLimit(fmtShort(-available)) : t.cards.available(fmtIDR(available))}
        </span>
        <span style={{ color: "var(--muted)" }}>{pct.toFixed(0)}%</span>
      </div>

      {usage > 0 && (
        <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600 }}>{t.cards.entriesUseCard(usage)}</div>
      )}

      {adjusting ? (
        <AdjustBalanceForm card={card} onAddAdjustment={onAddAdjustment} onClose={() => setAdjusting(false)} t={t} />
      ) : (
        <button
          onClick={() => setAdjusting(true)}
          style={{
            marginTop: 2, padding: "9px 0", borderRadius: 10, border: "1.5px dashed var(--line)",
            background: "transparent", color: "var(--ink)", fontWeight: 700, fontSize: 12.5, cursor: "pointer",
          }}
        >
          {t.cards.adjustBalance}
        </button>
      )}
    </Card>
  );
}

function LogPaymentForm({ cardNames, accountNames, onAddPayment, t }) {
  const [card, setCard] = useState(cardNames[0] || "");
  const [fromAccount, setFromAccount] = useState(accountNames[0] || "");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayISO());
  const [error, setError] = useState("");

  const inputStyle = {
    width: "100%", padding: "13px 14px", borderRadius: 12, border: "1.5px solid var(--line)",
    background: "var(--white)", fontSize: 14.5, fontWeight: 600, color: "var(--ink)",
  };
  const labelStyle = { fontSize: 12, fontWeight: 700, color: "var(--muted)", marginBottom: 6, display: "block" };

  const submit = () => {
    const amt = parseFloat(String(amount).replace(/[^0-9.]/g, ""));
    if (!amt || amt <= 0) { setError(t.addEntry.errAmount); return; }
    if (!date || !card) { setError(t.addEntry.errDate); return; }
    setError("");
    onAddPayment({
      card,
      amount: amt,
      date,
      name: `Payment — ${card}`,
      source: card,
      fromAccount: fromAccount || undefined,
    });
    setAmount("");
  };

  return (
    <Card style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ fontSize: 14, fontWeight: 700 }}>{t.cards.logPayment}</div>
      <div>
        <label style={labelStyle}>{t.cards.card}</label>
        <select style={inputStyle} value={card} onChange={(e) => setCard(e.target.value)}>
          {cardNames.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      <div>
        <label style={labelStyle}>{t.cards.paidFrom}</label>
        <select style={inputStyle} value={fromAccount} onChange={(e) => setFromAccount(e.target.value)}>
          {accountNames.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>{t.cards.amount}</label>
          <input style={inputStyle} placeholder="0" inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>{t.cards.date}</label>
          <input style={inputStyle} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
      </div>
      {error && <div style={{ color: "var(--red)", fontSize: 12.5, fontWeight: 700 }}>{error}</div>}
      <button
        onClick={submit}
        style={{
          padding: "14px 0", borderRadius: 14, border: "none", cursor: "pointer",
          background: "var(--ink)", color: "var(--white)", fontWeight: 700, fontSize: 14.5,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}
      >
        <IconPlus /> {t.cards.logPaymentBtn}
      </button>
      <div style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 600, lineHeight: 1.5 }}>
        {t.cards.logPaymentHint}
      </div>
    </Card>
  );
}

function AddCardForm({ onAddCard, t }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [limit, setLimit] = useState("");
  const [error, setError] = useState("");

  const inputStyle = {
    width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid var(--line)",
    background: "var(--paper)", fontSize: 13.5, fontWeight: 600, color: "var(--ink)",
  };

  const submit = async () => {
    const lim = parseFloat(String(limit).replace(/[^0-9.]/g, ""));
    if (!name.trim()) { setError(t.addEntry.errName); return; }
    if (!lim || lim <= 0) { setError(t.addEntry.errAmount); return; }
    setError("");
    const ok = await onAddCard(name, lim);
    if (ok) { setName(""); setLimit(""); setOpen(false); }
  };

  if (!open) {
    return (
      <Card>
        <button
          onClick={() => setOpen(true)}
          style={{
            width: "100%", padding: "12px 0", borderRadius: 12, border: "1.5px dashed var(--line)",
            background: "transparent", color: "var(--ink)", fontWeight: 700, fontSize: 13.5, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}
        >
          <IconPlus /> {t.cards.addCard}
        </button>
      </Card>
    );
  }

  return (
    <Card style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ fontSize: 14, fontWeight: 700 }}>{t.cards.newCard}</div>
      <input placeholder={t.cards.cardNamePlaceholder} value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
      <input placeholder={t.cards.limitPlaceholder} inputMode="numeric" value={limit} onChange={(e) => setLimit(e.target.value)} style={inputStyle} />
      {error && <div style={{ color: "var(--red)", fontSize: 12, fontWeight: 700 }}>{error}</div>}
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={submit} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "none", background: "var(--blue)", color: "var(--white)", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
          {t.common.add}
        </button>
        <button onClick={() => setOpen(false)} style={{ padding: "10px 16px", borderRadius: 10, border: "none", background: "var(--paper)", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
          {t.common.cancel}
        </button>
      </div>
    </Card>
  );
}

function CardsTab({
  transactions,
  cardLimits,
  accounts,
  countSourceUsage,
  onAddPayment,
  onAddAdjustment,
  onUpdateLimit,
  onAddCard,
  onRenameCard,
  onDeleteCard,
  onUpdateAccountOpening,
  onAddAccount,
  onRenameAccount,
  onDeleteAccount,
  t,
}) {
  const cardNames = Object.keys(cardLimits);
  const accountNames = Object.keys(accounts || {});
  const balances = useMemo(() => computeCardBalances(transactions, cardNames), [transactions, cardLimits]);
  const accountData = useMemo(
    () => computeAccountBalances(transactions, accounts),
    [transactions, accounts]
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingTop: 4 }}>
      <div style={{ fontSize: 13.5, fontWeight: 700, padding: "0 2px" }}>{t.cards.accountsTitle}</div>
      <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600, padding: "0 2px" }}>
        {t.cards.accountsHint}
      </div>

      {accountNames.map((name) => (
        <AccountCard
          key={name}
          name={name}
          opening={accounts[name] || 0}
          liveBalance={accountData.balances[name] || 0}
          usage={countSourceUsage(name)}
          canDelete={accountNames.length > 1}
          onUpdateOpening={onUpdateAccountOpening}
          onRename={onRenameAccount}
          onDelete={onDeleteAccount}
          t={t}
        />
      ))}

      <AddAccountForm onAddAccount={onAddAccount} t={t} />

      <div style={{ height: 1, background: "var(--line)", margin: "4px 0" }} />

      <div style={{ fontSize: 13.5, fontWeight: 700, padding: "0 2px" }}>{t.nav.cards}</div>
      <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600, padding: "0 2px" }}>
        {t.cards.hint}
      </div>

      {cardNames.length === 0 && (
        <Card style={{ textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>💳</div>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{t.cards.noCardsTitle}</div>
          <div style={{ fontSize: 12.5, color: "var(--muted)", fontWeight: 600 }}>
            {t.cards.noCardsBody}
          </div>
        </Card>
      )}

      {cardNames.map((card) => (
        <CreditCardCard
          key={card}
          card={card}
          limit={cardLimits[card]}
          balance={balances[card] || 0}
          usage={countSourceUsage(card)}
          onUpdateLimit={onUpdateLimit}
          onRenameCard={onRenameCard}
          onDeleteCard={onDeleteCard}
          onAddAdjustment={onAddAdjustment}
          t={t}
        />
      ))}

      <AddCardForm onAddCard={onAddCard} t={t} />

      <LogPaymentForm cardNames={cardNames} accountNames={accountNames} onAddPayment={onAddPayment} t={t} />
    </div>
  );
}

/* ---- account management (Cards tab) ---- */

function AccountCard({ name, opening, liveBalance, usage, canDelete, onUpdateOpening, onRename, onDelete, t }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editingOpening, setEditingOpening] = useState(false);
  const [editingBalance, setEditingBalance] = useState(false);
  const [draft, setDraft] = useState(String(opening));
  const [balDraft, setBalDraft] = useState(String(Math.round(liveBalance)));

  const commitOpening = () => {
    const num = parseFloat(String(draft).replace(/[^0-9.-]/g, ""));
    if (!Number.isNaN(num) && num !== opening) onUpdateOpening(name, num);
    setEditingOpening(false);
  };

  // Editing the headline number sets the balance to exactly what you type
  // by shifting the opening balance by the difference — history still flows
  // forward from there.
  const commitBalance = () => {
    const target = parseFloat(String(balDraft).replace(/[^0-9.-]/g, ""));
    if (!Number.isNaN(target) && target !== Math.round(liveBalance)) {
      onUpdateOpening(name, Math.round(opening + (target - liveBalance)));
    }
    setEditingBalance(false);
  };

  return (
    <Card style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <CardNameLabel card={name} onSave={(next) => onRename(name, next)} />
          <div style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 600, marginTop: 2 }}>
            {t.cards.accountEntries(usage)}
          </div>
        </div>
        {canDelete && (
          confirmDelete ? (
            <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
              <button
                onClick={() => { onDelete(name); setConfirmDelete(false); }}
                style={{ background: "var(--red)", color: "white", border: "none", borderRadius: 8, padding: "6px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}
              >
                {t.common.delete}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                style={{ background: "var(--paper)", border: "none", borderRadius: 8, padding: "6px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}
              >
                {t.common.cancel}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              style={{ background: "transparent", border: "none", color: "var(--muted)", cursor: "pointer", padding: 4, flexShrink: 0 }}
            >
              <IconTrash />
            </button>
          )
        )}
      </div>

      {editingBalance ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            autoFocus
            inputMode="numeric"
            value={balDraft}
            onChange={(e) => setBalDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") commitBalance(); if (e.key === "Escape") { setBalDraft(String(Math.round(liveBalance))); setEditingBalance(false); } }}
            onBlur={commitBalance}
            style={{ width: 180, padding: "8px 10px", borderRadius: 8, border: "1.5px solid var(--blue)", fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em" }}
          />
        </div>
      ) : (
        <button
          onClick={() => { setBalDraft(String(Math.round(liveBalance))); setEditingBalance(true); }}
          style={{ background: "none", border: "none", padding: 0, cursor: "pointer", textAlign: "left", fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", color: liveBalance < 0 ? "var(--red)" : "var(--ink)" }}
        >
          {fmtIDR(liveBalance)}
        </button>
      )}
      <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>{t.cards.liveBalanceLabel} · {t.cards.tapToEdit}</div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)" }}>{t.cards.openingBalanceLabel}</span>
        {editingOpening ? (
          <input
            autoFocus
            inputMode="numeric"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") commitOpening(); if (e.key === "Escape") { setDraft(String(opening)); setEditingOpening(false); } }}
            onBlur={commitOpening}
            style={{ width: 150, padding: "6px 8px", borderRadius: 8, border: "1.5px solid var(--blue)", fontSize: 12.5, fontWeight: 700, textAlign: "right" }}
          />
        ) : (
          <button
            onClick={() => { setDraft(String(opening)); setEditingOpening(true); }}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: 13, fontWeight: 700, color: "var(--blue)" }}
          >
            {fmtIDR(opening)}
          </button>
        )}
      </div>
    </Card>
  );
}

function AddAccountForm({ onAddAccount, t }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [opening, setOpening] = useState("");
  const [error, setError] = useState("");

  const inputStyle = {
    width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid var(--line)",
    background: "var(--paper)", fontSize: 13.5, fontWeight: 600, color: "var(--ink)",
  };

  const submit = async () => {
    if (!name.trim()) { setError(t.addEntry.errName); return; }
    const num = parseFloat(String(opening).replace(/[^0-9.-]/g, ""));
    setError("");
    const ok = await onAddAccount(name, Number.isNaN(num) ? 0 : num);
    if (ok) { setName(""); setOpening(""); setOpen(false); }
  };

  if (!open) {
    return (
      <Card>
        <button
          onClick={() => setOpen(true)}
          style={{
            width: "100%", padding: "12px 0", borderRadius: 12, border: "1.5px dashed var(--line)",
            background: "transparent", color: "var(--ink)", fontWeight: 700, fontSize: 13.5, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}
        >
          <IconPlus /> {t.cards.addAccount}
        </button>
      </Card>
    );
  }

  return (
    <Card style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ fontSize: 14, fontWeight: 700 }}>{t.cards.newAccount}</div>
      <input placeholder={t.cards.accountNamePlaceholder} value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
      <input placeholder={t.cards.openingPlaceholder} inputMode="numeric" value={opening} onChange={(e) => setOpening(e.target.value)} style={inputStyle} />
      {error && <div style={{ color: "var(--red)", fontSize: 12, fontWeight: 700 }}>{error}</div>}
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={submit} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "none", background: "var(--blue)", color: "var(--white)", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
          {t.common.add}
        </button>
        <button onClick={() => setOpen(false)} style={{ padding: "10px 16px", borderRadius: 10, border: "none", background: "var(--paper)", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
          {t.common.cancel}
        </button>
      </div>
    </Card>
  );
}

/* ---------------------------------------------------------
   HELP TAB
--------------------------------------------------------- */

function HelpTab({ t }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingTop: 4 }}>
      <div>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{t.help.title}</div>
        <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600 }}>{t.help.subtitle}</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {t.help.sections.map((section, i) => (
          <Card key={i}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>{section.h}</div>
            <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600, lineHeight: 1.6 }}>{section.body}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}
